/**
 * Elo-style mastery estimation per tag.
 *
 * Each tag has a rating; each problem has a rating derived from its difficulty. After an
 * attempt, every tag on the problem moves toward the observed performance. Hints discount
 * a correct answer, a quick clean solve earns a small bonus, and a confident miss costs
 * more than a tentative one.
 */

import type { Difficulty } from "@/content/types";

export interface TagMastery {
  rating: number;
  /** Number of attempts that touched this tag. */
  n: number;
  /** Number of correct attempts. */
  correct: number;
  updatedAt: number;
}

export const BASE_RATING = 1200;

export function problemRating(d: Difficulty): number {
  return 800 + 200 * d; // 1000, 1200, 1400, 1600, 1800
}

/** Probability that a player with `user` rating solves a problem with `problem` rating. */
export function expectedScore(user: number, problem: number): number {
  return 1 / (1 + Math.pow(10, (problem - user) / 400));
}

export interface AttemptOutcome {
  correct: boolean;
  difficulty: Difficulty;
  hintsUsed: number;
  timeMs: number;
  /** The problem's estimated minutes. */
  estMinutes: number;
  /** Stated confidence in [0, 1]. */
  confidence: number;
}

/** Observed performance in [0, 1.1]: 0 for a miss, discounted by hints, bonus for a fast clean solve. */
export function performanceScore(o: AttemptOutcome): number {
  if (!o.correct) return 0;
  let s = Math.max(0.3, 1 - 0.25 * o.hintsUsed);
  const fast = o.timeMs > 0 && o.timeMs <= 0.6 * o.estMinutes * 60_000;
  if (fast && o.hintsUsed === 0) s = 1.1;
  return s;
}

export function kFactor(n: number, o: AttemptOutcome): number {
  let k = n < 5 ? 48 : n < 15 ? 32 : 20;
  if (!o.correct && o.confidence >= 0.9) k *= 1.3;
  return k;
}

export function updateMastery(prev: TagMastery | undefined, o: AttemptOutcome, now: number): TagMastery {
  const cur: TagMastery = prev ?? { rating: BASE_RATING, n: 0, correct: 0, updatedAt: now };
  const p = expectedScore(cur.rating, problemRating(o.difficulty));
  const s = performanceScore(o);
  const k = kFactor(cur.n, o);
  const rating = Math.max(400, Math.min(2800, cur.rating + k * (s - p)));
  return { rating, n: cur.n + 1, correct: cur.correct + (o.correct ? 1 : 0), updatedAt: now };
}

/** Mastery as a percentage: the chance of solving a difficulty-4 problem. */
export function masteryPercent(rating: number): number {
  return Math.round(100 * expectedScore(rating, problemRating(4)));
}

export function masteryLabel(percent: number): string {
  if (percent < 20) return "Starting";
  if (percent < 40) return "Developing";
  if (percent < 60) return "Solid";
  if (percent < 80) return "Strong";
  return "Expert";
}

/** The difficulty that gives roughly a 65% solve chance: hard enough to learn, easy enough to finish. */
export function recommendedDifficulty(rating: number): Difficulty {
  let best: Difficulty = 1;
  let bestGap = Infinity;
  for (const d of [1, 2, 3, 4, 5] as Difficulty[]) {
    const gap = Math.abs(expectedScore(rating, problemRating(d)) - 0.65);
    if (gap < bestGap) {
      bestGap = gap;
      best = d;
    }
  }
  return best;
}

/**
 * Difficulty ramp inside a session: up one level after three quick correct answers in a
 * row, down one after two misses in a row, otherwise unchanged.
 */
export function rampDifficulty(current: Difficulty, recent: Array<{ correct: boolean; fast: boolean }>): Difficulty {
  const last3 = recent.slice(-3);
  const last2 = recent.slice(-2);
  if (last3.length === 3 && last3.every((r) => r.correct && r.fast)) return Math.min(5, current + 1) as Difficulty;
  if (last2.length === 2 && last2.every((r) => !r.correct)) return Math.max(1, current - 1) as Difficulty;
  return current;
}

/** Weakness in [0, 1]: how much a tag needs work. Unseen tags get a moderate default. */
export function tagWeakness(m: TagMastery | undefined): number {
  if (!m || m.n === 0) return 0.7;
  const solveChance = expectedScore(m.rating, problemRating(3));
  // Shrink toward the prior when we have little data.
  const w = 1 - solveChance;
  const shrink = Math.min(1, m.n / 6);
  return shrink * w + (1 - shrink) * 0.7;
}
