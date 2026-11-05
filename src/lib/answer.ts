/**
 * Flexible answer parsing and grading.
 *
 * Accepts integers, decimals, exact fractions (3/8), percentages (37.5%), and simple
 * expressions: + - * / ^ parentheses, factorial (5!), choose(n,k) / C(n,k) / nCr,
 * P(n,k), sqrt, exp, ln, log (natural), log10, abs, floor, ceil, round, min, max,
 * and the constants pi and e. Everything is evaluated by a small recursive-descent
 * parser; nothing is ever passed to eval.
 */

import type { Answer, NumericAnswer } from "@/content/types";

export interface ParseResult {
  ok: boolean;
  value?: number;
  error?: string;
}

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "comma" };

const FUNCS: Record<string, (...args: number[]) => number> = {
  sqrt: (x) => Math.sqrt(x),
  exp: (x) => Math.exp(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log(x),
  log10: (x) => Math.log10(x),
  log2: (x) => Math.log2(x),
  abs: (x) => Math.abs(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  round: (x) => Math.round(x),
  min: (...xs) => Math.min(...xs),
  max: (...xs) => Math.max(...xs),
  choose: (n, k) => choose(n, k),
  c: (n, k) => choose(n, k),
  ncr: (n, k) => choose(n, k),
  binom: (n, k) => choose(n, k),
  p: (n, k) => perm(n, k),
  npr: (n, k) => perm(n, k),
  perm: (n, k) => perm(n, k),
  fact: (n) => factorial(n),
};

const CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function choose(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k)) return NaN;
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function perm(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k)) return NaN;
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

function tokenize(src: string): Token[] | string {
  const tokens: Token[] = [];
  let i = 0;
  const s = src.replace(/−/g, "-").replace(/[×✕✖]/g, "*").replace(/[÷]/g, "/").replace(/\^/g, "^");
  while (i < s.length) {
    const ch = s[i];
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++;
      continue;
    }
    if ((ch >= "0" && ch <= "9") || (ch === "." && i + 1 < s.length && s[i + 1] >= "0" && s[i + 1] <= "9")) {
      let j = i;
      while (j < s.length && ((s[j] >= "0" && s[j] <= "9") || s[j] === ".")) j++;
      // scientific notation like 1e-3
      if (j < s.length && (s[j] === "e" || s[j] === "E")) {
        let k = j + 1;
        if (k < s.length && (s[k] === "+" || s[k] === "-")) k++;
        if (k < s.length && s[k] >= "0" && s[k] <= "9") {
          while (k < s.length && s[k] >= "0" && s[k] <= "9") k++;
          j = k;
        }
      }
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) return `Could not read the number "${s.slice(i, j)}"`;
      tokens.push({ t: "num", v });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
      tokens.push({ t: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if ("+-*/^!%".includes(ch)) {
      tokens.push({ t: "op", v: ch });
      i++;
      continue;
    }
    if (ch === "(" || ch === "[") {
      tokens.push({ t: "lp" });
      i++;
      continue;
    }
    if (ch === ")" || ch === "]") {
      tokens.push({ t: "rp" });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ t: "comma" });
      i++;
      continue;
    }
    return `Unexpected character "${ch}"`;
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): number {
    const v = this.expr();
    if (this.pos < this.tokens.length) throw new Error("Unexpected input after the expression");
    return v;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error("Expression ended early");
    return t;
  }

  private expr(): number {
    let v = this.term();
    for (;;) {
      const t = this.peek();
      if (t && t.t === "op" && (t.v === "+" || t.v === "-")) {
        this.pos++;
        const r = this.term();
        v = t.v === "+" ? v + r : v - r;
      } else return v;
    }
  }

  private term(): number {
    let v = this.unary();
    for (;;) {
      const t = this.peek();
      if (t && t.t === "op" && (t.v === "*" || t.v === "/")) {
        this.pos++;
        const r = this.unary();
        if (t.v === "/") {
          if (r === 0) throw new Error("Division by zero");
          v = v / r;
        } else v = v * r;
      } else if (t && (t.t === "lp" || t.t === "num" || t.t === "id")) {
        // implicit multiplication: 2(3+1), 2pi, 3 sqrt(2)
        const r = this.unary();
        v = v * r;
      } else return v;
    }
  }

  private unary(): number {
    const t = this.peek();
    if (t && t.t === "op" && t.v === "-") {
      this.pos++;
      return -this.unary();
    }
    if (t && t.t === "op" && t.v === "+") {
      this.pos++;
      return this.unary();
    }
    return this.power();
  }

  private power(): number {
    const base = this.postfix();
    const t = this.peek();
    if (t && t.t === "op" && t.v === "^") {
      this.pos++;
      const exp = this.unary(); // right associative, allows 2^-3
      return Math.pow(base, exp);
    }
    return base;
  }

  private postfix(): number {
    let v = this.primary();
    for (;;) {
      const t = this.peek();
      if (t && t.t === "op" && t.v === "!") {
        this.pos++;
        v = factorial(v);
        if (Number.isNaN(v)) throw new Error("Factorial needs a non-negative integer up to 170");
      } else if (t && t.t === "op" && t.v === "%") {
        this.pos++;
        v = v / 100;
      } else return v;
    }
  }

  private primary(): number {
    const t = this.next();
    if (t.t === "num") return t.v;
    if (t.t === "lp") {
      const v = this.expr();
      const close = this.next();
      if (close.t !== "rp") throw new Error("Missing closing parenthesis");
      return v;
    }
    if (t.t === "id") {
      const name = t.v;
      const nxt = this.peek();
      if (nxt && nxt.t === "lp") {
        const fn = FUNCS[name];
        if (!fn) throw new Error(`Unknown function "${name}"`);
        this.pos++;
        const args: number[] = [];
        if (this.peek()?.t !== "rp") {
          args.push(this.expr());
          while (this.peek()?.t === "comma") {
            this.pos++;
            args.push(this.expr());
          }
        }
        const close = this.next();
        if (close.t !== "rp") throw new Error("Missing closing parenthesis");
        const v = fn(...args);
        if (Number.isNaN(v)) throw new Error(`Bad arguments to ${name}`);
        return v;
      }
      if (name in CONSTS) return CONSTS[name];
      throw new Error(`Unknown symbol "${name}"`);
    }
    throw new Error("Unexpected token");
  }
}

