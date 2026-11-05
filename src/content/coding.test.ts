import { describe, expect, it } from "vitest";
import { CODING_PROBLEMS } from "./coding";
import { mulberry32 } from "@/lib/rng";

function materialise(arg: unknown): unknown {
  if (typeof arg === "string" && arg.startsWith("__rng__:")) return mulberry32(Number(arg.slice(8)));
  return arg;
}

function approxEqual(a: unknown, b: unknown, tol?: number): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= (tol ?? 1e-9) * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => approxEqual(x, b[i], tol));
  return a === b;
}

describe("coding problems: reference solutions pass their own tests", () => {
  for (const p of CODING_PROBLEMS) {
    it(p.id, () => {
      const fn = new Function(`${p.solution.js}\n; return ${p.functionName};`)() as (...a: unknown[]) => unknown;
      for (const t of p.tests) {
        const received = fn(...t.args.map(materialise));
        expect(approxEqual(received, t.expected, t.tolerance), `${p.id} / ${t.name}: expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(received)}`).toBe(true);
      }
      expect(p.starter.js).toContain(p.functionName);
      expect(p.hints).toHaveLength(3);
    });
  }
});
