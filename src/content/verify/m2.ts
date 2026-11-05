import type { VerifySpec } from "../types";
import {
  forEachDice,
  forEachTuple,
  forEachPermutation,
  forEachSubset,
  simulateProb,
  die,
  coin,
  shuffle,
  deck,
  choose,
  binomialPmf,
} from "./helpers";

/**
 * Independent checks for module 2 (probability basics).
 *
 * Conventions:
 * - `enumeration` walks the whole discrete sample space (dice tuples, flip strings, card
 *   subsets, random-row positions). For the continuous geometric problems it is a fine
 *   midpoint-rule integration of the one-dimensional slice probability over the first
 *   coordinate; the grid is chosen so the kinks of the slice function sit on grid nodes
 *   (exact for piecewise-linear slices) or so the discretisation error is far below 1e-9.
 * - `simulation` uses the seeded rng handed in by the runner, never Math.random. Trial
 *   counts are sized so that 6 standard errors fit the runner's noise budget.
 * - `formula` is a closed form reached by a different route than the worked solution.
 * - `recursion` fills a small table from base cases.
 * - Choice answers return the 0-based index after computing the quantities compared.
 */

type Rng = () => number;

/** Length of the longest block of equal consecutive values. */
function longestRun(t: readonly number[]): number {
  let best = 1;
  let cur = 1;
  for (let i = 1; i < t.length; i++) {
    if (t[i] === t[i - 1]) {
      cur++;
      if (cur > best) best = cur;
    } else cur = 1;
  }
  return best;
}

/** True if t contains at least `k` consecutive entries equal to `face`. */
function hasRunOf(t: readonly number[], face: number, k: number): boolean {
  let cur = 0;
  for (const x of t) {
    cur = x === face ? cur + 1 : 0;
    if (cur >= k) return true;
  }
  return false;
}

/** Number of compositions of n with every part at most k (c(0) = 1). */
function compositionsMaxPart(n: number, k: number): number {
  const c = new Array<number>(n + 1).fill(0);
  c[0] = 1;
  for (let m = 1; m <= n; m++) for (let j = 1; j <= k && j <= m; j++) c[m] += c[m - j];
  return c[n];
}

/** Two distinct uniform indices from 0..n-1 (an ordered draw without replacement). */
function drawTwoDistinct(rng: Rng, n: number): [number, number] {
  const i = Math.floor(rng() * n);
  let j = Math.floor(rng() * (n - 1));
  if (j >= i) j++;
  return [i, j];
}

/** Draw without replacement from an urn with `a` marked and `b` unmarked items until a marked one appears; returns the draw number. */
function drawsUntilMarked(rng: Rng, a: number, b: number): number {
  let k = 0;
  for (;;) {
    k++;
    if (rng() * (a + b) < a) return k;
    b--;
  }
}

/**
 * Classify two events from their probabilities: 0 independent, 1 disjoint (and dependent),
 * 2 dependent with the conditional raised to `up`, 3 dependent with the conditional lowered.
 */
function classifyPair(pA: number, pB: number, pAB: number, up: number): number {
  if (Math.abs(pAB - pA * pB) < 1e-12) return 0;
  if (pAB === 0) return pA > 0 && pB > 0 ? 1 : -1;
  const cond = pAB / pB;
  if (cond > pA) return Math.abs(cond - up) < 1e-12 ? 2 : -1;
  return 3;
}

/** Midpoint-rule average of f over [lo, hi] with n cells. */
function midpointAverage(lo: number, hi: number, n: number, f: (x: number) => number): number {
  const h = (hi - lo) / n;
  let acc = 0;
  for (let i = 0; i < n; i++) acc += f(lo + (i + 0.5) * h);
  return acc / n;
}

const STANDARD = deck();
const isFace = (c: { rank: number }) => c.rank >= 11;
const isSpade = (c: { suit: number }) => c.suit === 0;

