"use client";

import { create } from "zustand";
import { set as idbSet } from "idb-keyval";
import { selectData, useStore, type EdgeworkData } from "./store";
import { decideSync, isPristine, normalizeData, sameData, type SyncMeta } from "./syncLogic";

/**
 * Account sync. Progress still lives in this browser first; when signed in, the whole
 * progress document is also saved to the account and pulled on other devices.
 * Nothing here runs for someone who never signs in.
 */

export type SyncStatus = "checking" | "unavailable" | "signed-out" | "syncing" | "pending" | "synced" | "offline" | "conflict";

interface Conflict {
  remote: EdgeworkData;
  remoteUpdatedAt: number;
}

interface SyncState {
  status: SyncStatus;
  email: string | null;
  lastSyncedAt: number | null;
  error: string | null;
  conflict: Conflict | null;
  /** Bumped whenever the account copy replaces local data, so open pages can remount with it. */
  epoch: number;
}

export const useSync = create<SyncState>(() => ({ status: "checking", email: null, lastSyncedAt: null, error: null, conflict: null, epoch: 0 }));

const META_KEY = "edgework-sync";
const BACKUP_KEY = "edgework-backup-before-sync";
const DEBOUNCE_MS = 10_000;
const MAX_WAIT_MS = 60_000;
const RECHECK_MS = 60_000;
const EXPIRED = "Your sign-in expired. Sign in again to keep syncing. Your progress is still on this device.";

let meta: SyncMeta | null = null;
let applying = false;
let changeCount = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let firstDirtyAt = 0;
let busy: Promise<void> | null = null;
let lastCheckAt = 0;
let started = false;
const RETRY_MIN_MS = 15_000;
const RETRY_MAX_MS = 5 * 60_000;
let retryDelay = RETRY_MIN_MS;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function localData(): EdgeworkData {
  return selectData(useStore.getState());
}

function loadMeta(email: string): SyncMeta {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (raw) {
      const m = JSON.parse(raw) as Partial<SyncMeta>;
      if (m.email === email && typeof m.base === "number") return { email, base: m.base, dirty: Boolean(m.dirty) };
    }
  } catch {
    /* fall through to a fresh record */
  }
  return { email, base: 0, dirty: !isPristine(localData()) };
}

function saveMeta() {
  try {
    if (meta) window.localStorage.setItem(META_KEY, JSON.stringify(meta));
    else window.localStorage.removeItem(META_KEY);
  } catch {
    /* private mode: sync still works for this visit */
  }
}

function applyRemote(data: EdgeworkData) {
  const merged = normalizeData(data);
  applying = true;
  try {
    useStore.setState({ ...merged, pendingUnlocks: [] });
  } finally {
    applying = false;
  }
  useSync.setState((s) => ({ epoch: s.epoch + 1 }));
}

async function api<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  let body: T | null = null;
  try {
    body = (await res.json()) as T;
  } catch {
    /* empty or non-JSON body */
  }
  return { status: res.status, body };
}

function markSynced(version: number, stillDirty: boolean) {
  if (!meta) return;
  meta = { ...meta, base: version, dirty: stillDirty };
  saveMeta();
  useSync.setState({ status: stillDirty ? "pending" : "synced", lastSyncedAt: Date.now(), error: null, conflict: null });
  if (stillDirty) schedulePush();
}

function signedOutLocally(message: string | null) {
  meta = null;
  saveMeta();
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  firstDirtyAt = 0;
  useSync.setState({ status: "signed-out", email: null, error: message, conflict: null, lastSyncedAt: null });
}

/** Applies the decision for a known account copy. Returns "push" when local should be uploaded. */
function settle(rawRemote: unknown, remoteUpdatedAt: number): "push" | "done" {
  if (!meta) return "done";
  const remote = rawRemote ? normalizeData(rawRemote) : null;
  const local = localData();
  const decision = decideSync({
    remoteUpdatedAt: remote ? remoteUpdatedAt : 0,
    meta,
    localPristine: isPristine(local),
    identical: remote ? sameData(local, remote) : false,
  });
  if (decision === "push") return "push";
  if (decision === "noop") {
    useSync.setState({ status: "synced", lastSyncedAt: Date.now(), error: null });
  } else if (decision === "adopt-version") {
    markSynced(remoteUpdatedAt, false);
  } else if (decision === "apply-remote" && remote) {
    applyRemote(remote);
    markSynced(remoteUpdatedAt, false);
  } else if (remote) {
    useSync.setState({ status: "conflict", conflict: { remote, remoteUpdatedAt }, error: null });
  }
  return "done";
}

async function push(force = false): Promise<void> {
  if (!meta) return;
  const counted = changeCount;
  useSync.setState({ status: "syncing", error: null });
  const res = await api<{ updatedAt?: number; data?: EdgeworkData; error?: string }>("/api/sync", {
    method: "PUT",
    body: JSON.stringify({ data: localData(), base: meta.base, force }),
  });
  if (res.status === 200 && typeof res.body?.updatedAt === "number") {
    markSynced(res.body.updatedAt, changeCount !== counted);
    return;
  }
  if (res.status === 409 && res.body?.data && typeof res.body.updatedAt === "number") {
    // Another device saved first. Local is dirty here, so this ends in a prompt unless local is empty.
    if (settle(res.body.data, res.body.updatedAt) === "push") throw new Error("Sync could not settle. It will retry.");
    return;
  }
  if (res.status === 401) {
    signedOutLocally(EXPIRED);
    return;
  }
  throw new Error(res.body?.error ?? "Sync failed (" + res.status + ").");
}

