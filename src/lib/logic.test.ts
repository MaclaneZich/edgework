import { describe, expect, it } from "vitest";
import {
  BASE_RATING,
  expectedScore,
  masteryPercent,
  performanceScore,
  problemRating,
  rampDifficulty,
  recommendedDifficulty,
  tagWeakness,
  updateMastery,
} from "./mastery";
import { DAY_MS, dueCards, isGraduated, qualityFromOutcome, reviewCard, shouldTrack } from "./srs";
import { brierScore, brierSeries, calibrationCurve, calibrationFlags, confidenceIndex, nearestLevel } from "./calibration";
import { addDays, buildPlan, daysBetween, todaysTasks } from "./schedule";
import type { ModuleId } from "@/content/types";

const now = 1_700_000_000_000;

describe("mastery (Elo)", () => {
  it("maps difficulty to ratings and gives 50% at equal rating", () => {
    expect(problemRating(1)).toBe(1000);
    expect(problemRating(5)).toBe(1800);
    expect(expectedScore(1400, 1400)).toBeCloseTo(0.5);
    expect(expectedScore(1800, 1400)).toBeGreaterThan(0.9);
  });

  it("raises the rating after a correct answer and lowers it after a miss", () => {
    const base = { correct: true, difficulty: 3 as const, hintsUsed: 0, timeMs: 120_000, estMinutes: 3, confidence: 0.7 };
    const up = updateMastery(undefined, base, now);
    expect(up.rating).toBeGreaterThan(BASE_RATING);
    expect(up.n).toBe(1);
    expect(up.correct).toBe(1);
    const down = updateMastery(undefined, { ...base, correct: false }, now);
    expect(down.rating).toBeLessThan(BASE_RATING);
  });

  it("discounts hints and boosts fast clean solves", () => {
    const o = { correct: true, difficulty: 3 as const, hintsUsed: 0, timeMs: 60_000, estMinutes: 3, confidence: 0.9 };
    expect(performanceScore(o)).toBe(1.1);
    expect(performanceScore({ ...o, timeMs: 200_000 })).toBe(1);
    expect(performanceScore({ ...o, hintsUsed: 2, timeMs: 200_000 })).toBe(0.5);
    expect(performanceScore({ ...o, hintsUsed: 3 })).toBe(0.3);
    expect(performanceScore({ ...o, correct: false })).toBe(0);
  });

  it("penalises confident misses more than tentative ones", () => {
    const o = { correct: false, difficulty: 3 as const, hintsUsed: 0, timeMs: 60_000, estMinutes: 3, confidence: 0.5 };
    const tentative = updateMastery(undefined, o, now);
    const confident = updateMastery(undefined, { ...o, confidence: 0.99 }, now);
    expect(confident.rating).toBeLessThan(tentative.rating);
  });

  it("recommends harder problems as the rating grows and ramps difficulty on streaks", () => {
    expect(recommendedDifficulty(1200)).toBeLessThanOrEqual(2);
    expect(recommendedDifficulty(1700)).toBeGreaterThanOrEqual(4);
    expect(rampDifficulty(2, [{ correct: true, fast: true }, { correct: true, fast: true }, { correct: true, fast: true }])).toBe(3);
    expect(rampDifficulty(3, [{ correct: false, fast: false }, { correct: false, fast: false }])).toBe(2);
    expect(rampDifficulty(3, [{ correct: true, fast: false }, { correct: true, fast: true }])).toBe(3);
    expect(rampDifficulty(5, [{ correct: true, fast: true }, { correct: true, fast: true }, { correct: true, fast: true }])).toBe(5);
  });

  it("reports mastery percent and weakness sensibly", () => {
    expect(masteryPercent(1600)).toBe(50);
    expect(tagWeakness(undefined)).toBeCloseTo(0.7);
    const strong = { rating: 1900, n: 20, correct: 18, updatedAt: now };
    const weak = { rating: 1000, n: 20, correct: 4, updatedAt: now };
    expect(tagWeakness(strong)).toBeLessThan(tagWeakness(weak));
  });
});

