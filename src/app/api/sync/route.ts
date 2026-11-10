import { MAX_DATA_BYTES, NOT_CONFIGURED, currentSession, json, readData, sameOrigin, storageConfigured, writeData } from "@/lib/server/accounts";

/** The synced progress for the signed-in account, or updatedAt 0 when nothing is stored yet. */
export async function GET() {
  if (!storageConfigured()) return json({ error: NOT_CONFIGURED }, 503);
  try {
    const session = await currentSession();
    if (!session) return json({ error: "Not signed in." }, 401);
    const doc = await readData(session.userId);
    return json(doc ?? { updatedAt: 0, data: null });
  } catch (e) {
    console.error("sync read failed", e);
    return json({ error: "Could not load your progress." }, 500);
  }
}

/**
 * Stores the whole progress document. `base` is the server version this browser last
 * saw; if another device has written since, the write is refused with 409 and the
 * newer copy is returned so the client can ask which one to keep. `force` skips that.
 */
export async function PUT(request: Request) {
  if (!storageConfigured()) return json({ error: NOT_CONFIGURED }, 503);
  if (!sameOrigin(request)) return json({ error: "Cross-site request refused." }, 403);
  try {
    const session = await currentSession();
    if (!session) return json({ error: "Not signed in." }, 401);
    const text = await request.text();
    if (text.length > MAX_DATA_BYTES) return json({ error: "Progress is too large to sync." }, 413);
    let body: { data?: unknown; base?: unknown; force?: unknown };
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: "Malformed request." }, 400);
    }
    const data = body?.data as { attempts?: unknown; settings?: unknown } | undefined;
    if (!data || typeof data !== "object" || !Array.isArray(data.attempts) || typeof data.settings !== "object") {
      return json({ error: "That is not Edgework progress." }, 400);
    }
    const base = typeof body.base === "number" ? body.base : 0;
    const existing = await readData(session.userId);
    if (existing && existing.updatedAt !== base && body.force !== true) {
      return json({ error: "conflict", updatedAt: existing.updatedAt, data: existing.data }, 409);
    }
    const updatedAt = Math.max(Date.now(), (existing?.updatedAt ?? 0) + 1);
    await writeData(session.userId, { updatedAt, data });
    return json({ updatedAt });
  } catch (e) {
    console.error("sync write failed", e);
    return json({ error: "Could not save your progress." }, 500);
  }
}
