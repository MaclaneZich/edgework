import { DEFAULT_SETTINGS, emptyData, type EdgeworkData } from "./store-types";

/** What this browser remembers about its last exchange with the account. */
export interface SyncMeta {
  email: string;
  /** Server version this device last matched; 0 means it has never synced with this account. */
  base: number;
  /** Local changes exist that the server has not confirmed. */
  dirty: boolean;
}

export type SyncDecision = "push" | "noop" | "apply-remote" | "adopt-version" | "conflict";

/**
 * Fills in anything missing or mistyped in a copy that came from outside this browser
 * (an older app version, a hand-edited file), so the rest of the app can trust its shape.
 */
export function normalizeData(raw: unknown): EdgeworkData {
  const base = emptyData();
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = base as unknown as Record<string, unknown>;
  for (const key of Object.keys(base)) {
    const fallback = out[key];
    const value = src[key];
    if (key === "session") {
      out[key] = value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } else if (Array.isArray(fallback)) {
      if (Array.isArray(value)) out[key] = value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = key === "settings" ? { ...DEFAULT_SETTINGS, ...value } : key === "streak" ? { ...(fallback as object), ...value } : value;
    }
  }
  return out as unknown as EdgeworkData;
}

/** True when a device holds no real study progress, so replacing it loses nothing. */
export function isPristine(d: EdgeworkData): boolean {
  return (
    d.attempts.length === 0 &&
    d.studyLog.length === 0 &&
    d.mockResults.length === 0 &&
    d.mentalMath.length === 0 &&
    d.marketGame.length === 0 &&
    d.fermi.length === 0 &&
    d.interview.length === 0 &&
    d.speak.length === 0 &&
    d.errorLog.length === 0 &&
    Object.keys(d.quiz).length === 0 &&
    Object.keys(d.lessonsCompleted).length === 0 &&
    Object.keys(d.coding).length === 0 &&
    Object.values(d.notes).every((n) => !n || n.trim() === "")
  );
}

export function sameData(a: EdgeworkData, b: EdgeworkData): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Decides what to do after reading the account's copy. The rule that matters: a copy
 * holding real progress is never replaced without the user choosing, unless this
 * device has nothing unsaved and has synced with the account before.
 */
export function decideSync(input: { remoteUpdatedAt: number; meta: SyncMeta; localPristine: boolean; identical: boolean }): SyncDecision {
  const { remoteUpdatedAt, meta, localPristine, identical } = input;
  if (remoteUpdatedAt === 0) return "push";
  if (remoteUpdatedAt === meta.base) return meta.dirty ? "push" : "noop";
  if (identical) return "adopt-version";
  if (localPristine) return "apply-remote";
  if (meta.base !== 0 && !meta.dirty) return "apply-remote";
  return "conflict";
}

export interface ProgressSummary {
  attempts: number;
  studyMinutes: number;
  mocks: number;
  lessons: number;
  lastActivity: number | null;
}

export function summarize(d: EdgeworkData): ProgressSummary {
  let last = 0;
  for (const a of d.attempts) if (a.timestamp > last) last = a.timestamp;
  for (const s of d.studyLog) if (s.startedAt > last) last = s.startedAt;
  for (const m of d.mockResults) if (m.finishedAt > last) last = m.finishedAt;
  for (const m of d.mentalMath) if (m.timestamp > last) last = m.timestamp;
  return {
    attempts: d.attempts.length,
    studyMinutes: d.studyLog.reduce((sum, s) => sum + s.minutes, 0),
    mocks: d.mockResults.length,
    lessons: Object.keys(d.lessonsCompleted).length,
    lastActivity: last || null,
  };
}
