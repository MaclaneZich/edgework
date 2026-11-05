import type { VerifySpec } from "../types";
import type { Rng } from "@/lib/rng";
import { coin, die, forEachMask, simulate, simulateProb, solveLinear } from "./helpers";

/**
 * Independent checks for module 6 (first-step analysis and recursion).
 *
 * Two kinds of exact route are used, built so that they share as little logic as possible:
 *   - `recursion`: write the first-step linear system and solve it with solveLinear;
 *   - `dp`: push probability mass forward through time over raw histories (not the
 *     progress automaton) and accumulate tail sums or rewards until the mass is gone.
 * Simulations use the runner's seeded rng only. Long-tailed waiting times (where a
 * million trials would still be too noisy) get two exact routes instead.
 */

// ------------------------------------------------------------------ patterns

/**
 * Progress automaton for a pattern over an alphabet of `k` symbols: state = length of the
 * longest prefix of the pattern matched so far. `next(state, symbol)` by brute force.
 */
function patternAutomaton(pattern: number[], k: number): (state: number, symbol: number) => number {
  const m = pattern.length;
  return (state, symbol) => {
    const seq = [...pattern.slice(0, state), symbol];
    for (let len = Math.min(m, seq.length); len >= 0; len--) {
      let ok = true;
      for (let i = 0; i < len; i++) if (seq[seq.length - len + i] !== pattern[i]) ok = false;
      if (ok) return len;
    }
    return 0;
  };
}

/** Expected number of symbols until `pattern` appears, by solving the first-step equations. */
function patternWaitRecursion(pattern: number[], probs: number[]): number {
  const m = pattern.length;
  const next = patternAutomaton(pattern, probs.length);
  // unknowns e_0 .. e_{m-1}; e_m = 0.   e_s = 1 + sum_sym p_sym e_{next(s, sym)}
  const A: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const b = new Array<number>(m).fill(1);
  for (let s = 0; s < m; s++) {
    A[s][s] += 1;
    for (let sym = 0; sym < probs.length; sym++) {
      const n = next(s, sym);
      if (n < m) A[s][n] -= probs[sym];
    }
  }
  return solveLinear(A, b)[0];
}

/**
 * Expected wait for `pattern` by forward DP over the raw last (m-1) symbols: no automaton.
 * E[T] = sum_{n>=0} P(T > n); the surviving mass after n symbols is P(T > n).
 */
function patternWaitTailSum(pattern: number[], probs: number[], maxSteps = 200000): number {
  const m = pattern.length;
  const key = (hist: number[]) => hist.join(",");
  let mass = new Map<string, number>([["", 1]]);
  let expected = 1; // P(T > 0) = 1
  for (let n = 1; n < maxSteps; n++) {
    const nextMass = new Map<string, number>();
    let surviving = 0;
    for (const [k, p] of mass) {
      const hist = k === "" ? [] : k.split(",").map(Number);
      for (let sym = 0; sym < probs.length; sym++) {
        const h = [...hist, sym];
        const tail = h.slice(-m);
        const done = tail.length === m && tail.every((x, i) => x === pattern[i]);
        if (done) continue;
        const kept = h.slice(-(m - 1));
        const kk = key(kept);
        nextMass.set(kk, (nextMass.get(kk) ?? 0) + p * probs[sym]);
        surviving += p * probs[sym];
      }
    }
    expected += surviving;
    mass = nextMass;
    if (surviving < 1e-15) break;
  }
  return expected;
}

