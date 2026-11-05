import { describe, expect, it } from "vitest";
import { choose, defaultTolerance, factorial, gradeAnswer, parseAnswer, perm } from "./answer";

describe("parseAnswer", () => {
  const cases: Array<[string, number]> = [
    ["3", 3],
    ["-4", -4],
    ["0.375", 0.375],
    [".5", 0.5],
    ["3/8", 0.375],
    ["37.5%", 0.375],
    ["12.5 %", 0.125],
    ["1 - 5/6^4", 1 - 5 / Math.pow(6, 4)],
    ["1 - (5/6)^4", 1 - Math.pow(5 / 6, 4)],
    ["2^-3", 0.125],
    ["2^3^2", 512],
    ["(1/2)*(1/3)", 1 / 6],
    ["5!", 120],
    ["5!/(2!*3!)", 10],
    ["choose(5,2)", 10],
    ["C(10,3)", 120],
    ["nCr(6,2)/36", 15 / 36],
    ["P(5,2)", 20],
    ["sqrt(2)", Math.SQRT2],
    ["e^-1", 1 / Math.E],
    ["1/e", 1 / Math.E],
    ["pi/4", Math.PI / 4],
    ["2pi", 2 * Math.PI],
    ["2(3+1)", 8],
    ["ln(2)", Math.log(2)],
    ["log10(1000)", 3],
    ["1,234", 1234],
    ["1e-3", 0.001],
    ["−3", -3],
    ["6 × 7", 42],
    ["max(3, 7)", 7],
    ["[1+2]*3", 9],
  ];
  for (const [input, expected] of cases) {
    it(`parses ${JSON.stringify(input)}`, () => {
      const r = parseAnswer(input);
      expect(r.ok).toBe(true);
      expect(r.value).toBeCloseTo(expected, 10);
    });
  }

  it("rejects garbage", () => {
    expect(parseAnswer("").ok).toBe(false);
    expect(parseAnswer("abc").ok).toBe(false);
    expect(parseAnswer("1/0").ok).toBe(false);
    expect(parseAnswer("(1+2").ok).toBe(false);
    expect(parseAnswer("3 $").ok).toBe(false);
    expect(parseAnswer("2.5!").ok).toBe(false);
    expect(parseAnswer("foo(2)").ok).toBe(false);
  });
});

describe("combinatorics helpers", () => {
  it("computes factorials, binomials and permutations", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(10)).toBe(3628800);
    expect(choose(52, 5)).toBe(2598960);
    expect(choose(5, 7)).toBe(0);
    expect(perm(10, 3)).toBe(720);
  });
});

describe("gradeAnswer", () => {
  it("accepts equivalent forms of a fraction", () => {
    const answer = { type: "numeric" as const, value: 3 / 8, exact: "\\frac{3}{8}" };
    expect(gradeAnswer(answer, "3/8").correct).toBe(true);
    expect(gradeAnswer(answer, "0.375").correct).toBe(true);
    expect(gradeAnswer(answer, "37.5%").correct).toBe(true);
    expect(gradeAnswer(answer, "0.377").correct).toBe(true); // within 1%
    expect(gradeAnswer(answer, "0.4").correct).toBe(false);
  });

  it("requires exact integers by default", () => {
    const answer = { type: "numeric" as const, value: 120, exact: "120" };
    expect(gradeAnswer(answer, "120").correct).toBe(true);
    expect(gradeAnswer(answer, "5!").correct).toBe(true);
    expect(gradeAnswer(answer, "121").correct).toBe(false);
  });

  it("honours an explicit tolerance", () => {
    const answer = { type: "numeric" as const, value: 14.7, exact: "14.7", tolerance: 0.3 };
    expect(gradeAnswer(answer, "14.5").correct).toBe(true);
    expect(gradeAnswer(answer, "15.1").correct).toBe(false);
  });

  it("uses a 1% relative default tolerance for non-integers", () => {
    const answer = { type: "numeric" as const, value: 1 / 3, exact: "\\frac{1}{3}" };
    expect(defaultTolerance(answer)).toBeCloseTo(1 / 300, 10);
    expect(gradeAnswer(answer, "0.33").correct).toBe(true);
    expect(gradeAnswer(answer, "0.3").correct).toBe(false);
  });

  it("grades multiple choice by index", () => {
    const answer = { type: "choice" as const, options: ["a", "b", "c"], correct: 2 };
    expect(gradeAnswer(answer, 2).correct).toBe(true);
    expect(gradeAnswer(answer, "1").correct).toBe(false);
    expect(gradeAnswer(answer, "x").error).toBeTruthy();
  });

  it("reports parse errors", () => {
    const answer = { type: "numeric" as const, value: 1, exact: "1" };
    const r = gradeAnswer(answer, "one");
    expect(r.correct).toBe(false);
    expect(r.error).toBeTruthy();
  });
});
