/**
 * Helpers for independent answer verification. Everything here is deterministic given
 * the seeded rng passed in by the runner.
 */

import type { Rng } from "@/lib/rng";

export type SimResult = { value: number; se: number };

/**
 * Monte Carlo estimate of E[f]. Returns the sample mean and its standard error so the
 * runner can tell "wrong" from "noisy". Use at least 200k trials for probabilities.
 */
export function simulate(rng: Rng, trials: number, trial: (rng: Rng) => number): SimResult {
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < trials; i++) {
    const x = trial(rng);
    sum += x;
    sumSq += x * x;
  }
  const mean = sum / trials;
  const variance = Math.max(0, sumSq / trials - mean * mean);
  return { value: mean, se: Math.sqrt(variance / trials) };
}

/** Probability that a boolean event happens, estimated by simulation. */
export function simulateProb(rng: Rng, trials: number, event: (rng: Rng) => boolean): SimResult {
  return simulate(rng, trials, (r) => (event(r) ? 1 : 0));
}

export function randInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function die(rng: Rng, sides = 6): number {
  return 1 + Math.floor(rng() * sides);
}

export function coin(rng: Rng, pHeads = 0.5): boolean {
  return rng() < pHeads;
}

export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Draw k items without replacement from arr. */
export function drawWithoutReplacement<T>(arr: readonly T[], k: number, rng: Rng): T[] {
  return shuffle(arr, rng).slice(0, k);
}

/** A standard 52-card deck as rank (1-13, 1 = ace) and suit (0-3). */
export function deck(): Array<{ rank: number; suit: number }> {
  const out: Array<{ rank: number; suit: number }> = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) out.push({ rank: r, suit: s });
  return out;
}

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function perm(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

/** Number of derangements of n items. */
export function derangements(n: number): number {
  if (n === 0) return 1;
  if (n === 1) return 0;
  let a = 1; // D(0)
  let b = 0; // D(1)
  for (let i = 2; i <= n; i++) {
    const c = (i - 1) * (a + b);
    a = b;
    b = c;
  }
  return b;
}

/** Call cb for every tuple in {0..sides-1}^n (or 1..sides when oneBased). */
export function forEachTuple(n: number, sides: number, cb: (t: number[]) => void, oneBased = false): void {
  const t = new Array<number>(n).fill(oneBased ? 1 : 0);
  const lo = oneBased ? 1 : 0;
  const hi = oneBased ? sides : sides - 1;
  for (;;) {
    cb(t);
    let i = n - 1;
    while (i >= 0) {
      if (t[i] < hi) {
        t[i]++;
        break;
      }
      t[i] = lo;
      i--;
    }
    if (i < 0) return;
  }
}

/** Enumerate all dice outcomes for n dice with the given sides (1-based). */
export function forEachDice(n: number, cb: (dice: number[]) => void, sides = 6): void {
  forEachTuple(n, sides, cb, true);
}

/** Call cb for every permutation of 0..n-1 (n <= 10 recommended). */
export function forEachPermutation(n: number, cb: (p: number[]) => void): void {
  const p = Array.from({ length: n }, (_, i) => i);
  const used = new Array<boolean>(n).fill(false);
  const cur: number[] = [];
  const rec = () => {
    if (cur.length === n) {
      cb(cur.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(p[i]);
      rec();
      cur.pop();
      used[i] = false;
    }
  };
  rec();
}

/** Call cb for every k-subset of 0..n-1, as an ascending array. */
export function forEachSubset(n: number, k: number, cb: (s: number[]) => void): void {
  const cur: number[] = [];
  const rec = (start: number) => {
    if (cur.length === k) {
      cb(cur.slice());
      return;
    }
    for (let i = start; i < n; i++) {
      cur.push(i);
      rec(i + 1);
      cur.pop();
    }
  };
  rec(0);
}

/** Call cb for every subset (as a bitmask) of n items. */
export function forEachMask(n: number, cb: (mask: number) => void): void {
  for (let m = 0; m < 1 << n; m++) cb(m);
}

export function binomialPmf(n: number, k: number, p: number): number {
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function poissonPmf(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

/** Standard normal CDF (Abramowitz-Stegun style approximation, error < 7.5e-8). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - p : p;
}

/**
 * Solve a linear system A x = b by Gaussian elimination (for absorbing Markov chains and
 * first-step equations). Returns x.
 */
export function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    if (Math.abs(d) < 1e-14) throw new Error("Singular system");
    for (let c = col; c <= n; c++) M[col][c] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row) => row[n]);
}

/**
 * Expected number of steps / value by value iteration on a finite chain. `step` returns the
 * list of (nextState, prob, reward) from a state; absorbing states return []. Returns the
 * expected total reward from each state.
 */
export function expectedRewardByIteration(
  states: number,
  step: (s: number) => Array<[next: number, prob: number, reward: number]>,
  iterations = 20000,
  tol = 1e-13,
): number[] {
  let v = new Array<number>(states).fill(0);
  for (let it = 0; it < iterations; it++) {
    const nv = new Array<number>(states).fill(0);
    let delta = 0;
    for (let s = 0; s < states; s++) {
      let acc = 0;
      for (const [n, p, r] of step(s)) acc += p * (r + v[n]);
      nv[s] = acc;
      delta = Math.max(delta, Math.abs(acc - v[s]));
    }
    v = nv;
    if (delta < tol) break;
  }
  return v;
}

/** Greatest common divisor, for reducing exact fractions in checks. */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