/** Probability that pattern a appears strictly before pattern b, by first-step equations on raw histories. */
function raceRecursion(a: number[], b: number[], probs: number[]): number {
  const L = Math.max(a.length, b.length) - 1;
  // states: all histories of length <= L that contain neither pattern (as a suffix at any time)
  const states: string[] = [];
  const index = new Map<string, number>();
  const endsWith = (h: number[], pat: number[]) =>
    h.length >= pat.length && pat.every((x, i) => x === h[h.length - pat.length + i]);
  const addState = (h: number[]) => {
    const k = h.join(",");
    if (!index.has(k)) {
      index.set(k, states.length);
      states.push(k);
    }
  };
  addState([]);
  // breadth-first discovery of reachable histories (kept to the last L symbols)
  const queue: number[][] = [[]];
  while (queue.length) {
    const h = queue.shift()!;
    for (let sym = 0; sym < probs.length; sym++) {
      const full = [...h, sym];
      if (endsWith(full, a) || endsWith(full, b)) continue;
      const kept = full.slice(-L);
      const k = kept.join(",");
      if (!index.has(k)) {
        addState(kept);
        queue.push(kept);
      }
    }
  }
  const n = states.length;
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const rhs = new Array<number>(n).fill(0);
  for (let s = 0; s < n; s++) {
    const h = states[s] === "" ? [] : states[s].split(",").map(Number);
    A[s][s] += 1;
    for (let sym = 0; sym < probs.length; sym++) {
      const full = [...h, sym];
      if (endsWith(full, a)) rhs[s] += probs[sym];
      else if (endsWith(full, b)) continue;
      else A[s][index.get(full.slice(-L).join(","))!] -= probs[sym];
    }
  }
  return solveLinear(A, rhs)[0];
}

/** Simulate flips until `pattern` (0 = tails/down, 1 = heads/up) appears; returns the count. */
function simPatternWait(rng: Rng, pattern: number[], pHead: number): number {
  const m = pattern.length;
  let matched = 0;
  let n = 0;
  const next = patternAutomaton(pattern, 2);
  for (;;) {
    n++;
    const sym = coin(rng, pHead) ? 1 : 0;
    matched = next(matched, sym);
    if (matched === m) return n;
  }
}

// ------------------------------------------------------------------ ruin / walks

/** P(reach N before 0 from k) with win probability p per unit step, by first-step equations. */
function ruinProbRecursion(k: number, N: number, p: number): number {
  const n = N - 1; // unknowns for 1..N-1
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(0);
  for (let i = 1; i <= n; i++) {
    const r = i - 1;
    A[r][r] += 1;
    if (i + 1 <= n) A[r][i] -= p;
    else b[r] += p; // reaching N
    if (i - 1 >= 1) A[r][i - 2] -= 1 - p;
  }
  return solveLinear(A, b)[k - 1];
}

function ruinProbFormula(k: number, N: number, p: number): number {
  if (Math.abs(p - 0.5) < 1e-12) return k / N;
  const r = (1 - p) / p;
  return (1 - Math.pow(r, k)) / (1 - Math.pow(r, N));
}

/** Expected steps until the walk from k hits 0 or N, with up-probability p. */
function ruinDurationRecursion(k: number, N: number, p: number): number {
  const n = N - 1;
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(1);
  for (let i = 1; i <= n; i++) {
    const r = i - 1;
    A[r][r] += 1;
    if (i + 1 <= n) A[r][i] -= p;
    if (i - 1 >= 1) A[r][i - 2] -= 1 - p;
  }
  return solveLinear(A, b)[k - 1];
}

function ruinDurationFormula(k: number, N: number, p: number): number {
  if (Math.abs(p - 0.5) < 1e-12) return k * (N - k);
  const q = 1 - p;
  return k / (q - p) - (N / (q - p)) * ruinProbFormula(k, N, p);
}

function simRuin(rng: Rng, k: number, N: number, p: number): { won: boolean; steps: number } {
  let x = k;
  let steps = 0;
  while (x > 0 && x < N) {
    x += rng() < p ? 1 : -1;
    steps++;
  }
  return { won: x === N, steps };
}

// ------------------------------------------------------------------ counting

/** Number of binary strings of length n with no two consecutive 1s, by the Fibonacci-type table. */
function noTwoConsecutiveDp(n: number): number {
  // end0[i] = strings of length i ending in 0; end1[i] = ending in 1
  let end0 = 1;
  let end1 = 1;
  for (let i = 2; i <= n; i++) {
    const n0 = end0 + end1;
    const n1 = end0;
    end0 = n0;
    end1 = n1;
  }
  return n === 0 ? 1 : end0 + end1;
}

function noTwoConsecutiveEnumeration(n: number): number {
  let count = 0;
  forEachMask(n, (m) => {
    if ((m & (m >> 1)) === 0) count++;
  });
  return count;
}

// ------------------------------------------------------------------ generic absorbing chains

