import type { VerifySpec } from "../types";
import { deck, die, forEachDice, forEachMask, forEachPermutation, shuffle, simulate, simulateProb } from "./helpers";

/**
 * Independent checks for module 7 (betting, EV decisions and games). Wherever possible the
 * answer is recomputed by searching the whole strategy space (every keep-set, every cutoff,
 * every pure strategy of the opponent) rather than by re-deriving the solution's argument,
 * and then confirmed by a closed form or by simulating the optimal strategy.
 */

type Rng = () => number;

// ------------------------------------------------------------------ numeric helpers

/** Bisection on a function with a sign change on [lo, hi]. */
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  let flo = f(lo);
  const fhi = f(hi);
  if (flo === 0) return lo;
  if (fhi === 0) return hi;
  if (flo * fhi > 0) throw new Error("bisect: no sign change");
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (fm === 0) return mid;
    if (fm * flo > 0) {
      lo = mid;
      flo = fm;
    } else hi = mid;
    if (hi - lo < 1e-16) break;
  }
  return (lo + hi) / 2;
}

/** Scan a grid for the first sign change of f, then bisect inside it. */
function scanRoot(f: (x: number) => number, lo: number, hi: number, steps: number): number {
  let prev = f(lo);
  for (let i = 1; i <= steps; i++) {
    const x = lo + ((hi - lo) * i) / steps;
    const cur = f(x);
    if (prev === 0) return lo + ((hi - lo) * (i - 1)) / steps;
    if (prev * cur <= 0) return bisect(f, lo + ((hi - lo) * (i - 1)) / steps, x);
    prev = cur;
  }
  throw new Error("scanRoot: no sign change found");
}

/** Expected log growth per bet when staking fraction f on a bet paying b to 1 with win probability p. */
function growth(p: number, b: number, f: number): number {
  return p * Math.log(1 + b * f) + (1 - p) * Math.log(1 - f);
}

/**
 * Growth-maximising fraction found numerically: a coarse grid locates the maximum of g, then
 * bisection on the sign of the slope pins it down. Does not use the closed form p - q/b.
 */
function maxGrowthFraction(p: number, b: number): number {
  const steps = 10_000;
  let bestI = 0;
  let best = -Infinity;
  for (let i = 0; i < steps; i++) {
    const g = growth(p, b, i / steps);
    if (g > best) {
      best = g;
      bestI = i;
    }
  }
  const slope = (f: number) => (p * b) / (1 + b * f) - (1 - p) / (1 - f);
  const lo = Math.max(0, (bestI - 1) / steps);
  const hi = Math.min(0.999999, (bestI + 1) / steps);
  return bisect(slope, lo, hi);
}

/** E[log W_N] / N by enumerating every win-loss sequence of N bets (exact, 2^N terms). */
function logGrowthByEnumeration(p: number, b: number, f: number, N: number): number {
  let total = 0;
  forEachMask(N, (mask) => {
    let wins = 0;
    for (let i = 0; i < N; i++) if (mask & (1 << i)) wins++;
    const prob = Math.pow(p, wins) * Math.pow(1 - p, N - wins);
    const logW = wins * Math.log(1 + b * f) + (N - wins) * Math.log(1 - f);
    total += prob * logW;
  });
  return total / N;
}

// ------------------------------------------------------------------ take-away games

/** W/L table for the player to move; a position with no legal move is a loss. */
function winTable(moves: number[], n: number): boolean[] {
  const win = new Array<boolean>(n + 1).fill(false);
  for (let s = 0; s <= n; s++) {
    win[s] = moves.some((m) => m <= s && !win[s - m]);
  }
  return win;
}

/** Full game-tree walk without memoisation: does the player to move win from s? */
function treeWin(moves: number[], s: number): boolean {
  for (const m of moves) if (m <= s && !treeWin(moves, s - m)) return true;
  return false;
}

