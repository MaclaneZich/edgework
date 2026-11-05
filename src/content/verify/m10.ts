import type { VerifySpec } from "../types";
import {
  choose,
  coin,
  die,
  forEachDice,
  forEachMask,
  forEachPermutation,
  forEachSubset,
  poissonPmf,
  shuffle,
  simulate,
  simulateProb,
  solveLinear,
} from "./helpers";

/**
 * Independent checks for module 10 (mixed review). Each problem is recomputed by a route
 * that does not reuse the worked solution's reasoning: brute-force enumeration, Monte
 * Carlo simulation with the runner's seeded rng, linear systems for first-step problems,
 * and exhaustive search over policies or assignments for decisions and logic puzzles.
 */

function popcount(mask: number): number {
  let c = 0;
  while (mask) {
    mask &= mask - 1;
    c++;
  }
  return c;
}

/** One Poisson(lambda) sample by counting exponential arrivals before time lambda. */
function poissonSample(rng: () => number, lambda: number): number {
  let t = 0;
  let n = 0;
  for (;;) {
    t += -Math.log(1 - rng());
    if (t > lambda) return n;
    n++;
  }
}

/** Exact expected payout of the three-roll die game under a threshold policy (keep first roll if >= t1, second if >= t2). */
function rerollPolicyValue(t1: number, t2: number): number {
  let total = 0;
  forEachDice(3, (d) => {
    total += d[0] >= t1 ? d[0] : d[1] >= t2 ? d[1] : d[2];
  });
  return total / 216;
}