/**
 * Forward-mass DP for an absorbing chain: returns the expected total reward collected from
 * `start`, where `step(s)` lists (next, prob, reward) and absorbing states return [].
 */
function expectedRewardForward(
  states: number,
  start: number,
  step: (s: number) => Array<[next: number, prob: number, reward: number]>,
  maxSteps = 200000,
): number {
  let mass = new Array<number>(states).fill(0);
  mass[start] = 1;
  let total = 0;
  for (let n = 0; n < maxSteps; n++) {
    const nextMass = new Array<number>(states).fill(0);
    let moving = 0;
    for (let s = 0; s < states; s++) {
      if (mass[s] === 0) continue;
      const out = step(s);
      if (out.length === 0) continue;
      for (const [nx, p, r] of out) {
        total += mass[s] * p * r;
        nextMass[nx] += mass[s] * p;
        moving += mass[s] * p;
      }
    }
    mass = nextMass;
    if (moving < 1e-16) break;
  }
  return total;
}

/** Absorption probability into `target` from `start` by forward-mass DP. */
function absorptionForward(
  states: number,
  start: number,
  target: number,
  step: (s: number) => Array<[next: number, prob: number]>,
  maxSteps = 200000,
): number {
  let mass = new Array<number>(states).fill(0);
  mass[start] = 1;
  for (let n = 0; n < maxSteps; n++) {
    const nextMass = new Array<number>(states).fill(0);
    let moving = 0;
    for (let s = 0; s < states; s++) {
      if (mass[s] === 0) continue;
      const out = step(s);
      if (out.length === 0) {
        nextMass[s] += mass[s];
        continue;
      }
      for (const [nx, p] of out) {
        nextMass[nx] += mass[s] * p;
        if (step(nx).length > 0) moving += mass[s] * p;
      }
    }
    mass = nextMass;
    if (moving < 1e-16) break;
  }
  return mass[target];
}

const H = 1;
const T = 0;
const FAIR = [0.5, 0.5];
const DIE = [0, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6]; // index = face, index 0 unused

