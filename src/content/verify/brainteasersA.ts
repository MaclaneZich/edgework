import type { VerifySpec } from "../types";
import {
  choose,
  die,
  forEachMask,
  forEachPermutation,
  forEachSubset,
  forEachTuple,
  randInt,
  shuffle,
  simulate,
  simulateProb,
  solveLinear,
} from "./helpers";

/**
 * Independent checks for the first half of the brainteaser bank (bt-001 .. bt-040).
 * Logic puzzles are settled by exhaustive search over assignments, strategies or decision
 * trees; probability puzzles by enumeration or a Monte Carlo run paired with a closed form.
 * For a choice answer every check recomputes the claim behind the option and returns the
 * index only when that claim holds (and returns -1 otherwise, which fails the check).
 */

// ------------------------------------------------------------------ shared solvers

/**
 * Event-driven simulation of robots on a rail: they move at unit speed, reverse on contact
 * and drop off at either end. Returns the time at which the rail becomes empty. Positions
 * are integers and collisions happen at half-integer times, so the arithmetic is exact.
 */
function railClearTime(positions: number[], dirs: number[], length: number): number {
  const order = positions.map((_, i) => i).sort((i, j) => positions[i] - positions[j]);
  let xs = order.map((i) => positions[i]);
  let vs = order.map((i) => dirs[i]);
  let t = 0;
  while (xs.length > 0) {
    let dt = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const exit = vs[i] > 0 ? length - xs[i] : xs[i];
      dt = Math.min(dt, exit);
      if (i + 1 < xs.length && vs[i] > 0 && vs[i + 1] < 0) dt = Math.min(dt, (xs[i + 1] - xs[i]) / 2);
    }
    xs = xs.map((x, i) => x + vs[i] * dt);
    t += dt;
    for (let i = 0; i + 1 < xs.length; i++) {
      if (Math.abs(xs[i] - xs[i + 1]) < 1e-9 && vs[i] > 0 && vs[i + 1] < 0) {
        vs[i] = -1;
        vs[i + 1] = 1;
        i++;
      }
    }
    const keep = xs.map((x) => x > 1e-9 && x < length - 1e-9);
    xs = xs.filter((_, i) => keep[i]);
    vs = vs.filter((_, i) => keep[i]);
  }
  return t;
}

/** Gambler's ruin by first-step equations: P(reach N before 0 | start k), win prob p. */
function ruinByLinearSystem(k: number, N: number, p: number): number {
  const n = N - 1; // transient states 1..N-1
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(0);
  for (let s = 1; s <= n; s++) {
    A[s - 1][s - 1] = 1;
    if (s + 1 <= n) A[s - 1][s] -= p;
    else b[s - 1] += p; // reaching N
    if (s - 1 >= 1) A[s - 1][s - 2] -= 1 - p;
  }
  return solveLinear(A, b)[k - 1];
}

/**
 * Minimal number of balance weighings that always identifies the odd coin, by exhaustive
 * minimax search over decision trees. Coins are grouped by what is still possible:
 * a = may only be heavy, b = may only be light, c = heavy or light, g = known genuine.
 * A weighing is any split of the classes between the two pans (padding the lighter pan
 * with genuine coins); coins within a class are interchangeable, so this is complete.
 */
