"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { del as idbDel, get as idbGet, set as idbSet } from "idb-keyval";
import { uid } from "./ids";
import { updateMastery } from "./mastery";
import { DAY_MS, qualityFromOutcome, reviewCard, shouldTrack } from "./srs";
import { todayString, addDays } from "./schedule";
import { newlyUnlocked } from "./achievements";
import {
  emptyData,
  DEFAULT_SETTINGS,
  type Attempt,
  type CodingResult,
  type EdgeworkData,
  type ErrorEntry,
  type FermiResult,
  type InterviewResult,
  type MarketGameResult,
  type MentalMathResult,
  type MockResult,
  type SessionConfig,
  type Settings,
  type SpeakResult,
  type StudyEntry,
} from "./store-types";

export * from "./store-types";

const STORAGE_KEY = "edgework-v1";

/** IndexedDB first, localStorage when IndexedDB is unavailable or fails, no-op on the server. */
const storage: StateStorage = {
  getItem: async (name) => {
    if (typeof window === "undefined") return null;
    try {
      if (typeof indexedDB !== "undefined") {
        const v = await idbGet<string>(name);
        if (v !== undefined) return v;
      }
    } catch {
      /* fall through */
    }
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    if (typeof window === "undefined") return;
    try {
      if (typeof indexedDB !== "undefined") {
        await idbSet(name, value);
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* storage full or blocked; the in-memory state still works */
    }
  },
  removeItem: async (name) => {
    if (typeof window === "undefined") return;
    try {
      if (typeof indexedDB !== "undefined") await idbDel(name);
    } catch {
      /* ignore */
    }
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export interface RecordAttemptInput {
  problemId: string;
  module: Attempt["module"];
  tags: Attempt["tags"];
  difficulty: Attempt["difficulty"];
  estMinutes: number;
  correct: boolean;
  confidence: number;
  timeMs: number;
  hintsUsed: number;
  given: string;
  context: Attempt["context"];
}

export interface EdgeworkStore extends EdgeworkData {
  hydrated: boolean;
  /** Achievement ids unlocked since the last toast; transient. */
  pendingUnlocks: string[];
  /** True while the Pomodoro timer runs, so sessions do not double-log time. */
  timerRunning: boolean;

  setHydrated: (v: boolean) => void;
  recordAttempt: (input: RecordAttemptInput) => Attempt;
  touchStreak: () => void;
  updateError: (id: string, patch: Partial<Pick<ErrorEntry, "category" | "lesson" | "redoBy" | "transcript">>) => void;
  resolveError: (id: string) => void;
  reopenError: (id: string) => void;
  removeError: (id: string) => void;
  setNote: (moduleId: number, text: string) => void;
  logStudy: (entry: Omit<StudyEntry, "id">) => void;
  setTimerRunning: (v: boolean) => void;
  saveMock: (result: Omit<MockResult, "id">) => MockResult;
  saveMentalMath: (result: Omit<MentalMathResult, "id">) => void;
  saveMarketGame: (result: Omit<MarketGameResult, "id">) => void;
  saveFermi: (result: Omit<FermiResult, "id">) => void;
  saveInterview: (result: Omit<InterviewResult, "id">) => void;
  saveSpeak: (result: Omit<SpeakResult, "id">) => void;
  saveCoding: (result: CodingResult) => void;
  recordQuiz: (moduleId: number, score: number, total: number, passRatio: number) => boolean;
  completeLesson: (moduleId: number) => void;
  markSolutionSeen: (problemId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setChecklist: (key: string, checked: boolean) => void;
  startSession: (config: Omit<SessionConfig, "id">) => SessionConfig;
  clearSession: () => void;
  clearPendingUnlocks: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
  resetAll: () => void;
}

const DATA_KEYS: Array<keyof EdgeworkData> = [
  "settings",
  "attempts",
  "mastery",
  "srs",
  "errorLog",
  "notes",
  "studyLog",
  "mockResults",
  "mentalMath",
  "marketGame",
  "fermi",
  "interview",
  "speak",
  "quiz",
  "lessonsCompleted",
  "achievements",
  "streak",
  "coding",
  "session",
  "checklist",
  "seenSolutions",
];

function pickData(s: EdgeworkData): EdgeworkData {
  const out = {} as Record<string, unknown>;
  for (const k of DATA_KEYS) out[k] = s[k];
  return out as unknown as EdgeworkData;
}

function withUnlocks(data: EdgeworkData, pending: string[]): { achievements: Record<string, number>; pendingUnlocks: string[] } {
  const fresh = newlyUnlocked(data);
  if (fresh.length === 0) return { achievements: data.achievements, pendingUnlocks: pending };
  const now = Date.now();
  const achievements = { ...data.achievements };
  for (const id of fresh) achievements[id] = now;
  return { achievements, pendingUnlocks: [...pending, ...fresh] };
}

function nextStreak(streak: EdgeworkData["streak"], today: string): EdgeworkData["streak"] {
  if (streak.lastActive === today) return streak;
  const yesterday = addDays(today, -1);
  const current = streak.lastActive === yesterday ? streak.current + 1 : 1;
  return { current, best: Math.max(streak.best, current), lastActive: today };
}

export const useStore = create<EdgeworkStore>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      hydrated: false,
      pendingUnlocks: [],
      timerRunning: false,

      setHydrated: (v) => set({ hydrated: v }),

      touchStreak: () => set((s) => ({ streak: nextStreak(s.streak, todayString()) })),

      recordAttempt: (input) => {
        const now = Date.now();
        const attempt: Attempt = { ...input, id: uid("a-"), timestamp: now };
        set((s) => {
          const mastery = { ...s.mastery };
          const outcome = {
            correct: input.correct,
            difficulty: input.difficulty,
            hintsUsed: input.hintsUsed,
            timeMs: input.timeMs,
            estMinutes: input.estMinutes,
            confidence: input.confidence,
          };
          for (const tag of input.tags) mastery[tag] = updateMastery(mastery[tag], outcome, now);

          const srs = { ...s.srs };
          const existing = srs[input.problemId];
          if (existing || shouldTrack(outcome)) {
            srs[input.problemId] = reviewCard(existing, input.problemId, qualityFromOutcome(outcome), now);
          }

          let errorLog = s.errorLog;
          const reason: ErrorEntry["reason"] | null = !input.correct ? "wrong" : input.confidence < 0.7 ? "low-confidence" : input.hintsUsed > 0 ? "hints" : null;
          if (reason) {
            const open = s.errorLog.find((e) => e.problemId === input.problemId && e.resolvedAt === null);
            if (!open) {
              const entry: ErrorEntry = {
                id: uid("e-"),
                problemId: input.problemId,
                attemptId: attempt.id,
                category: null,
                lesson: "",
                createdAt: now,
                redoBy: now + (reason === "wrong" ? 2 : 4) * DAY_MS,
                resolvedAt: null,
                reason,
              };
              errorLog = [entry, ...s.errorLog];
            }
          }

          const data: EdgeworkData = {
            ...pickData(s),
            attempts: [...s.attempts, attempt],
            mastery,
            srs,
            errorLog,
            streak: nextStreak(s.streak, todayString()),
          };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        });
        return attempt;
      },

      updateError: (id, patch) =>
        set((s) => ({ errorLog: s.errorLog.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      resolveError: (id) => set((s) => ({ errorLog: s.errorLog.map((e) => (e.id === id ? { ...e, resolvedAt: Date.now() } : e)) })),
      reopenError: (id) => set((s) => ({ errorLog: s.errorLog.map((e) => (e.id === id ? { ...e, resolvedAt: null } : e)) })),
      removeError: (id) => set((s) => ({ errorLog: s.errorLog.filter((e) => e.id !== id) })),

      setNote: (moduleId, text) => set((s) => ({ notes: { ...s.notes, [String(moduleId)]: text } })),

      logStudy: (entry) =>
        set((s) => {
          if (entry.minutes <= 0) return {};
          const data: EdgeworkData = {
            ...pickData(s),
            studyLog: [...s.studyLog, { ...entry, id: uid("s-") }],
            streak: nextStreak(s.streak, todayString()),
          };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        }),
      setTimerRunning: (v) => set({ timerRunning: v }),

      saveMock: (result) => {
        const full: MockResult = { ...result, id: uid("m-") };
        set((s) => {
          const data: EdgeworkData = { ...pickData(s), mockResults: [...s.mockResults, full], streak: nextStreak(s.streak, todayString()) };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        });
        return full;
      },
      saveMentalMath: (result) =>
        set((s) => {
          const data: EdgeworkData = { ...pickData(s), mentalMath: [...s.mentalMath, { ...result, id: uid("mm-") }], streak: nextStreak(s.streak, todayString()) };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        }),
      saveMarketGame: (result) =>
        set((s) => {
          const data: EdgeworkData = { ...pickData(s), marketGame: [...s.marketGame, { ...result, id: uid("mg-") }] };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        }),
      saveFermi: (result) => set((s) => ({ fermi: [...s.fermi, { ...result, id: uid("f-") }] })),
      saveInterview: (result) =>
        set((s) => {
          const data: EdgeworkData = { ...pickData(s), interview: [...s.interview, { ...result, id: uid("i-") }] };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        }),
      saveSpeak: (result) =>
        set((s) => {
          const data: EdgeworkData = { ...pickData(s), speak: [...s.speak, { ...result, id: uid("sp-") }] };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        }),
      saveCoding: (result) => set((s) => ({ coding: { ...s.coding, [result.problemId]: result } })),

      recordQuiz: (moduleId, score, total, passRatio) => {
        const passed = total > 0 && score / total >= passRatio;
        set((s) => {
          const key = String(moduleId);
          const prev = s.quiz[key];
          const rec = {
            attempts: (prev?.attempts ?? 0) + 1,
            bestScore: Math.max(prev?.bestScore ?? 0, score),
            bestTotal: total,
            passed: (prev?.passed ?? false) || passed,
            lastAt: Date.now(),
          };
          const data: EdgeworkData = { ...pickData(s), quiz: { ...s.quiz, [key]: rec } };
          return { ...data, ...withUnlocks(data, s.pendingUnlocks) };
        });
        return passed;
      },

      completeLesson: (moduleId) =>
        set((s) => ({
          lessonsCompleted: { ...s.lessonsCompleted, [String(moduleId)]: s.lessonsCompleted[String(moduleId)] ?? Date.now() },
          streak: nextStreak(s.streak, todayString()),
        })),
      markSolutionSeen: (problemId) => set((s) => ({ seenSolutions: { ...s.seenSolutions, [problemId]: Date.now() } })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setChecklist: (key, checked) => set((s) => ({ checklist: { ...s.checklist, [key]: checked } })),

      startSession: (config) => {
        const full: SessionConfig = { ...config, id: uid("sess-") };
        set({ session: full });
        return full;
      },
      clearSession: () => set({ session: null }),
      clearPendingUnlocks: () => set({ pendingUnlocks: [] }),

      exportJSON: () => {
        const s = get();
        return JSON.stringify({ app: "edgework", version: 1, exportedAt: new Date().toISOString(), data: pickData(s) }, null, 2);
      },
      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json) as { app?: string; version?: number; data?: Partial<EdgeworkData> };
          const data = parsed?.data;
          if (!data || typeof data !== "object" || !Array.isArray(data.attempts)) return { ok: false, error: "That file is not an Edgework export." };
          const merged: EdgeworkData = { ...emptyData(), ...data, settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) } };
          set({ ...merged, pendingUnlocks: [] });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Could not read the file." };
        }
      },
      resetAll: () => set({ ...emptyData(), pendingUnlocks: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      version: 1,
      partialize: (s) => pickData(s) as unknown as EdgeworkStore,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<EdgeworkData>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn("Edgework: could not restore saved progress", error);
        state?.setHydrated(true);
      },
    },
  ),
);

/** Convenience selector for the persisted data slice. Use through useData() in components. */
export function selectData(s: EdgeworkStore): EdgeworkData {
  return pickData(s);
}

/** The persisted data slice, shallow-compared so a render does not trigger another render. */
export function useData(): EdgeworkData {
  return useStore(useShallow(selectData));
}