export const spec: VerifySpec = {
  // -------------------------------------------------------------- difficulty 1
  "m6-p01": [
    {
      method: "recursion",
      run: () => solveLinear([[1 - 5 / 6]], [1])[0],
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let n = 0;
          for (;;) {
            n++;
            if (die(r) === 6) return n;
          }
        }),
    },
  ],
  "m6-p02": [
    { method: "recursion", run: () => ruinProbRecursion(3, 10, 0.5) },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => simRuin(r, 3, 10, 0.5).won) },
  ],
  "m6-p03": [
    { method: "enumeration", run: () => noTwoConsecutiveEnumeration(5) },
    { method: "dp", run: () => noTwoConsecutiveDp(5) },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m6-p04": [
    { method: "recursion", run: () => patternWaitRecursion([H, T], FAIR) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, T], 0.5)) },
  ],
  "m6-p05": [
    { method: "recursion", run: () => patternWaitRecursion([H, H], FAIR) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, H], 0.5)) },
  ],
  "m6-p06": [
    {
      method: "recursion",
      run: () => {
        // states: 0 = no roll yet, 1 = holding a roll. e1 = 1 + (5/6) e1 ; e0 = 1 + e1
        const [e0] = solveLinear(
          [
            [1, -1],
            [0, 1 - 5 / 6],
          ],
          [1, 1],
        );
        return e0;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let prev = die(r);
          let n = 1;
          for (;;) {
            const x = die(r);
            n++;
            if (x === prev) return n;
            prev = x;
          }
        }),
    },
  ],
  "m6-p07": [
    { method: "recursion", run: () => ruinDurationRecursion(4, 10, 0.5) },
    { method: "formula", run: () => ruinDurationFormula(4, 10, 0.5) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simRuin(r, 4, 10, 0.5).steps) },
  ],
  "m6-p08": [
    // shift the walk: start at 3 on [0, 8]; +5 is the top boundary
    { method: "recursion", run: () => ruinProbRecursion(3, 8, 0.5) },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => simRuin(r, 3, 8, 0.5).won) },
  ],
  "m6-p09": [
    {
      method: "dp",
      run: () => {
        const ways = [1, 1];
        for (let i = 2; i <= 10; i++) ways[i] = ways[i - 1] + ways[i - 2];
        return ways[10];
      },
    },
    {
      method: "enumeration",
      run: () => {
        // A composition of 10 into parts 1 and 2 is a set of break points among positions 1..9
        // such that consecutive breaks (and the ends) are at most 2 apart.
        let count = 0;
        forEachMask(9, (m) => {
          let last = 0;
          let ok = true;
          for (let pos = 1; pos <= 9; pos++) {
            if (m & (1 << (pos - 1))) {
              if (pos - last > 2) ok = false;
              last = pos;
            }
          }
          if (10 - last > 2) ok = false;
          if (ok) count++;
        });
        return count;
      },
    },
  ],
  "m6-p10": [
    {
      method: "recursion",
      run: () => {
        const hh = patternWaitRecursion([H, H], FAIR);
        const ht = patternWaitRecursion([H, T], FAIR);
        return Math.abs(hh - 6) < 1e-9 && Math.abs(ht - 4) < 1e-9 && hh > ht ? 0 : -1;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const hh = simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, H], 0.5));
        const ht = simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, T], 0.5));
        const closeTo = (s: { value: number; se: number }, x: number) => Math.abs(s.value - x) < 6 * s.se && 6 * s.se < 0.05;
        return closeTo(hh, 6) && closeTo(ht, 4) ? 0 : -1;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m6-p11": [
    { method: "recursion", run: () => patternWaitRecursion([6, 6], DIE) },
    { method: "dp", run: () => patternWaitTailSum([6, 6], DIE) },
  ],
  "m6-p12": [
    { method: "recursion", run: () => patternWaitRecursion([6, 5], DIE) },
    { method: "dp", run: () => patternWaitTailSum([6, 5], DIE) },
  ],
  "m6-p13": [
    { method: "recursion", run: () => patternWaitRecursion([H, H, H], FAIR) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, H, H], 0.5)) },
  ],
  "m6-p14": [
    { method: "enumeration", run: () => noTwoConsecutiveEnumeration(8) / 256 },
    { method: "dp", run: () => noTwoConsecutiveDp(8) / Math.pow(2, 8) },
  ],
  "m6-p15": [
    { method: "recursion", run: () => patternWaitRecursion([H, H], [0.6, 0.4]) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simPatternWait(r, [H, H], 0.4)) },
  ],
  "m6-p16": [
    { method: "recursion", run: () => raceRecursion([H, T], [T, T], FAIR) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let prev = coin(r) ? H : T;
          for (;;) {
            const x = coin(r) ? H : T;
            if (prev === H && x === T) return true; // up then down
            if (prev === T && x === T) return false; // down, down
            prev = x;
          }
        }),
    },
  ],
  "m6-p17": [
    { method: "recursion", run: () => ruinProbRecursion(5, 10, 0.45) },
    { method: "formula", run: () => ruinProbFormula(5, 10, 0.45) },
    { method: "simulation", run: (rng) => simulateProb(rng, 2_000_000, (r) => simRuin(r, 5, 10, 0.45).won) },
  ],
  "m6-p18": [
    {
      method: "recursion",
      run: () => {
        // unknowns t (trainee), j (junior): t = 0.5 t + 0.3 j ; j = 0.2 t + 0.5 j + 0.2
        const [t] = solveLinear(
          [
            [1 - 0.5, -0.3],
            [-0.2, 1 - 0.5],
          ],
          [0, 0.2],
        );
        return t;
      },
    },
    {
      method: "dp",
      run: () =>
        // states: 0 trainee, 1 junior, 2 senior (absorbing), 3 out (absorbing)
        absorptionForward(4, 0, 2, (s) => {
          if (s === 0)
            return [
              [0, 0.5],
              [1, 0.3],
              [3, 0.2],
            ];
          if (s === 1)
            return [
              [0, 0.2],
              [1, 0.5],
              [2, 0.2],
              [3, 0.1],
            ];
          return [];
        }),
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let s = 0; // 0 trainee, 1 junior
          for (;;) {
            const u = r();
            if (s === 0) {
              if (u < 0.5) continue;
              if (u < 0.8) s = 1;
              else return false;
            } else {
              if (u < 0.2) s = 0;
              else if (u < 0.7) continue;
              else if (u < 0.9) return true;
              else return false;
            }
          }
        }),
    },
  ],
  "m6-p19": [
    {
      method: "recursion",
      run: () => {
        // s = 1 + 0.6 s + 0.3 c ; c = 1 + 0.3 s + 0.4 c
        const [s] = solveLinear(
          [
            [1 - 0.6, -0.3],
            [-0.3, 1 - 0.4],
          ],
          [1, 1],
        );
        return s;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let s = 0; // 0 sunny, 1 cloudy
          let days = 0;
          for (;;) {
            days++;
            const u = r();
            if (s === 0) {
              if (u < 0.6) continue;
              if (u < 0.9) s = 1;
              else return days;
            } else {
              if (u < 0.3) s = 0;
              else if (u < 0.7) continue;
              else return days;
            }
          }
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m6-p20": [
    {
      method: "recursion",
      run: () => {
        const hth = patternWaitRecursion([H, T, H], FAIR);
        const hht = patternWaitRecursion([H, H, T], FAIR);
        return Math.abs(hth - 10) < 1e-9 && Math.abs(hht - 8) < 1e-9 ? 0 : -1;
      },
    },
    {
      method: "dp",
      run: () => {
        const hth = patternWaitTailSum([H, T, H], FAIR);
        const hht = patternWaitTailSum([H, H, T], FAIR);
        return Math.abs(hth - 10) < 1e-9 && Math.abs(hht - 8) < 1e-9 ? 0 : -1;
      },
    },
  ],
  "m6-p21": [
    {
      method: "recursion",
      run: () => {
        // e_k for k = 0..4 ; e_5 = 0 ; e_0 = 1 + e_1 ; e_k = 1 + (e_{k-1} + e_{k+1}) / 2
        const n = 5;
        const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
        const b = new Array<number>(n).fill(1);
        A[0][0] = 1;
        A[0][1] = -1;
        for (let k = 1; k < n; k++) {
          A[k][k] = 1;
          A[k][k - 1] -= 0.5;
          if (k + 1 < n) A[k][k + 1] -= 0.5;
        }
        return solveLinear(A, b)[0];
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let q = 0;
          let t = 0;
          while (q < 5) {
            t++;
            if (q === 0) q = 1;
            else q += r() < 0.5 ? 1 : -1;
          }
          return t;
        }),
    },
  ],
  "m6-p22": [
    { method: "recursion", run: () => ruinDurationRecursion(5, 10, 0.6) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => simRuin(r, 5, 10, 0.6).steps) },
  ],
  "m6-p23": [
    {
      method: "recursion",
      run: () => {
        const p = 0.49;
        const by1 = ruinProbRecursion(50, 60, p);
        const by5 = ruinProbRecursion(10, 12, p);
        const by10 = ruinProbRecursion(5, 6, p);
        return by10 > by5 && by5 > by1 && Math.abs(by10 - 0.8163) < 0.001 ? 0 : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const p = 0.49;
        const by1 = ruinProbFormula(50, 60, p);
        const by5 = ruinProbFormula(10, 12, p);
        const by10 = ruinProbFormula(5, 6, p);
        return by10 > by5 && by5 > by1 && Math.abs(by10 - 0.8163) < 0.001 && Math.abs(by1 - 0.6374) < 0.001 ? 0 : -1;
      },
    },
  ],
  "m6-p24": [
    {
      method: "recursion",
      run: () => {
        // squares 0,1,2 transient; 3 is a trap (back to 0); 4 finishes.
        // e0 = 1 + (e1 + e2)/2 ; e1 = 1 + (e2 + e0)/2 ; e2 = 1 + (e0 + 0)/2
        const [e0] = solveLinear(
          [
            [1, -0.5, -0.5],
            [-0.5, 1, -0.5],
            [-0.5, 0, 1],
          ],
          [1, 1, 1],
        );
        return e0;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let pos = 0;
          let turns = 0;
          while (pos !== 4) {
            turns++;
            pos += coin(r) ? 1 : 2;
            if (pos === 3) pos = 0;
          }
          return turns;
        }),
    },
  ],
  "m6-p25": [
    {
      method: "recursion",
      run: () => {
        // cells 1..5 transient (cell 0 = start is the target). e_k = 1 + (e_{k-1} + e_{k+1})/2 with e_0 = e_6 = 0
        const n = 5;
        const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
        const b = new Array<number>(n).fill(1);
        for (let k = 1; k <= n; k++) {
          A[k - 1][k - 1] = 1;
          if (k - 1 >= 1) A[k - 1][k - 2] -= 0.5;
          if (k + 1 <= n) A[k - 1][k] -= 0.5;
        }
        const e = solveLinear(A, b);
        return 1 + 0.5 * e[0] + 0.5 * e[n - 1];
      },
    },
    { method: "formula", run: () => 1 + ruinDurationFormula(1, 6, 0.5) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let pos = 0;
          let t = 0;
          do {
            pos = (pos + (r() < 0.5 ? 1 : 5)) % 6;
            t++;
          } while (pos !== 0);
          return t;
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m6-p26": [
    { method: "recursion", run: () => patternWaitRecursion([H, T, T, H], [0.4, 0.6]) },
    { method: "dp", run: () => patternWaitTailSum([H, T, T, H], [0.4, 0.6]) },
    { method: "formula", run: () => 1 / 0.6 + 1 / (0.6 * 0.4 * 0.4 * 0.6) },
  ],
  "m6-p27": [
    {
      method: "recursion",
      run: () => {
        // c0 = (5/6)(1 + c0) + (1/6)(3 + c1) ; c1 = (5/6)(1 + c0) + (1/6)(3)
        const [c0] = solveLinear(
          [
            [1 - 5 / 6, -1 / 6],
            [-5 / 6, 1],
          ],
          [5 / 6 + 3 / 6, 5 / 6 + 3 / 6],
        );
        return c0;
      },
    },
    {
      method: "dp",
      run: () =>
        expectedRewardForward(3, 0, (s) => {
          if (s === 2) return [];
          // state 0: no F pending; state 1: last tick was F; state 2: stopped
          return s === 0
            ? [
                [0, 5 / 6, 1],
                [1, 1 / 6, 3],
              ]
            : [
                [0, 5 / 6, 1],
                [2, 1 / 6, 3],
              ];
        }),
    },
  ],
  "m6-p28": [
    {
      method: "recursion",
      run: () => {
        // inventory x in -2..2 transient (index x+2); reward per tick = -|x|; +3 pays 30, -3 pays 0
        const n = 5;
        const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
        const b = new Array<number>(n).fill(0);
        for (let x = -2; x <= 2; x++) {
          const i = x + 2;
          A[i][i] = 1;
          b[i] = -Math.abs(x);
          if (x + 1 <= 2) A[i][i + 1] -= 0.5;
          else b[i] += 0.5 * 30;
          if (x - 1 >= -2) A[i][i - 1] -= 0.5;
        }
        return solveLinear(A, b)[2];
      },
    },
    {
      method: "dp",
      run: () =>
        expectedRewardForward(7, 3, (s) => {
          const x = s - 3;
          if (x === 3 || x === -3) return [];
          const up = x + 1 === 3 ? 30 : 0;
          return [
            [s + 1, 0.5, -Math.abs(x) + up],
            [s - 1, 0.5, -Math.abs(x)],
          ];
        }),
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m6-lc1": [
    { method: "recursion", run: () => solveLinear([[1 - 0.5]], [1])[0] },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let n = 0;
          for (;;) {
            n++;
            if (coin(r)) return n;
          }
        }),
    },
  ],
  "m6-lc2": [
    { method: "recursion", run: () => ruinProbRecursion(2, 5, 0.5) },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => simRuin(r, 2, 5, 0.5).won) },
  ],
  "m6-lc3": [
    { method: "enumeration", run: () => noTwoConsecutiveEnumeration(4) },
    { method: "dp", run: () => noTwoConsecutiveDp(4) },
  ],
  "m6-lc4": [
    { method: "recursion", run: () => solveLinear([[1 - 2 / 3]], [1])[0] },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let n = 0;
          for (;;) {
            n++;
            if (die(r) >= 5) return n;
          }
        }),
    },
  ],
};
