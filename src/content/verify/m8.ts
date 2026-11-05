import type { VerifySpec } from "../types";
import { choose, deck, die, forEachDice, forEachMask, simulate, simulateProb, solveLinear } from "./helpers";

/**
 * Independent checks for module 8 (market-making and estimation). Conditional fair values
 * are enumerated over the full sample space and re-estimated by rejection sampling with the
 * runner's rng; quoting problems are re-derived from the probability tree and simulated
 * against the described counterparty; option prices are computed both by backward
 * replication (solving for shares and cash at every node) and by risk-neutral expectation.
 */

/**
 * Price a European claim on a recombining binomial tree by backward replication. At each
 * node solve for (shares, cash) matching the two successor values; the node value is the
 * cost of that portfolio. `growth` is the gross one-period return on cash.
 */
function priceByReplication(
  S0: number,
  u: number,
  d: number,
  growth: number,
  steps: number,
  payoff: (s: number) => number,
): number {
  let values: number[] = [];
  for (let k = 0; k <= steps; k++) values.push(payoff(S0 * Math.pow(u, steps - k) * Math.pow(d, k)));
  for (let n = steps - 1; n >= 0; n--) {
    const next: number[] = [];
    for (let k = 0; k <= n; k++) {
      const s = S0 * Math.pow(u, n - k) * Math.pow(d, k);
      // shares a, cash b: a*s*u + b*growth = V_up, a*s*d + b*growth = V_down
      const [a, b] = solveLinear(
        [
          [s * u, growth],
          [s * d, growth],
        ],
        [values[k], values[k + 1]],
      );
      next.push(a * s + b);
    }
    values = next;
  }
  return values[0];
}

/** Risk-neutral expectation on the same tree, discounted at the cash growth rate. */
function priceRiskNeutral(
  S0: number,
  u: number,
  d: number,
  growth: number,
  steps: number,
  payoff: (s: number) => number,
): number {
  const p = (growth - d) / (u - d);
  let sum = 0;
  for (let k = 0; k <= steps; k++) {
    sum += choose(steps, k) * Math.pow(p, steps - k) * Math.pow(1 - p, k) * payoff(S0 * Math.pow(u, steps - k) * Math.pow(d, k));
  }
  return sum / Math.pow(growth, steps);
}