describe("spaced repetition (SM-2)", () => {
  it("tracks misses, hints and low confidence only", () => {
    expect(shouldTrack({ correct: true, confidence: 0.9, hintsUsed: 0 })).toBe(false);
    expect(shouldTrack({ correct: false, confidence: 0.9, hintsUsed: 0 })).toBe(true);
    expect(shouldTrack({ correct: true, confidence: 0.5, hintsUsed: 0 })).toBe(true);
    expect(shouldTrack({ correct: true, confidence: 0.9, hintsUsed: 1 })).toBe(true);
  });

  it("maps outcomes to quality 0-5", () => {
    expect(qualityFromOutcome({ correct: true, confidence: 0.99, hintsUsed: 0 })).toBe(5);
    expect(qualityFromOutcome({ correct: true, confidence: 0.7, hintsUsed: 0 })).toBe(4);
    expect(qualityFromOutcome({ correct: true, confidence: 0.7, hintsUsed: 2 })).toBe(3);
    expect(qualityFromOutcome({ correct: false, confidence: 0.5, hintsUsed: 0 })).toBe(2);
    expect(qualityFromOutcome({ correct: false, confidence: 0.7, hintsUsed: 0 })).toBe(1);
    expect(qualityFromOutcome({ correct: false, confidence: 0.99, hintsUsed: 0 })).toBe(0);
  });

  it("follows the SM-2 interval sequence 1, 6, then ease-multiplied", () => {
    let c = reviewCard(undefined, "p", 4, now);
    expect(c.interval).toBe(1);
    expect(c.due).toBe(now + DAY_MS);
    c = reviewCard(c, "p", 4, c.due);
    expect(c.interval).toBe(6);
    c = reviewCard(c, "p", 5, c.due);
    expect(c.interval).toBeGreaterThanOrEqual(15);
    expect(c.reps).toBe(3);
    const lapsed = reviewCard(c, "p", 1, c.due);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.ease).toBeLessThan(c.ease);
    expect(lapsed.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("lists due cards in due order and detects graduation", () => {
    const a = reviewCard(undefined, "a", 4, now - 3 * DAY_MS);
    const b = reviewCard(undefined, "b", 4, now - 2 * DAY_MS);
    const future = reviewCard(undefined, "c", 4, now);
    const due = dueCards({ a, b, c: future }, now);
    expect(due.map((d) => d.problemId)).toEqual(["a", "b"]);
    expect(isGraduated({ ...a, interval: 30, lastQuality: 5 })).toBe(true);
    expect(isGraduated(a)).toBe(false);
  });
});

describe("calibration", () => {
  const mk = (confidence: number, correct: boolean, i = 0) => ({ confidence, correct, timestamp: now + i * 1000, tags: ["bayes"], module: 3, timeMs: 60_000, estMinutes: 2 });

  it("computes the Brier score", () => {
    expect(brierScore([])).toBeNull();
    expect(brierScore([mk(1, true), mk(0, false)])).toBe(0);
    expect(brierScore([mk(0.5, true), mk(0.5, false)])).toBeCloseTo(0.25);
    expect(brierScore([mk(0.9, false)])).toBeCloseTo(0.81);
  });

  it("buckets confidence to the nearest level and builds the curve", () => {
    expect(nearestLevel(0.55)).toBe(0.5);
    expect(nearestLevel(0.78)).toBe(0.7);
    expect(nearestLevel(0.95)).toBe(0.99);
    const curve = calibrationCurve([mk(0.9, true), mk(0.9, false), mk(0.5, true)]);
    const p90 = curve.find((c) => c.confidence === 0.9)!;
    expect(p90.n).toBe(2);
    expect(p90.accuracy).toBeCloseTo(0.5);
    expect(curve.find((c) => c.confidence === 0.7)!.n).toBe(0);
  });

  it("flags overconfidence by tag", () => {
    const attempts = Array.from({ length: 8 }, (_, i) => mk(0.9, i < 3, i));
    const flags = calibrationFlags(attempts, "tag");
    expect(flags).toHaveLength(1);
    expect(flags[0].key).toBe("bayes");
    expect(flags[0].kind).toBe("over");
    expect(calibrationFlags(attempts.slice(0, 3), "tag")).toHaveLength(0);
  });

  it("produces a rolling Brier series and a confidence index", () => {
    const attempts = Array.from({ length: 30 }, (_, i) => mk(0.7, i % 3 !== 0, i));
    const series = brierSeries(attempts, 10);
    expect(series).toHaveLength(30);
    expect(series.at(-1)!.brier).toBeGreaterThan(0);
    const idx = confidenceIndex(attempts)!;
    expect(idx).toBeGreaterThan(50);
    expect(idx).toBeLessThanOrEqual(100);
    expect(confidenceIndex([])).toBeNull();
    const perfect = confidenceIndex([mk(0.99, true), mk(0.99, true)])!;
    expect(perfect).toBeGreaterThan(95);
  });
});

describe("schedule planner", () => {
  const moduleHours: Record<ModuleId, number> = { 1: 1.5, 2: 1.5, 3: 1.75, 4: 1.75, 5: 1.25, 6: 1.5, 7: 1.25, 8: 1, 9: 1.25, 10: 0.75 };
  const moduleTitles = Object.fromEntries(Object.keys(moduleHours).map((k) => [k, `Module ${k}`])) as Record<ModuleId, string>;
  const base = { today: "2026-11-05", testDate: "2026-11-13", completed: new Set<string>(), moduleHours, moduleTitles };

  it("handles dates", () => {
    expect(addDays("2026-11-05", 8)).toBe("2026-11-13");
    expect(daysBetween("2026-11-05", "2026-11-13")).toBe(8);
  });

  it("covers every module, places the final mock two days before and keeps the last day light", () => {
    const plan = buildPlan(base);
    const dates = plan.days.map((d) => d.date);
    expect(dates[0]).toBe("2026-11-05");
    expect(dates.at(-1)).toBe("2026-11-13");
    const allIds = plan.days.flatMap((d) => d.tasks.map((t) => t.id));
    for (let m = 1; m <= 10; m++) {
      expect(allIds).toContain(`m${m}-lesson`);
      expect(allIds).toContain(`m${m}-practice`);
      expect(allIds).toContain(`m${m}-quiz`);
      expect(allIds).toContain(`m${m}-hardset`);
    }
    const finalMockDay = plan.days.find((d) => d.tasks.some((t) => t.id === "mock-final"))!;
    expect(finalMockDay.date).toBe("2026-11-11");
    const light = plan.days.find((d) => d.date === "2026-11-12")!;
    expect(light.kind).toBe("light");
    expect(light.minutes).toBeLessThanOrEqual(45);
    const test = plan.days.find((d) => d.date === "2026-11-13")!;
    expect(test.kind).toBe("test");
    expect(test.tasks.every((t) => t.type === "checklist")).toBe(true);
    // About the 20-hour target: modules 13.5h + three mocks, drills, mental math and the fixed final days
    expect(plan.totalMinutes).toBeGreaterThan(19 * 60);
    expect(plan.totalMinutes).toBeLessThan(22 * 60);
    // Modules appear in order
    const lessonDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => plan.days.findIndex((d) => d.tasks.some((t) => t.id === `m${m}-lesson`)));
    for (let i = 1; i < lessonDays.length; i++) expect(lessonDays[i]).toBeGreaterThanOrEqual(lessonDays[i - 1]);
  });

  it("drops completed tasks and rebalances the rest over the remaining days", () => {
    const completed = new Set(["sample-early", "m1-lesson", "m1-practice", "m1-quiz", "m1-hardset", "m2-lesson"]);
    const plan = buildPlan({ ...base, today: "2026-11-07", completed });
    const ids = plan.days.flatMap((d) => d.tasks.map((t) => t.id));
    expect(ids).not.toContain("m1-lesson");
    expect(ids).toContain("m2-practice");
    expect(plan.days[0].date).toBe("2026-11-07");
    expect(todaysTasks(plan).length).toBeGreaterThan(0);
    const behindPlan = buildPlan({ ...base, today: "2026-11-10" });
    expect(behindPlan.dailyMinutes).toBeGreaterThan(plan.dailyMinutes);
  });

  it("reports overflow when a fixed daily budget cannot fit the work", () => {
    const plan = buildPlan({ ...base, today: "2026-11-10", hoursPerDay: 1 });
    expect(plan.overflowMinutes).toBeGreaterThan(0);
    expect(plan.behind).toBe(true);
    const roomy = buildPlan({ ...base, hoursPerDay: 6 });
    expect(roomy.overflowMinutes).toBe(0);
  });

  it("degrades gracefully on or after the test date", () => {
    const plan = buildPlan({ ...base, today: "2026-11-13" });
    expect(plan.days).toHaveLength(1);
    expect(plan.days[0].kind).toBe("test");
    const two = buildPlan({ ...base, today: "2026-11-12" });
    expect(two.days.map((d) => d.kind)).toEqual(["study", "test"]);
  });
});
