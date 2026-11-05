import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { DRILLS, genDrill, genEighty, genZetamac, slowestOperations, type DrillKey } from "./mentalMath";

describe("mental math generators", () => {
  it("produces consistent Zetamac-style questions in the default ranges", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 2000; i++) {
      const q = genZetamac(rng);
      if (q.op === "add") expect(q.answer).toBe(q.a + q.b);
      if (q.op === "sub") {
        expect(q.answer).toBe(q.a - q.b);
        expect(q.answer).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeLessThanOrEqual(100);
      }
      if (q.op === "mul") {
        expect(q.answer).toBe(q.a * q.b);
        expect(q.a).toBeGreaterThanOrEqual(2);
        expect(q.a).toBeLessThanOrEqual(12);
      }
      if (q.op === "div") {
        expect(q.a / q.b).toBe(q.answer);
        expect(Number.isInteger(q.answer)).toBe(true);
      }
    }
  });

  it("drills stay on their operation and have integer answers", () => {
    const rng = mulberry32(3);
    for (const key of Object.keys(DRILLS) as DrillKey[]) {
      for (let i = 0; i < 300; i++) {
        const q = genDrill(rng, key);
        expect(Number.isInteger(q.answer)).toBe(true);
        expect(q.opKey).toBe(key);
        if (key === "sub100") {
          expect(q.a).toBeGreaterThan(100);
          expect(q.answer).toBeLessThan(100);
          expect(q.answer).toBeGreaterThan(0);
        }
      }
    }
  });

  it("eighty-in-eight questions carry four distinct choices including the answer", () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 1000; i++) {
      const q = genEighty(rng);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(q.answer);
    }
  });

  it("ranks the slowest operations", () => {
    const report = slowestOperations([
      { add: { n: 10, correct: 9, totalMs: 20000 }, mul: { n: 5, correct: 5, totalMs: 25000 } },
      { add: { n: 10, correct: 10, totalMs: 15000 } },
    ]);
    expect(report[0].opKey).toBe("mul");
    expect(report[1].avgMs).toBeCloseTo(1750);
    expect(report[1].accuracy).toBeCloseTo(0.95);
  });
});
