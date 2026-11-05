/**
 * Derived views over the persisted data: module progress, heatmaps, planner completion,
 * and the "next best action" recommendation.
 */

import { MODULE_IDS, MODULE_META, PROBLEMS, LESSONS, problemsForModule, hardSetForModule } from "@/content";
import { TAGS, type ModuleId, type Problem, type Tag } from "@/content/types";
import { calibrationFlags, confidenceIndex, type CalibrationAttempt } from "./calibration";
import { masteryPercent } from "./mastery";
import { buildPlan, todayString, todaysTasks, type Plan, type PlanTask } from "./schedule";
import { dueCards } from "./srs";
import type { Attempt, EdgeworkData } from "./store-types";

export function toCalibration(a: Attempt): CalibrationAttempt {
  return { confidence: a.confidence, correct: a.correct, timestamp: a.timestamp, tags: a.tags, module: a.module, timeMs: a.timeMs, estMinutes: a.estMinutes };
}

/** Attempts where the user stated a confidence (mocks and drills record a neutral default and are excluded). */
export function calibrationAttempts(data: EdgeworkData): CalibrationAttempt[] {
  return data.attempts.filter((a) => a.context !== "mock" && a.context !== "drill").map(toCalibration);
}

export interface ModuleStats {
  id: ModuleId;
  total: number;
  attempted: number;
  solved: number;
  hardTotal: number;
  hardSolved: number;
  hardAttempted: number;
  lessonDone: boolean;
  quizPassed: boolean;
  quizBest: string | null;
  percent: number;
  confidenceIndex: number | null;
  mastery: number | null;
  hasContent: boolean;
  attempts: number;
  accuracy: number | null;
}

/** Problems the user has solved at least once (by id). */
export function solvedSet(attempts: Attempt[]): Set<string> {
  const s = new Set<string>();
  for (const a of attempts) if (a.correct) s.add(a.problemId);
  return s;
}

export function attemptedSet(attempts: Attempt[]): Set<string> {
  return new Set(attempts.map((a) => a.problemId));
}

export function moduleStats(data: EdgeworkData, id: ModuleId): ModuleStats {
  const practice = problemsForModule(id);
  const hard = hardSetForModule(id);
  const solved = solvedSet(data.attempts);
  const attempted = attemptedSet(data.attempts);
  const moduleAttempts = data.attempts.filter((a) => a.module === id);
  const lessonDone = Boolean(data.lessonsCompleted[String(id)]);
  const quiz = data.quiz[String(id)];
  const quizPassed = quiz?.passed ?? false;
  const solvedCount = practice.filter((p) => solved.has(p.id)).length;
  const hardSolved = hard.filter((p) => solved.has(p.id)).length;
  const hardAttempted = hard.filter((p) => attempted.has(p.id)).length;
  const hasContent = LESSONS[id] !== null && practice.length > 0;
  const solvedRatio = practice.length ? solvedCount / practice.length : 0;
  const hardRatio = hard.length ? Math.min(1, hardSolved / Math.min(hard.length, 5)) : 0;
  const percent = Math.round(100 * (0.2 * (lessonDone ? 1 : 0) + 0.5 * Math.min(1, solvedRatio / 0.6) + 0.2 * (quizPassed ? 1 : 0) + 0.1 * hardRatio));
  const tagRatings = tagsForModule(id)
    .map((t) => data.mastery[t]?.rating)
    .filter((r): r is number => typeof r === "number");
  const mastery = tagRatings.length ? Math.round(tagRatings.map(masteryPercent).reduce((a, b) => a + b, 0) / tagRatings.length) : null;
  return {
    id,
    total: practice.length,
    attempted: practice.filter((p) => attempted.has(p.id)).length,
    solved: solvedCount,
    hardTotal: hard.length,
    hardSolved,
    hardAttempted,
    lessonDone,
    quizPassed,
    quizBest: quiz ? `${quiz.bestScore}/${quiz.bestTotal}` : null,
    percent: Math.min(100, percent),
    confidenceIndex: confidenceIndex(moduleAttempts.filter((a) => a.context !== "mock" && a.context !== "drill").map(toCalibration)),
    mastery,
    hasContent,
    attempts: moduleAttempts.length,
    accuracy: moduleAttempts.length ? moduleAttempts.filter((a) => a.correct).length / moduleAttempts.length : null,
  };
}