/** Parse a free-form numeric answer. */
export function parseAnswer(input: string | number): ParseResult {
  if (typeof input === "number") {
    return Number.isFinite(input) ? { ok: true, value: input } : { ok: false, error: "Not a finite number" };
  }
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter an answer" };
  // Remove thousands separators only when the input is a plain number like 1,234,567
  const plain = /^-?\d{1,3}(,\d{3})+(\.\d+)?%?$/.test(raw) ? raw.replace(/,/g, "") : raw;
  const tokens = tokenize(plain);
  if (typeof tokens === "string") return { ok: false, error: tokens };
  if (tokens.length === 0) return { ok: false, error: "Enter an answer" };
  try {
    const value = new Parser(tokens).parse();
    if (!Number.isFinite(value)) return { ok: false, error: "That does not evaluate to a finite number" };
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not parse" };
  }
}

/** Default grading tolerance (absolute) for a numeric answer. */
export function defaultTolerance(a: NumericAnswer): number {
  if (typeof a.tolerance === "number") return a.tolerance;
  if (Number.isInteger(a.value) && Math.abs(a.value) >= 1) return 1e-9;
  return Math.max(0.01 * Math.abs(a.value), 1e-9);
}

export interface GradeResult {
  correct: boolean;
  /** Parsed numeric value or chosen index. */
  given?: number;
  error?: string;
}

/** Grade a user response against a problem answer. For choice answers pass the option index. */
export function gradeAnswer(answer: Answer, input: string | number): GradeResult {
  if (answer.type === "choice") {
    const idx = typeof input === "number" ? input : Number.parseInt(String(input), 10);
    if (!Number.isInteger(idx)) return { correct: false, error: "Pick an option" };
    return { correct: idx === answer.correct, given: idx };
  }
  const parsed = parseAnswer(input);
  if (!parsed.ok || parsed.value === undefined) return { correct: false, error: parsed.error };
  const tol = defaultTolerance(answer);
  const correct = Math.abs(parsed.value - answer.value) <= tol + 1e-12;
  return { correct, given: parsed.value };
}

/** Human-readable preview of what the parser understood, e.g. "= 0.375". */
export function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const abs = Math.abs(v);
  if (abs >= 1e6 || abs < 1e-4) return v.toExponential(4);
  return Number(v.toPrecision(6)).toString();
}