async function reconcile(): Promise<void> {
  if (!meta) return;
  useSync.setState({ status: "syncing", error: null });
  const res = await api<{ updatedAt?: number; data?: EdgeworkData | null; error?: string }>("/api/sync");
  if (res.status === 401) {
    signedOutLocally(EXPIRED);
    return;
  }
  if (res.status !== 200 || typeof res.body?.updatedAt !== "number") {
    throw new Error(res.body?.error ?? "Sync failed (" + res.status + ").");
  }
  lastCheckAt = Date.now();
  if (settle(res.body.data ?? null, res.body.updatedAt) === "push") await push();
}

/** Runs one sync job at a time. A failure leaves local progress untouched and is retried later. */
function run(job: () => Promise<void>): Promise<void> {
  const next = (busy ?? Promise.resolve())
    .then(job)
    .then(() => {
      retryDelay = RETRY_MIN_MS;
    })
    .catch((e: unknown) => {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    // Back off and try again on our own, so a blip does not leave the account stale.
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      if (meta && useSync.getState().status === "offline") void run(reconcile);
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS);
    useSync.setState({
      status: "offline",
      error: offline
        ? "You are offline. Changes are saved on this device and will sync when you reconnect."
        : e instanceof Error
          ? e.message
          : "Sync failed.",
    });
  });
  busy = next;
  void next.finally(() => {
    if (busy === next) busy = null;
  });
  return next;
}

function schedulePush() {
  if (!meta || useSync.getState().status === "conflict") return;
  const now = Date.now();
  if (!firstDirtyAt) firstDirtyAt = now;
  const wait = Math.max(0, Math.min(DEBOUNCE_MS, firstDirtyAt + MAX_WAIT_MS - now));
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flush, wait);
}

function flush() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  firstDirtyAt = 0;
  if (!meta || !meta.dirty || useSync.getState().status === "conflict") return;
  void run(() => push());
}

function onLocalChange() {
  if (applying || !meta) return;
  changeCount += 1;
  if (!meta.dirty) {
    meta = { ...meta, dirty: true };
    saveMeta();
  }
  if (useSync.getState().status === "synced") useSync.setState({ status: "pending" });
  schedulePush();
}

function attach(email: string) {
  meta = loadMeta(email);
  saveMeta();
  useSync.setState({ email, status: "syncing", error: null, conflict: null });
}

/** Call once, after the local store has loaded from this browser's storage. */
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  const keys = Object.keys(localData()) as Array<keyof EdgeworkData>;
  useStore.subscribe((state, prev) => {
    for (const k of keys) {
      if (state[k] !== prev[k]) {
        onLocalChange();
        return;
      }
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!meta) return;
    if (document.visibilityState === "hidden") flush();
    else if (Date.now() - lastCheckAt > RECHECK_MS && useSync.getState().status !== "conflict") void run(reconcile);
  });
  window.addEventListener("online", () => {
    if (meta && useSync.getState().status !== "conflict") void run(reconcile);
  });

  void (async () => {
    try {
      const res = await api<{ email: string | null; available?: boolean }>("/api/auth/me");
      if (res.status !== 200 || !res.body) throw new Error("unreachable");
      if (res.body.available === false) {
        useSync.setState({ status: "unavailable" });
        return;
      }
      if (!res.body.email) {
        meta = null;
        saveMeta();
        useSync.setState({ status: "signed-out" });
        return;
      }
      attach(res.body.email);
      await run(reconcile);
    } catch {
      // No server or no network: stay local-only for this visit.
      useSync.setState({ status: "signed-out", error: null });
    }
  })();
}

export async function authenticate(mode: "login" | "signup", email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api<{ email?: string; error?: string }>("/api/auth/" + mode, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.status !== 200 || !res.body?.email) return { ok: false, error: res.body?.error ?? "Something went wrong. Try again." };
    attach(res.body.email);
    await run(reconcile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}

/** Signs out of the account. Progress stays on this device. */
export async function signOut(): Promise<void> {
  if (meta?.dirty && useSync.getState().status !== "conflict") await run(() => push());
  try {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
  } catch {
    /* the cookie expires on its own; clear local state regardless */
  }
  signedOutLocally(null);
}

export function syncNow(): Promise<void> {
  if (!meta || useSync.getState().status === "conflict") return Promise.resolve();
  return run(reconcile);
}

/** Resolves a two-copies conflict. A device copy that gets replaced is kept as a local backup first. */
export async function resolveConflict(keep: "device" | "account"): Promise<void> {
  const conflict = useSync.getState().conflict;
  if (!conflict || !meta) return;
  if (keep === "account") {
    try {
      await idbSet(BACKUP_KEY, JSON.stringify({ savedAt: Date.now(), data: localData() }));
    } catch {
      /* backup is best-effort */
    }
    applyRemote(conflict.remote);
    markSynced(conflict.remoteUpdatedAt, false);
    return;
  }
  meta = { ...meta, base: conflict.remoteUpdatedAt, dirty: true };
  saveMeta();
  useSync.setState({ status: "syncing", conflict: null });
  await run(() => push(true));
}
