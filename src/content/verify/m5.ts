import type { VerifySpec } from "../types";
import type { Rng } from "@/lib/rng";
import {
  binomialPmf,
  choose,
  die,
  forEachDice,
  forEachMask,
  forEachPermutation,
  normalCdf,
  poissonPmf,
  simulate,
  simulateProb,
} from "./helpers";

/**
 * Independent checks for module 5. Variances are recomputed by brute-force enumeration of
 * the sample space wherever it is finite (dice tuples, permutations), by exact convolution
 * for sums with a random number of terms, by independent closed forms, and by Monte Carlo
 * with the runner's seeded rng. The normal approximation problems store the approximation
 * itself; their simulations sample the exact discrete distribution, which agrees with the
 * approximation well inside the simulation tolerance for the chosen parameters.
 */

const DIE_VAR = 35 / 12;

/** Exact Poisson sample by Knuth's multiplication method, using only the seeded rng. */
function poissonSample(rng: Rng, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

/** Standard normal sample by Box-Muller, independent of the normalCdf approximation. */
function normalSample(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Geometric number of trials up to and including the first success. */
function geometricSample(rng: Rng, p: number): number {
  let n = 1;
  while (rng() >= p) n++;
  return n;
}

/** Mean and variance of a discrete distribution given as [value, probability] pairs. */
function moments(dist: Iterable<[number, number]>): { mean: number; variance: number } {
  let m = 0;
  let m2 = 0;
  for (const [v, p] of dist) {
    m += v * p;
    m2 += v * v * p;
  }
  return { mean: m, variance: m2 - m * m };
}

/** Covariance of two functions of the outcome under a uniform sample space of dice. */
function diceCov(n: number, f: (d: number[]) => number, g: (d: number[]) => number): number {
  let total = 0;
  let sf = 0;
  let sg = 0;
  let sfg = 0;
  forEachDice(n, (d) => {
    const a = f(d);
    const b = g(d);
    total++;
    sf += a;
    sg += b;
    sfg += a * b;
  });
  return sfg / total - (sf / total) * (sg / total);
}

/** Correlation of two functions of the outcome under a uniform sample space of dice. */
function diceCorr(n: number, f: (d: number[]) => number, g: (d: number[]) => number): number {
  return diceCov(n, f, g) / Math.sqrt(diceCov(n, f, f) * diceCov(n, g, g));
}

/** Variance of a function of the outcome under a uniform sample space of dice. */
function diceVar(n: number, f: (d: number[]) => number): number {
  return diceCov(n, f, f);
}

/**
 * Exact distribution of X_1 + ... + X_N where N has pmf `countPmf(n)` for n = 0..maxN and
 * each X_i is iid with the given finite distribution. Returns [value, probability] pairs.
 */
function randomSumDistribution(
  countPmf: (n: number) => number,
  maxN: number,
  term: Array<[number, number]>,
): Map<number, number> {
  const out = new Map<number, number>();
  let partial = new Map<number, number>([[0, 1]]);
  for (let n = 0; n <= maxN; n++) {
    const pn = countPmf(n);
    for (const [v, p] of partial) out.set(v, (out.get(v) ?? 0) + pn * p);
    const next = new Map<number, number>();
    for (const [v, p] of partial) {
      for (const [x, px] of term) next.set(v + x, (next.get(v + x) ?? 0) + p * px);
    }
    partial = next;
  }
  return out;
}

export const spec: VerifySpec = {
  // -------------------------------------------------------------- difficulty 1
  "m5-p01": [
    { method: "enumeration", run: () => diceVar(1, (d) => d[0]) },
    {
      method: "formula",
      run: () => {
        // Mean squared deviation from 3.5, summed directly.
        let s = 0;
        for (let f = 1; f <= 6; f++) s += (f - 3.5) ** 2;
        return s / 6;
      },
    },
  ],
  "m5-p02": [
    { method: "formula", run: () => 0.3 * 0.7 * (8 - -2) ** 2 },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          const x = r() < 0.3 ? 8 : -2;
          return (x - 1) ** 2; // squared deviation from the known mean of 1
        }),
    },
  ],
  "m5-p03": [
    { method: "enumeration", run: () => Math.sqrt(diceVar(1, (d) => 10 * d[0] - 15)) },
    { method: "formula", run: () => Math.sqrt(100 * DIE_VAR) },
  ],
  "m5-p04": [
    { method: "formula", run: () => 40 * 0.35 * 0.65 },
    {
      method: "enumeration",
      run: () => {
        const dist: Array<[number, number]> = [];
        for (let k = 0; k <= 40; k++) dist.push([k, binomialPmf(40, k, 0.35)]);
        return moments(dist).variance;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let k = 0;
          for (let i = 0; i < 40; i++) if (r() < 0.35) k++;
          return (k - 14) ** 2;
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m5-p05": [
    { method: "enumeration", run: () => diceCov(2, (d) => d[0], (d) => d[0] + d[1]) },
    { method: "formula", run: () => DIE_VAR + 0 },
  ],
  "m5-p06": [
    {
      method: "enumeration",
      run: () => {
        const varA = diceVar(2, (d) => d[0] + d[1]);
        const varB = diceVar(1, (d) => 2 * d[0]);
        if (Math.abs(varB - 2 * varA) < 1e-12) return 0;
        if (Math.abs(varA - varB) < 1e-12) return 1;
        if (Math.abs(varA - 2 * varB) < 1e-12) return 3;
        return varA > varB ? 2 : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const varA = 2 * DIE_VAR;
        const varB = 4 * DIE_VAR;
        return Math.abs(varB - 2 * varA) < 1e-12 ? 0 : -1;
      },
    },
  ],
  "m5-p07": [
    { method: "formula", run: () => binomialPmf(8, 3, 0.3) },
    {
      method: "enumeration",
      run: () => {
        // Sum the probability of every make/miss pattern with exactly three makes.
        let total = 0;
        forEachMask(8, (mask) => {
          let makes = 0;
          for (let i = 0; i < 8; i++) if (mask & (1 << i)) makes++;
          if (makes === 3) total += Math.pow(0.3, 3) * Math.pow(0.7, 5);
        });
        return total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_500_000, (r) => {
          let makes = 0;
          for (let i = 0; i < 8; i++) if (r() < 0.3) makes++;
          return makes === 3;
        }),
    },
  ],
  "m5-p08": [
    { method: "formula", run: () => 1 - binomialPmf(25, 0, 0.04) - binomialPmf(25, 1, 0.04) },
    {
      method: "enumeration",
      run: () => {
        let s = 0;
        for (let k = 2; k <= 25; k++) s += binomialPmf(25, k, 0.04);
        return s;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          let d = 0;
          for (let i = 0; i < 25; i++) if (r() < 0.04) d++;
          return d >= 2;
        }),
    },
  ],
  "m5-p09": [
    { method: "formula", run: () => 1 / 0.15 },
    {
      method: "enumeration",
      run: () => {
        // Conditional distribution of N - 4 given N > 4, summed directly from the pmf of N.
        const p = 0.15;
        let num = 0;
        let den = 0;
        for (let n = 5; n <= 3000; n++) {
          const pn = Math.pow(1 - p, n - 1) * p;
          num += (n - 4) * pn;
          den += pn;
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        // Rejection sampling of the conditional law: keep runs whose first four calls fail.
        let sum = 0;
        let sumSq = 0;
        let kept = 0;
        for (let i = 0; i < 800_000; i++) {
          const n = geometricSample(rng, 0.15);
          if (n <= 4) continue;
          const x = n - 4;
          sum += x;
          sumSq += x * x;
          kept++;
        }
        const mean = sum / kept;
        const variance = Math.max(0, sumSq / kept - mean * mean);
        return { value: mean, se: Math.sqrt(variance / kept) };
      },
    },
  ],
  "m5-p10": [
    { method: "formula", run: () => 1 - poissonPmf(1.25, 0) },
    { method: "simulation", run: (rng) => simulateProb(rng, 1_000_000, (r) => poissonSample(r, 1.25) >= 1) },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m5-p11": [
    { method: "formula", run: () => poissonPmf(2, 2) / (1 - poissonPmf(2, 0)) },
    {
      method: "enumeration",
      run: () => {
        // Normalise P(2) by the sum of the pmf over k >= 1, summed term by term.
        let tail = 0;
        for (let k = 1; k <= 80; k++) tail += poissonPmf(2, k);
        return poissonPmf(2, 2) / tail;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        let hits = 0;
        let kept = 0;
        for (let i = 0; i < 1_300_000; i++) {
          const f = poissonSample(rng, 2);
          if (f === 0) continue;
          kept++;
          if (f === 2) hits++;
        }
        const p = hits / kept;
        return { value: p, se: Math.sqrt((p * (1 - p)) / kept) };
      },
    },
  ],
  "m5-p12": [
    {
      method: "formula",
      run: () => 1 - binomialPmf(200, 0, 0.01) - binomialPmf(200, 1, 0.01) - binomialPmf(200, 2, 0.01),
    },
    {
      method: "enumeration",
      run: () => {
        let s = 0;
        for (let k = 3; k <= 200; k++) s += binomialPmf(200, k, 0.01);
        return s;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let errors = 0;
          for (let i = 0; i < 200; i++) if (r() < 0.01) errors++;
          return errors >= 3;
        }),
    },
  ],
  "m5-p13": [
    { method: "enumeration", run: () => diceCorr(3, (d) => d[0] + d[1], (d) => d[1] + d[2]) },
    { method: "formula", run: () => DIE_VAR / Math.sqrt(2 * DIE_VAR * (2 * DIE_VAR)) },
  ],
  "m5-p14": [
    { method: "formula", run: () => (1 - 1 / 6) / (1 / 6) ** 2 },
    {
      method: "enumeration",
      run: () => {
        // Conditional pmf of N given N > 4, variance by direct summation.
        const p = 1 / 6;
        const dist: Array<[number, number]> = [];
        let den = 0;
        for (let n = 5; n <= 3000; n++) den += Math.pow(1 - p, n - 1) * p;
        for (let n = 5; n <= 3000; n++) dist.push([n, (Math.pow(1 - p, n - 1) * p) / den]);
        return moments(dist).variance;
      },
    },
  ],
  "m5-p15": [
    { method: "formula", run: () => normalCdf((0 - 1200) / 800) },
    { method: "simulation", run: (rng) => simulateProb(rng, 6_000_000, (r) => 1200 + 800 * normalSample(r) < 0) },
  ],
  "m5-p16": [
    { method: "formula", run: () => normalCdf((54 - 42) / 6) - normalCdf((36 - 42) / 6) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const t = 42 + 6 * normalSample(r);
          return t > 36 && t < 54;
        }),
    },
  ],
  "m5-p17": [
    {
      method: "formula",
      run: () => {
        const mean = 120 * 0.5;
        const sd = Math.sqrt(120 * 0.5 * 0.5);
        return 1 - normalCdf((66 - 0.5 - mean) / sd);
      },
    },
    {
      // Exact binomial sampled directly; differs from the approximation by about 5e-7.
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_200_000, (r) => {
          let heads = 0;
          for (let i = 0; i < 120; i++) if (r() < 0.5) heads++;
          return heads >= 66;
        }),
    },
  ],
  "m5-p18": [
    { method: "formula", run: () => Math.ceil(DIE_VAR / 0.05 ** 2) },
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 1; n <= 100_000; n++) {
          if (Math.sqrt(DIE_VAR / n) <= 0.05) return n;
        }
        return -1;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m5-p19": [
    { method: "formula", run: () => 1 / (12 / 4) ** 2 },
    {
      method: "enumeration",
      run: () => {
        // The extremal three-point distribution: check its mean and variance, then read off
        // the tail probability it attains.
        const dist: Array<[number, number]> = [
          [38, 1 / 18],
          [50, 8 / 9],
          [62, 1 / 18],
        ];
        const { mean, variance } = moments(dist);
        if (Math.abs(mean - 50) > 1e-12 || Math.abs(variance - 16) > 1e-12) return -1;
        let tail = 0;
        for (const [v, p] of dist) if (Math.abs(v - 50) >= 12) tail += p;
        return tail;
      },
    },
  ],
  "m5-p20": [
    {
      method: "formula",
      run: () => {
        const mean = 50 * 3.5;
        const sd = Math.sqrt(50 * DIE_VAR);
        return 1 - normalCdf((190 - 0.5 - mean) / sd);
      },
    },
    {
      // Exact dice total sampled directly; differs from the approximation by about 3e-4.
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 3_000_000, (r) => {
          let total = 0;
          for (let i = 0; i < 50; i++) total += die(r);
          return total >= 190;
        }),
    },
  ],
  "m5-p21": [
    {
      method: "dp",
      run: () => {
        const dist = randomSumDistribution((n) => poissonPmf(4, n), 70, [
          [2, 0.5],
          [-1, 0.5],
        ]);
        return moments(dist).variance;
      },
    },
    {
      method: "formula",
      run: () => {
        const ex = 0.5 * 2 + 0.5 * -1;
        const varX = 0.5 * 4 + 0.5 * 1 - ex * ex;
        return 4 * varX + 4 * ex * ex;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 2_000_000, (r) => {
          const n = poissonSample(r, 4);
          let t = 0;
          for (let i = 0; i < n; i++) t += r() < 0.5 ? 2 : -1;
          return (t - 2) ** 2; // squared deviation from the known mean of 2
        }),
    },
  ],
  "m5-p22": [
    {
      method: "enumeration",
      run: () => {
        const first6 = (d: number[]) => (d[0] === 6 ? 1 : 0);
        const events: Array<(d: number[]) => number> = [
          (d) => (d[0] + d[1] === 7 ? 1 : 0),
          (d) => (d[0] + d[1] === 8 ? 1 : 0),
          (d) => (Math.max(d[0], d[1]) === 6 ? 1 : 0),
          (d) => (d[0] + d[1] >= 10 ? 1 : 0),
        ];
        const zero = events.map((g) => Math.abs(diceCov(2, first6, g)) < 1e-12);
        if (zero.filter(Boolean).length !== 1) return -1;
        return zero.indexOf(true);
      },
    },
    {
      method: "formula",
      run: () => {
        // P(A and B) - P(A)P(B) from outcome counts out of 36.
        const pA = 6 / 36;
        const candidates: Array<[joint: number, pB: number]> = [
          [1 / 36, 6 / 36],
          [1 / 36, 5 / 36],
          [6 / 36, 11 / 36],
          [3 / 36, 6 / 36],
        ];
        const covs = candidates.map(([joint, pB]) => joint - pA * pB);
        const zeros = covs.map((c) => Math.abs(c) < 1e-12);
        if (zeros.filter(Boolean).length !== 1) return -1;
        return zeros.indexOf(true);
      },
    },
  ],
  "m5-p23": [
    {
      method: "formula",
      run: () => {
        const q = 1 - Math.exp(-0.4);
        return choose(5, 1) * q * Math.pow(1 - q, 4);
      },
    },
    {
      // Independent route: draw the total flaw count for the whole cable, then scatter each
      // flaw uniformly along it and count the pieces that received at least one.
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const flaws = poissonSample(r, 2);
          let hit = 0;
          for (let i = 0; i < flaws; i++) hit |= 1 << Math.floor(r() * 5);
          let pieces = 0;
          while (hit) {
            hit &= hit - 1;
            pieces++;
          }
          return pieces === 1;
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m5-p24": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let s = 0;
        let s2 = 0;
        forEachPermutation(7, (p) => {
          let m = 0;
          for (let i = 0; i < 7; i++) if (p[i] === i) m++;
          total++;
          s += m;
          s2 += m * m;
        });
        return s2 / total - (s / total) ** 2;
      },
    },
    {
      method: "formula",
      run: () => {
        const n = 7;
        const p1 = 1 / n;
        const p2 = 1 / (n * (n - 1));
        return n * p1 * (1 - p1) + n * (n - 1) * (p2 - p1 * p1);
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_500_000, (r) => {
          // Fisher-Yates shuffle of 0..6, count fixed points, squared deviation from mean 1.
          const a = [0, 1, 2, 3, 4, 5, 6];
          for (let i = 6; i > 0; i--) {
            const j = Math.floor(r() * (i + 1));
            const t = a[i];
            a[i] = a[j];
            a[j] = t;
          }
          let m = 0;
          for (let i = 0; i < 7; i++) if (a[i] === i) m++;
          return (m - 1) ** 2;
        }),
    },
  ],
  "m5-p25": [
    {
      method: "dp",
      run: () => {
        // M non-six rolls (geometric on 0,1,2,...), each uniform on 1..5, plus the final 6.
        const term: Array<[number, number]> = [1, 2, 3, 4, 5].map((v) => [v, 1 / 5]);
        const dist = randomSumDistribution((m) => Math.pow(5 / 6, m) * (1 / 6), 260, term);
        const shifted: Array<[number, number]> = [...dist].map(([v, p]) => [v + 6, p]);
        return moments(shifted).variance;
      },
    },
    {
      method: "formula",
      run: () => {
        const p = 1 / 6;
        const eM = (1 - p) / p;
        const varM = (1 - p) / (p * p);
        const eX = 3;
        const varX = (25 - 1) / 12;
        return eM * varX + varM * eX * eX;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 3_500_000, (r) => {
          let t = 0;
          for (;;) {
            const f = die(r);
            t += f;
            if (f === 6) break;
          }
          return (t - 21) ** 2; // squared deviation from the known mean of 21
        }),
    },
  ],
  "m5-p26": [
    {
      method: "enumeration",
      run: () =>
        diceVar(6, (d) => {
          let seen = 0;
          for (const f of d) seen |= 1 << f;
          let c = 0;
          while (seen) {
            seen &= seen - 1;
            c++;
          }
          return c;
        }),
    },
    {
      method: "formula",
      run: () => {
        const miss1 = Math.pow(5 / 6, 6);
        const miss2 = Math.pow(4 / 6, 6);
        const p = 1 - miss1;
        const p2 = 1 - 2 * miss1 + miss2;
        return 6 * p * (1 - p) + 30 * (p2 - p * p);
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const mean = 6 * (1 - Math.pow(5 / 6, 6));
        return simulate(rng, 1_500_000, (r) => {
          let seen = 0;
          for (let i = 0; i < 6; i++) seen |= 1 << die(r);
          let c = 0;
          while (seen) {
            seen &= seen - 1;
            c++;
          }
          return (c - mean) ** 2;
        });
      },
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m5-lc1": [
    { method: "formula", run: () => 0.2 * 0.8 },
    {
      method: "enumeration",
      run: () =>
        moments([
          [0, 0.8],
          [1, 0.2],
        ]).variance,
    },
  ],
  "m5-lc2": [
    { method: "enumeration", run: () => diceVar(3, (d) => d[0] + d[1] + d[2]) },
    { method: "formula", run: () => 3 * DIE_VAR },
  ],
  "m5-lc3": [
    { method: "formula", run: () => Math.sqrt(12 * 0.25 * 0.75) },
    {
      method: "enumeration",
      run: () => {
        const dist: Array<[number, number]> = [];
        for (let k = 0; k <= 12; k++) dist.push([k, binomialPmf(12, k, 0.25)]);
        return Math.sqrt(moments(dist).variance);
      },
    },
  ],
  "m5-lc4": [
    { method: "formula", run: () => poissonPmf(3, 0) + poissonPmf(3, 1) },
    { method: "simulation", run: (rng) => simulateProb(rng, 2_500_000, (r) => poissonSample(r, 3) <= 1) },
  ],
};
