/**
 * Problem selection: Smart Sessions, quizzes, drills and the difficulty ramp.
 */

import type { Difficulty, ModuleId, Problem, Tag } from "@/content/types";
import type { TagMastery } from "./mastery";
import { recommendedDifficulty, tagWeakness, BASE_RATING } from "./mastery";
import { dueCards, type SrsCard } from "./srs";
import { rngFromString, shuffle, type Rng } from "./rng";
import type { Attempt } from "./store-types";

export interface SelectionInput {
  candidates: Problem[];
  mastery: Record<string, TagMastery>;
  srs: Record<string, SrsCard>;
  attempts: Attempt[];
  now: number;
  rng: Rng;
  /** Only pick problems carrying one of these tags (calibration sessions). */
  focusTags?: Tag[];
}

const RECENT_MS = 2 * 86_400_000;

function lastAttemptTime(attempts: Attempt[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of attempts) m.set(a.problemId, Math.max(m.get(a.problemId) ?? 0, a.timestamp));
  return m;
}

function solvedIds(attempts: Attempt[]): Set<string> {
  const s = new Set<string>();
  for (const a of attempts) if (a.correct) s.add(a.problemId);
  return s;
}

/** Score how much a problem would teach right now. Higher is better. */
export function learningScore(p: Problem, input: SelectionInput, last: Map<string, number>, solved: Set<string>): number {
  let weakness = 0;
  let targetDiff: Difficulty = 2;
  for (const t of p.tags) {
    const w = tagWeakness(input.mastery[t]);
    if (w > weakness) {
      weakness = w;
      targetDiff = recommendedDifficulty(input.mastery[t]?.rating ?? BASE_RATING);
    }
  }
  let score = weakness;
  const gap = Math.abs(p.difficulty - targetDiff);
  score += gap === 0 ? 0.3 : gap === 1 ? 0.1 : -0.25 * gap;
  if (solved.has(p.id)) score -= 0.6;
  const seen = last.get(p.id);
  if (seen && input.now - seen < RECENT_MS) score -= 0.8;
  if (input.focusTags && !p.tags.some((t) => input.focusTags!.includes(t))) score -= 10;
  score += input.rng() * 0.08;
  return score;
}

/**
 * Pick `count` problems: due reviews first (up to `reviewShare`), then the problems with the
 * highest learning score.
 */
export function selectProblems(input: SelectionInput, count: number, reviewShare = 0.4): Problem[] {
  const byId = new Map(input.candidates.map((p) => [p.id, p]));
  const due = dueCards(input.srs, input.now)
    .map((c) => byId.get(c.problemId))
    .filter((p): p is Problem => Boolean(p))
    .filter((p) => !input.focusTags || p.tags.some((t) => input.focusTags!.includes(t)));
  const reviews = due.slice(0, Math.round(count * reviewShare));
  const chosen = new Set(reviews.map((p) => p.id));
  const last = lastAttemptTime(input.attempts);
  const solved = solvedIds(input.attempts);
  const scored = input.candidates
    .filter((p) => !chosen.has(p.id))
    .map((p) => ({ p, s: learningScore(p, input, last, solved) }))
    .sort((a, b) => b.s - a.s);
  const fresh: Problem[] = [];
  for (const { p } of scored) {
    if (fresh.length >= count - reviews.length) break;
    fresh.push(p);
  }
  return [...reviews, ...fresh];
}

/** Build a session of roughly `minutes` minutes. */
export function buildSmartSession(input: SelectionInput, minutes = 30): Problem[] {
  const pool = selectProblems(input, 40);
  const out: Problem[] = [];
  let total = 0;
  for (const p of pool) {
    if (total + p.minutes > minutes * 1.1 && out.length >= 3) break;
    out.push(p);
    total += p.minutes;
    if (total >= minutes) break;
  }
  return out;
}

/** Deterministic quiz: `size` problems of difficulty 2-4 from the module, varying by attempt number. */
export function quizProblems(moduleProblems: Problem[], moduleId: ModuleId, attemptNumber: number, size: number): Problem[] {
  const rng = rngFromString(`quiz-${moduleId}-${attemptNumber}`);
  const eligible = moduleProblems.filter((p) => p.difficulty >= 2 && p.difficulty <= 4);
  const pool = eligible.length >= size ? eligible : moduleProblems;
  // Aim for a spread: roughly 30% d2, 45% d3, 25% d4.
  const byDiff = (d: number) => shuffle(pool.filter((p) => p.difficulty === d), rng);
  const want = { 2: Math.round(size * 0.3), 3: Math.round(size * 0.45), 4: size - Math.round(size * 0.3) - Math.round(size * 0.45) };
  const picked: Problem[] = [];
  const leftovers: Problem[] = [];
  for (const d of [2, 3, 4] as const) {
    const list = byDiff(d);
    picked.push(...list.slice(0, want[d]));
    leftovers.push(...list.slice(want[d]));
  }
  const rest = shuffle([...leftovers, ...pool.filter((p) => ![2, 3, 4].includes(p.difficulty))], rng);
  for (const p of rest) {
    if (picked.length >= size) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return shuffle(picked.slice(0, size), rng);
}

/** Three problems in eighteen minutes: test-level difficulty from any module with content. */
export function drillProblems(candidates: Problem[], attempts: Attempt[], rng: Rng, count = 3): Problem[] {
  const attempted = new Set(attempts.map((a) => a.problemId));
  const fresh = candidates.filter((p) => p.difficulty >= 2 && p.difficulty <= 4 && !attempted.has(p.id));
  const pool = fresh.length >= count ? fresh : candidates.filter((p) => p.difficulty >= 2 && p.difficulty <= 4);
  return shuffle(pool, rng).slice(0, count);
}