/** Index of the power of ten nearest to `total` in plain distance, among the listed exponents. */
function nearestPowerIndex(total: number, exponents: number[]): number {
  let best = -1;
  let bestDist = Infinity;
  exponents.forEach((e, i) => {
    const dist = Math.abs(total - Math.pow(10, e));
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

/**
 * Two-point terminal model that satisfies a parity problem's premises: S_T takes the two
 * values F - a and F + a with probability 1/2 each, where F is the forward and `a` is tuned
 * so that the quoted option is priced correctly. Returns the discounted expectation of the
 * other option's payoff, computed directly from the two states.
 */
function parityByTwoPointModel(S: number, K: number, discount: number, quoted: "call" | "put", quotedPrice: number): number {
  const F = S / discount;
  // Quoted option pays in exactly one state when a > |F - K|; solve 0.5 * discount * (payoff) = quotedPrice.
  const a = quoted === "put" ? quotedPrice / (0.5 * discount) - (K - F) : quotedPrice / (0.5 * discount) - (F - K);
  const states = [F - a, F + a];
  const call = states.reduce((acc, s) => acc + 0.5 * Math.max(s - K, 0), 0) * discount;
  const put = states.reduce((acc, s) => acc + 0.5 * Math.max(K - s, 0), 0) * discount;
  const check = quoted === "put" ? put : call;
  if (Math.abs(check - quotedPrice) > 1e-9) throw new Error("two-point model does not reproduce the quoted price");
  return quoted === "put" ? call : put;
}

export const spec: VerifySpec = {
  // -------------------------------------------------------------- difficulty 1
  "m8-p01": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        let n = 0;
        forEachDice(2, (d) => {
          sum += 5 + d[0] + d[1];
          n++;
        });
        return sum / n;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          // Roll three dice; keep only rolls where the pre-chosen die (die 0) shows 5.
          for (;;) {
            const a = die(r);
            const b = die(r);
            const c = die(r);
            if (a === 5) return a + b + c;
          }
        }),
    },
  ],
  "m8-p02": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        let n = 0;
        forEachMask(6, (m) => {
          let heads = 3;
          for (let i = 0; i < 6; i++) if (m & (1 << i)) heads++;
          sum += heads;
          n++;
        });
        return sum / n;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          // Flip ten coins; keep only sequences starting H, T, H, H.
          for (;;) {
            const flips: boolean[] = [];
            for (let i = 0; i < 10; i++) flips.push(r() < 0.5);
            if (flips[0] && !flips[1] && flips[2] && flips[3]) return flips.filter(Boolean).length;
          }
        }),
    },
  ],
  "m8-p03": [{ method: "formula", run: () => Math.max(112 - 105, 0) + Math.max(120 - 112, 0) }],
  "m8-p04": [
    { method: "formula", run: () => 100 * 0.35 },
    { method: "simulation", run: (rng) => simulate(rng, 1_000_000, (r) => (r() < 0.35 ? 100 : 0)) },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m8-p05": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        forEachDice(1, (d) => {
          sum += d[0] * d[0];
        });
        return sum / 6;
      },
    },
    { method: "formula", run: () => 35 / 12 + 3.5 * 3.5 },
  ],
  "m8-p06": [
    {
      method: "enumeration",
      run: () => {
        // All ordered triples of distinct cards whose first card is a 9.
        const cards = deck();
        let sum = 0;
        let n = 0;
        for (let i = 0; i < 52; i++) {
          if (cards[i].rank !== 9) continue;
          for (let j = 0; j < 52; j++) {
            if (j === i) continue;
            for (let k = 0; k < 52; k++) {
              if (k === i || k === j) continue;
              sum += cards[i].rank + cards[j].rank + cards[k].rank;
              n++;
            }
          }
        }
        return sum / n;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const cards = deck();
        return simulate(rng, 300_000, (r) => {
          for (;;) {
            const i = Math.floor(r() * 52);
            if (cards[i].rank !== 9) continue;
            let j = Math.floor(r() * 52);
            while (j === i) j = Math.floor(r() * 52);
            let k = Math.floor(r() * 52);
            while (k === i || k === j) k = Math.floor(r() * 52);
            return cards[i].rank + cards[j].rank + cards[k].rank;
          }
        });
      },
    },
  ],
  "m8-p07": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        forEachDice(2, (d) => {
          sum += Math.max(d[0], d[1]);
        });
        return sum / 36;
      },
    },
    {
      method: "formula",
      run: () => {
        let s = 0;
        for (let k = 1; k <= 6; k++) s += 1 - Math.pow((k - 1) / 6, 2);
        return s;
      },
    },
  ],
  "m8-p08": [
    { method: "formula", run: () => 0.3 * (56 - 52) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 2_000_000, (r) => {
          const u = r();
          const value = u < 0.2 ? 45 : u < 0.7 ? 50 : 56;
          return value > 52 ? value - 52 : 0;
        }),
    },
  ],
  "m8-p09": [
    { method: "formula", run: () => 5.5 - 50 + 48 },
    { method: "enumeration", run: () => parityByTwoPointModel(50, 48, 1, "call", 5.5) },
  ],
  "m8-p10": [
    { method: "formula", run: () => 4000 * (6.5 * 60) * 252 },
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        for (let day = 0; day < 252; day++) for (let minute = 0; minute < 390; minute++) total += 4000;
        return total;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m8-p11": [
    {
      method: "enumeration",
      run: () => {
        // Probability tree over (value, customer type, direction).
        let ev = 0;
        for (const value of [110, 90]) {
          const pv = 0.5;
          // informed: trades on the side that profits them
          const informedProfit = value === 110 ? 104 - value : value - 96;
          ev += pv * 0.2 * informedProfit;
          // uninformed: buy or sell with probability 1/2
          ev += pv * 0.8 * 0.5 * (104 - value);
          ev += pv * 0.8 * 0.5 * (value - 96);
        }
        return ev;
      },
    },
    { method: "formula", run: () => 4 - 0.2 * 10 },
  ],
  "m8-p12": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        forEachDice(2, (d) => {
          const seen = d[0];
          const total = d[0] + d[1];
          const fair = seen + 3.5;
          if (fair > 7.5) sum += total - 7.5;
          else if (fair < 6.5) sum += 6.5 - total;
        });
        return sum / 36;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 2_000_000, (r) => {
          const seen = die(r);
          const other = die(r);
          const fair = seen + 3.5;
          if (fair > 7.5) return seen + other - 7.5;
          if (fair < 6.5) return 6.5 - (seen + other);
          return 0;
        }),
    },
  ],
  "m8-p13": [
    { method: "formula", run: () => 0.6 * (0.5 * 200 + 0.5 * 40 - 5) + 0.4 * 10 },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          if (r() >= 0.6) return 10;
          const payout = r() < 0.5 ? 200 : 40;
          return payout - 5;
        }),
    },
  ],
  "m8-p14": [
    { method: "formula", run: () => 6 + 100 - 100 * Math.exp(-0.05) },
    { method: "enumeration", run: () => parityByTwoPointModel(100, 100, Math.exp(-0.05), "put", 6) },
  ],
  "m8-p15": [
    { method: "dp", run: () => priceByReplication(100, 1.25, 0.8, 1, 1, (s) => Math.max(s - 100, 0)) },
    { method: "formula", run: () => priceRiskNeutral(100, 1.25, 0.8, 1, 1, (s) => Math.max(s - 100, 0)) },
    {
      method: "simulation",
      run: (rng) => {
        const p = (100 - 80) / (125 - 80);
        return simulate(rng, 1_000_000, (r) => (r() < p ? 25 : 0));
      },
    },
  ],
  "m8-p16": [
    { method: "formula", run: () => (0.2 * 0.9) / (0.2 * 0.9 + 0.8 * 0.5) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 2_000_000, (r) => {
          for (;;) {
            const informed = r() < 0.2;
            const trades = r() < (informed ? 0.9 : 0.5);
            if (trades) return informed;
          }
        }),
    },
  ],
  "m8-p17": [
    { method: "formula", run: () => (500 * (10 - 0)) / (75 - 50) },
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 0; n <= 500; n++) {
          const up = 75 * n - 500 * Math.max(75 - 65, 0);
          const down = 50 * n - 500 * Math.max(50 - 65, 0);
          if (up === down) return n;
        }
        return -1;
      },
    },
  ],
  "m8-p18": [
    {
      method: "formula",
      run: () => {
        const total = 1.2e9 * 80 * 7 * 365;
        return [12, 13, 14, 15].indexOf(Math.round(Math.log10(total)));
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        let total = 0;
        for (let day = 0; day < 7 * 365; day++) total += 1.2e9 * 80;
        return nearestPowerIndex(total, [12, 13, 14, 15]);
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m8-p19": [
    { method: "formula", run: () => (4 * 0.4) / (3 - 0.4) },
    {
      method: "exhaustive-search",
      run: () => {
        // Exact expected profit per arrival as a function of h; bisect for its unique root.
        const profit = (h: number) => {
          let loss = 0;
          for (let x = 1; x <= 6; x++) {
            const edge = Math.abs(x - 3.5) - h;
            if (edge > 0) loss += edge / 6;
          }
          return 0.6 * h - 0.4 * loss;
        };
        let lo = 0;
        let hi = 3;
        if (!(profit(lo) < 0 && profit(hi) > 0)) throw new Error("bracket failed");
        for (let it = 0; it < 200; it++) {
          const mid = (lo + hi) / 2;
          if (profit(mid) < 0) lo = mid;
          else hi = mid;
        }
        return (lo + hi) / 2;
      },
    },
  ],
  "m8-p20": [
    {
      method: "enumeration",
      run: () => {
        // Joint tree over coin, type, signal/direction; compute P(buy and heads) / P(buy).
        let buyAndHeads = 0;
        let buy = 0;
        for (const heads of [true, false]) {
          const pCoin = 0.5;
          // informed: signal matches with 0.8; buys iff signal says heads
          const pBuyInformed = heads ? 0.8 : 0.2;
          const pBuyUninformed = 0.5;
          const pBuy = 0.4 * pBuyInformed + 0.6 * pBuyUninformed;
          buy += pCoin * pBuy;
          if (heads) buyAndHeads += pCoin * pBuy;
        }
        return (100 * buyAndHeads) / buy;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 1_000_000, (r) => {
          for (;;) {
            const heads = r() < 0.5;
            const informed = r() < 0.4;
            let buys: boolean;
            if (informed) {
              const signalHeads = r() < 0.8 ? heads : !heads;
              buys = signalHeads;
            } else buys = r() < 0.5;
            if (buys) return heads ? 100 : 0;
          }
        }),
    },
  ],
  "m8-p21": [
    {
      method: "formula",
      run: () => {
        const diff = 100 - 100 * Math.exp(-0.04);
        return diff > 0 ? 0 : diff < 0 ? 1 : 2;
      },
    },
    {
      method: "dp",
      run: () => {
        // Price both options on 60-step CRR trees at several volatilities; the sign must not depend on it.
        const steps = 60;
        const dt = 1 / steps;
        const growth = Math.exp(0.04 * dt);
        let verdict = -1;
        for (const sigma of [0.1, 0.3, 0.6]) {
          const u = Math.exp(sigma * Math.sqrt(dt));
          const d = 1 / u;
          const call = priceByReplication(100, u, d, growth, steps, (s) => Math.max(s - 100, 0));
          const put = priceByReplication(100, u, d, growth, steps, (s) => Math.max(100 - s, 0));
          const v = call > put ? 0 : call < put ? 1 : 2;
          if (verdict === -1) verdict = v;
          else if (verdict !== v) return 3; // would mean "depends on volatility"
        }
        return verdict;
      },
    },
  ],
  "m8-p22": [
    {
      method: "formula",
      run: () => {
        const total = 1500 * 25000 * ((6.5 * 60) / 2) * 252;
        return [11, 12, 13, 14].indexOf(Math.round(Math.log10(total)));
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        let total = 0;
        for (let day = 0; day < 252; day++) for (let run = 0; run < 195; run++) total += 1500 * 25000;
        return nearestPowerIndex(total, [11, 12, 13, 14]);
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m8-p23": [
    { method: "formula", run: () => 5 / (2 * (1 - 0.1)) },
    {
      method: "exhaustive-search",
      run: () => {
        // Exact expected profit per arrival on a fine grid of half-spreads; return the argmax.
        const profit = (h: number) => 0.9 * (1 - h / 5) * h - 0.1 * (10 - h);
        let bestH = 0;
        let best = -Infinity;
        for (let k = 0; k <= 4500; k++) {
          const h = k / 900;
          const v = profit(h);
          if (v > best) {
            best = v;
            bestH = h;
          }
        }
        return bestH;
      },
    },
  ],
  "m8-p24": [
    { method: "dp", run: () => priceByReplication(100, 1.2, 0.8, 1.05, 2, (s) => Math.max(s - 100, 0)) },
    { method: "formula", run: () => priceRiskNeutral(100, 1.2, 0.8, 1.05, 2, (s) => Math.max(s - 100, 0)) },
    {
      method: "simulation",
      run: (rng) => {
        const p = (1.05 - 0.8) / (1.2 - 0.8);
        return simulate(rng, 1_000_000, (r) => {
          let s = 100;
          for (let t = 0; t < 2; t++) s *= r() < p ? 1.2 : 0.8;
          return Math.max(s - 100, 0) / (1.05 * 1.05);
        });
      },
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m8-lc1": [
    {
      method: "enumeration",
      run: () => {
        let sum = 0;
        forEachDice(1, (d) => {
          sum += 6 + d[0];
        });
        return sum / 6;
      },
    },
    { method: "formula", run: () => 6 + 3.5 },
  ],
  "m8-lc2": [
    { method: "formula", run: () => 0.25 * 4 },
    {
      method: "exhaustive-search",
      run: () => {
        // Grid over half-spreads; return the one where expected profit per trade is closest to zero.
        const profit = (h: number) => 0.75 * h - 0.25 * (4 - h);
        let bestH = 0;
        let best = Infinity;
        for (let k = 0; k <= 4000; k++) {
          const h = k / 1000;
          const v = Math.abs(profit(h));
          if (v < best) {
            best = v;
            bestH = h;
          }
        }
        return bestH;
      },
    },
  ],
  "m8-lc3": [
    { method: "formula", run: () => 7 + 40 - 45 },
    { method: "enumeration", run: () => parityByTwoPointModel(40, 45, 1, "put", 7) },
  ],
  "m8-lc4": [
    { method: "formula", run: () => 30 * 6 * 200 },
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        for (let day = 0; day < 200; day++) for (let hour = 0; hour < 6; hour++) total += 30;
        return total;
      },
    },
  ],
};
