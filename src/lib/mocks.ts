/**
 * Mock assembly. Mocks are built deterministically from the problem bank by module and
 * difficulty so the mix resembles the real test (mostly probability, expectation,
 * conditional probability and logic, with some estimation), and no problem repeats across
 * mocks. Because the assembly is a pure function of the bank, the mocks are stable for a
 * given content build.
 */

import type { Difficulty, ModuleId, Problem } from "@/content/types";
import { rngFromString, shuffle, weightedPick } from "./rng";

export type MockKind = "standard" | "hard";

export interface MockDef {
  id: string;
  title: string;
  kind: MockKind;
  description: string;
  problemIds: string[];
  codingId: string;
  /** Total minutes. */
  minutes: number;
}

/** How many math questions per module in an 11-question mock. */
const COMPOSITION: Array<[ModuleId, number]> = [
  [1, 1],
  [2, 1],
  [3, 2],
  [4, 2],
  [5, 1],
  [6, 1],
  [7, 1],
  [8, 1],
  [9, 1],
];

const WEIGHTS: Record<MockKind, Partial<Record<Difficulty, number>>> = {
  standard: { 2: 0.3, 3: 0.5, 4: 0.2 },
  hard: { 3: 0.3, 4: 0.45, 5: 0.25 },
};

export const MOCK_MATH_COUNT = 11;

function pickForModule(pool: Problem[], kind: MockKind, used: Set<string>, rng: () => number, count: number): Problem[] {
  const out: Problem[] = [];
  const weights = WEIGHTS[kind];
  const available = pool.filter((p) => !used.has(p.id) && weights[p.difficulty] !== undefined);
  const byDiff = new Map<Difficulty, Problem[]>();
  for (const p of shuffle(available, rng)) {
    const arr = byDiff.get(p.difficulty) ?? [];
    arr.push(p);
    byDiff.set(p.difficulty, arr);
  }
  for (let i = 0; i < count; i++) {
    const diffs = [...byDiff.entries()].filter(([, arr]) => arr.length > 0).map(([d]) => d);
    if (diffs.length === 0) break;
    const d = weightedPick(
      diffs,
      diffs.map((x) => weights[x] ?? 0),
      rng,
    );
    const arr = byDiff.get(d)!;
    const p = arr.pop()!;
    used.add(p.id);
    out.push(p);
  }
  return out;
}

export function assembleMocks(problems: Problem[], codingIds: string[]): MockDef[] {
  const practice = problems.filter((p) => p.kind === "practice" || p.kind === "brainteaser");
  const used = new Set<string>();
  const usedCoding = new Set<string>();
  const specs: Array<{ id: string; kind: MockKind; title: string; description: string }> = [
    { id: "standard-1", kind: "standard", title: "Standard mock A", description: "The real test's difficulty: eleven math questions and one coding question in 75 minutes." },
    { id: "standard-2", kind: "standard", title: "Standard mock B", description: "A second pass at test-level difficulty with a fresh set of problems." },
    { id: "hard-1", kind: "hard", title: "Hard mock I", description: "Overkill tier: difficulty 3 to 5. If this feels manageable, the real test will feel slow." },
    { id: "hard-2", kind: "hard", title: "Hard mock II", description: "More multi-step problems with traps. Keep to the six-minute pace anyway." },
    { id: "hard-3", kind: "hard", title: "Hard mock III", description: "Heavier on expectation and recursion." },
    { id: "hard-4", kind: "hard", title: "Hard mock IV", description: "The last one. Treat it as the dress rehearsal under lockdown." },
  ];
  const mocks: MockDef[] = [];
  for (const spec of specs) {
    const rng = rngFromString(`mock-${spec.id}`);
    const chosen: Problem[] = [];
    for (const [moduleId, count] of COMPOSITION) {
      const pool = practice.filter((p) => p.module === moduleId);
      chosen.push(...pickForModule(pool, spec.kind, used, rng, count));
    }
    // Fill any shortfall (modules without content yet) from the whole bank.
    if (chosen.length < MOCK_MATH_COUNT) {
      const filler = pickForModule(practice, spec.kind, used, rng, MOCK_MATH_COUNT - chosen.length);
      chosen.push(...filler);
    }
    const ordered = shuffle(chosen, rng).slice(0, MOCK_MATH_COUNT);
    const codingPool = codingIds.filter((c) => !usedCoding.has(c));
    const codingId = codingPool.length ? codingPool[Math.floor(rng() * codingPool.length)] : codingIds[0] ?? "";
    if (codingId) usedCoding.add(codingId);
    mocks.push({ id: spec.id, title: spec.title, kind: spec.kind, description: spec.description, problemIds: ordered.map((p) => p.id), codingId, minutes: 75 });
  }
  return mocks;
}

/** Score bands estimated from the user's own mock history plus a fixed heuristic. */
export function scoreBand(score: number, total: number, history: number[]): { label: string; percentileOfOwn: number | null; note: string } {
  const ratio = total ? score / total : 0;
  const label = ratio >= 0.83 ? "Strong" : ratio >= 0.67 ? "Likely pass" : ratio >= 0.5 ? "Borderline" : "Needs work";
  const note =
    ratio >= 0.83
      ? "Comfortably above the level that typically advances. Keep the pace honest."
      : ratio >= 0.67
        ? "Around the level that usually advances. Convert the near-misses and this becomes strong."
        : ratio >= 0.5
          ? "Half right is not enough on a twelve-question test. Review every miss and redo the module."
          : "Go back to the modules whose problems you missed before the next mock.";
  const percentileOfOwn = history.length ? Math.round((100 * history.filter((h) => h < score).length) / history.length) : null;
  return { label, percentileOfOwn, note };
}