export const spec: VerifySpec = {
  // ------------------------------------------------------------------ difficulty 1
  "m2-p01": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(2, (d) => {
          if (d[0] + d[1] >= 9) hit++;
        });
        return hit / 36;
      },
    },
    { method: "simulation", run: (rng) => simulateProb(rng, 2_000_000, (r) => die(r) + die(r) >= 9) },
  ],
  "m2-p02": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachTuple(5, 2, (t) => {
          let ok = true;
          for (let i = 1; i < 5; i++) if (t[i] === t[i - 1]) ok = false;
          if (ok) hit++;
        });
        return hit / 32;
      },
    },
    // First flip free, each of the next four must differ from its predecessor.
    { method: "formula", run: () => Math.pow(1 / 2, 4) },
  ],
  "m2-p03": [
    {
      method: "enumeration",
      run: () => STANDARD.filter((c) => isFace(c) || isSpade(c)).length / 52,
    },
    // Complement: ten non-face ranks in three non-spade suits.
    { method: "formula", run: () => 1 - (10 * 3) / 52 },
  ],
  "m2-p04": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachTuple(3, 2, (t) => {
          if (t[0] + t[1] + t[2] >= 2) hit++;
        });
        return hit / 8;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let h = 0;
          for (let i = 0; i < 3; i++) if (coin(r)) h++;
          return h >= 2;
        }),
    },
  ],
  // ------------------------------------------------------------------ difficulty 2
  "m2-p05": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(2, (d) => {
          const mixed = (d[0] === 2 && d[1] === 5) || (d[0] === 5 && d[1] === 2);
          if (mixed || (d[0] === 6 && d[1] === 6)) hit++;
        });
        return hit / 36;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 5_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          return (a === 2 && b === 5) || (a === 5 && b === 2) || (a === 6 && b === 6);
        }),
    },
  ],
  "m2-p06": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(2, (d) => {
          if (d[0] % 2 === 0 || d[0] + d[1] === 7) hit++;
        });
        return hit / 36;
      },
    },
    // Independent events: P(A or B) = 1 - P(not A) P(not B).
    { method: "formula", run: () => 1 - (1 / 2) * (5 / 6) },
  ],
  "m2-p07": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(4, (d) => {
          if (d.filter((x) => x === 6).length === 2) hit++;
        });
        return hit / 1296;
      },
    },
    { method: "formula", run: () => binomialPmf(4, 2, 1 / 6) },
  ],
  "m2-p08": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachDice(6, (d) => {
          total++;
          if (d[0] === d[1] || d[2] === d[3] || d[4] === d[5]) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          for (let i = 0; i < 3; i++) if (die(r) === die(r)) return true;
          return false;
        }),
    },
  ],
  "m2-p09": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachSubset(52, 2, (s) => {
          total++;
          const a = STANDARD[s[0]];
          const b = STANDARD[s[1]];
          if (a.suit === b.suit || a.rank === b.rank) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          const [i, j] = drawTwoDistinct(r, 52);
          const a = STANDARD[i];
          const b = STANDARD[j];
          return a.suit === b.suit || a.rank === b.rank;
        }),
    },
  ],
  "m2-p10": [
    {
      method: "enumeration",
      run: () => {
        // tokens 0..3 red, 4..9 green
        let withHit = 0;
        let withoutHit = 0;
        let withoutTotal = 0;
        forEachTuple(2, 10, (t) => {
          const bothGreen = t[0] >= 4 && t[1] >= 4;
          if (bothGreen) withHit++;
          if (t[0] !== t[1]) {
            withoutTotal++;
            if (bothGreen) withoutHit++;
          }
        });
        return withHit / 100 - withoutHit / withoutTotal;
      },
    },
    // Binomial versus hypergeometric.
    { method: "formula", run: () => binomialPmf(2, 2, 0.6) - choose(6, 2) / choose(10, 2) },
  ],
  "m2-p11": [
    {
      method: "enumeration",
      run: () => {
        // card 0 is the ace, cards 1..4 are the kings; count relative orders with the ace first
        let hit = 0;
        let total = 0;
        forEachPermutation(5, (p) => {
          total++;
          if (p[0] === 0) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          const order = shuffle(STANDARD, r);
          for (const c of order) {
            if (c.rank === 1 && c.suit === 0) return true;
            if (c.rank === 13) return false;
          }
          return false;
        }),
    },
  ],
  // ------------------------------------------------------------------ difficulty 3
  "m2-p12": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(3, (d) => {
          if (d[0] + d[1] + d[2] <= 6) hit++;
        });
        return hit / 216;
      },
    },
    // Three positive parts plus a non-negative slack summing to 6: C(6,3).
    { method: "formula", run: () => choose(6, 3) / 216 },
  ],
  "m2-p13": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(4, (d) => {
          if (Math.max(...d) === 5) hit++;
        });
        return hit / 1296;
      },
    },
    {
      // Exactly j fives, the rest from {1,2,3,4}.
      method: "formula",
      run: () => {
        let count = 0;
        for (let j = 1; j <= 4; j++) count += choose(4, j) * Math.pow(4, 4 - j);
        return count / 1296;
      },
    },
  ],
  "m2-p14": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachTuple(6, 2, (t) => {
          if (hasRunOf(t, 1, 3)) hit++;
        });
        return hit / 64;
      },
    },
    {
      method: "recursion",
      run: () => {
        const a = [1, 2, 4];
        for (let n = 3; n <= 6; n++) a[n] = a[n - 1] + a[n - 2] + a[n - 3];
        return (64 - a[6]) / 64;
      },
    },
  ],
  "m2-p15": [
    {
      method: "enumeration",
      run: () => {
        let a = 0;
        let b = 0;
        let ab = 0;
        forEachDice(2, (d) => {
          const inA = d[0] % 2 === 0;
          const inB = d[0] + d[1] === 8;
          if (inA) a++;
          if (inB) b++;
          if (inA && inB) ab++;
        });
        return classifyPair(a / 36, b / 36, ab / 36, 3 / 5);
      },
    },
    {
      // Count completions: first die f, second die 8 - f must be in 1..6.
      method: "formula",
      run: () => {
        let b = 0;
        let ab = 0;
        for (let f = 1; f <= 6; f++) {
          const s = 8 - f;
          if (s < 1 || s > 6) continue;
          b++;
          if (f % 2 === 0) ab++;
        }
        return classifyPair(1 / 2, b / 36, ab / 36, 3 / 5);
      },
    },
  ],
  "m2-p16": [
    {
      method: "enumeration",
      run: () => {
        let withoutHit = 0;
        let withoutTotal = 0;
        forEachSubset(52, 3, (s) => {
          withoutTotal++;
          const ranks = new Set(s.map((i) => STANDARD[i].rank));
          if (ranks.size === 3) withoutHit++;
        });
        let withHit = 0;
        let withTotal = 0;
        forEachTuple(3, 52, (t) => {
          withTotal++;
          const ranks = new Set(t.map((i) => STANDARD[i].rank));
          if (ranks.size === 3) withHit++;
        });
        return decideDistinctRanks(withoutHit / withoutTotal, withHit / withTotal);
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const trials = 1_000_000;
        let withoutHit = 0;
        let withHit = 0;
        for (let n = 0; n < trials; n++) {
          const i = Math.floor(rng() * 52);
          let j = Math.floor(rng() * 51);
          if (j >= i) j++;
          let k = Math.floor(rng() * 50);
          const lo = Math.min(i, j);
          const hi = Math.max(i, j);
          if (k >= lo) k++;
          if (k >= hi) k++;
          const r = new Set([STANDARD[i].rank, STANDARD[j].rank, STANDARD[k].rank]);
          if (r.size === 3) withoutHit++;
          const a = STANDARD[Math.floor(rng() * 52)].rank;
          const b = STANDARD[Math.floor(rng() * 52)].rank;
          const c = STANDARD[Math.floor(rng() * 52)].rank;
          if (a !== b && a !== c && b !== c) withHit++;
        }
        return decideDistinctRanks(withoutHit / trials, withHit / trials);
      },
    },
  ],
  "m2-p17": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachSubset(9, 3, (s) => {
          total++;
          if (new Set(s.map((i) => Math.floor(i / 3))).size === 2) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const hand = shuffle(NINE, r).slice(0, 3);
          return new Set(hand.map((i) => Math.floor(i / 3))).size === 2;
        }),
    },
  ],
  "m2-p18": [
    {
      method: "enumeration",
      run: () => {
        // positions of the 4 whites among 10 slots; first white at slot index 3
        let hit = 0;
        let total = 0;
        forEachSubset(10, 4, (s) => {
          total++;
          if (s[0] === 3) hit++;
        });
        return hit / total;
      },
    },
    { method: "simulation", run: (rng) => simulateProb(rng, 4_000_000, (r) => drawsUntilMarked(r, 4, 6) === 4) },
  ],
  "m2-p19": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachSubset(12, 5, (s) => {
          total++;
          if (s.includes(8)) hit++;
        });
        return hit / total;
      },
    },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => shuffle(TWELVE, r)[8] < 5) },
  ],
  "m2-p20": [
    { method: "formula", run: () => Math.pow((10 - 4) / 10, 2) },
    {
      // Slice: for a fixed x the allowed set for y has length max(0, x - 4) + max(0, 6 - x).
      method: "enumeration",
      run: () => midpointAverage(0, 10, 10_000, (x) => (Math.max(0, x - 4) + Math.max(0, 6 - x)) / 10),
    },
    { method: "simulation", run: (rng) => simulateProb(rng, 2_000_000, (r) => Math.abs(10 * r() - 10 * r()) > 4) },
  ],
  // ------------------------------------------------------------------ difficulty 4
  "m2-p21": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(3, (d) => {
          if (d.includes(1) && d.includes(6)) hit++;
        });
        return hit / 216;
      },
    },
    // Direct count: arrangements of {1, 6, x} for x in 2..5, plus {1,1,6} and {1,6,6}.
    { method: "formula", run: () => (4 * 6 + 3 + 3) / 216 },
  ],
  "m2-p22": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachTuple(5, 2, (t) => {
          if (t[0] + t[1] + t[2] > t[3] + t[4]) hit++;
        });
        return hit / 32;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let a = 0;
          let b = 0;
          for (let i = 0; i < 3; i++) if (coin(r)) a++;
          for (let i = 0; i < 2; i++) if (coin(r)) b++;
          return a > b;
        }),
    },
  ],
  "m2-p23": [
    {
      method: "enumeration",
      run: () => {
        // gold positions among 8 slots; Ana owns even slot indices (odd positions)
        let hit = 0;
        let total = 0;
        forEachSubset(8, 2, (s) => {
          total++;
          if (s[0] % 2 === 0) hit++;
        });
        return hit / total;
      },
    },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => drawsUntilMarked(r, 2, 6) % 2 === 1) },
  ],
  "m2-p24": [
    {
      // Piecewise closed-form slice integral: x in [0,20], [20,50], [50,60].
      method: "formula",
      run: () => {
        const part1 = (20 * 20) / 2 + 10 * 20; // integral of (x + 10) from 0 to 20
        const part2 = 30 * 30; // constant 30 over a 30-minute stretch
        const part3 = 80 * 10 - (60 * 60 - 50 * 50) / 2; // integral of (80 - x) from 50 to 60
        return (part1 + part2 + part3) / 3600;
      },
    },
    {
      method: "enumeration",
      run: () => midpointAverage(0, 60, 6_000, (x) => (Math.min(60, x + 10) - Math.max(0, x - 20)) / 60),
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          const x = 60 * r();
          const y = 60 * r();
          return y - x <= 10 && x - y <= 20;
        }),
    },
  ],
  "m2-p25": [
    {
      method: "formula",
      run: () => decideBets(1 - Math.pow(5 / 6, 3), 1 - Math.pow(35 / 36, 18)),
    },
    {
      method: "simulation",
      run: (rng) => {
        const trials = 1_000_000;
        let a = 0;
        let b = 0;
        for (let n = 0; n < trials; n++) {
          let winA = false;
          for (let i = 0; i < 3 && !winA; i++) if (die(rng) === 6) winA = true;
          if (winA) a++;
          let winB = false;
          for (let i = 0; i < 18 && !winB; i++) if (die(rng) === 6 && die(rng) === 6) winB = true;
          if (winB) b++;
        }
        return decideBets(a / trials, b / trials);
      },
    },
  ],
  // ------------------------------------------------------------------ difficulty 5
  "m2-p26": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachTuple(8, 2, (t) => {
          if (longestRun(t) === 3) hit++;
        });
        return hit / 256;
      },
    },
    {
      method: "recursion",
      run: () => (2 * (compositionsMaxPart(8, 3) - compositionsMaxPart(8, 2))) / 256,
    },
  ],
  "m2-p27": [
    {
      method: "enumeration",
      run: () => {
        const c = { a: 0, b: 0, c: 0, ab: 0, ac: 0, bc: 0, abc: 0 };
        forEachDice(2, (d) => {
          const A = d[0] + d[1] === 7;
          const B = d[0] === 3;
          const C = d[1] === 4;
          if (A) c.a++;
          if (B) c.b++;
          if (C) c.c++;
          if (A && B) c.ab++;
          if (A && C) c.ac++;
          if (B && C) c.bc++;
          if (A && B && C) c.abc++;
        });
        return classifyTriple(c.a / 36, c.b / 36, c.c / 36, c.ab / 36, c.ac / 36, c.bc / 36, c.abc / 36, 1e-12, 1e-12);
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const trials = 1_000_000;
        const c = { a: 0, b: 0, c: 0, ab: 0, ac: 0, bc: 0, abc: 0 };
        for (let n = 0; n < trials; n++) {
          const red = die(rng);
          const blue = die(rng);
          const A = red + blue === 7;
          const B = red === 3;
          const C = blue === 4;
          if (A) c.a++;
          if (B) c.b++;
          if (C) c.c++;
          if (A && B) c.ab++;
          if (A && C) c.ac++;
          if (B && C) c.bc++;
          if (A && B && C) c.abc++;
        }
        // pairs must factor within noise (se ~ 2e-4); the triple gap is 1/36 - 1/216 ~ 0.023
        const T = trials;
        return classifyTriple(c.a / T, c.b / T, c.c / T, c.ab / T, c.ac / T, c.bc / T, c.abc / T, 2e-3, 1.5e-2);
      },
    },
  ],
  "m2-p28": [
    {
      // Slice over the first snap x: longer piece L = max(x, 1 - x), success window (1 - L) of L.
      method: "enumeration",
      run: () =>
        midpointAverage(0, 1, 2_000_000, (x) => {
          const L = Math.max(x, 1 - x);
          return (1 - L) / L;
        }),
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          const x = r();
          const L = Math.max(x, 1 - x);
          const a = L * r();
          const pieces = [1 - L, a, L - a];
          return pieces.every((p) => p < 0.5);
        }),
    },
  ],
  // ------------------------------------------------------------------ lesson checks
  "m2-lc1": [
    {
      method: "enumeration",
      run: () => {
        let a = 0;
        let b = 0;
        let ab = 0;
        forEachDice(2, (d) => {
          const s = d[0] + d[1];
          const inA = s === 5;
          const inB = s === 9;
          if (inA) a++;
          if (inB) b++;
          if (inA && inB) ab++;
        });
        return classifyDisjointQuestion(a / 36, b / 36, ab / 36);
      },
    },
    {
      // Counts: total s has 6 - |s - 7| pairs.
      method: "formula",
      run: () => classifyDisjointQuestion((6 - Math.abs(5 - 7)) / 36, (6 - Math.abs(9 - 7)) / 36, 0),
    },
  ],
  "m2-lc2": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachDice(2, (d) => {
          if (Math.min(d[0], d[1]) >= 3) hit++;
        });
        return hit / 36;
      },
    },
    // A 4-by-4 block of the 6-by-6 grid.
    { method: "formula", run: () => (4 * 4) / 36 },
  ],
  "m2-lc3": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachPermutation(8, (p) => {
          total++;
          const m = p.indexOf(0);
          if (m < p.indexOf(1) && m < p.indexOf(2)) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const order = shuffle(EIGHT, r);
          const m = order.indexOf(0);
          return m < order.indexOf(1) && m < order.indexOf(2);
        }),
    },
  ],
  "m2-lc4": [
    // Direct: exactly one head plus two heads.
    { method: "formula", run: () => 2 * 0.3 * 0.7 + 0.3 * 0.3 },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => coin(r, 0.3) || coin(r, 0.3)) },
  ],
};

