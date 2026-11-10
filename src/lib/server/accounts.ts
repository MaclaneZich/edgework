import "server-only";

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import { cookies } from "next/headers";

/**
 * Accounts and synced progress live as small private JSON blobs:
 *   users/<id>/account.json   email + scrypt password hash
 *   users/<id>/data.json      the synced progress document
 *   sessions/<hash>.json      one per signed-in browser
 * The browser only ever holds a random session token in an httpOnly cookie; the
 * store keeps its SHA-256, so a leaked blob listing cannot be replayed as a login.
 */

export const SESSION_COOKIE = "edgework_session";
const SESSION_DAYS = 60;
const MAX_FAILED = 8;
const LOCK_MS = 10 * 60 * 1000;
/** Vercel caps request bodies at 4.5 MB; stay well inside it. */
export const MAX_DATA_BYTES = 3_500_000;

export interface AccountRecord {
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
  failed: number;
  lockedUntil: number;
}

export interface SessionRecord {
  userId: string;
  email: string;
  expiresAt: number;
}

export interface SyncDoc {
  updatedAt: number;
  data: unknown;
}

export function storageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  const at = email.indexOf("@");
  if (at < 1 || at !== email.lastIndexOf("@") || at === email.length - 1) return null;
  if (!email.slice(at + 1).includes(".") || email.includes(" ")) return null;
  return email;
}

export function validPassword(raw: unknown): raw is string {
  return typeof raw === "string" && raw.length >= 8 && raw.length <= 200;
}

export function userIdFor(email: string): string {
  return sha256(`edgework-user:${email}`).slice(0, 40);
}

const accountPath = (userId: string) => `users/${userId}/account.json`;
const dataPath = (userId: string) => `users/${userId}/data.json`;
const sessionPath = (token: string) => `sessions/${sha256(token)}.json`;

async function readJson<T>(pathname: string): Promise<T | null> {
  // useCache: false reads from origin, so a write is visible to the very next read.
  const res = await get(pathname, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  try {
    return (await new Response(res.stream).json()) as T;
  } catch {
    return null;
  }
}

async function writeJson(pathname: string, value: unknown): Promise<void> {
  await put(pathname, JSON.stringify(value), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function findAccount(email: string): Promise<AccountRecord | null> {
  return readJson<AccountRecord>(accountPath(userIdFor(email)));
}

export async function createAccount(email: string, password: string): Promise<AccountRecord> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt);
  const record: AccountRecord = {
    email,
    salt: salt.toString("base64"),
    hash: hash.toString("base64"),
    createdAt: Date.now(),
    failed: 0,
    lockedUntil: 0,
  };
  await writeJson(accountPath(userIdFor(email)), record);
  return record;
}

export type LoginResult = { ok: true } | { ok: false; reason: "invalid" | "locked" };

export async function checkLogin(email: string, password: string): Promise<LoginResult> {
  const account = await findAccount(email);
  if (!account) {
    // Spend the same work as a real check so timing does not reveal which emails exist.
    await scryptAsync(password, Buffer.alloc(16));
    return { ok: false, reason: "invalid" };
  }
  if (account.lockedUntil > Date.now()) return { ok: false, reason: "locked" };
  const expected = Buffer.from(account.hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(account.salt, "base64"));
  const match = expected.length === actual.length && timingSafeEqual(expected, actual);
  if (match) {
    if (account.failed > 0 || account.lockedUntil > 0) {
      await writeJson(accountPath(userIdFor(email)), { ...account, failed: 0, lockedUntil: 0 });
    }
    return { ok: true };
  }
  const failed = account.failed + 1;
  const locked = failed >= MAX_FAILED;
  await writeJson(accountPath(userIdFor(email)), { ...account, failed: locked ? 0 : failed, lockedUntil: locked ? Date.now() + LOCK_MS : 0 });
  return { ok: false, reason: locked ? "locked" : "invalid" };
}

export async function startSession(email: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const record: SessionRecord = { userId: userIdFor(email), email, expiresAt };
  await writeJson(sessionPath(token), record);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function currentSession(): Promise<SessionRecord | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  const record = await readJson<SessionRecord>(sessionPath(token));
  if (!record || record.expiresAt < Date.now()) return null;
  return record;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  jar.delete(SESSION_COOKIE);
  if (!token || token.length > 200) return;
  try {
    await del(sessionPath(token));
  } catch {
    /* already gone */
  }
}

export async function readData(userId: string): Promise<SyncDoc | null> {
  return readJson<SyncDoc>(dataPath(userId));
}

export async function writeData(userId: string, doc: SyncDoc): Promise<void> {
  await writeJson(dataPath(userId), doc);
}

/** Rejects cross-site writes: a browser always sends Origin on these, and it must be this site. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await request.json();
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const NOT_CONFIGURED = "Accounts are not set up on this deployment (no storage connected).";
