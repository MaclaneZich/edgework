/**
 * Mental math generators: Zetamac-style sprint (default ranges), the 80-questions-in-8-minutes
 * multiple-choice format with right/wrong penalty scoring, and operation-specific drills.
 */

import { randInt, type Rng } from "./rng";

export type Op = "add" | "sub" | "mul" | "div";

export interface MMQuestion {
  op: Op;
  a: number;
  b: number;
  answer: number;
  /** Rendered prompt, e.g. "47 + 38" */
  text: string;
  /** Key for timing breakdowns: add, sub, mul, div, x7, d9, sub100, pct, dec... */
  opKey: string;
  /** For multiple-choice modes. */
  choices?: number[];
}

export interface ZetamacSettings {
  addLo: number;
  addHi: number;
  mulLo: number;
  mulHi: number;
  mulLo2: number;
  mulHi2: number;
  ops: Op[];
}

export const ZETAMAC_DEFAULT: ZetamacSettings = { addLo: 2, addHi: 100, mulLo: 2, mulHi: 12, mulLo2: 2, mulHi2: 100, ops: ["add", "sub", "mul", "div"] };

export function genZetamac(rng: Rng, s: ZetamacSettings = ZETAMAC_DEFAULT): MMQuestion {
  const op = s.ops[Math.floor(rng() * s.ops.length)];
  switch (op) {
    case "add": {
      const a = randInt(rng, s.addLo, s.addHi);
      const b = randInt(rng, s.addLo, s.addHi);
      return { op, a, b, answer: a + b, text: `${a} + ${b}`, opKey: "add" };
    }
    case "sub": {
      // inverse of an addition problem so results stay in range and non-negative
      const x = randInt(rng, s.addLo, s.addHi);
      const y = randInt(rng, s.addLo, s.addHi);
      return { op, a: x + y, b: x, answer: y, text: `${x + y} − ${x}`, opKey: "sub" };
    }
    case "mul": {
      const a = randInt(rng, s.mulLo, s.mulHi);
      const b = randInt(rng, s.mulLo2, s.mulHi2);
      return { op, a, b, answer: a * b, text: `${a} × ${b}`, opKey: "mul" };
    }
    case "div": {
      const x = randInt(rng, s.mulLo, s.mulHi);
      const y = randInt(rng, s.mulLo2, s.mulHi2);
      return { op, a: x * y, b: x, answer: y, text: `${x * y} ÷ ${x}`, opKey: "div" };
    }
  }
}

export type DrillKey = "x7" | "x8" | "x12" | "d6" | "d9" | "d12" | "sub100" | "sq" | "pct";

export const DRILLS: Record<DrillKey, { label: string; description: string }> = {
  x7: { label: "×7", description: "Seven times two-digit numbers. Split: 7 × 40 + 7 × 6." },
  x8: { label: "×8", description: "Double three times." },
  x12: { label: "×12", description: "Ten times plus two times." },
  d6: { label: "÷6", description: "Halve, then divide by three." },
  d9: { label: "÷9", description: "Digit-sum check, then long division in your head." },
  d12: { label: "÷12", description: "Divide by 4, then by 3 (or by 3 then 4)." },
  sub100: { label: "Subtraction across 100", description: "Borrowing across a hundred: 143 − 68." },
  sq: { label: "Squares to 30", description: "Know them cold; they speed up everything else." },
  pct: { label: "Percent of", description: "15% of 80: take 10%, add half of it." },
};

export function genDrill(rng: Rng, key: DrillKey): MMQuestion {
  switch (key) {
    case "x7":
    case "x8":
    case "x12": {
      const k = key === "x7" ? 7 : key === "x8" ? 8 : 12;
      const b = randInt(rng, 11, 99);
      return { op: "mul", a: k, b, answer: k * b, text: `${k} × ${b}`, opKey: key };
    }
    case "d6":
    case "d9":
    case "d12": {
      const k = key === "d6" ? 6 : key === "d9" ? 9 : 12;
      const y = randInt(rng, 7, 99);
      return { op: "div", a: k * y, b: k, answer: y, text: `${k * y} ÷ ${k}`, opKey: key };
    }
    case "sub100": {
      const a = randInt(rng, 101, 199);
      const b = randInt(rng, 2, 99);
      const diff = a - b;
      if (diff >= 100) return genDrill(rng, key);
      return { op: "sub", a, b, answer: diff, text: `${a} − ${b}`, opKey: key };
    }
    case "sq": {
      const a = randInt(rng, 11, 30);
      return { op: "mul", a, b: a, answer: a * a, text: `${a}²`, opKey: key };
    }
    case "pct": {
      const pcts = [5, 10, 15, 20, 25, 30, 40, 60, 75];
      const p = pcts[Math.floor(rng() * pcts.length)];
      const base = randInt(rng, 2, 50) * 20; // multiples of 20 keep answers integral
      return { op: "mul", a: p, b: base, answer: Math.round((p * base) / 100), text: `${p}% of ${base}`, opKey: key };
    }
  }
}