export const spec: VerifySpec = {
  // -------------------------------------------------------------- counting / complement
  "m10-p01": [
    {
      method: "enumeration",
      run: () => {
        // Weighted sum over all 2^8 absence patterns with at least one absence.
        let p = 0;
        forEachMask(8, (m) => {
          const k = popcount(m);
          if (k > 0) p += Math.pow(0.1, k) * Math.pow(0.9, 8 - k);
        });
        return p;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          for (let i = 0; i < 8; i++) if (r() < 0.1) return true;
          return false;
        }),
    },
  ],
  "m10-p02": [
    {
      method: "enumeration",
      run: () => {
        // Chips 0-6 green, 7-11 orange.
        let hit = 0;
        let total = 0;
        forEachSubset(12, 4, (s) => {
          total++;
          const greens = s.filter((x) => x < 7).length;
          if (greens >= 1 && greens <= 3) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const bag = Array.from({ length: 12 }, (_, i) => (i < 7 ? 0 : 1));
        return simulateProb(rng, 1_000_000, (r) => {
          const draw = shuffle(bag, r).slice(0, 4);
          const greens = draw.filter((x) => x === 0).length;
          return greens >= 1 && greens <= 3;
        });
      },
    },
  ],

  // -------------------------------------------------------------- conditional / Bayes
  "m10-p03": [
    {
      method: "formula",
      run: () => {
        // Odds form: prior odds times the likelihood ratio.
        const priorOdds = 0.02 / 0.98;
        const lr = 0.95 / 0.06;
        const postOdds = priorOdds * lr;
        return postOdds / (1 + postOdds);
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          // Rejection sampling: keep generating accounts until one is flagged.
          for (;;) {
            const fraud = r() < 0.02;
            const flagged = fraud ? r() < 0.95 : r() < 0.06;
            if (flagged) return fraud;
          }
        }),
    },
  ],
  "m10-p04": [
    {
      method: "enumeration",
      run: () => {
        let pStay = 0;
        let pSwitch = 0;
        for (let prize = 0; prize < 4; prize++) {
          for (let pick = 0; pick < 4; pick++) {
            const base = 1 / 16;
            const hostOptions = [0, 1, 2, 3].filter((b) => b !== pick && b !== prize);
            for (const opened of hostOptions) {
              const w = base / hostOptions.length;
              if (pick === prize) pStay += w;
              const targets = [0, 1, 2, 3].filter((b) => b !== pick && b !== opened);
              for (const t of targets) if (t === prize) pSwitch += w / targets.length;
            }
          }
        }
        const ok = Math.abs(pStay - 1 / 4) < 1e-12 && Math.abs(pSwitch - 3 / 8) < 1e-12 && pSwitch > pStay;
        return ok ? 1 : -1;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const trials = 1_000_000;
        let stayWins = 0;
        let switchWins = 0;
        for (let i = 0; i < trials; i++) {
          const prize = Math.floor(rng() * 4);
          const pick = Math.floor(rng() * 4);
          const hostOptions = [0, 1, 2, 3].filter((b) => b !== pick && b !== prize);
          const opened = hostOptions[Math.floor(rng() * hostOptions.length)];
          const targets = [0, 1, 2, 3].filter((b) => b !== pick && b !== opened);
          const target = targets[Math.floor(rng() * 2)];
          if (pick === prize) stayWins++;
          if (target === prize) switchWins++;
        }
        const pStay = stayWins / trials;
        const pSwitch = switchWins / trials;
        const se = Math.sqrt(0.25 / trials);
        const ok = Math.abs(pStay - 1 / 4) < 6 * se && Math.abs(pSwitch - 3 / 8) < 6 * se && pSwitch > pStay;
        return ok ? 1 : -1;
      },
    },
  ],
  "m10-p05": [
    {
      method: "formula",
      run: () => {
        // Posterior odds via likelihood ratio, then the posterior predictive.
        const lr = (Math.pow(0.6, 3) * 0.4) / Math.pow(0.5, 4);
        const postOdds = (1 / 3) * lr;
        const pSkilled = postOdds / (1 + postOdds);
        return pSkilled * 0.6 + (1 - pSkilled) * 0.5;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          // Rejection sampling: sample a signal type and five days; accept when days 1-4 read R R R W.
          for (;;) {
            const skilled = r() < 0.25;
            const acc = skilled ? 0.6 : 0.5;
            const d1 = r() < acc;
            const d2 = r() < acc;
            const d3 = r() < acc;
            const d4 = r() < acc;
            const d5 = r() < acc;
            if (d1 && d2 && d3 && !d4) return d5;
          }
        }),
    },
  ],

  // -------------------------------------------------------------- expectation
  "m10-p06": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        let total = 0;
        forEachPermutation(8, (p) => {
          total++;
          for (let i = 0; i < 7; i++) if (p[i + 1] === p[i] + 1) sum++;
        });
        return sum / total;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const tickets = [0, 1, 2, 3, 4, 5, 6, 7];
        return simulate(rng, 1_000_000, (r) => {
          const p = shuffle(tickets, r);
          let c = 0;
          for (let i = 0; i < 7; i++) if (p[i + 1] === p[i] + 1) c++;
          return c;
        });
      },
    },
  ],
  "m10-p07": [
    {
      method: "enumeration",
      run: () => {
        // Choose the 3 red positions among 12; the second red is the middle one (1-based).
        let sum = 0;
        let total = 0;
        forEachSubset(12, 3, (s) => {
          total++;
          sum += s[1] + 1;
        });
        return sum / total;
      },
    },
    {
      method: "formula",
      run: () => {
        // Tail sum: P(T > j) = P(at most one red among the first j cards).
        let e = 0;
        for (let j = 0; j <= 12; j++) e += (choose(9, j) + 3 * choose(9, j - 1)) / choose(12, j);
        return e;
      },
    },
  ],
  "m10-p08": [
    {
      method: "formula",
      run: () => {
        // Expected ticks to see 3 distinct of 6, via the explicit distribution of the number of
        // distinct codes after t ticks (occupancy counts), summing P(fewer than 3 distinct after t).
        let e = 0;
        for (let t = 0; t < 200; t++) {
          // P(exactly 1 distinct after t) and P(exactly 2 distinct after t), t >= 1.
          if (t === 0) {
            e += 1;
            continue;
          }
          const p1 = 6 / Math.pow(6, t);
          const p2 = (choose(6, 2) * (Math.pow(2, t) - 2)) / Math.pow(6, t);
          e += p1 + p2;
        }
        return e;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 400_000, (r) => {
          let seen = 0;
          let ticks = 0;
          while (popcount(seen) < 3) {
            seen |= 1 << Math.floor(r() * 6);
            ticks++;
          }
          return ticks;
        }),
    },
  ],

  // -------------------------------------------------------------- distributions
  "m10-p09": [
    {
      method: "enumeration",
      run: () => {
        let p = 0;
        forEachMask(7, (m) => {
          if (popcount(m) === 4) p += Math.pow(0.6, 4) * Math.pow(0.4, 3);
        });
        return p;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_500_000, (r) => {
          let fills = 0;
          for (let i = 0; i < 7; i++) if (r() < 0.6) fills++;
          return fills === 4;
        }),
    },
  ],
  "m10-p10": [
    { method: "formula", run: () => poissonPmf(2, 0) + poissonPmf(2, 1) },
    {
      method: "simulation",
      run: (rng) => simulateProb(rng, 1_000_000, (r) => poissonSample(r, 2) <= 1),
    },
  ],

  // -------------------------------------------------------------- first-step / recursion
  "m10-p11": [
    {
      method: "recursion",
      run: () => {
        // Unknowns E_0..E_6; E_s - (1/6) sum_{f} E_{s+f} [s+f<7] = 1.
        const A: number[][] = Array.from({ length: 7 }, () => new Array<number>(7).fill(0));
        const b = new Array<number>(7).fill(1);
        for (let s = 0; s < 7; s++) {
          A[s][s] += 1;
          for (let f = 1; f <= 6; f++) if (s + f < 7) A[s][s + f] -= 1 / 6;
        }
        return solveLinear(A, b)[0];
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 400_000, (r) => {
          let score = 0;
          let rolls = 0;
          while (score < 7) {
            score += die(r);
            rolls++;
          }
          return rolls;
        }),
    },
  ],
  "m10-p12": [
    {
      method: "recursion",
      run: () => {
        // Unknowns h_1..h_5; h_k - 0.6 h_{k+1} - 0.4 h_{k-1} = 0, with h_0 = 0, h_6 = 1.
        const A: number[][] = Array.from({ length: 5 }, () => new Array<number>(5).fill(0));
        const b = new Array<number>(5).fill(0);
        for (let k = 1; k <= 5; k++) {
          const i = k - 1;
          A[i][i] = 1;
          if (k + 1 <= 5) A[i][i + 1] -= 0.6;
          else b[i] += 0.6; // h_6 = 1
          if (k - 1 >= 1) A[i][i - 1] -= 0.4;
        }
        return solveLinear(A, b)[1];
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let chips = 2;
          while (chips > 0 && chips < 6) chips += r() < 0.6 ? 1 : -1;
          return chips === 6;
        }),
    },
  ],

  // -------------------------------------------------------------- games / EV decisions
  "m10-p13": [
    {
      method: "exhaustive-search",
      run: () => {
        // Best threshold policy (keep first roll if >= t1, second if >= t2); thresholds 1..7 cover every rule.
        let best = -Infinity;
        for (let t1 = 1; t1 <= 7; t1++) for (let t2 = 1; t2 <= 7; t2++) best = Math.max(best, rerollPolicyValue(t1, t2));
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 400_000, (r) => {
          const a = die(r);
          if (a >= 5) return a;
          const b = die(r);
          if (b >= 4) return b;
          return die(r);
        }),
    },
  ],
  "m10-p14": [
    { method: "formula", run: () => (0.4 * 2 - 0.6) / 2 },
    {
      method: "exhaustive-search",
      run: () => {
        // Grid search of the expected log growth over stake fractions.
        let bestF = 0;
        let bestG = -Infinity;
        for (let i = 0; i < 10_000; i++) {
          const f = i / 10_000;
          const g = 0.4 * Math.log(1 + 2 * f) + 0.6 * Math.log(1 - f);
          if (g > bestG) {
            bestG = g;
            bestF = f;
          }
        }
        return bestF;
      },
    },
  ],

  // -------------------------------------------------------------- logic
  "m10-p15": [
    {
      method: "exhaustive-search",
      run: () => {
        // Bit 0 = Priya truthful, bit 1 = Quinn, bit 2 = Raj. A statement must be true iff its speaker is truthful.
        const solutions: number[] = [];
        forEachMask(3, (m) => {
          const P = (m & 1) !== 0;
          const Q = (m & 2) !== 0;
          const R = (m & 4) !== 0;
          const sP = !Q && !R;
          const sQ = P;
          const sR = !P && !Q;
          if (sP === P && sQ === Q && sR === R) solutions.push(m);
        });
        if (solutions.length !== 1) throw new Error(`expected a unique assignment, found ${solutions.length}`);
        const m = solutions[0];
        const key = [(m & 1) !== 0, (m & 2) !== 0, (m & 4) !== 0].map((x) => (x ? "T" : "L")).join("");
        const optionByKey: Record<string, number> = { TLL: 0, LLL: 1, LLT: 2, LTL: 3 };
        if (!(key in optionByKey)) throw new Error(`assignment ${key} is not among the options`);
        return optionByKey[key];
      },
    },
  ],
  "m10-p16": [
    {
      method: "exhaustive-search",
      run: () => {
        const ANA = 0;
        const BEN = 1;
        const CY = 2;
        const DEV = 3;
        const EVA = 4;
        const BONDS = 0;
        const FX = 1;
        const METALS = 2;
        const EQUITIES = 3;
        const ENERGY = 4;
        const solutions: number[] = [];
        // deskOf[trader] = desk number 1..5 (permutation + 1); prodOf[trader] = product index.
        forEachPermutation(5, (deskPerm) => {
          const deskOf = deskPerm.map((d) => d + 1);
          if (deskOf[ANA] !== 3 || deskOf[BEN] !== 2) return;
          forEachPermutation(5, (prodOf) => {
            const deskOfProd = (p: number) => deskOf[prodOf.indexOf(p)];
            if (deskOfProd(BONDS) !== 1) return;
            if (deskOfProd(FX) !== 5) return;
            if (prodOf[CY] === BONDS || prodOf[CY] === METALS) return;
            if (deskOf[DEV] !== deskOfProd(EQUITIES) + 1) return;
            if (!(deskOf[DEV] > deskOf[CY])) return;
            if (Math.abs(deskOf[EVA] - deskOfProd(ENERGY)) !== 1) return;
            if (prodOf[EVA] === ENERGY) return;
            solutions.push(prodOf.indexOf(METALS));
          });
        });
        if (solutions.length !== 1) throw new Error(`expected a unique solution, found ${solutions.length}`);
        return solutions[0]; // trader index == option index (Ana, Ben, Cy, Dev, Eva)
      },
    },
  ],

  // -------------------------------------------------------------- simulation thinking
  "m10-p17": [
    {
      method: "enumeration",
      run: () => {
        let e = 0;
        for (let n = 1; n <= 6; n++) {
          forEachMask(n, (m) => {
            e += (popcount(m) / Math.pow(2, n)) * (1 / 6);
          });
        }
        return e;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 500_000, (r) => {
          const n = die(r);
          let heads = 0;
          for (let i = 0; i < n; i++) if (coin(r)) heads++;
          return heads;
        }),
    },
  ],
  "m10-p18": [
    { method: "formula", run: () => Math.round(Math.pow(12 / 0.05, 2)) },
    {
      method: "exhaustive-search",
      run: () => {
        // Smallest n whose standard error 12 / sqrt(n) meets the target.
        for (let n = 1; n <= 1_000_000; n++) if (12 / Math.sqrt(n) <= 0.05) return n;
        throw new Error("no n found");
      },
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m10-lc1": [{ method: "formula", run: () => 75 - 7 * 6 - 15 }],
  "m10-lc2": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        forEachDice(1, (d) => {
          sum += d[0] % 2 === 0 ? d[0] : 0;
        });
        return sum / 6;
      },
    },
    { method: "formula", run: () => (2 + 4 + 6) / 6 },
  ],
  "m10-lc3": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        forEachMask(10, (m) => {
          if (popcount(m) === 4) hit++;
        });
        return hit / 1024;
      },
    },
    { method: "formula", run: () => choose(10, 4) / Math.pow(2, 10) },
  ],
  "m10-lc4": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachDice(4, (d) => {
          total++;
          if (!d.includes(6)) hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => Math.pow(5 / 6, 4) },
  ],
};
