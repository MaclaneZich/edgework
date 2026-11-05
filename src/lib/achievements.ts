import type { Attempt, EdgeworkData } from "./store-types";
import { brierScore } from "./calibration";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name hint for the UI. */
  icon: "sparkles" | "flame" | "target" | "trophy" | "brain" | "timer" | "mic" | "trending-up" | "shield" | "zap";
  check: (s: EdgeworkData) => boolean;
}

function correctCount(attempts: Attempt[]): number {
  return attempts.filter((a) => a.correct).length;
}

function studiedMinutes(s: EdgeworkData): number {
  return s.studyLog.reduce((sum, e) => sum + e.minutes, 0);
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-correct", title: "First blood", description: "Your first correct answer.", icon: "sparkles", check: (s) => correctCount(s.attempts) >= 1 },
  { id: "ten-correct", title: "Ten up", description: "Ten correct answers.", icon: "target", check: (s) => correctCount(s.attempts) >= 10 },
  { id: "fifty-correct", title: "Half century", description: "Fifty correct answers.", icon: "target", check: (s) => correctCount(s.attempts) >= 50 },
  { id: "hundred-correct", title: "Century", description: "One hundred correct answers.", icon: "trophy", check: (s) => correctCount(s.attempts) >= 100 },
  { id: "streak-3", title: "Three in a row", description: "Studied three days running.", icon: "flame", check: (s) => s.streak.best >= 3 },
  { id: "streak-7", title: "Full week", description: "A seven-day study streak.", icon: "flame", check: (s) => s.streak.best >= 7 },
  {
    id: "calibrated",
    title: "Well calibrated",
    description: "Brier score under 0.15 across your last 30 problems.",
    icon: "shield",
    check: (s) => {
      const recent = [...s.attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);
      if (recent.length < 30) return false;
      const b = brierScore(recent.map((a) => ({ confidence: a.confidence, correct: a.correct, timestamp: a.timestamp, tags: a.tags, module: a.module })));
      return b !== null && b < 0.15;
    },
  },
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((m) => ({
    id: `mastery-m${m}`,
    title: `Module ${m} mastered`,
    description: `Passed the module ${m} mastery quiz.`,
    icon: "brain" as const,
    check: (s: EdgeworkData) => s.quiz[String(m)]?.passed === true,
  })),
  { id: "first-mock", title: "Dress rehearsal", description: "Finished a full-length mock.", icon: "timer", check: (s) => s.mockResults.some((m) => m.kind !== "drill") },
  { id: "hard-mock", title: "Overkill", description: "Finished a hard mock.", icon: "trophy", check: (s) => s.mockResults.some((m) => m.kind === "hard") },
  { id: "mock-strong", title: "Nine of eleven", description: "Scored at least 9 of 11 on a full mock.", icon: "trophy", check: (s) => s.mockResults.some((m) => m.kind !== "drill" && m.score >= 9) },
  { id: "hard-ten", title: "Deep end", description: "Ten difficulty 4-5 problems solved.", icon: "zap", check: (s) => s.attempts.filter((a) => a.correct && a.difficulty >= 4).length >= 10 },
  { id: "mental-40", title: "Quick hands", description: "Scored 40+ in a 120-second mental math sprint.", icon: "zap", check: (s) => s.mentalMath.some((r) => r.mode === "zetamac" && r.score >= 40) },
  { id: "market-profit", title: "Positive expectancy", description: "Finished a market-making game in profit.", icon: "trending-up", check: (s) => s.marketGame.some((g) => g.pnl > 0) },
  { id: "speak-first", title: "Out loud", description: "Explained a solution aloud for the first time.", icon: "mic", check: (s) => s.speak.length >= 1 },
  { id: "interview-first", title: "In the hot seat", description: "Completed an interview simulation.", icon: "mic", check: (s) => s.interview.length >= 1 },
  { id: "hours-5", title: "Five hours in", description: "Five hours of logged study.", icon: "timer", check: (s) => studiedMinutes(s) >= 300 },
  { id: "hours-10", title: "Halfway", description: "Ten hours of logged study.", icon: "timer", check: (s) => studiedMinutes(s) >= 600 },
  { id: "hours-20", title: "Test ready", description: "Twenty hours of logged study.", icon: "trophy", check: (s) => studiedMinutes(s) >= 1200 },
];

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

/** Ids of achievements whose condition now holds but were not unlocked before. */
export function newlyUnlocked(s: EdgeworkData): string[] {
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.id]) continue;
    try {
      if (a.check(s)) out.push(a.id);
    } catch {
      // a broken check must never break the app
    }
  }
  return out;
}