/** Four plausible options including the right one, in random order. */
function withChoices(q: MMQuestion, rng: Rng): MMQuestion {
  const set = new Set<number>([q.answer]);
  const mag = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.max(1, Math.abs(q.answer)))) - 1));
  const deltas = [1, -1, 2, -2, 10, -10, mag, -mag, 2 * mag, -2 * mag];
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const d = deltas[Math.floor(rng() * deltas.length)];
    const candidate = Number((q.answer + d).toFixed(2));
    if (candidate !== q.answer && (q.op !== "div" || candidate > 0)) set.add(candidate);
  }
  const choices = [...set];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { ...q, choices };
}

/** Harder mixed arithmetic for the 80-in-8 format. */
export function genEighty(rng: Rng): MMQuestion {
  const kind = Math.floor(rng() * 7);
  let q: MMQuestion;
  switch (kind) {
    case 0: {
      const a = randInt(rng, 100, 999);
      const b = randInt(rng, 100, 999);
      q = { op: "add", a, b, answer: a + b, text: `${a} + ${b}`, opKey: "add3" };
      break;
    }
    case 1: {
      const a = randInt(rng, 200, 999);
      const b = randInt(rng, 100, a - 1);
      q = { op: "sub", a, b, answer: a - b, text: `${a} − ${b}`, opKey: "sub3" };
      break;
    }
    case 2: {
      const a = randInt(rng, 12, 99);
      const b = randInt(rng, 3, 19);
      q = { op: "mul", a, b, answer: a * b, text: `${a} × ${b}`, opKey: "mul2" };
      break;
    }
    case 3: {
      const b = randInt(rng, 3, 19);
      const y = randInt(rng, 11, 60);
      q = { op: "div", a: b * y, b, answer: y, text: `${b * y} ÷ ${b}`, opKey: "div2" };
      break;
    }
    case 4: {
      const a = randInt(rng, 10, 999) / 10;
      const b = randInt(rng, 10, 999) / 10;
      q = { op: "add", a, b, answer: Number((a + b).toFixed(1)), text: `${a.toFixed(1)} + ${b.toFixed(1)}`, opKey: "dec" };
      break;
    }
    case 5: {
      const pcts = [5, 10, 12.5, 15, 20, 25, 30, 40, 60, 75];
      const p = pcts[Math.floor(rng() * pcts.length)];
      const base = randInt(rng, 2, 60) * 20;
      q = { op: "mul", a: p, b: base, answer: Number(((p * base) / 100).toFixed(2)), text: `${p}% of ${base}`, opKey: "pct" };
      break;
    }
    default: {
      const a = randInt(rng, 11, 29);
      q = { op: "mul", a, b: a, answer: a * a, text: `${a}²`, opKey: "sq" };
    }
  }
  return withChoices(q, rng);
}

export const OP_LABELS: Record<string, string> = {
  add: "Addition",
  sub: "Subtraction",
  mul: "Multiplication",
  div: "Division",
  add3: "3-digit addition",
  sub3: "3-digit subtraction",
  mul2: "2-digit × 1-2 digit",
  div2: "Division",
  dec: "Decimals",
  pct: "Percentages",
  sq: "Squares",
  x7: "×7",
  x8: "×8",
  x12: "×12",
  d6: "÷6",
  d9: "÷9",
  d12: "÷12",
  sub100: "Subtraction across 100",
};

/** Aggregate per-operation stats across many results. */
export function slowestOperations(perOps: Array<Record<string, { n: number; correct: number; totalMs: number }>>): Array<{ opKey: string; label: string; n: number; accuracy: number; avgMs: number }> {
  const agg = new Map<string, { n: number; correct: number; totalMs: number }>();
  for (const per of perOps) {
    for (const [k, v] of Object.entries(per)) {
      const cur = agg.get(k) ?? { n: 0, correct: 0, totalMs: 0 };
      cur.n += v.n;
      cur.correct += v.correct;
      cur.totalMs += v.totalMs;
      agg.set(k, cur);
    }
  }
  return [...agg.entries()]
    .filter(([, v]) => v.n > 0)
    .map(([opKey, v]) => ({ opKey, label: OP_LABELS[opKey] ?? opKey, n: v.n, accuracy: v.correct / v.n, avgMs: v.totalMs / v.n }))
    .sort((a, b) => b.avgMs - a.avgMs);
}