function weighingsNeeded(a0: number, b0: number, c0: number, g0: number, needDirection: boolean, maxK = 6): number {
  const memo = new Map<string, boolean>();
  const solvable = (a: number, b: number, c: number, g: number, k: number): boolean => {
    const hyps = a + b + 2 * c;
    if (hyps === 0) return true; // this branch cannot occur
    if (needDirection ? hyps === 1 : a + b + c === 1) return true;
    if (k === 0) return false;
    const bound = Math.pow(3, k);
    if ((needDirection ? hyps : a + b + c) > bound) return false;
    const key = `${a},${b},${c},${g},${k}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const n = a + b + c + g;
    let ok = false;
    outer: for (let aL = 0; aL <= a; aL++)
      for (let aR = 0; aR + aL <= a; aR++)
        for (let bL = 0; bL <= b; bL++)
          for (let bR = 0; bR + bL <= b; bR++)
            for (let cL = 0; cL <= c; cL++)
              for (let cR = 0; cR + cL <= c; cR++) {
                const l = aL + bL + cL;
                const r = aR + bR + cR;
                if (l === 0 && r === 0) continue;
                if (Math.abs(l - r) > g) continue; // not enough genuine coins to balance the pans
                // left pan heavier
                const a1 = aL + cL, b1 = bR + cR;
                if (!solvable(a1, b1, 0, n - a1 - b1, k - 1)) continue;
                // right pan heavier
                const a2 = aR + cR, b2 = bL + cL;
                if (!solvable(a2, b2, 0, n - a2 - b2, k - 1)) continue;
                // balance
                const a3 = a - aL - aR, b3 = b - bL - bR, c3 = c - cL - cR;
                if (!solvable(a3, b3, c3, n - a3 - b3 - c3, k - 1)) continue;
                ok = true;
                break outer;
              }
    memo.set(key, ok);
    return ok;
  };
  for (let k = 0; k <= maxK; k++) if (solvable(a0, b0, c0, g0, k)) return k;
  return Infinity;
}

/**
 * Minimax number of pairwise comparisons needed to sort n distinct items, by exhaustive
 * search over comparison decision trees. States are sets of still-consistent orderings.
 */
function comparisonsToSort(n: number): number {
  const perms: number[][] = [];
  forEachPermutation(n, (p) => perms.push(p));
  const m = perms.length;
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
  // before[k] = mask of orderings in which item i comes before item j for pair k
  const before: bigint[] = pairs.map(([i, j]) => {
    let mask = BigInt(0);
    for (let t = 0; t < m; t++) {
      const p = perms[t];
      if (p.indexOf(i) < p.indexOf(j)) mask |= BigInt(1) << BigInt(t);
    }
    return mask;
  });
  const full = (BigInt(1) << BigInt(m)) - BigInt(1);
  const popcount = (x: bigint): number => {
    let c = 0;
    while (x > BigInt(0)) {
      if (x & BigInt(1)) c++;
      x >>= BigInt(1);
    }
    return c;
  };
  const memo = new Map<string, number>();
  const f = (S: bigint): number => {
    const size = popcount(S);
    if (size <= 1) return 0;
    const key = S.toString(16);
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const lower = Math.ceil(Math.log2(size));
    let best = Infinity;
    for (let k = 0; k < pairs.length; k++) {
      const S1 = S & before[k];
      const S2 = S & ~before[k] & full;
      if (S1 === BigInt(0) || S2 === BigInt(0)) continue;
      const d = 1 + Math.max(f(S1), f(S2));
      if (d < best) best = d;
      if (best === lower) break;
    }
    memo.set(key, best);
    return best;
  };
  return f(full);
}

/** Best success probability over all strategies in the guess-or-pass hat game for 3 players. */
function bestGuessOrPass3(): number {
  // hat assignments: 3 bits. Player p sees the other two hats: view index 0..3.
  const viewOf = (hats: number, p: number): number => {
    const others: number[] = [];
    for (let q = 0; q < 3; q++) if (q !== p) others.push((hats >> q) & 1);
    return others[0] * 2 + others[1];
  };
  // strategy index s in 0..80 encodes action for each of the 4 views in base 3 (0 red, 1 blue, 2 pass)
  const action = (s: number, view: number): number => Math.floor(s / Math.pow(3, view)) % 3;
  const act: number[][][] = [];
  for (let p = 0; p < 3; p++) {
    act.push([]);
    for (let s = 0; s < 81; s++) {
      const row: number[] = [];
      for (let hats = 0; hats < 8; hats++) row.push(action(s, viewOf(hats, p)));
      act[p].push(row);
    }
  }
  let best = 0;
  for (let s0 = 0; s0 < 81; s0++)
    for (let s1 = 0; s1 < 81; s1++)
      for (let s2 = 0; s2 < 81; s2++) {
        let wins = 0;
        for (let hats = 0; hats < 8; hats++) {
          let guessed = false;
          let ok = true;
          const acts = [act[0][s0][hats], act[1][s1][hats], act[2][s2][hats]];
          for (let p = 0; p < 3; p++) {
            if (acts[p] === 2) continue;
            guessed = true;
            if (acts[p] !== ((hats >> p) & 1)) ok = false;
          }
          if (guessed && ok) wins++;
        }
        if (wins > best) best = wins;
      }
  return best / 8;
}

/** All values reachable as the last number in the erase-two-write-the-difference game. */
function differenceGameFinals(start: number[]): Set<number> {
  const seen = new Set<string>();
  const finals = new Set<number>();
  const stack: number[][] = [start.slice().sort((x, y) => x - y)];
  seen.add(stack[0].join(","));
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.length === 1) {
      finals.add(cur[0]);
      continue;
    }
    for (let i = 0; i < cur.length; i++)
      for (let j = i + 1; j < cur.length; j++) {
        const next = cur.filter((_, k) => k !== i && k !== j);
        next.push(Math.abs(cur[i] - cur[j]));
        next.sort((x, y) => x - y);
        const key = next.join(",");
        if (!seen.has(key)) {
          seen.add(key);
          stack.push(next);
        }
      }
  }
  return finals;
}

/** Min and max number of single-piece straight cuts that reduce a w x h bar to unit squares. */
function chocolateCutRange(w: number, h: number): { min: number; max: number } {
  const norm = (a: number, b: number): string => (a <= b ? `${a}x${b}` : `${b}x${a}`);
  const start = [norm(w, h)].sort();
  let layer = new Set<string>([start.join("|")]);
  const seenDepth = new Map<string, number>();
  let depth = 0;
  let min = Infinity;
  let max = -Infinity;
  const target = new Array<string>(w * h).fill("1x1").join("|");
  while (layer.size) {
    const next = new Set<string>();
    for (const key of layer) {
      if (key === target) {
        min = Math.min(min, depth);
        max = Math.max(max, depth);
        continue;
      }
      const pieces = key.split("|");
      for (let i = 0; i < pieces.length; i++) {
        const [a, b] = pieces[i].split("x").map(Number);
        const rest = pieces.filter((_, k) => k !== i);
        const cuts: Array<[string, string]> = [];
        for (let x = 1; x < a; x++) cuts.push([norm(x, b), norm(a - x, b)]);
        for (let y = 1; y < b; y++) cuts.push([norm(a, y), norm(a, b - y)]);
        for (const [p, q] of cuts) {
          const nk = [...rest, p, q].sort().join("|");
          if (!seenDepth.has(nk)) {
            seenDepth.set(nk, depth + 1);
            next.add(nk);
          }
        }
      }
    }
    layer = next;
    depth++;
  }
  return { min, max };
}

/** Number of monotone lattice paths between two points with optional blocked cells, by DP. */
function pathsDp(x0: number, y0: number, x1: number, y1: number, blocked: Array<[number, number]> = []): number {
  const W = x1 - x0, H = y1 - y0;
  if (W < 0 || H < 0) return 0;
  const f: number[][] = Array.from({ length: W + 1 }, () => new Array<number>(H + 1).fill(0));
  f[0][0] = 1;
  for (let x = 0; x <= W; x++)
    for (let y = 0; y <= H; y++) {
      if (x === 0 && y === 0) continue;
      if (blocked.some(([bx, by]) => bx === x0 + x && by === y0 + y)) continue;
      f[x][y] = (x > 0 ? f[x - 1][y] : 0) + (y > 0 ? f[x][y - 1] : 0);
    }
  return f[W][H];
}

function digitSum(n: number): number {
  let s = 0;
  while (n > 0) {
    s += n % 10;
    n = Math.floor(n / 10);
  }
  return s;
}

function trailingZerosOfFactorial(n: number): number {
  let f = BigInt(1);
  for (let i = 2; i <= n; i++) f *= BigInt(i);
  let z = 0;
  while (f % BigInt(10) === BigInt(0)) {
    f /= BigInt(10);
    z++;
  }
  return z;
}

/** Index of the option whose claim held, or -1 if the claims do not single out that option. */
function pick(index: number, holds: boolean): number {
  return holds ? index : -1;
}

const near = (x: number, y: number, tol = 1e-9) => Math.abs(x - y) <= tol;

// ------------------------------------------------------------------ the spec

export const spec: VerifySpec = {
  // bt-001: five robots on a 100 cm rail, expected time until the rail is empty
  "bt-001": [
    {
      method: "enumeration",
      run: () => {
        const pos = [10, 25, 50, 70, 90];
        let total = 0;
        forEachMask(5, (mask) => {
          const dirs = pos.map((_, i) => ((mask >> i) & 1 ? 1 : -1));
          total += railClearTime(pos, dirs, 100);
        });
        return total / 32;
      },
    },
    {
      method: "formula",
      run: () => {
        // ghost argument: the clearing time is the latest exit time of the non-interacting ghosts
        const pos = [10, 25, 50, 70, 90];
        let total = 0;
        forEachMask(5, (mask) => {
          let t = 0;
          pos.forEach((x, i) => {
            t = Math.max(t, (mask >> i) & 1 ? 100 - x : x);
          });
          total += t;
        });
        return total / 32;
      },
    },
  ],

  // bt-002: nine orders over forty shards, at least one shared shard
  "bt-002": [
    {
      method: "formula",
      run: () => {
        let noClash = 1;
        for (let k = 0; k < 9; k++) noClash *= (40 - k) / 40;
        return 1 - noClash;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const used = new Set<number>();
          for (let i = 0; i < 9; i++) {
            const s = randInt(r, 0, 39);
            if (used.has(s)) return true;
            used.add(s);
          }
          return false;
        }),
    },
  ],

  // bt-003: four doors, host opens one empty door, switch to a random remaining door
  "bt-003": [
    {
      method: "enumeration",
      run: () => {
        let stay = 0;
        let swit = 0;
        for (let prize = 0; prize < 4; prize++)
          for (let pickDoor = 0; pickDoor < 4; pickDoor++) {
            const w = 1 / 16;
            const hostOptions = [0, 1, 2, 3].filter((d) => d !== pickDoor && d !== prize);
            for (const h of hostOptions) {
              const wh = w / hostOptions.length;
              if (pickDoor === prize) stay += wh;
              const remaining = [0, 1, 2, 3].filter((d) => d !== pickDoor && d !== h);
              for (const d of remaining) if (d === prize) swit += wh / remaining.length;
            }
          }
        return pick(1, near(stay, 1 / 4) && near(swit, 3 / 8));
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const res = simulate(rng, 1_000_000, (r) => {
          const prize = randInt(r, 0, 3);
          const pickDoor = randInt(r, 0, 3);
          const hostOptions = [0, 1, 2, 3].filter((d) => d !== pickDoor && d !== prize);
          const h = hostOptions[randInt(r, 0, hostOptions.length - 1)];
          const remaining = [0, 1, 2, 3].filter((d) => d !== pickDoor && d !== h);
          const d = remaining[randInt(r, 0, 1)];
          return d === prize ? 1 : 0;
        });
        return pick(1, Math.abs(res.value - 3 / 8) < 6 * res.se && 6 * res.se < 0.01);
      },
    },
  ],

  // bt-004: three players roll in turn, first six wins, probability the second player wins
  "bt-004": [
    {
      method: "recursion",
      run: () => {
        // x_i = P(player 2 wins | player i is about to roll), i = 1, 2, 3
        const p = 1 / 6, q = 5 / 6;
        const A = [
          [1, -q, 0],
          [0, 1, -q],
          [-q, 0, 1],
        ];
        const b = [0, p, 0];
        return solveLinear(A, b)[0];
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          let turn = 0;
          for (;;) {
            if (die(r) === 6) return turn === 1;
            turn = (turn + 1) % 3;
          }
        }),
    },
  ],

  // bt-005: biased walk from 2 to 6 before 0, unit bets vs two-dollar bets (choice)
  "bt-005": [
    {
      method: "recursion",
      run: () => {
        const unit = ruinByLinearSystem(2, 6, 0.6);
        const two = ruinByLinearSystem(1, 3, 0.6);
        return pick(0, near(unit, 81 / 133) && near(two, 9 / 19) && unit > two);
      },
    },
    {
      method: "formula",
      run: () => {
        const r = 0.4 / 0.6;
        const unit = (1 - Math.pow(r, 2)) / (1 - Math.pow(r, 6));
        const two = (1 - r) / (1 - Math.pow(r, 3));
        return pick(0, near(unit, 81 / 133) && near(two, 9 / 19) && unit > two);
      },
    },
  ],

  // bt-006: expected number of consecutive ascending neighbours in a shuffled 8-card pack
  "bt-006": [
    {
      method: "enumeration",
      run: () => {
        let total = 0;
        let count = 0;
        forEachPermutation(8, (p) => {
          count++;
          for (let i = 0; i + 1 < 8; i++) if (p[i + 1] === p[i] + 1) total++;
        });
        return total / count;
      },
    },
    { method: "formula", run: () => 7 * (1 / 8) },
    {
      method: "simulation",
      run: (rng) =>
        simulate(rng, 600_000, (r) => {
          const p = shuffle([0, 1, 2, 3, 4, 5, 6, 7], r);
          let c = 0;
          for (let i = 0; i + 1 < 8; i++) if (p[i + 1] === p[i] + 1) c++;
          return c;
        }),
    },
  ],

  // bt-007: a 1 m cable cut at two uniform points, all pieces at least 20 cm
  "bt-007": [
    { method: "formula", run: () => Math.pow(1 - 3 * 0.2, 2) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 3_000_000, (r) => {
          const u = r(), v = r();
          const lo = Math.min(u, v), hi = Math.max(u, v);
          return lo >= 0.2 && hi - lo >= 0.2 && 1 - hi >= 0.2;
        }),
    },
  ],

  // bt-008: two envelopes, which step of the switching argument fails (choice)
  "bt-008": [
    {
      method: "enumeration",
      run: () => {
        // Any concrete prior: pairs (2^k, 2^(k+1)) for k = 0..9, equally likely; a fair pick of envelope.
        const weightLarger = new Map<number, number>();
        const weightTotal = new Map<number, number>();
        let gain = 0;
        for (let k = 0; k < 10; k++) {
          const small = Math.pow(2, k), large = 2 * small;
          // hold the small one
          weightTotal.set(small, (weightTotal.get(small) ?? 0) + 0.5);
          weightLarger.set(small, (weightLarger.get(small) ?? 0) + 0.5);
          gain += 0.5 * (large - small);
          // hold the large one
          weightTotal.set(large, (weightTotal.get(large) ?? 0) + 0.5);
          gain += 0.5 * (small - large);
        }
        let allHalf = true;
        for (const [amt, w] of weightTotal) {
          const pLarger = (weightLarger.get(amt) ?? 0) / w;
          if (!near(pLarger, 0.5)) allHalf = false;
        }
        // The switching argument needs P(other is larger | amount) = 1/2 for every amount; with a
        // real prior it fails at the extremes, and the overall gain from always switching is zero.
        return pick(1, !allHalf && near(gain, 0));
      },
    },
  ],

  // bt-009: doubling bets 1, 2, 4, 8 on a 45% coin, stop at the first win or when broke
  "bt-009": [
    {
      method: "enumeration",
      run: () => {
        // Enumerate all 16 outcomes of four flips (bit i = 1 means flip i is a win), weight each
        // full sequence by its exact probability, and apply the stopping rule to read off the profit.
        const p = 0.45;
        let ev = 0;
        forEachMask(4, (mask) => {
          let prob = 1;
          for (let i = 0; i < 4; i++) prob *= (mask >> i) & 1 ? p : 1 - p;
          let profit = 0;
          for (let i = 0; i < 4; i++) {
            if ((mask >> i) & 1) {
              profit += Math.pow(2, i);
              break;
            }
            profit -= Math.pow(2, i);
          }
          ev += prob * profit;
        });
        return ev;
      },
    },
    {
      method: "recursion",
      run: () => {
        // V_k = expected profit when about to place bet 2^k having lost 2^k - 1 so far
        const p = 0.45, q = 0.55;
        const A = [
          [1, -q, 0, 0],
          [0, 1, -q, 0],
          [0, 0, 1, -q],
          [0, 0, 0, 1],
        ];
        const b = [p, p, p, p - 15 * q];
        return solveLinear(A, b)[0];
      },
    },
  ],

  // bt-010: three named desks in the same cycle of a random permutation of eight
  "bt-010": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachPermutation(8, (p) => {
          total++;
          let x = p[0];
          let seen1 = false, seen2 = false;
          while (x !== 0) {
            if (x === 1) seen1 = true;
            if (x === 2) seen2 = true;
            x = p[x];
          }
          if (seen1 && seen2) hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => 1 / 3 },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const p = shuffle([0, 1, 2, 3, 4, 5, 6, 7], r);
          let x = p[0];
          let seen1 = false, seen2 = false;
          while (x !== 0) {
            if (x === 1) seen1 = true;
            if (x === 2) seen2 = true;
            x = p[x];
          }
          return seen1 && seen2;
        }),
    },
  ],

  // bt-011: cables in five colours, pulls needed to guarantee four of one colour
  "bt-011": [
    {
      method: "exhaustive-search",
      run: () => {
        // smallest n such that no composition of n into 5 parts has every part <= 3
        const canAvoid = (n: number): boolean => {
          let found = false;
          const rec = (left: number, parts: number) => {
            if (found) return;
            if (parts === 0) {
              if (left === 0) found = true;
              return;
            }
            for (let x = 0; x <= Math.min(3, left); x++) rec(left - x, parts - 1);
          };
          rec(n, 5);
          return found;
        };
        for (let n = 1; n < 100; n++) if (!canAvoid(n)) return n;
        return -1;
      },
    },
    { method: "formula", run: () => (4 - 1) * 5 + 1 },
  ],

  // bt-012: picks from 1..30 that force two numbers differing by exactly 5
  "bt-012": [
    {
      method: "exhaustive-search",
      run: () => {
        // A difference of 5 keeps the residue mod 5, so maximise independently inside each residue class.
        let best = 0;
        for (let res = 1; res <= 5; res++) {
          const chain = [res, res + 5, res + 10, res + 15, res + 20, res + 25];
          let bestHere = 0;
          forEachMask(chain.length, (mask) => {
            let ok = true;
            for (let i = 0; i + 1 < chain.length; i++) if ((mask >> i) & 1 && (mask >> (i + 1)) & 1) ok = false;
            if (ok) {
              let c = 0;
              for (let i = 0; i < chain.length; i++) if ((mask >> i) & 1) c++;
              bestHere = Math.max(bestHere, c);
            }
          });
          best += bestHere;
        }
        return best + 1;
      },
    },
    { method: "formula", run: () => 5 * Math.ceil(6 / 2) + 1 },
  ],

  // bt-013: smallest n such that any n integers contain three with sum divisible by 3
  "bt-013": [
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 3; n <= 8; n++) {
          let allHave = true;
          forEachTuple(n, 3, (t) => {
            if (!allHave) return;
            let found = false;
            for (let i = 0; i < n && !found; i++)
              for (let j = i + 1; j < n && !found; j++)
                for (let k = j + 1; k < n && !found; k++) if ((t[i] + t[j] + t[k]) % 3 === 0) found = true;
            if (!found) allHave = false;
          });
          if (allHave) return n;
        }
        return -1;
      },
    },
    { method: "formula", run: () => 2 * 3 - 1 },
  ],

  // bt-014: shortest list guaranteeing a consecutive block with sum divisible by 6
  "bt-014": [
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 1; n <= 8; n++) {
          let allHave = true;
          forEachTuple(n, 6, (t) => {
            if (!allHave) return;
            // residues 0..5 stand for the entries mod 6 (entry 6 itself is residue 0)
            let found = false;
            for (let i = 0; i < n && !found; i++) {
              let s = 0;
              for (let j = i; j < n; j++) {
                s = (s + t[j]) % 6;
                if (s === 0) {
                  found = true;
                  break;
                }
              }
            }
            if (!found) allHave = false;
          });
          if (allHave) return n;
        }
        return -1;
      },
    },
    { method: "formula", run: () => 6 },
  ],

  // bt-015: smallest group forcing three mutual acquaintances or three mutual strangers
  "bt-015": [
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 3; n <= 6; n++) {
          const edges: Array<[number, number]> = [];
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([i, j]);
          const idx = (i: number, j: number) => edges.findIndex(([a, b]) => a === Math.min(i, j) && b === Math.max(i, j));
          const triangles: number[][] = [];
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) triangles.push([idx(i, j), idx(j, k), idx(i, k)]);
          let every = true;
          forEachMask(edges.length, (mask) => {
            if (!every) return;
            let mono = false;
            for (const [e1, e2, e3] of triangles) {
              const c1 = (mask >> e1) & 1, c2 = (mask >> e2) & 1, c3 = (mask >> e3) & 1;
              if (c1 === c2 && c2 === c3) {
                mono = true;
                break;
              }
            }
            if (!mono) every = false;
          });
          if (every) return n;
        }
        return -1;
      },
    },
  ],

  // bt-016: twenty coins, one heavier, balance weighings needed
  "bt-016": [
    { method: "exhaustive-search", run: () => weighingsNeeded(20, 0, 0, 0, false) },
    {
      method: "formula",
      run: () => {
        let k = 0;
        while (Math.pow(3, k) < 20) k++;
        return k;
      },
    },
  ],

  // bt-017: thirteen coins plus one genuine reference, direction required
  "bt-017": [
    { method: "exhaustive-search", run: () => weighingsNeeded(0, 0, 13, 1, true) },
    {
      method: "formula",
      run: () => {
        // with a reference coin, k weighings handle up to (3^k - 1) / 2 coins with direction
        let k = 0;
        while ((Math.pow(3, k) - 1) / 2 < 13) k++;
        return k;
      },
    },
  ],

  // bt-018: largest number of coins solvable with direction in three weighings, no reference
  "bt-018": [
    {
      method: "exhaustive-search",
      run: () => {
        let best = 0;
        for (let n = 2; n <= 14; n++) if (weighingsNeeded(0, 0, n, 0, true, 3) <= 3) best = n;
        return best;
      },
    },
    { method: "formula", run: () => (Math.pow(3, 3) - 3) / 2 },
  ],

  // bt-019: two heavy bags among ten, which coin counts make one digital weighing enough (choice)
  "bt-019": [
    {
      method: "exhaustive-search",
      run: () => {
        const distinctPairSums = (counts: number[]): boolean => {
          const sums = new Set<number>();
          for (let i = 0; i < counts.length; i++)
            for (let j = i + 1; j < counts.length; j++) {
              const s = counts[i] + counts[j];
              if (sums.has(s)) return false;
              sums.add(s);
            }
          return true;
        };
        const linear = Array.from({ length: 10 }, (_, i) => i + 1);
        const powers = Array.from({ length: 10 }, (_, i) => Math.pow(2, i));
        const flat = new Array<number>(10).fill(10);
        return pick(1, !distinctPairSums(linear) && distinctPairSums(powers) && !distinctPairSums(flat));
      },
    },
  ],

  // bt-020: comparisons needed to sort five coins of distinct weight
  "bt-020": [
    { method: "exhaustive-search", run: () => comparisonsToSort(5) },
    { method: "formula", run: () => Math.ceil(Math.log2(120)) },
  ],

  // bt-021: three players guess-or-pass, best success probability
  "bt-021": [
    { method: "exhaustive-search", run: () => bestGuessOrPass3() },
    {
      method: "enumeration",
      run: () => {
        // strategy: if the two hats you see match, guess the other colour; otherwise pass
        let wins = 0;
        for (let hats = 0; hats < 8; hats++) {
          let guessed = false, ok = true;
          for (let p = 0; p < 3; p++) {
            const others = [0, 1, 2].filter((q) => q !== p).map((q) => (hats >> q) & 1);
            if (others[0] === others[1]) {
              guessed = true;
              if (1 - others[0] !== ((hats >> p) & 1)) ok = false;
            }
          }
          if (guessed && ok) wins++;
        }
        return wins / 8;
      },
    },
  ],

  // bt-022: seven in a line, three colours, guaranteed correct calls under the mod-3 convention
  "bt-022": [
    {
      method: "enumeration",
      run: () => {
        let worst = Infinity;
        forEachTuple(7, 3, (h) => {
          // index 6 is at the back and speaks first; everyone sees lower indices
          let seenSum = 0;
          for (let i = 0; i < 6; i++) seenSum += h[i];
          const announced = seenSum % 3;
          let correct = announced === h[6] ? 1 : 0;
          let heard = 0; // sum of the hats already correctly deduced by later speakers
          for (let i = 5; i >= 0; i--) {
            let front = 0;
            for (let j = 0; j < i; j++) front += h[j];
            const guess = (((announced - heard - front) % 3) + 3) % 3;
            if (guess === h[i]) correct++;
            heard += h[i];
          }
          worst = Math.min(worst, correct);
        });
        return worst;
      },
    },
    { method: "formula", run: () => 7 - 1 },
  ],

  // bt-023: three players, hats numbered 0..2, at least one correct guess (choice)
  "bt-023": [
    {
      method: "enumeration",
      run: () => {
        // player p assumes the total is congruent to p mod 3 and guesses accordingly
        let wins = 0;
        forEachTuple(3, 3, (h) => {
          let someone = false;
          for (let p = 0; p < 3; p++) {
            const others = h.reduce((s, x, i) => (i === p ? s : s + x), 0);
            const guess = (((p - others) % 3) + 3) % 3;
            if (guess === h[p]) someone = true;
          }
          if (someone) wins++;
        });
        return pick(1, wins === 27);
      },
    },
  ],

  // bt-024: two players, at least one correct, which strategy guarantees it (choice)
  "bt-024": [
    {
      method: "exhaustive-search",
      run: () => {
        // a strategy for a player maps the seen hat (0/1) to a guess (0/1): 4 strategies each
        const guess = (s: number, seen: number) => (s >> seen) & 1;
        const winsAll = (s0: number, s1: number): boolean => {
          for (let hats = 0; hats < 4; hats++) {
            const h0 = hats & 1, h1 = (hats >> 1) & 1;
            if (guess(s0, h1) !== h0 && guess(s1, h0) !== h1) return false;
          }
          return true;
        };
        const same = 0b10; // guess what you see
        const opposite = 0b01; // guess the opposite of what you see
        const red = 0b00; // always guess colour 0
        const option1 = winsAll(same, opposite);
        const option0 = winsAll(same, same);
        const option2 = winsAll(red, red);
        let anyWins = false;
        for (let s0 = 0; s0 < 4; s0++) for (let s1 = 0; s1 < 4; s1++) if (winsAll(s0, s1)) anyWins = true;
        return pick(1, option1 && !option0 && !option2 && anyWins);
      },
    },
    {
      method: "enumeration",
      run: () => {
        let wins = 0;
        for (let hats = 0; hats < 4; hats++) {
          const h0 = hats & 1, h1 = (hats >> 1) & 1;
          const g0 = h1; // she guesses the colour she sees
          const g1 = 1 - h0; // he guesses the opposite
          if (g0 === h0 || g1 === h1) wins++;
        }
        return pick(1, wins === 4);
      },
    },
  ],

  // bt-025: smallest positive integer with digit sum 20 divisible by 20
  "bt-025": [
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 1; n < 100000; n++) if (n % 20 === 0 && digitSum(n) === 20) return n;
        return -1;
      },
    },
    {
      method: "dp",
      run: () => {
        // smallest number of each length with a given (digit sum, residue mod 20), built digit by digit
        type Key = string;
        let layer = new Map<Key, number>(); // (sum, mod) -> smallest number with that many digits
        for (let d = 1; d <= 9; d++) layer.set(`${d},${d % 20}`, d);
        for (let len = 1; len <= 6; len++) {
          const hit = layer.get("20,0");
          if (hit !== undefined) return hit;
          const next = new Map<Key, number>();
          for (const [key, num] of layer) {
            const [s, m] = key.split(",").map(Number);
            for (let d = 0; d <= 9; d++) {
              if (s + d > 20) continue;
              const k2 = `${s + d},${(m * 10 + d) % 20}`;
              const val = num * 10 + d;
              const cur = next.get(k2);
              if (cur === undefined || val < cur) next.set(k2, val);
            }
          }
          layer = next;
        }
        return -1;
      },
    },
  ],

  // bt-026: remainder 2 on division by 3, 4 and 5, divisible by 7
  "bt-026": [
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 1; n < 10000; n++) if (n % 3 === 2 && n % 4 === 2 && n % 5 === 2 && n % 7 === 0) return n;
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // n = 60k + 2 with 60k + 2 = 0 mod 7, i.e. 4k = 5 mod 7, k = 3 mod 7
        let k = 0;
        while ((60 * k + 2) % 7 !== 0) k++;
        return 60 * k + 2;
      },
    },
  ],

  // bt-027: integers from 1 to 999 with digit sum 13
  "bt-027": [
    {
      method: "enumeration",
      run: () => {
        let c = 0;
        for (let n = 1; n <= 999; n++) if (digitSum(n) === 13) c++;
        return c;
      },
    },
    { method: "formula", run: () => choose(15, 2) - 3 * choose(5, 2) },
  ],

  // bt-028: smallest n whose factorial ends in at least ten zeros
  "bt-028": [
    {
      method: "formula",
      run: () => {
        const zeros = (n: number) => {
          let z = 0;
          for (let p = 5; p <= n; p *= 5) z += Math.floor(n / p);
          return z;
        };
        for (let n = 1; n < 200; n++) if (zeros(n) >= 10) return n;
        return -1;
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        for (let n = 1; n < 200; n++) if (trailingZerosOfFactorial(n) >= 10) return n;
        return -1;
      },
    },
  ],

  // bt-029: 3^2026 mod 7
  "bt-029": [
    {
      method: "formula",
      run: () => {
        // order of 3 mod 7 is 6; 2026 = 6 * 337 + 4
        const e = 2026 % 6;
        let r = 1;
        for (let i = 0; i < e; i++) r = (r * 3) % 7;
        return r;
      },
    },
    {
      method: "enumeration",
      run: () => {
        let r = BigInt(1);
        for (let i = 0; i < 2026; i++) r *= BigInt(3);
        return Number(r % BigInt(7));
      },
    },
  ],

  // bt-030: how many times the digit 3 is written from 1 to 500
  "bt-030": [
    {
      method: "enumeration",
      run: () => {
        let c = 0;
        for (let n = 1; n <= 500; n++) for (const ch of String(n)) if (ch === "3") c++;
        return c;
      },
    },
    { method: "formula", run: () => 50 + 50 + 100 },
  ],

  // bt-031: three islanders, who is honest (choice)
  "bt-031": [
    {
      method: "exhaustive-search",
      run: () => {
        const solutions: number[] = [];
        forEachMask(3, (m) => {
          const P = !!(m & 1), Q = !!(m & 2), R = !!(m & 4);
          const honestCount = Number(P) + Number(Q) + Number(R);
          const sP = honestCount === 1;
          const sQ = !P;
          const sR = Q === R;
          if (P === sP && Q === sQ && R === sR) solutions.push(m);
        });
        // options: 0 "P only", 1 "Q only", 2 "Q and R", 3 "P and R", 4 "none"
        return pick(2, solutions.length === 1 && solutions[0] === (2 | 4));
      },
    },
  ],

  // bt-032: six traders answer 0..5 to "how many of you are honest" (choice)
  "bt-032": [
    {
      method: "exhaustive-search",
      run: () => {
        const answers = [0, 1, 2, 3, 4, 5];
        const solutions: number[] = [];
        forEachMask(6, (m) => {
          let h = 0;
          for (let i = 0; i < 6; i++) if ((m >> i) & 1) h++;
          let ok = true;
          for (let i = 0; i < 6; i++) {
            const honest = !!((m >> i) & 1);
            if (honest !== (answers[i] === h)) ok = false;
          }
          if (ok) solutions.push(m);
        });
        // exactly one consistent world: only the trader who answered 1 is honest
        return pick(0, solutions.length === 1 && solutions[0] === 1 << 1);
      },
    },
  ],

  // bt-033: lattice paths through one checkpoint avoiding another
  "bt-033": [
    {
      method: "enumeration",
      run: () => {
        // every path is a choice of which 6 of the 13 steps go up
        let c = 0;
        forEachSubset(13, 6, (ups) => {
          const up = new Set(ups);
          let x = 0, y = 0;
          let through = false, hitBlocked = false;
          for (let s = 0; s < 13; s++) {
            if (up.has(s)) y++;
            else x++;
            if (x === 3 && y === 2) through = true;
            if (x === 5 && y === 4) hitBlocked = true;
          }
          if (through && !hitBlocked) c++;
        });
        return c;
      },
    },
    { method: "formula", run: () => choose(5, 2) * (choose(8, 4) - choose(4, 2) * choose(4, 2)) },
    { method: "dp", run: () => pathsDp(0, 0, 3, 2) * pathsDp(3, 2, 7, 6, [[5, 4]]) },
  ],

  // bt-034: squares with vertices in a 4 x 4 array of points, any orientation
  "bt-034": [
    {
      method: "enumeration",
      run: () => {
        const pts: Array<[number, number]> = [];
        for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) pts.push([x, y]);
        let c = 0;
        forEachSubset(16, 4, (s) => {
          const d: number[] = [];
          for (let i = 0; i < 4; i++)
            for (let j = i + 1; j < 4; j++) {
              const dx = pts[s[i]][0] - pts[s[j]][0], dy = pts[s[i]][1] - pts[s[j]][1];
              d.push(dx * dx + dy * dy);
            }
          d.sort((a, b) => a - b);
          if (d[0] > 0 && d[0] === d[3] && d[4] === d[5] && d[4] === 2 * d[0]) c++;
        });
        return c;
      },
    },
    {
      method: "formula",
      run: () => {
        // a square with side vector (a, b), a >= 1, b >= 0, fits in (4 - a - b)^2 positions
        let c = 0;
        for (let a = 1; a <= 3; a++) for (let b = 0; a + b <= 3; b++) c += Math.pow(4 - a - b, 2);
        return c;
      },
    },
  ],

  // bt-035: non-square rectangles in a 6 x 4 grid of cells
  "bt-035": [
    {
      method: "enumeration",
      run: () => {
        let c = 0;
        for (let x1 = 0; x1 <= 6; x1++)
          for (let x2 = x1 + 1; x2 <= 6; x2++)
            for (let y1 = 0; y1 <= 4; y1++) for (let y2 = y1 + 1; y2 <= 4; y2++) if (x2 - x1 !== y2 - y1) c++;
        return c;
      },
    },
    {
      method: "formula",
      run: () => {
        let squares = 0;
        for (let k = 1; k <= 4; k++) squares += (7 - k) * (5 - k);
        return choose(7, 2) * choose(5, 2) - squares;
      },
    },
  ],

  // bt-036: five arrivals and five departures, the queue never goes negative
  "bt-036": [
    {
      method: "dp",
      run: () => {
        const f: number[][] = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
        f[0][0] = 1;
        for (let a = 0; a <= 5; a++)
          for (let d = 0; d <= a; d++) {
            if (a === 0 && d === 0) continue;
            f[a][d] = (a > 0 ? f[a - 1][d] : 0) + (d > 0 && d - 1 <= a ? f[a][d - 1] : 0);
          }
        return f[5][5];
      },
    },
    { method: "formula", run: () => choose(10, 5) / 6 },
  ],

  // bt-037: domino tilings of a 2 x 10 strip
  "bt-037": [
    {
      method: "dp",
      run: () => {
        const t = [1, 1];
        for (let n = 2; n <= 10; n++) t.push(t[n - 1] + t[n - 2]);
        return t[10];
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        const W = 10;
        const grid: boolean[][] = [new Array<boolean>(W).fill(false), new Array<boolean>(W).fill(false)];
        const rec = (): number => {
          let r = -1, c = -1;
          outer: for (let col = 0; col < W; col++)
            for (let row = 0; row < 2; row++)
              if (!grid[row][col]) {
                r = row;
                c = col;
                break outer;
              }
          if (c === -1) return 1;
          let total = 0;
          if (r === 0 && !grid[1][c]) {
            grid[0][c] = grid[1][c] = true;
            total += rec();
            grid[0][c] = grid[1][c] = false;
          }
          if (c + 1 < W && !grid[r][c + 1]) {
            grid[r][c] = grid[r][c + 1] = true;
            total += rec();
            grid[r][c] = grid[r][c + 1] = false;
          }
          return total;
        };
        return rec();
      },
    },
  ],

  // bt-038: rook-style routes across a 7 x 7 block grid
  "bt-038": [
    {
      method: "dp",
      run: () => {
        const N = 7;
        const f: number[][] = Array.from({ length: N + 1 }, () => new Array<number>(N + 1).fill(0));
        f[0][0] = 1;
        for (let x = 0; x <= N; x++)
          for (let y = 0; y <= N; y++) {
            if (x === 0 && y === 0) continue;
            let s = 0;
            for (let i = 0; i < x; i++) s += f[i][y];
            for (let j = 0; j < y; j++) s += f[x][j];
            f[x][y] = s;
          }
        return f[N][N];
      },
    },
    {
      method: "formula",
      run: () => {
        // h east legs and v north legs: compositions of 7 into h and v parts, interleaved
        let total = 0;
        for (let h = 1; h <= 7; h++) for (let v = 1; v <= 7; v++) total += choose(6, h - 1) * choose(6, v - 1) * choose(h + v, h);
        return total;
      },
    },
  ],

  // bt-039: erase two, write the difference, starting from 1..8; which final value is possible (choice)
  "bt-039": [
    {
      method: "exhaustive-search",
      run: () => {
        const finals = differenceGameFinals([1, 2, 3, 4, 5, 6, 7, 8]);
        // options: 0 "1", 1 "3", 2 "6", 3 "9"
        return pick(2, finals.has(6) && !finals.has(1) && !finals.has(3) && !finals.has(9));
      },
    },
    {
      method: "formula",
      run: () => {
        // invariant: the parity of the sum never changes; the maximum never increases
        const sum = (8 * 9) / 2;
        const options = [1, 3, 6, 9];
        const feasible = options.map((v) => v % 2 === sum % 2 && v <= 8);
        return pick(2, feasible.filter(Boolean).length === 1 && feasible[2]);
      },
    },
  ],

  // bt-040: cuts to break a 4 x 6 bar into unit squares, one piece per cut (choice)
  "bt-040": [
    {
      method: "exhaustive-search",
      run: () => {
        const { min, max } = chocolateCutRange(4, 6);
        return pick(1, min === 23 && max === 23);
      },
    },
    { method: "formula", run: () => pick(1, 4 * 6 - 1 === 23) },
  ],
};
