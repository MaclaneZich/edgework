/**
 * Day-by-day study planner.
 *
 * Given the test date and either hours per day or a total-hours target, the planner lays out
 * every module (lesson, practice, quiz, hard set), the official sample test, mental math,
 * standard and hard mocks, a full-length mock two days before the test, a light final day,
 * and a test-day checklist. The plan is a pure function of (today, settings, completed task
 * ids), so it rebalances itself whenever the user falls behind: tasks that were not done
 * simply flow into the remaining days.
 */

import type { ModuleId } from "@/content/types";

export type PlanTaskType =
  | "lesson"
  | "practice"
  | "quiz"
  | "hardset"
  | "mock"
  | "drill"
  | "mental"
  | "review"
  | "sample"
  | "checklist"
  | "rest";

export interface PlanTask {
  id: string;
  type: PlanTaskType;
  module?: ModuleId;
  minutes: number;
  label: string;
  href: string;
  /** Lower = more important to keep on schedule. */
  priority: number;
}

export interface PlanDay {
  /** YYYY-MM-DD */
  date: string;
  tasks: PlanTask[];
  minutes: number;
  kind: "study" | "mock" | "light" | "test" | "past";
  note?: string;
}

export interface Plan {
  today: string;
  testDate: string;
  days: PlanDay[];
  totalMinutes: number;
  dailyMinutes: number;
  /** Minutes of planned work that could not fit before the test at the given daily budget. */
  overflowMinutes: number;
  behind: boolean;
}

export interface PlanOptions {
  today: string;
  testDate: string;
  /** Total hours to spread across the days (default 20). Ignored when hoursPerDay is set. */
  totalHours?: number;
  /** Fixed daily budget in hours; when set, the plan may not fit and overflowMinutes reports it. */
  hoursPerDay?: number;
  completed: ReadonlySet<string>;
  moduleHours: Record<ModuleId, number>;
  moduleTitles: Record<ModuleId, string>;
  /** Minutes already studied, to judge whether the user is behind. */
  studiedMinutes?: number;
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86_400_000);
}

export function todayString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MODULE_IDS: ModuleId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Every unit of work in curriculum order. */
export function buildWorkUnits(moduleHours: Record<ModuleId, number>, moduleTitles: Record<ModuleId, string>): PlanTask[] {
  const units: PlanTask[] = [];
  units.push({
    id: "sample-early",
    type: "sample",
    minutes: 30,
    label: "Take the official HackerRank sample test once, early",
    href: "/mock",
    priority: 1,
  });
  for (const m of MODULE_IDS) {
    const total = Math.round(moduleHours[m] * 60);
    const title = moduleTitles[m];
    units.push({ id: `m${m}-lesson`, type: "lesson", module: m, minutes: Math.round(total * 0.25), label: `Lesson: ${title}`, href: `/modules/${m}/lesson`, priority: 2 });
    units.push({ id: `m${m}-practice`, type: "practice", module: m, minutes: Math.round(total * 0.45), label: `Practice set: ${title}`, href: `/modules/${m}`, priority: 2 });
    units.push({ id: `m${m}-quiz`, type: "quiz", module: m, minutes: Math.round(total * 0.15), label: `Mastery quiz: ${title}`, href: `/modules/${m}`, priority: 3 });
    units.push({ id: `m${m}-hardset`, type: "hardset", module: m, minutes: Math.max(10, total - Math.round(total * 0.25) - Math.round(total * 0.45) - Math.round(total * 0.15)), label: `Hard set: ${title}`, href: `/modules/${m}`, priority: 4 });
    if (m === 3) units.push({ id: "drill-1", type: "drill", minutes: 20, label: "Pacing drill: 3 problems in 18 minutes", href: "/mock", priority: 3 });
    if (m === 5) units.push({ id: "mock-standard-1", type: "mock", minutes: 90, label: "Standard mock (75 min) + review", href: "/mock", priority: 1 });
    if (m === 7) units.push({ id: "drill-2", type: "drill", minutes: 20, label: "Pacing drill: 3 problems in 18 minutes", href: "/mock", priority: 3 });
    if (m === 8) units.push({ id: "mock-hard-1", type: "mock", minutes: 90, label: "Hard mock (75 min) + review", href: "/mock", priority: 1 });
  }
  for (let i = 1; i <= 4; i++) {
    units.push({ id: `mental-${i}`, type: "mental", minutes: 10, label: "Mental math: 120-second sprint", href: "/mental-math", priority: 6 });
  }
  return units;
}

function spreadMentalMath(units: PlanTask[]): PlanTask[] {
  // Interleave the mental-math units so they land on alternate days instead of bunching up.
  const mental = units.filter((u) => u.type === "mental");
  const rest = units.filter((u) => u.type !== "mental");
  if (mental.length === 0) return rest;
  const out: PlanTask[] = [];
  const gap = Math.max(1, Math.floor(rest.length / (mental.length + 1)));
  let mi = 0;
  rest.forEach((u, i) => {
    out.push(u);
    if ((i + 1) % gap === 0 && mi < mental.length) out.push(mental[mi++]);
  });
  while (mi < mental.length) out.push(mental[mi++]);
  return out;
}