const MODULE_TAGS: Record<ModuleId, Tag[]> = {
  1: ["permutations", "combinations", "stars-and-bars", "complement", "inclusion-exclusion", "derangements", "birthday"],
  2: ["sample-space", "independence", "dice", "coins", "cards", "urns", "symmetry", "geometric-probability"],
  3: ["conditional", "bayes", "total-probability", "monty-hall", "sequential-updating"],
  4: ["expectation", "linearity", "indicators", "coupon-collector", "order-statistics"],
  5: ["variance", "binomial", "geometric-dist", "poisson", "normal", "covariance", "lln"],
  6: ["first-step", "recursion", "random-walk", "gamblers-ruin", "markov", "patterns"],
  7: ["stopping", "backward-induction", "kelly", "games", "auctions", "poker"],
  8: ["market-making", "fermi", "options", "adverse-selection"],
  9: ["pigeonhole", "invariants", "weighing", "hats", "induction", "knights-knaves", "number-puzzle", "search-strategy", "logic"],
  10: ["coding", "simulation", "mental-math", "mixed-review"],
};

export function tagsForModule(id: ModuleId): Tag[] {
  return MODULE_TAGS[id];
}

export function moduleForTag(tag: Tag): ModuleId {
  for (const id of MODULE_IDS) if (MODULE_TAGS[id].includes(tag)) return id;
  return 10;
}

export function allModuleStats(data: EdgeworkData): ModuleStats[] {
  return MODULE_IDS.map((id) => moduleStats(data, id));
}

export function overallPercent(stats: ModuleStats[]): number {
  const weights = MODULE_META.map((m) => m.hours);
  const total = weights.reduce((a, b) => a + b, 0);
  return Math.round(stats.reduce((acc, s, i) => acc + (s.percent * weights[i]) / total, 0));
}

export function studiedMinutes(data: EdgeworkData): number {
  return data.studyLog.reduce((s, e) => s + e.minutes, 0);
}

export function studiedMinutesToday(data: EdgeworkData, today = todayString()): number {
  return data.studyLog.filter((e) => todayString(new Date(e.startedAt)) === today).reduce((s, e) => s + e.minutes, 0);
}

export interface TagStat {
  tag: Tag;
  label: string;
  module: ModuleId;
  attempts: number;
  correct: number;
  accuracy: number | null;
  mastery: number | null;
  meanConfidence: number | null;
}

export function tagStats(data: EdgeworkData): TagStat[] {
  const out: TagStat[] = [];
  for (const tag of Object.keys(TAGS) as Tag[]) {
    const attempts = data.attempts.filter((a) => a.tags.includes(tag));
    const m = data.mastery[tag];
    out.push({
      tag,
      label: TAGS[tag],
      module: moduleForTag(tag),
      attempts: attempts.length,
      correct: attempts.filter((a) => a.correct).length,
      accuracy: attempts.length ? attempts.filter((a) => a.correct).length / attempts.length : null,
      mastery: m ? masteryPercent(m.rating) : null,
      meanConfidence: attempts.length ? attempts.reduce((s, a) => s + a.confidence, 0) / attempts.length : null,
    });
  }
  return out;
}

/** Which planner tasks count as done, derived from the data. */
export function completedTaskIds(data: EdgeworkData): Set<string> {
  const done = new Set<string>();
  const attempted = attemptedSet(data.attempts);
  for (const id of MODULE_IDS) {
    const practice = problemsForModule(id);
    const hard = hardSetForModule(id);
    if (data.lessonsCompleted[String(id)]) done.add(`m${id}-lesson`);
    const practiced = practice.filter((p) => attempted.has(p.id)).length;
    if (practice.length > 0 && practiced >= Math.min(8, Math.ceil(practice.length * 0.4))) done.add(`m${id}-practice`);
    if (data.quiz[String(id)]?.passed) done.add(`m${id}-quiz`);
    if (hard.length > 0 && hard.filter((p) => attempted.has(p.id)).length >= Math.min(4, hard.length)) done.add(`m${id}-hardset`);
  }
  const drills = data.mockResults.filter((m) => m.kind === "drill").length;
  if (drills >= 1) done.add("drill-1");
  if (drills >= 2) done.add("drill-2");
  if (data.mockResults.some((m) => m.kind === "standard")) done.add("mock-standard-1");
  if (data.mockResults.some((m) => m.kind === "hard")) done.add("mock-hard-1");
  if (data.mockResults.some((m) => m.kind === "final" || (m.lockdown && m.kind !== "drill")) || data.mockResults.filter((m) => m.kind === "hard").length >= 2) done.add("mock-final");
  const mental = data.mentalMath.length;
  for (let i = 1; i <= 4; i++) if (mental >= i) done.add(`mental-${i}`);
  for (const key of ["sample-early", "sample-late", "final-formulas", "final-redo", "final-checklist", "test-day"]) {
    if (data.checklist[`task:${key}`]) done.add(key);
  }
  return done;
}

