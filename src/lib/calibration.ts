/**
 * Confidence calibration metrics: Brier score, calibration curve, over/under-confidence
 * flags and the blended Confidence Index.
 */

export interface CalibrationAttempt {
  confidence: number;
  correct: boolean;
  timestamp: number;
  tags: string[];
  module: number;
  timeMs?: number;
  estMinutes?: number;
}

export const CONFIDENCE_LEVELS = [0.5, 0.7, 0.9, 0.99] as const;

export function nearestLevel(c: number): number {
  let best: number = CONFIDENCE_LEVELS[0];
  for (const l of CONFIDENCE_LEVELS) if (Math.abs(l - c) < Math.abs(best - c)) best = l;
  return best;
}

/** Mean squared gap between stated confidence and the 0/1 outcome. Lower is better; 0.25 is coin-flip guessing. */
export function brierScore(attempts: CalibrationAttempt[]): number | null {
  if (attempts.length === 0) return null;
  let s = 0;
  for (const a of attempts) s += Math.pow(a.confidence - (a.correct ? 1 : 0), 2);
  return s / attempts.length;
}

/** Rolling Brier score over a window of attempts, in chronological order. */
export function brierSeries(attempts: CalibrationAttempt[], window = 20): Array<{ index: number; brier: number; timestamp: number }> {
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  const out: Array<{ index: number; brier: number; timestamp: number }> = [];
  for (let i = 0; i < sorted.length; i++) {
    const slice = sorted.slice(Math.max(0, i - window + 1), i + 1);
    const b = brierScore(slice);
    if (b !== null) out.push({ index: i + 1, brier: b, timestamp: sorted[i].timestamp });
  }
  return out;
}

export interface CalibrationPoint {
  confidence: number;
  accuracy: number;
  n: number;
}

/** Stated confidence (bucketed to the four levels) versus actual accuracy. */
export function calibrationCurve(attempts: CalibrationAttempt[]): CalibrationPoint[] {
  const buckets = new Map<number, { correct: number; n: number }>();
  for (const l of CONFIDENCE_LEVELS) buckets.set(l, { correct: 0, n: 0 });
  for (const a of attempts) {
    const b = buckets.get(nearestLevel(a.confidence))!;
    b.n++;
    if (a.correct) b.correct++;
  }
  return CONFIDENCE_LEVELS.map((l) => {
    const b = buckets.get(l)!;
    return { confidence: l, accuracy: b.n ? b.correct / b.n : NaN, n: b.n };
  });
}

export interface CalibrationFlag {
  key: string;
  meanConfidence: number;
  accuracy: number;
  /** meanConfidence - accuracy: positive = overconfident. */
  gap: number;
  kind: "over" | "under";
  n: number;
}

/** Groups (tags or modules) where stated confidence and accuracy disagree by more than `threshold`. */
export function calibrationFlags(
  attempts: CalibrationAttempt[],
  groupBy: "tag" | "module",
  minN = 5,
  threshold = 0.15,
): CalibrationFlag[] {
  const groups = new Map<string, CalibrationAttempt[]>();
  for (const a of attempts) {
    const keys = groupBy === "tag" ? a.tags : [String(a.module)];
    for (const k of keys) {
      const arr = groups.get(k) ?? [];
      arr.push(a);
      groups.set(k, arr);
    }
  }
  const out: CalibrationFlag[] = [];
  for (const [key, arr] of groups) {
    if (arr.length < minN) continue;
    const meanConfidence = arr.reduce((s, a) => s + a.confidence, 0) / arr.length;
    const accuracy = arr.filter((a) => a.correct).length / arr.length;
    const gap = meanConfidence - accuracy;
    if (Math.abs(gap) >= threshold) out.push({ key, meanConfidence, accuracy, gap, kind: gap > 0 ? "over" : "under", n: arr.length });
  }
  return out.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
}

/**
 * Confidence Index in [0, 100]: 50% accuracy, 30% calibration (1 - Brier/0.25), 20% speed
 * (share of problems solved within their estimated time). Speed is dropped when no timing
 * data exists and the other weights are renormalised.
 */
export function confidenceIndex(attempts: CalibrationAttempt[]): number | null {
  if (attempts.length === 0) return null;
  const accuracy = attempts.filter((a) => a.correct).length / attempts.length;
  const brier = brierScore(attempts) ?? 0.25;
  const calibration = Math.max(0, Math.min(1, 1 - brier / 0.25));
  const timed = attempts.filter((a) => a.timeMs !== undefined && a.estMinutes !== undefined && a.timeMs > 0);
  if (timed.length === 0) {
    return Math.round(100 * ((0.5 * accuracy + 0.3 * calibration) / 0.8));
  }
  const speed = timed.filter((a) => (a.timeMs ?? 0) <= (a.estMinutes ?? 0) * 60_000).length / timed.length;
  return Math.round(100 * (0.5 * accuracy + 0.3 * calibration + 0.2 * speed));
}
