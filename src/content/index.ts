import type { Lesson, ModuleId, Problem } from "./types";
import { MODULE_META, type ModuleMeta } from "./moduleMeta";

import { lesson as l1 } from "./modules/m1";
import { lesson as l2 } from "./modules/m2";
import { lesson as l3 } from "./modules/m3";
import { lesson as l4 } from "./modules/m4";
import { lesson as l5 } from "./modules/m5";
import { lesson as l6 } from "./modules/m6";
import { lesson as l7 } from "./modules/m7";
import { lesson as l8 } from "./modules/m8";
import { lesson as l9 } from "./modules/m9";
import { lesson as l10 } from "./modules/m10";

import { problems as p1 } from "./problems/m1";
import { problems as p2 } from "./problems/m2";
import { problems as p3 } from "./problems/m3";
import { problems as p4 } from "./problems/m4";
import { problems as p5 } from "./problems/m5";
import { problems as p6 } from "./problems/m6";
import { problems as p7 } from "./problems/m7";
import { problems as p8 } from "./problems/m8";
import { problems as p9 } from "./problems/m9";
import { problems as p10 } from "./problems/m10";
import { problems as pBrain } from "./problems/brainteasers";

export const LESSONS: Record<ModuleId, Lesson | null> = {
  1: l1,
  2: l2,
  3: l3,
  4: l4,
  5: l5,
  6: l6,
  7: l7,
  8: l8,
  9: l9,
  10: l10,
};

export const PROBLEMS: Problem[] = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7, ...p8, ...p9, ...p10, ...pBrain];

export const PROBLEM_BY_ID: ReadonlyMap<string, Problem> = new Map(PROBLEMS.map((p) => [p.id, p]));

export function getProblem(id: string): Problem | undefined {
  return PROBLEM_BY_ID.get(id);
}

export function problemsForModule(id: ModuleId, kind: Problem["kind"] = "practice"): Problem[] {
  return PROBLEMS.filter((p) => p.module === id && p.kind === kind);
}

export function hardSetForModule(id: ModuleId): Problem[] {
  return problemsForModule(id).filter((p) => p.difficulty >= 4);
}

export function lessonChecksForModule(id: ModuleId): Problem[] {
  return PROBLEMS.filter((p) => p.module === id && p.kind === "lessonCheck");
}

export const BRAINTEASERS: Problem[] = PROBLEMS.filter((p) => p.kind === "brainteaser");

export { MODULE_META };
export type { ModuleMeta };

export const MODULE_IDS: ModuleId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function moduleHasContent(id: ModuleId): boolean {
  return LESSONS[id] !== null && problemsForModule(id).length > 0;
}