const NINE = Array.from({ length: 9 }, (_, i) => i);
const TWELVE = Array.from({ length: 12 }, (_, i) => i);
const EIGHT = Array.from({ length: 8 }, (_, i) => i);

/** p16: option 0 is "without replacement, about 0.83 vs 0.78". */
function decideDistinctRanks(without: number, withRep: number): number {
  const gapOk = without > withRep + 0.03;
  const levelsOk = Math.abs(without - 0.828) < 0.01 && Math.abs(withRep - 0.781) < 0.01;
  return gapOk && levelsOk ? 0 : -1;
}

/** p25: option 0 is "Bet A, about 0.42 vs 0.40". */
function decideBets(pA: number, pB: number): number {
  const gapOk = pA > pB + 0.01;
  const levelsOk = Math.abs(pA - 0.421) < 0.01 && Math.abs(pB - 0.398) < 0.01;
  return gapOk && levelsOk ? 0 : -1;
}

/**
 * p27 options: 0 mutually independent, 1 pairwise independent only, 2 A independent of B
 * but not C, 3 no pair independent. `pairTol` is the slack for "equal", `tripleGap` the
 * minimum discrepancy required to call the triple dependent.
 */
function classifyTriple(
  a: number,
  b: number,
  c: number,
  ab: number,
  ac: number,
  bc: number,
  abc: number,
  pairTol: number,
  tripleGap: number,
): number {
  const abInd = Math.abs(ab - a * b) <= pairTol;
  const acInd = Math.abs(ac - a * c) <= pairTol;
  const bcInd = Math.abs(bc - b * c) <= pairTol;
  const tripleInd = Math.abs(abc - a * b * c) <= pairTol;
  const tripleDep = Math.abs(abc - a * b * c) >= tripleGap;
  if (abInd && acInd && bcInd && tripleInd) return 0;
  if (abInd && acInd && bcInd && tripleDep) return 1;
  if (abInd && !acInd) return 2;
  if (!abInd && !acInd && !bcInd) return 3;
  return -1;
}

/** lc1 options: 0 independent, 1 disjoint hence independent (never true), 2 disjoint hence dependent, 3 neither. */
function classifyDisjointQuestion(pA: number, pB: number, pAB: number): number {
  const independent = Math.abs(pAB - pA * pB) < 1e-12;
  const disjoint = pAB === 0;
  if (independent) return 0;
  if (disjoint && pA > 0 && pB > 0) return 2;
  return 3;
}
