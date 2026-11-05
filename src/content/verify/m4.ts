import type { VerifySpec } from "../types";
import type { Rng } from "@/lib/rng";
import {
  simulate,
  die,
  randInt,
  shuffle,
  forEachDice,
  forEachTuple,
  forEachPermutation,
  forEachSubset,
  forEachMask,
  choose,
  factorial,
  derangements,
  solveLinear,
  expectedRewardByIteration,
} from "./helpers";

/**
 * Independent checks for module 4 (expectation and linearity). Wherever the sample
 * space is small the answer is recomputed by brute force over every outcome; otherwise
 * by Monte Carlo with the runner's seeded rng, by an independent closed form, or by a
 * first-step recursion. Simulations of the physical processes (bouncing particles,
 * hat rounds) do not reuse the solution's shortcut.
 */

function identity(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function popcount(m: number): number {
  let c = 0;
  while (m) {
    m &= m - 1;
    c++;
  }
  return c;
}

/** Expected number of steps to reach `target` distinct types when drawing uniformly from n. */
function couponStages(n: number, target: number): number {
  // Unknowns E_0..E_{target-1}; E_target = 0. E_j = 1 + (j/n) E_j + ((n-j)/n) E_{j+1}.
  const A: number[][] = [];
  const b: number[] = [];
  for (let j = 0; j < target; j++) {
    const row = new Array<number>(target).fill(0);
    row[j] = 1 - j / n;
    if (j + 1 < target) row[j + 1] = -(n - j) / n;
    A.push(row);
    b.push(1);
  }
  return solveLinear(A, b)[0];
}

function simulateCoupon(rng: Rng, n: number, target: number): number {
  const seen = new Array<boolean>(n).fill(false);
  let distinct = 0;
  let draws = 0;
  while (distinct < target) {
    draws++;
    const t = Math.floor(rng() * n);
    if (!seen[t]) {
      seen[t] = true;
      distinct++;
    }
  }
  return draws;
}

/** Event-driven simulation of bouncing particles in a unit tube; returns the clearing time. */
function tubeClearingTime(rng: Rng, n: number): number {
  const x: number[] = [];
  for (let i = 0; i < n; i++) x.push(rng());
  x.sort((a, b) => a - b);
  const v: number[] = x.map(() => (rng() < 0.5 ? -1 : 1));
  const EPS = 1e-12;
  let t = 0;
  let guard = 0;
  while (x.length > 0) {
    if (++guard > 10000) throw new Error("particle simulation did not terminate");
    let dt = Infinity;
    for (let i = 0; i < x.length; i++) {
      const e = v[i] < 0 ? x[i] : 1 - x[i];
      if (e < dt) dt = e;
    }
    for (let i = 0; i + 1 < x.length; i++) {
      if (v[i] > 0 && v[i + 1] < 0) {
        const c = (x[i + 1] - x[i]) / 2;
        if (c < dt) dt = c;
      }
    }
    if (dt < 0) dt = 0;
    t += dt;
    for (let i = 0; i < x.length; i++) x[i] += v[i] * dt;
    // Collisions: approaching neighbours that have met swap velocities.
    for (let i = 0; i + 1 < x.length; i++) {
      if (v[i] > 0 && v[i + 1] < 0 && x[i + 1] - x[i] <= EPS) {
        const mid = (x[i] + x[i + 1]) / 2;
        x[i] = mid;
        x[i + 1] = mid;
        v[i] = -1;
        v[i + 1] = 1;
      }
    }
    // Exits: remove particles that reached an end while moving toward it.
    for (let i = x.length - 1; i >= 0; i--) {
      if ((v[i] < 0 && x[i] <= EPS) || (v[i] > 0 && x[i] >= 1 - EPS)) {
        x.splice(i, 1);
        v.splice(i, 1);
      }
    }
  }
  return t;
}

export const spec: VerifySpec = {
  // ------------------------------------------------------------------ d1
  "m4-p01": [
    {
      method: "enumeration",
      run: () => {
        const tickets: number[] = [];
        tickets.push(150);
        for (let i = 0; i < 3; i++) tickets.push(30);
        for (let i = 0; i < 10; i++) tickets.push(5);
        while (tickets.length < 400) tickets.push(0);
        return tickets.reduce((a, b) => a + b, 0) / tickets.length;
      },
    },
    { method: "formula", run: () => (150 * 1 + 30 * 3 + 5 * 10 + 0 * 386) / 400 },
  ],
  "m4-p02": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        forEachDice(1, (d) => {
          total += d[0] === 6 ? 12 : d[0];
        });
        return total / 6;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          const f = die(r);
          return f === 6 ? 12 : f;
        }),
    },
  ],
  "m4-p03": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachDice(4, (d) => {
          total += d[0] + d[1] + d[2] + d[3];
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => simulate(rng, 300_000, (r) => die(r) + die(r) + die(r) + die(r)),
    },
  ],
  "m4-p04": [
    {
      method: "recursion",
      run: () => expectedRewardByIteration(2, (s) => (s === 0 ? [[0, 0.8, 1], [1, 0.2, 1]] : []))[0],
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let n = 1;
          while (r() >= 0.2) n++;
          return n;
        }),
    },
  ],

  // ------------------------------------------------------------------ d2
  "m4-p05": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachTuple(5, 5, (t) => {
          const used = new Set(t);
          total += 5 - used.size;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const full = [false, false, false, false, false];
          for (let i = 0; i < 5; i++) full[randInt(r, 0, 4)] = true;
          return full.filter((f) => !f).length;
        }),
    },
  ],
  "m4-p06": [
    {
      method: "enumeration",
      run: () => {
        const fav = [0, 1, 2, 3, 4, 5, 5, 5];
        let total = 0;
        let count = 0;
        forEachPermutation(8, (p) => {
          for (let i = 0; i < 8; i++) if (p[i] === fav[i]) total++;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const fav = [0, 1, 2, 3, 4, 5, 5, 5];
        const base = identity(8);
        return simulate(rng, 1_000_000, (r) => {
          const p = shuffle(base, r);
          let n = 0;
          for (let i = 0; i < 8; i++) if (p[i] === fav[i]) n++;
          return n;
        });
      },
    },
  ],
  "m4-p07": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachDice(4, (d) => {
          total += new Set(d).size;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => simulate(rng, 300_000, (r) => new Set([die(r), die(r), die(r), die(r)]).size),
    },
  ],
  "m4-p08": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachTuple(10, 4, (t) => {
          for (let i = 0; i + 1 < 10; i++) if (t[i] === t[i + 1]) total++;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          let prev = randInt(r, 0, 3);
          let reps = 0;
          for (let i = 1; i < 10; i++) {
            const cur = randInt(r, 0, 3);
            if (cur === prev) reps++;
            prev = cur;
          }
          return reps;
        }),
    },
  ],
  "m4-p09": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        forEachDice(2, (d) => {
          total += Math.max(d[0], d[1]);
        });
        return total / 36;
      },
    },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => Math.max(die(r), die(r))) },
  ],
  "m4-p10": [
    // Beta(1, 5) mean for the minimum of five uniforms, rescaled to [40, 60].
    { method: "formula", run: () => 40 + 20 * (1 / (5 + 1)) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let m = Infinity;
          for (let i = 0; i < 5; i++) m = Math.min(m, 40 + 20 * r());
          return m;
        }),
    },
  ],
  "m4-p11": [
    {
      method: "enumeration",
      run: () => {
        let sumM = 0;
        let summ = 0;
        forEachDice(2, (d) => {
          sumM += Math.max(d[0], d[1]);
          summ += Math.min(d[0], d[1]);
        });
        const total = (sumM + summ) / 36;
        if (Math.abs(total - 7) < 1e-12) return 0;
        return total > 7 ? 1 : 2;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        // Pointwise identity on every outcome, then E[M] + E[m] under dependent couplings.
        let pointwise = true;
        forEachDice(2, (d) => {
          if (Math.max(d[0], d[1]) + Math.min(d[0], d[1]) !== d[0] + d[1]) pointwise = false;
        });
        const couplings: Array<(x: number) => number> = [(x) => 7 - x, (x) => x, (x) => (x % 6) + 1];
        let allSeven = true;
        for (const f of couplings) {
          let s = 0;
          for (let x = 1; x <= 6; x++) {
            const y = f(x);
            s += Math.max(x, y) + Math.min(x, y);
          }
          if (Math.abs(s / 6 - 7) > 1e-12) allSeven = false;
        }
        return pointwise && allSeven ? 0 : 3;
      },
    },
  ],

  // ------------------------------------------------------------------ d3
  "m4-p12": [
    { method: "recursion", run: () => couponStages(6, 6) },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => simulateCoupon(r, 6, 6)) },
  ],
  "m4-p13": [
    {
      method: "enumeration",
      run: () => {
        // Card c: rank c % 13 (0 = ace), suit floor(c / 13) (0 = hearts).
        let total = 0;
        let count = 0;
        forEachSubset(52, 5, (s) => {
          let pay = 0;
          for (const c of s) {
            if (c % 13 === 0) pay += 10;
            if (c < 13) pay += 1;
          }
          total += pay;
          count++;
        });
        if (count !== choose(52, 5)) throw new Error("subset count mismatch");
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          const hand: number[] = [];
          while (hand.length < 5) {
            const c = randInt(r, 0, 51);
            if (!hand.includes(c)) hand.push(c);
          }
          let pay = 0;
          for (const c of hand) {
            if (c % 13 === 0) pay += 10;
            if (c < 13) pay += 1;
          }
          return pay;
        }),
    },
  ],
  "m4-p14": [
    {
      method: "enumeration",
      run: () => {
        // At any position the pair (card from deck A, card from deck B) is uniform on 52 x 52.
        let match = 0;
        for (let a = 0; a < 52; a++) for (let b = 0; b < 52; b++) if (a % 13 === b % 13) match++;
        return 52 * (match / (52 * 52));
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = identity(52);
        return simulate(rng, 300_000, (r) => {
          const a = shuffle(base, r);
          const b = shuffle(base, r);
          let n = 0;
          for (let i = 0; i < 52; i++) if (a[i] % 13 === b[i] % 13) n++;
          return n;
        });
      },
    },
  ],
  "m4-p15": [
    {
      method: "enumeration",
      run: () => {
        const p = 0.3;
        let total = 0;
        forEachMask(12, (m) => {
          const h = popcount(m);
          const w = Math.pow(p, h) * Math.pow(1 - p, 12 - h);
          let runs = 1;
          for (let i = 0; i + 1 < 12; i++) if (((m >> i) & 1) !== ((m >> (i + 1)) & 1)) runs++;
          total += w * runs;
        });
        return total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          let prev = r() < 0.3;
          let runs = 1;
          for (let i = 1; i < 12; i++) {
            const cur = r() < 0.3;
            if (cur !== prev) runs++;
            prev = cur;
          }
          return runs;
        }),
    },
  ],
  "m4-p16": [
    { method: "recursion", run: () => couponStages(12, 8) },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => simulateCoupon(r, 12, 8)) },
  ],
  "m4-p17": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        forEachDice(3, (d) => {
          total += Math.max(d[0], d[1], d[2]);
        });
        return total / 216;
      },
    },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => Math.max(die(r), die(r), die(r))) },
  ],
  "m4-p18": [
    // Beta(3, 5) mean.
    { method: "formula", run: () => 3 / (7 + 1) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          const u = [r(), r(), r(), r(), r(), r(), r()].sort((a, b) => a - b);
          return u[2];
        }),
    },
  ],
  "m4-p19": [
    // E[max] - E[min] via Beta(5, 1) and Beta(1, 5) means.
    { method: "formula", run: () => 5 / 6 - 1 / 6 },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          let lo = Infinity;
          let hi = -Infinity;
          for (let i = 0; i < 5; i++) {
            const u = r();
            if (u < lo) lo = u;
            if (u > hi) hi = u;
          }
          return hi - lo;
        }),
    },
  ],
  "m4-p20": [
    {
      method: "enumeration",
      run: () => {
        // Three equally likely coins; for a fair coin enumerate the 16 flip patterns.
        let total = 0;
        for (let coin = 0; coin < 3; coin++) {
          if (coin < 2) {
            forEachMask(4, (m) => {
              total += (1 / 3) * (1 / 16) * popcount(m);
            });
          } else {
            total += (1 / 3) * 4;
          }
        }
        return total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const twoHeaded = randInt(r, 0, 2) === 2;
          let h = 0;
          for (let i = 0; i < 4; i++) if (twoHeaded || r() < 0.5) h++;
          return h;
        }),
    },
  ],
  "m4-p21": [
    {
      method: "exhaustive-search",
      run: () => {
        // Every joint law with the given marginals: one free parameter t in [0.1, 0.5].
        const sums: number[] = [];
        const prods: number[] = [];
        for (let i = 0; i <= 400; i++) {
          const t = 0.1 + (0.4 * i) / 400;
          const joint: Array<[number, number, number]> = [
            [1, 2, t],
            [1, -1, 0.6 - t],
            [-1, 2, 0.5 - t],
            [-1, -1, t - 0.1],
          ];
          if (joint.some(([, , q]) => q < -1e-12)) continue;
          let s = 0;
          let pr = 0;
          for (const [x, y, q] of joint) {
            s += (x + y) * q;
            pr += x * y * q;
          }
          sums.push(s);
          prods.push(pr);
        }
        const allSame = sums.every((s) => Math.abs(s - 0.7) < 1e-9);
        const prodVaries = Math.max(...prods) - Math.min(...prods) > 1;
        return allSame && prodVaries ? 0 : 2;
      },
    },
    {
      method: "formula",
      run: () => {
        const ex = 0.6 * 1 + 0.4 * -1;
        const ey = 0.5 * 2 + 0.5 * -1;
        // Comonotone (t = 0.5) and countermonotone (t = 0.1) couplings, from their joint pmfs.
        const como = (1 + 2) * 0.5 + (1 - 1) * 0.1 + (-1 + 2) * 0 + (-1 - 1) * 0.4;
        const counter = (1 + 2) * 0.1 + (1 - 1) * 0.5 + (-1 + 2) * 0.4 + (-1 - 1) * 0;
        const ok = Math.abs(ex + ey - 0.7) < 1e-12 && Math.abs(como - 0.7) < 1e-12 && Math.abs(counter - 0.7) < 1e-12;
        return ok ? 0 : 2;
      },
    },
  ],

  // ------------------------------------------------------------------ d4
  "m4-p22": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachPermutation(8, (p) => {
          let best = -1;
          for (const v of p) {
            if (v > best) {
              best = v;
              total++;
            }
          }
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = identity(8);
        return simulate(rng, 300_000, (r) => {
          const p = shuffle(base, r);
          let best = -1;
          let n = 0;
          for (const v of p) {
            if (v > best) {
              best = v;
              n++;
            }
          }
          return n;
        });
      },
    },
  ],
  "m4-p23": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachSubset(10, 5, (s) => {
          const trader = new Array<boolean>(10).fill(false);
          for (const i of s) trader[i] = true;
          for (let i = 0; i < 10; i++) if (trader[i] !== trader[(i + 1) % 10]) total++;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
        return simulate(rng, 300_000, (r) => {
          const seat = shuffle(base, r);
          let n = 0;
          for (let i = 0; i < 10; i++) if (seat[i] !== seat[(i + 1) % 10]) n++;
          return n;
        });
      },
    },
  ],
  "m4-p24": [
    {
      method: "enumeration",
      run: () => {
        // Seven rolls always contain a repeat, so the stopping time is a function of the 7-tuple.
        let total = 0;
        let count = 0;
        forEachDice(7, (d) => {
          const seen = new Set<number>();
          let t = 0;
          for (let i = 0; i < 7; i++) {
            if (seen.has(d[i])) {
              t = i + 1;
              break;
            }
            seen.add(d[i]);
          }
          if (t === 0) throw new Error("no repeat in seven rolls");
          total += t;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "formula",
      run: () => {
        // pmf route: P(T = t) = P(first t-1 distinct) * (t-1)/6.
        let e = 0;
        for (let t = 2; t <= 7; t++) {
          let distinct = 1;
          for (let i = 0; i < t - 1; i++) distinct *= (6 - i) / 6;
          e += t * distinct * ((t - 1) / 6);
        }
        return e;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const seen = new Set<number>();
          let n = 0;
          for (;;) {
            n++;
            const f = die(r);
            if (seen.has(f)) return n;
            seen.add(f);
          }
        }),
    },
  ],
  "m4-p25": [
    {
      method: "recursion",
      run: () => {
        const p = [1 / 2, 1 / 3, 1 / 6];
        const v = expectedRewardByIteration(8, (s) =>
          s === 7 ? [] : p.map((q, i) => [s | (1 << i), q, 1] as [number, number, number]),
        );
        return v[0];
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 500_000, (r) => {
          let have = 0;
          let coins = 0;
          while (have !== 7) {
            coins++;
            const u = r();
            const type = u < 1 / 2 ? 0 : u < 1 / 2 + 1 / 3 ? 1 : 2;
            have |= 1 << type;
          }
          return coins;
        }),
    },
  ],
  "m4-p26": [
    {
      method: "enumeration",
      run: () => {
        // The 56 equally likely position sets of the three internal résumés.
        let total = 0;
        let count = 0;
        forEachSubset(8, 3, (s) => {
          total += s[0] + 1;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = [1, 1, 1, 0, 0, 0, 0, 0];
        return simulate(rng, 300_000, (r) => shuffle(base, r).indexOf(1) + 1);
      },
    },
  ],
  "m4-p27": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        forEachDice(3, (d) => {
          total += Math.max(d[0], d[1], d[2]) - Math.min(d[0], d[1], d[2]);
        });
        return total / 216;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const a = die(r);
          const b = die(r);
          const c = die(r);
          return Math.max(a, b, c) - Math.min(a, b, c);
        }),
    },
  ],

  // ------------------------------------------------------------------ d5
  "m4-p28": [
    // Max of five independent uniforms: Beta(5, 1) mean.
    { method: "formula", run: () => 5 / (5 + 1) },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => tubeClearingTime(r, 5)) },
  ],
  "m4-p29": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachPermutation(7, (p) => {
          const seen = new Array<boolean>(7).fill(false);
          for (let i = 0; i < 7; i++) {
            if (seen[i]) continue;
            total++;
            let j = i;
            while (!seen[j]) {
              seen[j] = true;
              j = p[j];
            }
          }
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = identity(7);
        return simulate(rng, 300_000, (r) => {
          const p = shuffle(base, r);
          const seen = new Array<boolean>(7).fill(false);
          let loops = 0;
          for (let i = 0; i < 7; i++) {
            if (seen[i]) continue;
            loops++;
            let j = i;
            while (!seen[j]) {
              seen[j] = true;
              j = p[j];
            }
          }
          return loops;
        });
      },
    },
  ],
  "m4-p30": [
    {
      method: "recursion",
      run: () => {
        // E_m = 1 + sum_k q_k E_{m-k}, with q_k = C(m,k) D(m-k) / m!; solved numerically, no induction used.
        const E: number[] = [0];
        for (let m = 1; m <= 6; m++) {
          const fm = factorial(m);
          const q0 = derangements(m) / fm;
          let num = 1;
          for (let k = 1; k <= m; k++) num += ((choose(m, k) * derangements(m - k)) / fm) * E[m - k];
          E[m] = num / (1 - q0);
        }
        return E[6];
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const bases = Array.from({ length: 7 }, (_, m) => identity(m));
        return simulate(rng, 1_000_000, (r) => {
          let m = 6;
          let rounds = 0;
          while (m > 0) {
            rounds++;
            const p = shuffle(bases[m], r);
            let fixed = 0;
            for (let i = 0; i < m; i++) if (p[i] === i) fixed++;
            m -= fixed;
          }
          return rounds;
        });
      },
    },
  ],

  // ------------------------------------------------------------------ lesson checks
  "m4-lc1": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        forEachMask(10, (m) => {
          const h = popcount(m);
          total += Math.pow(0.3, h) * Math.pow(0.7, 10 - h) * h;
        });
        return total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          let h = 0;
          for (let i = 0; i < 10; i++) if (r() < 0.3) h++;
          return h;
        }),
    },
  ],
  "m4-lc2": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachPermutation(8, (p) => {
          for (let i = 0; i < 8; i++) if (p[i] === i) total++;
          count++;
        });
        return total / count;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const base = identity(8);
        return simulate(rng, 1_000_000, (r) => {
          const p = shuffle(base, r);
          let n = 0;
          for (let i = 0; i < 8; i++) if (p[i] === i) n++;
          return n;
        });
      },
    },
  ],
  "m4-lc3": [
    // Recover the pmf from the tails and take the direct weighted average.
    { method: "formula", run: () => 1 * (1 - 3 / 5) + 2 * (3 / 5 - 1 / 5) + 3 * (1 / 5) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const u = r();
          return u < 2 / 5 ? 1 : u < 4 / 5 ? 2 : 3;
        }),
    },
  ],
  "m4-lc4": [
    { method: "formula", run: () => 1 / (3 + 1) },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => Math.min(r(), r(), r())) },
  ],
};
