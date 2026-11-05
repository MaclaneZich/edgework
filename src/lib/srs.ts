/**
 * SM-2 style spaced repetition for missed, hinted or low-confidence problems.
 */

export interface SrsCard {
  problemId: string;
  /** Current interval in days. */
  interval: number;
  /** Ease factor, starts at 2.5, floor 1.3. */
  ease: number;
  /** Consecutive successful reviews. */
  reps: number;
  /** Timestamp (ms) when the card is due. */
  due: number;
  lastReviewed: number;
  lastQuality: number;
  lapses: number;
}

export const DAY_MS = 86_400_000;

export interface SrsOutcome {
  correct: boolean;
  confidence: number;
  hintsUsed: number;
}

/** Should this attempt create a review card if none exists? Misses, hints and shaky confidence do. */
export function shouldTrack(o: SrsOutcome): boolean {
  return !o.correct || o.hintsUsed > 0 || o.confidence < 0.7;
}

/** Map an attempt onto the SM-2 quality scale 0-5. */
export function qualityFromOutcome(o: SrsOutcome): number {
  if (o.correct) {
    if (o.hintsUsed === 0 && o.confidence >= 0.9) return 5;
    if (o.hintsUsed === 0) return 4;
    return 3;
  }
  if (o.confidence >= 0.9) return 0;
  if (o.confidence > 0.5) return 1;
  return 2;
}

export function reviewCard(card: SrsCard | undefined, problemId: string, quality: number, now: number): SrsCard {
  const cur: SrsCard = card ?? {
    problemId,
    interval: 0,
    ease: 2.5,
    reps: 0,
    due: now,
    lastReviewed: now,
    lastQuality: quality,
    lapses: 0,
  };
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { interval, reps, ease, lapses } = cur;
  if (q < 3) {
    reps = 0;
    interval = 1;
    if (card) lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return {
    problemId,
    interval,
    ease,
    reps,
    lapses,
    due: now + interval * DAY_MS,
    lastReviewed: now,
    lastQuality: q,
  };
}

export function isDue(card: SrsCard, now: number): boolean {
  return card.due <= now;
}

export function dueCards(cards: Record<string, SrsCard>, now: number): SrsCard[] {
  return Object.values(cards)
    .filter((c) => isDue(c, now))
    .sort((a, b) => a.due - b.due);
}

/** A card has graduated once it has been recalled cleanly with a long interval. */
export function isGraduated(card: SrsCard): boolean {
  return card.interval >= 21 && card.lastQuality >= 4;
}