export function currentPlan(data: EdgeworkData, today = todayString()): Plan {
  const moduleHours = Object.fromEntries(MODULE_META.map((m) => [m.id, m.hours])) as Record<ModuleId, number>;
  const moduleTitles = Object.fromEntries(MODULE_META.map((m) => [m.id, m.title])) as Record<ModuleId, string>;
  return buildPlan({
    today,
    testDate: data.settings.testDate,
    totalHours: data.settings.hoursGoal,
    hoursPerDay: data.settings.hoursPerDay ?? undefined,
    completed: completedTaskIds(data),
    moduleHours,
    moduleTitles,
    studiedMinutes: studiedMinutes(data),
  });
}

export interface NextAction {
  title: string;
  description: string;
  href: string;
  cta: string;
  kind: "lesson" | "review" | "plan" | "hardset" | "calibration" | "smart" | "mock";
}

export function firstUnlockedModuleWithoutLesson(data: EdgeworkData): ModuleId | null {
  for (const id of MODULE_IDS) {
    if (LESSONS[id] === null) continue;
    if (!data.lessonsCompleted[String(id)]) return id;
  }
  return null;
}

export function nextBestAction(data: EdgeworkData, now = Date.now()): NextAction {
  const stats = allModuleStats(data);
  if (data.attempts.length === 0 && Object.keys(data.lessonsCompleted).length === 0) {
    return {
      title: "Start with Module 1",
      description: "Counting is the foundation for everything after it. The lesson takes about twenty minutes.",
      href: "/modules/1/lesson",
      cta: "Open the lesson",
      kind: "lesson",
    };
  }
  const due = dueCards(data.srs, now).filter((c) => PROBLEMS.some((p) => p.id === c.problemId));
  if (due.length >= 5) {
    return {
      title: `${due.length} problems are due for review`,
      description: "Spaced repetition only works when the reviews happen. Clear the queue before new material.",
      href: "/redo",
      cta: "Open the Redo Queue",
      kind: "review",
    };
  }
  const plan = currentPlan(data);
  const todays = todaysTasks(plan).filter((t) => t.type !== "rest");
  const firstTask: PlanTask | undefined = todays[0];
  if (firstTask) {
    return {
      title: firstTask.label,
      description: `Today's plan has ${todays.length} task${todays.length === 1 ? "" : "s"} (about ${todays.reduce((s, t) => s + t.minutes, 0)} minutes).`,
      href: firstTask.href,
      cta: "Start",
      kind: "plan",
    };
  }
  const hardCandidate = stats.find((s) => s.hasContent && s.quizPassed && s.hardAttempted === 0 && s.hardTotal > 0);
  if (hardCandidate) {
    return {
      title: `Hard set: ${MODULE_META[hardCandidate.id - 1].title}`,
      description: "You passed the quiz; now stretch past test level so the real thing feels easy.",
      href: `/modules/${hardCandidate.id}`,
      cta: "Open the hard set",
      kind: "hardset",
    };
  }
  const flags = calibrationFlags(calibrationAttempts(data), "tag", 8).filter((f) => f.kind === "over");
  if (flags.length) {
    const label = TAGS[flags[0].key as Tag] ?? flags[0].key;
    return {
      title: `You are overconfident on ${label}`,
      description: `Stated confidence ran ${Math.round(flags[0].gap * 100)} points above accuracy. A focused session will recalibrate.`,
      href: `/smart?tag=${flags[0].key}`,
      cta: "Calibration session",
      kind: "calibration",
    };
  }
  return {
    title: "Smart Session",
    description: "Thirty minutes built from your weakest tags and anything due for review.",
    href: "/smart",
    cta: "Build a session",
    kind: "smart",
  };
}

export function problemsSolvedCount(data: EdgeworkData): number {
  return solvedSet(data.attempts).size;
}

export function recentAttempts(data: EdgeworkData, n = 10): Attempt[] {
  return [...data.attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, n);
}

export function problemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}