/** The unique winning first move from n, or -1 if none or several. */
function uniqueWinningMove(moves: number[], n: number, winsFrom: (s: number) => boolean): number {
  const winning = moves.filter((m) => m <= n && !winsFrom(n - m));
  return winning.length === 1 ? winning[0] : -1;
}

// ------------------------------------------------------------------ dice stopping games

const FACES = [1, 2, 3, 4, 5, 6];
const mean6 = (vals: number[]) => vals.reduce((a, b) => a + b, 0) / 6;

/** Value of "up to k rolls, stop any time, forced last roll" by backward induction. */
function rerollValue(k: number, payoff: (face: number) => number = (x) => x): number {
  let v = mean6(FACES.map(payoff));
  for (let i = 2; i <= k; i++) v = mean6(FACES.map((x) => Math.max(payoff(x), v)));
  return v;
}

/** Value of a keep-set rule for one optional reroll: keep faces in the mask, otherwise take the continuation. */
function keepSetValue(mask: number, continuation: number): number {
  return mean6(FACES.map((x) => (mask & (1 << (x - 1)) ? x : continuation)));
}

// ------------------------------------------------------------------ signalling (toy poker) game

/**
 * Ann's expected net result per hand. Cards 0 = Low, 1 = Mid, 2 = High. A[x] = probability
 * Ann bets holding x; B[y] = probability Ben calls holding y. All six deals equally likely.
 */
function signalPayoff(ante: number, bet: number, A: number[], B: number[]): number {
  let total = 0;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (x === y) continue;
      const showdown = x > y ? ante : -ante;
      const called = x > y ? ante + bet : -(ante + bet);
      const betEV = B[y] * called + (1 - B[y]) * ante;
      total += A[x] * betEV + (1 - A[x]) * showdown;
    }
  }
  return total / 6;
}

function pureStrategies(): number[][] {
  const out: number[][] = [];
  for (let m = 0; m < 8; m++) out.push([m & 1, (m >> 1) & 1, (m >> 2) & 1]);
  return out;
}

const PURE = pureStrategies();

/** Ann's guaranteed payoff with strategy A against a best-responding Ben. */
function annGuarantee(ante: number, bet: number, A: number[]): number {
  let mn = Infinity;
  for (const B of PURE) mn = Math.min(mn, signalPayoff(ante, bet, A, B));
  return mn;
}

/** The most Ann can extract against Ben's strategy B. */
function benExposure(ante: number, bet: number, B: number[]): number {
  let mx = -Infinity;
  for (const A of PURE) mx = Math.max(mx, signalPayoff(ante, bet, A, B));
  return mx;
}

// ------------------------------------------------------------------ secretary rules

/** Index hired by "skip k, then take the first record, else the last" on a quality permutation. */
function cutoffHire(perm: number[], k: number): number {
  const n = perm.length;
  let best = -1;
  for (let i = 0; i < k; i++) best = Math.max(best, perm[i]);
  for (let i = k; i < n; i++) {
    if (perm[i] > best) return perm[i];
    best = Math.max(best, perm[i]);
  }
  return perm[n - 1];
}

function cutoffSuccessByEnumeration(n: number, success: (hiredQuality: number) => boolean): number[] {
  const counts = new Array<number>(n).fill(0);
  let total = 0;
  forEachPermutation(n, (p) => {
    total++;
    for (let k = 0; k < n; k++) if (success(cutoffHire(p, k))) counts[k]++;
  });
  return counts.map((c) => c / total);
}

/** Closed form: probability the cutoff rule with k skips hires the best of n. */
function cutoffBestFormula(n: number, k: number): number {
  if (k === 0) return 1 / n;
  let s = 0;
  for (let j = k + 1; j <= n; j++) s += 1 / (j - 1);
  return (k / n) * s;
}

/** Closed form: probability the cutoff rule with k skips hires the second best of n. */
function cutoffSecondFormula(n: number, k: number): number {
  if (k === 0) return 1 / n;
  let s = 0;
  for (let j = k + 1; j <= n; j++) s += ((n - j) / (n - 1)) * (k / (j - 1));
  return s / n + k / (n * (n - 1));
}