export function buildPlan(opts: PlanOptions): Plan {
  const { today, testDate, completed } = opts;
  const totalHours = opts.totalHours ?? 20;
  const daysLeft = daysBetween(today, testDate); // test day excluded from study
  const days: PlanDay[] = [];

  const allUnits = spreadMentalMath(buildWorkUnits(opts.moduleHours, opts.moduleTitles));
  const remaining = allUnits.filter((u) => !completed.has(u.id));
  const remainingMinutes = remaining.reduce((s, u) => s + u.minutes, 0);

  // Fixed items: final full-length mock two days before, light day before, checklist on test day.
  const finalMock: PlanTask = { id: "mock-final", type: "mock", minutes: 90, label: "Full-length mock, test conditions (lockdown rehearsal)", href: "/mock", priority: 0 };
  const sampleLate: PlanTask = { id: "sample-late", type: "sample", minutes: 30, label: "Official HackerRank sample test, second pass", href: "/mock", priority: 1 };
  const lightTasks: PlanTask[] = [
    { id: "final-formulas", type: "review", minutes: 20, label: "Skim the formula sheet and classic families", href: "/formulas", priority: 1 },
    { id: "final-redo", type: "review", minutes: 15, label: "Clear the Redo Queue (short)", href: "/redo", priority: 1 },
    { id: "final-checklist", type: "checklist", minutes: 10, label: "Run the pre-test checklist and set up your room", href: "/mock/checklist", priority: 0 },
  ];
  const testTasks: PlanTask[] = [{ id: "test-day", type: "checklist", minutes: 10, label: "Test day: checklist, water, calculator, paper. No new material.", href: "/mock/checklist", priority: 0 }];

  if (daysLeft <= 0) {
    days.push({ date: today, tasks: testTasks.filter((t) => !completed.has(t.id)), minutes: 10, kind: "test", note: "Test day" });
    return { today, testDate, days, totalMinutes: 10, dailyMinutes: 10, overflowMinutes: remainingMinutes, behind: remainingMinutes > 0 };
  }

  // Study days are today .. testDate-1. Reserve the last study day as light and the one before for the final mock.
  const studyDates: string[] = [];
  for (let i = 0; i < daysLeft; i++) studyDates.push(addDays(today, i));
  const lightDate = daysLeft >= 2 ? studyDates[studyDates.length - 1] : null;
  const finalMockDate = daysLeft >= 3 ? studyDates[studyDates.length - 2] : null;
  const regularDates = studyDates.filter((d) => d !== lightDate && d !== finalMockDate);

  const fixedMinutes = (lightDate ? 45 : 0) + (finalMockDate ? 120 : 0);
  const budgetMinutes = opts.hoursPerDay ? opts.hoursPerDay * 60 * Math.max(1, regularDates.length) : Math.max(0, totalHours * 60 - fixedMinutes);
  const dailyMinutes = opts.hoursPerDay ? opts.hoursPerDay * 60 : regularDates.length ? Math.max(remainingMinutes, budgetMinutes) / regularDates.length : remainingMinutes;

  const dayTasks = new Map<string, PlanTask[]>();
  for (const d of regularDates) dayTasks.set(d, []);
  let overflow = 0;
  if (regularDates.length === 0) {
    overflow = remainingMinutes;
  } else {
    let di = 0;
    const cap = dailyMinutes * 1.15;
    for (const unit of remaining) {
      // move to the next day when this one is full, but always place at least one task per day
      while (di < regularDates.length - 1) {
        const cur = dayTasks.get(regularDates[di])!;
        const used = cur.reduce((s, t) => s + t.minutes, 0);
        if (cur.length > 0 && used + unit.minutes > cap) di++;
        else break;
      }
      const cur = dayTasks.get(regularDates[di])!;
      const used = cur.reduce((s, t) => s + t.minutes, 0);
      if (opts.hoursPerDay && di === regularDates.length - 1 && cur.length > 0 && used + unit.minutes > cap) {
        overflow += unit.minutes;
        continue;
      }
      cur.push(unit);
    }
  }

  for (const d of regularDates) {
    const tasks = dayTasks.get(d)!;
    days.push({ date: d, tasks, minutes: tasks.reduce((s, t) => s + t.minutes, 0), kind: "study" });
  }
  if (finalMockDate) {
    const tasks = [finalMock, sampleLate].filter((t) => !completed.has(t.id));
    days.push({ date: finalMockDate, tasks, minutes: tasks.reduce((s, t) => s + t.minutes, 0), kind: "mock", note: "Dress rehearsal: full mock under test conditions" });
  }
  if (lightDate) {
    const tasks = lightTasks.filter((t) => !completed.has(t.id));
    days.push({ date: lightDate, tasks, minutes: tasks.reduce((s, t) => s + t.minutes, 0), kind: "light", note: "Light day: review only, sleep well" });
  }
  days.push({ date: testDate, tasks: testTasks.filter((t) => !completed.has(t.id)), minutes: 10, kind: "test", note: "Test day" });

  days.sort((a, b) => a.date.localeCompare(b.date));
  const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);

  // Behind: the daily budget cannot fit the work, or the catch-up load exceeds three hours a day.
  const behind = overflow > 0 || (regularDates.length > 0 && dailyMinutes > 240);

  return { today, testDate, days, totalMinutes, dailyMinutes: Math.round(dailyMinutes), overflowMinutes: overflow, behind };
}

export function todaysTasks(plan: Plan): PlanTask[] {
  return plan.days.find((d) => d.date === plan.today)?.tasks ?? [];
}