function randomPermutation(n: number, rng: Rng): number[] {
  return shuffle(Array.from({ length: n }, (_, i) => i), rng);
}

// ------------------------------------------------------------------ spec

export const spec: VerifySpec = {
  // -------------------------------------------------------------- difficulty 1
  "m7-p01": [
    { method: "enumeration", run: () => mean6(FACES) },
    { method: "simulation", run: (rng) => simulate(rng, 300_000, (r) => die(r)) },
  ],
  "m7-p02": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let n = 0;
        forEachDice(2, (d) => {
          const s = d[0] + d[1];
          total += s === 7 || s === 11 ? 8 : -2;
          n++;
        });
        return total / n;
      },
    },
    { method: "formula", run: () => (8 / 36) * 8 - (28 / 36) * 2 },
  ],
  "m7-p03": [
    {
      method: "exhaustive-search",
      run: () => {
        // Second-price auction, value 70, ties split by a coin. Check that 70 is the unique weakly dominant bid.
        const value = 70;
        const pay = (b: number, r: number) => (b > r ? value - r : b === r ? 0.5 * (value - r) : 0);
        const dominant: number[] = [];
        for (let b = 0; b <= 140; b++) {
          let weaklyBetter = true;
          for (let r = 0; r <= 140 && weaklyBetter; r++) {
            for (let other = 0; other <= 140; other++) {
              if (pay(b, r) < pay(other, r) - 1e-12) {
                weaklyBetter = false;
                break;
              }
            }
          }
          if (weaklyBetter) dominant.push(b);
        }
        return dominant.length === 1 && dominant[0] === value ? 0 : -1;
      },
    },
    {
      method: "enumeration",
      run: () => {
        // Against a rival bidding uniformly on 0..140, the expected-profit-maximising bid must be 70.
        const value = 70;
        let bestBid = -1;
        let best = -Infinity;
        for (let b = 0; b <= 140; b++) {
          let total = 0;
          for (let r = 0; r <= 140; r++) total += b > r ? value - r : b === r ? 0.5 * (value - r) : 0;
          if (total > best + 1e-9) {
            best = total;
            bestBid = b;
          }
        }
        return bestBid === value ? 0 : -1;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m7-p04": [
    {
      method: "enumeration",
      run: () => {
        const cards = deck();
        let total = 0;
        for (const c of cards) total += Math.min(c.rank, 10);
        return total / cards.length;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 400_000, (r) => {
          const rank = 1 + Math.floor(r() * 13);
          return Math.min(rank, 10);
        }),
    },
  ],
  "m7-p05": [
    { method: "formula", run: () => 5 / (5 + 12) },
    { method: "exhaustive-search", run: () => scanRoot((p) => 12 * p - 5 * (1 - p), 0, 1, 1000) },
  ],
  "m7-p06": [
    { method: "dp", run: () => rerollValue(2) },
    {
      method: "exhaustive-search",
      run: () => {
        let best = -Infinity;
        forEachMask(6, (mask) => {
          best = Math.max(best, keepSetValue(mask, mean6(FACES)));
        });
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const x = die(r);
          return x >= 4 ? x : die(r);
        }),
    },
  ],
  "m7-p07": [
    { method: "formula", run: () => 0.4 - 0.6 / 2.5 },
    { method: "exhaustive-search", run: () => maxGrowthFraction(0.4, 2.5) },
  ],
  "m7-p08": [
    {
      method: "dp",
      run: () => {
        const win = winTable([2, 3], 12);
        return uniqueWinningMove([2, 3], 12, (s) => win[s]);
      },
    },
    { method: "exhaustive-search", run: () => uniqueWinningMove([2, 3], 12, (s) => treeWin([2, 3], s)) },
  ],
  "m7-p09": [
    {
      method: "exhaustive-search",
      run: () => {
        const fractions = [0.05, 0.1, 0.2, 0.4];
        const g = fractions.map((f) => growth(0.55, 1, f));
        let bestI = 0;
        for (let i = 1; i < g.length; i++) if (g[i] > g[bestI]) bestI = i;
        return bestI;
      },
    },
    {
      method: "formula",
      run: () => {
        const fStar = 0.55 - 0.45;
        const fractions = [0.05, 0.1, 0.2, 0.4];
        return fractions.findIndex((f) => Math.abs(f - fStar) < 1e-12);
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m7-p10": [
    { method: "dp", run: () => rerollValue(3) },
    {
      method: "exhaustive-search",
      run: () => {
        let best = -Infinity;
        const v1 = mean6(FACES);
        forEachMask(6, (second) => {
          const v2 = keepSetValue(second, v1);
          forEachMask(6, (first) => {
            best = Math.max(best, keepSetValue(first, v2));
          });
        });
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const a = die(r);
          if (a >= 5) return a;
          const b = die(r);
          if (b >= 4) return b;
          return die(r);
        }),
    },
  ],
  "m7-p11": [
    {
      method: "enumeration",
      run: () => {
        // Keep the first card when it is 6 or more; otherwise take the second. All 90 ordered pairs.
        let total = 0;
        let n = 0;
        for (let a = 1; a <= 10; a++) {
          for (let b = 1; b <= 10; b++) {
            if (a === b) continue;
            total += a >= 6 ? a : b;
            n++;
          }
        }
        return total / n;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        let best = -Infinity;
        forEachMask(10, (mask) => {
          let total = 0;
          for (let a = 1; a <= 10; a++) {
            for (let b = 1; b <= 10; b++) {
              if (a === b) continue;
              total += mask & (1 << (a - 1)) ? a : b;
            }
          }
          best = Math.max(best, total / 90);
        });
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          const a = 1 + Math.floor(r() * 10);
          if (a >= 6) return a;
          let b = 1 + Math.floor(r() * 9);
          if (b >= a) b++;
          return b;
        }),
    },
  ],
  "m7-p12": [
    {
      method: "exhaustive-search",
      run: () => Math.max(...cutoffSuccessByEnumeration(5, (q) => q === 4)),
    },
    {
      method: "formula",
      run: () => Math.max(...[0, 1, 2, 3, 4].map((k) => cutoffBestFormula(5, k))),
    },
    {
      method: "simulation",
      run: (rng) => simulateProb(rng, 1_000_000, (r) => cutoffHire(randomPermutation(5, r), 2) === 4),
    },
  ],
  "m7-p13": [
    { method: "formula", run: () => 1 / (2 * 2 + 1) },
    {
      method: "exhaustive-search",
      run: () => {
        // Ann bets High, checks Mid, bluffs Low with probability beta; Ben best-responds with any pure strategy.
        const ante = 2;
        const bet = 1;
        const steps = 1000;
        let bestI = 0;
        let best = -Infinity;
        for (let i = 0; i <= steps; i++) {
          const g = annGuarantee(ante, bet, [i / steps, 0, 1]);
          if (g > best) {
            best = g;
            bestI = i;
          }
        }
        // The maximin sits where Ben's two live responses (call or fold with Mid) give Ann the same payoff.
        const diff = (beta: number) => signalPayoff(ante, bet, [beta, 0, 1], [0, 1, 1]) - signalPayoff(ante, bet, [beta, 0, 1], [0, 0, 1]);
        return bisect(diff, Math.max(0, (bestI - 1) / steps), Math.min(1, (bestI + 1) / steps));
      },
    },
  ],
  "m7-p14": [
    {
      method: "exhaustive-search",
      run: () => {
        // Rival bids half her uniform [0,100] value, so her bid is uniform on [0,50].
        let bestBid = -1;
        let best = -Infinity;
        for (let i = 0; i <= 100_000; i++) {
          const b = i / 1000;
          const profit = (80 - b) * Math.min(1, b / 50);
          if (profit > best) {
            best = profit;
            bestBid = b;
          }
        }
        return bestBid;
      },
    },
    { method: "formula", run: () => 80 / 2 },
  ],
  "m7-p15": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let n = 0;
        forEachDice(2, (d) => {
          total += Math.min(d[0], d[1]);
          n++;
        });
        return total / n;
      },
    },
    { method: "simulation", run: (rng) => simulate(rng, 400_000, (r) => Math.min(die(r), die(r))) },
  ],
  "m7-p16": [
    {
      method: "enumeration",
      run: () => {
        let alice = 0;
        let bob = 0;
        let n = 0;
        forEachDice(3, (d) => {
          const s = d[0] + d[1];
          const t = 2 * d[2];
          if (s > t) alice++;
          else if (t > s) bob++;
          n++;
        });
        const pa = alice / n;
        const pb = bob / n;
        if (Math.abs(pa - pb) < 1e-12) return 2;
        return pa > pb ? 0 : 1;
      },
    },
    {
      method: "formula",
      run: () => {
        // Triangular pmf of the two-dice sum against the six equally likely Bob scores.
        const pS = (s: number) => (s >= 2 && s <= 12 ? (6 - Math.abs(s - 7)) / 36 : 0);
        let alice = 0;
        let bob = 0;
        for (let d = 1; d <= 6; d++) {
          for (let s = 2; s <= 12; s++) {
            if (s > 2 * d) alice += pS(s) / 6;
            else if (s < 2 * d) bob += pS(s) / 6;
          }
        }
        if (Math.abs(alice - bob) < 1e-12) return 2;
        return alice > bob ? 0 : 1;
      },
    },
  ],
  "m7-p17": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        for (let k = 1; k <= 200; k++) total += Math.pow(2, -k) * Math.min(Math.pow(2, k - 1), 500);
        return total;
      },
    },
    {
      method: "formula",
      run: () => {
        const cap = 500;
        const uncapped = Math.floor(Math.log2(cap)) + 1; // prizes 2^0 .. 2^(uncapped-1) are at most cap
        return uncapped / 2 + cap * Math.pow(2, -uncapped);
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 12_000_000, (r) => {
          let prize = 1;
          while (r() >= 0.5) {
            prize *= 2;
            if (prize >= 500) return 500;
          }
          return prize;
        }),
    },
  ],
  "m7-p18": [
    {
      method: "enumeration",
      run: () => {
        // Concrete prior: pairs (a, 2a) with a in {1,2,4,8,16,32}, each equally likely; a random envelope is opened.
        const pairs = [1, 2, 4, 8, 16, 32].map((a) => [a, 2 * a] as const);
        const w = 1 / (2 * pairs.length);
        let gain = 0;
        const byX = new Map<number, { larger: number; total: number }>();
        for (const [a, b] of pairs) {
          for (const [seen, other] of [
            [a, b],
            [b, a],
          ]) {
            gain += w * (other - seen);
            const e = byX.get(seen) ?? { larger: 0, total: 0 };
            e.total += w;
            if (other > seen) e.larger += w;
            byX.set(seen, e);
          }
        }
        const probs = [...byX.values()].map((e) => e.larger / e.total);
        const halfEverywhere = probs.every((p) => Math.abs(p - 0.5) < 1e-12);
        // Option 1 claims: average switching gain is zero and the fixed one-half step fails.
        return Math.abs(gain) < 1e-12 && !halfEverywhere ? 1 : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // Exchangeability: the two envelopes have identical marginal distributions, so E[other] - E[seen] = 0.
        const pairs = [1, 2, 4, 8, 16, 32].map((a) => [a, 2 * a] as const);
        let eSeen = 0;
        let eOther = 0;
        for (const [a, b] of pairs) {
          eSeen += (0.5 * a + 0.5 * b) / pairs.length;
          eOther += (0.5 * b + 0.5 * a) / pairs.length;
        }
        return Math.abs(eOther - eSeen) < 1e-12 ? 1 : -1;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m7-p19": [
    {
      method: "dp",
      run: () => {
        const win = winTable([1, 3, 4], 20);
        return uniqueWinningMove([1, 3, 4], 20, (s) => win[s]);
      },
    },
    { method: "exhaustive-search", run: () => uniqueWinningMove([1, 3, 4], 20, (s) => treeWin([1, 3, 4], s)) },
  ],
  "m7-p20": [
    {
      method: "dp",
      run: () => {
        // Value iteration on V = -c + E[max(x, V)].
        const c = 0.25;
        let v = 0;
        for (let it = 0; it < 10_000; it++) {
          const nv = -c + mean6(FACES.map((x) => Math.max(x, v)));
          if (Math.abs(nv - v) < 1e-15) {
            v = nv;
            break;
          }
          v = nv;
        }
        return v;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        // Every threshold rule "keep x >= t": V_t = (-c + sum_{x>=t} x/6) / (1 - (t-1)/6).
        const c = 0.25;
        let best = -Infinity;
        for (let t = 1; t <= 6; t++) {
          let kept = 0;
          for (let x = t; x <= 6; x++) kept += x / 6;
          const pReroll = (t - 1) / 6;
          best = Math.max(best, (-c + kept) / (1 - pReroll));
        }
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 300_000, (r) => {
          let net = 0;
          for (;;) {
            net -= 0.25;
            const x = die(r);
            if (x >= 5) return net + x;
          }
        }),
    },
  ],
  "m7-p21": [
    {
      method: "formula",
      run: () => {
        // Ann holding Low: bluff value is linear in c; solve bluff(c) = check.
        const ante = 2;
        const bet = 1;
        const check = -ante;
        const bluff = (c: number) => 0.5 * -(ante + bet) + 0.5 * (c * -(ante + bet) + (1 - c) * ante);
        return (bluff(0) - check) / (bluff(0) - bluff(1));
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        // Ben calls High, folds Low, calls Mid with probability c; Ann best-responds with any pure strategy.
        const ante = 2;
        const bet = 1;
        const steps = 1000;
        let bestI = 0;
        let best = Infinity;
        for (let i = 0; i <= steps; i++) {
          const e = benExposure(ante, bet, [0, i / steps, 1]);
          if (e < best) {
            best = e;
            bestI = i;
          }
        }
        const diff = (c: number) => signalPayoff(ante, bet, [1, 0, 1], [0, c, 1]) - signalPayoff(ante, bet, [0, 0, 1], [0, c, 1]);
        return bisect(diff, Math.max(0, (bestI - 1) / steps), Math.min(1, (bestI + 1) / steps));
      },
    },
  ],
  "m7-p22": [
    { method: "formula", run: () => growth(0.3, 3, 0.3 - 0.7 / 3) },
    { method: "exhaustive-search", run: () => growth(0.3, 3, maxGrowthFraction(0.3, 3)) },
    { method: "enumeration", run: () => logGrowthByEnumeration(0.3, 3, 1 / 15, 16) },
  ],
  "m7-p23": [
    {
      method: "dp",
      run: () => {
        // A 1 pays nothing and ends the game; other faces compare with the continuation value.
        let v = mean6(FACES.map((x) => (x === 1 ? 0 : x)));
        for (let stage = 2; stage <= 3; stage++) v = mean6(FACES.map((x) => (x === 1 ? 0 : Math.max(x, v))));
        return v;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        const v1 = mean6(FACES.map((x) => (x === 1 ? 0 : x)));
        const value = (mask: number, cont: number) => mean6(FACES.map((x) => (x === 1 ? 0 : mask & (1 << (x - 1)) ? x : cont)));
        let best = -Infinity;
        forEachMask(6, (second) => {
          const v2 = value(second, v1);
          forEachMask(6, (first) => {
            best = Math.max(best, value(first, v2));
          });
        });
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 400_000, (r) => {
          for (let roll = 1; roll <= 3; roll++) {
            const x = die(r);
            if (x === 1) return 0;
            if (roll === 3 || x >= 4) return x;
          }
          return 0;
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m7-p24": [
    {
      method: "dp",
      run: () => {
        // Rival wins ties, keeps y >= s, else rerolls. First mover wins vs s iff both rival rolls are below s.
        const winVs = (s: number) => Math.pow((s - 1) / 6, 2);
        const rerollValueP = mean6(FACES.map(winVs));
        return mean6(FACES.map((x) => Math.max(winVs(x), rerollValueP)));
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        // Rival's best response computed by enumeration for each announced score and first roll.
        const rivalWins = (s: number) => {
          let total = 0;
          for (let y = 1; y <= 6; y++) {
            const keep = y >= s ? 1 : 0;
            let reroll = 0;
            for (let z = 1; z <= 6; z++) if (z >= s) reroll += 1 / 6;
            total += Math.max(keep, reroll) / 6;
          }
          return total;
        };
        const winVs = FACES.map((s) => 1 - rivalWins(s));
        const rerollP = winVs.reduce((a, b) => a + b, 0) / 6;
        let best = -Infinity;
        forEachMask(6, (mask) => {
          best = Math.max(best, mean6(FACES.map((x) => (mask & (1 << (x - 1)) ? winVs[x - 1] : rerollP))));
        });
        return best;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let s = die(r);
          if (s <= 4) s = die(r);
          let y = die(r);
          if (y < s) y = die(r);
          return s > y;
        }),
    },
  ],
  "m7-p25": [
    {
      method: "exhaustive-search",
      run: () => {
        // Maximin over Ann's betting mixtures (grid), Ben pure; minimax over Ben's calling mixtures, Ann pure.
        const ante = 2;
        const bet = 1;
        const steps = 20;
        let maximin = -Infinity;
        let minimax = Infinity;
        for (let i = 0; i <= steps; i++) {
          for (let j = 0; j <= steps; j++) {
            for (let k = 0; k <= steps; k++) {
              const mix = [i / steps, j / steps, k / steps];
              maximin = Math.max(maximin, annGuarantee(ante, bet, mix));
              minimax = Math.min(minimax, benExposure(ante, bet, mix));
            }
          }
        }
        if (Math.abs(maximin - minimax) > 1e-9) throw new Error(`maximin ${maximin} != minimax ${minimax}`);
        return maximin;
      },
    },
    {
      method: "enumeration",
      run: () => signalPayoff(2, 1, [1 / 5, 0, 1], [0, 3 / 5, 1]),
    },
  ],
  "m7-p26": [
    {
      method: "exhaustive-search",
      run: () => Math.max(...cutoffSuccessByEnumeration(6, (q) => q >= 4)),
    },
    {
      method: "formula",
      run: () => Math.max(...[0, 1, 2, 3, 4, 5].map((k) => cutoffBestFormula(6, k) + cutoffSecondFormula(6, k))),
    },
    {
      method: "simulation",
      run: (rng) => simulateProb(rng, 1_000_000, (r) => cutoffHire(randomPermutation(6, r), 2) >= 4),
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m7-lc1": [
    { method: "enumeration", run: () => mean6(FACES.map((x) => x - 4)) },
    { method: "formula", run: () => 3.5 - 4 },
  ],
  "m7-lc2": [
    { method: "formula", run: () => 1 / (4 + 1) },
    { method: "exhaustive-search", run: () => scanRoot((p) => 4 * p - (1 - p), 0, 1, 1000) },
  ],
  "m7-lc3": [
    {
      method: "dp",
      run: () => {
        const win = winTable([1, 2], 7);
        const m = uniqueWinningMove([1, 2], 7, (s) => win[s]);
        return m === 1 ? 0 : m === 2 ? 1 : win[7] ? -1 : 2;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        const m = uniqueWinningMove([1, 2], 7, (s) => treeWin([1, 2], s));
        return m === 1 ? 0 : m === 2 ? 1 : treeWin([1, 2], 7) ? -1 : 2;
      },
    },
  ],
  "m7-lc4": [
    { method: "formula", run: () => 0.55 - 0.45 },
    { method: "exhaustive-search", run: () => maxGrowthFraction(0.55, 1) },
  ],
};
