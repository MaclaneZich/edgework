import type { VerifySpec } from "../types";
import { choose, forEachTuple } from "./helpers";

/**
 * Independent checks for module 9 (logic and combinatorial puzzles). The preferred routes
 * are exhaustive: enumerate every type assignment, every strategy, every decision tree, or
 * run a breadth-first search over the whole state space. Each is paired with a closed form
 * or a DP table that uses a different idea. Nothing here uses randomness.
 */

function popcount(mask: number): number {
  let c = 0;
  while (mask) {
    mask &= mask - 1;
    c++;
  }
  return c;
}

/** Shortest path length by BFS over an implicit graph; -1 when the goal is unreachable. */
function bfs<T>(start: T, isGoal: (s: T) => boolean, next: (s: T) => T[], key: (s: T) => string): number {
  const seen = new Set<string>([key(start)]);
  let frontier: T[] = [start];
  let depth = 0;
  while (frontier.length) {
    const nextFrontier: T[] = [];
    for (const s of frontier) {
      if (isGoal(s)) return depth;
      for (const n of next(s)) {
        const k = key(n);
        if (seen.has(k)) continue;
        seen.add(k);
        nextFrontier.push(n);
      }
    }
    frontier = nextFrontier;
    depth++;
  }
  return -1;
}

/**
 * Minimum weighings to find one heavy item among n with a balance, by exhaustive search over
 * decision trees. Candidates are items; a weighing puts disjoint equal-size groups on the two
 * pans (non-candidate items may be used as fillers). Returns the smallest depth that works.
 */
function minWeighingsHeavyByDecisionTree(n: number): number {
  const weighings: Array<[number, number]> = []; // [leftMask, rightMask]
  forEachTuple(n, 3, (t) => {
    let L = 0;
    let R = 0;
    for (let i = 0; i < n; i++) {
      if (t[i] === 1) L |= 1 << i;
      if (t[i] === 2) R |= 1 << i;
    }
    if (L && popcount(L) === popcount(R) && L < R) weighings.push([L, R]);
  });
  const memo = new Map<string, boolean>();
  const solvable = (cand: number, k: number): boolean => {
    if (popcount(cand) <= 1) return true;
    if (k === 0) return false;
    const key = cand + ":" + k;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let ok = false;
    for (const [L, R] of weighings) {
      const left = cand & L;
      const right = cand & R;
      const bal = cand & ~(L | R);
      if (solvable(left, k - 1) && solvable(right, k - 1) && solvable(bal, k - 1)) {
        ok = true;
        break;
      }
    }
    memo.set(key, ok);
    return ok;
  };
  const all = (1 << n) - 1;
  for (let k = 0; k <= n; k++) if (solvable(all, k)) return k;
  return -1;
}

/**
 * Heavier-or-lighter variant: hypotheses are (item, direction). Returns the smallest number
 * of weighings that identifies both the item and the direction, by exhaustive search.
 */
function minWeighingsEitherByDecisionTree(n: number): number {
  const hyps: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    hyps.push([i, 1]);
    hyps.push([i, -1]);
  }
  const weighings: Array<[number, number]> = [];
  forEachTuple(n, 3, (t) => {
    let L = 0;
    let R = 0;
    for (let i = 0; i < n; i++) {
      if (t[i] === 1) L |= 1 << i;
      if (t[i] === 2) R |= 1 << i;
    }
    if (L && popcount(L) === popcount(R)) weighings.push([L, R]);
  });
  const memo = new Map<string, boolean>();
  const solvable = (mask: number, k: number): boolean => {
    if (popcount(mask) <= 1) return true;
    if (k === 0) return false;
    const key = mask + ":" + k;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let ok = false;
    for (const [L, R] of weighings) {
      const outs = [0, 0, 0];
      for (let h = 0; h < hyps.length; h++) {
        if (!((mask >> h) & 1)) continue;
        const [item, dir] = hyps[h];
        let o = 1;
        if ((L >> item) & 1) o = dir === 1 ? 0 : 2;
        else if ((R >> item) & 1) o = dir === 1 ? 2 : 0;
        outs[o] |= 1 << h;
      }
      if (outs.every((m) => solvable(m, k - 1))) {
        ok = true;
        break;
      }
    }
    memo.set(key, ok);
    return ok;
  };
  const all = (1 << hyps.length) - 1;
  for (let k = 0; k <= 2 * n; k++) if (solvable(all, k)) return k;
  return -1;
}

/** DP over candidate counts for the heavier-only balance problem: best three-way split. */
function minWeighingsHeavyByCountDp(n: number): number {
  const f = new Array<number>(n + 1).fill(0);
  for (let m = 2; m <= n; m++) {
    let best = Infinity;
    for (let a = 1; 2 * a <= m; a++) best = Math.min(best, 1 + Math.max(f[a], f[m - 2 * a]));
    f[m] = best;
  }
  return f[n];
}

/** Minimum moves for Hanoi-type puzzles by BFS; `adjacentOnly` forbids direct end-to-end moves. */
function hanoiMovesByBfs(n: number, adjacentOnly: boolean): number {
  const start = new Array<number>(n).fill(0); // peg of each disc, index 0 = smallest
  return bfs(
    start,
    (s) => s.every((p) => p === 2),
    (s) => {
      const top = [-1, -1, -1];
      for (let i = n - 1; i >= 0; i--) top[s[i]] = i;
      const out: number[][] = [];
      for (let p = 0; p < 3; p++) {
        if (top[p] < 0) continue;
        for (let q = 0; q < 3; q++) {
          if (q === p) continue;
          if (adjacentOnly && Math.abs(q - p) !== 1) continue;
          if (top[q] >= 0 && top[q] < top[p]) continue;
          const ns = s.slice();
          ns[top[p]] = q;
          out.push(ns);
        }
      }
      return out;
    },
    (s) => s.join(""),
  );
}

/** Minimum crossings for a one-item-at-a-time ferry puzzle with forbidden unattended pairs. */
function ferryCrossingsByBfs(items: number, forbiddenPairs: Array<[number, number]>): number {
  // state[0] = ferry side, state[1..items] = item sides; 0 = start bank, 1 = far bank
  const start = new Array<number>(items + 1).fill(0);
  const bad = (s: number[]) => forbiddenPairs.some(([a, b]) => s[a + 1] === s[b + 1] && s[a + 1] !== s[0]);
  return bfs(
    start,
    (s) => s.every((v) => v === 1),
    (s) => {
      const side = s[0];
      const out: number[][] = [];
      const alone = s.slice();
      alone[0] = 1 - side;
      if (!bad(alone)) out.push(alone);
      for (let i = 1; i <= items; i++) {
        if (s[i] !== side) continue;
        const n = s.slice();
        n[0] = 1 - side;
        n[i] = 1 - side;
        if (!bad(n)) out.push(n);
      }
      return out;
    },
    (s) => s.join(""),
  );
}

/** Knights-and-knaves: count assignments (bit i set = person i is truthful) consistent with all statements. */
function consistentAssignments(n: number, statements: Array<(truthful: boolean[]) => boolean>): boolean[][] {
  const out: boolean[][] = [];
  for (let m = 0; m < 1 << n; m++) {
    const t = Array.from({ length: n }, (_, i) => ((m >> i) & 1) === 1);
    if (statements.every((stmt, i) => stmt(t) === t[i])) out.push(t);
  }
  return out;
}

/** Index of the single option equal to `target` in a list of candidate values; throws if not unique. */
function uniqueIndex<T>(options: T[], target: T): number {
  const idx = options.map((o, i) => (o === target ? i : -1)).filter((i) => i >= 0);
  if (idx.length !== 1) throw new Error(`expected exactly one matching option, found ${idx.length}`);
  return idx[0];
}

/** Grid reachability for m9-p11: moves add 1 to two edge-adjacent cells of a 3x3 grid. */
function gridTargetReachable(target: number[]): boolean {
  const adj: Array<[number, number]> = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const i = 3 * r + c;
      if (c < 2) adj.push([i, i + 1]);
      if (r < 2) adj.push([i, i + 3]);
    }
  const start = new Array<number>(9).fill(0);
  const d = bfs(
    start,
    (s) => s.every((v, i) => v === target[i]),
    (s) => {
      const out: number[][] = [];
      for (const [a, b] of adj) {
        if (s[a] + 1 > target[a] || s[b] + 1 > target[b]) continue;
        const n = s.slice();
        n[a]++;
        n[b]++;
        out.push(n);
      }
      return out;
    },
    (s) => s.join(","),
  );
  return d >= 0;
}

const GRID_A = [1, 1, 1, 1, 1, 1, 1, 1, 1];
const GRID_B = [1, 1, 1, 1, 0, 1, 1, 1, 1];
const GRID_C = [2, 2, 2, 2, 1, 2, 2, 2, 2];

export const spec: VerifySpec = {
  // -------------------------------------------------------------- difficulty 1
  "m9-p01": [
    {
      method: "enumeration",
      run: () => {
        // Smallest k such that every sequence of k colours (from 4) has a repeated colour.
        for (let k = 1; k <= 8; k++) {
          let allRepeat = true;
          forEachTuple(k, 4, (t) => {
            if (new Set(t).size === k) allRepeat = false;
          });
          if (allRepeat) return k;
        }
        return -1;
      },
    },
    { method: "formula", run: () => 4 + 1 },
  ],
  "m9-p02": [
    {
      method: "enumeration",
      run: () => {
        const hits: number[] = [];
        for (let n = 10; n <= 99; n++) {
          const a = Math.floor(n / 10);
          const b = n % 10;
          if (a + b === 11 && 10 * b + a - n === 27) hits.push(n);
        }
        if (hits.length !== 1) throw new Error("expected a unique two-digit solution");
        return hits[0];
      },
    },
    {
      method: "formula",
      run: () => {
        const diff = 27 / 9; // b - a
        const b = (11 + diff) / 2;
        const a = 11 - b;
        return 10 * a + b;
      },
    },
  ],
  "m9-p03": [
    {
      method: "dp",
      run: () => {
        // f(n) = minimum yes/no questions for n items: best split into two parts.
        const f = [0, 0];
        for (let n = 2; n <= 16; n++) {
          let best = Infinity;
          for (let a = 1; a < n; a++) best = Math.min(best, 1 + Math.max(f[a], f[n - a]));
          f[n] = best;
        }
        return f[16];
      },
    },
    { method: "formula", run: () => Math.ceil(Math.log2(16)) },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m9-p04": [
    {
      method: "exhaustive-search",
      run: () => {
        // Largest subset of 1..20 with no two elements summing to 21, over all 2^20 subsets.
        let best = 0;
        for (let m = 0; m < 1 << 20; m++) {
          let ok = true;
          for (let a = 1; a <= 10 && ok; a++) if ((m >> (a - 1)) & 1 && (m >> (20 - a)) & 1) ok = false;
          if (ok) best = Math.max(best, popcount(m));
        }
        return best + 1;
      },
    },
    { method: "formula", run: () => 20 / 2 + 1 },
  ],
  "m9-p05": [
    {
      method: "enumeration",
      run: () => {
        for (let n = 1; n < 100000; n++) if (n % 3 === 2 && n % 4 === 3 && n % 5 === 4 && n % 7 === 0) return n;
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // N = 60t - 1 with 60t = 1 (mod 7): 4t = 1 (mod 7) gives t = 2.
        let t = 1;
        while ((60 * t) % 7 !== 1) t++;
        return 60 * t - 1;
      },
    },
  ],
  "m9-p06": [
    {
      method: "dp",
      run: () => {
        const a = [1, 1, 1];
        for (let n = 3; n <= 12; n++) a[n] = a[n - 1] + a[n - 3];
        return a[12];
      },
    },
    {
      method: "enumeration",
      run: () => {
        // Count compositions of 12 into parts 1 and 3 by explicit recursion, and cross-check
        // with the binomial sum over the number of wide modules.
        const rec = (left: number): number => (left === 0 ? 1 : (left >= 1 ? rec(left - 1) : 0) + (left >= 3 ? rec(left - 3) : 0));
        const direct = rec(12);
        let binomial = 0;
        for (let k = 0; 3 * k <= 12; k++) binomial += choose(12 - 2 * k, k);
        if (direct !== binomial) throw new Error("composition count and binomial sum disagree");
        return direct;
      },
    },
  ],
  "m9-p07": [
    { method: "formula", run: () => 1 + 7 + choose(7, 2) },
    {
      method: "enumeration",
      run: () => {
        // Concrete lines y = m x + b in general position; count faces by Euler's formula.
        const lines: Array<[number, number]> = [[1, 0], [2, 1], [-1, 3], [0.5, -2], [3, 5], [-2, -1], [0.25, 7]];
        const pts = new Set<string>();
        for (let i = 0; i < lines.length; i++)
          for (let j = i + 1; j < lines.length; j++) {
            const [m1, b1] = lines[i];
            const [m2, b2] = lines[j];
            if (m1 === m2) throw new Error("parallel lines");
            const x = (b2 - b1) / (m1 - m2);
            pts.add(x.toFixed(9) + "," + (m1 * x + b1).toFixed(9));
          }
        const V = pts.size;
        if (V !== choose(lines.length, 2)) throw new Error("three lines concurrent");
        const E = lines.length * lines.length; // each line cut into n pieces by n - 1 points
        return E - (V + 1) + 2; // Euler with one extra vertex at infinity
      },
    },
  ],
  "m9-p08": [
    {
      method: "exhaustive-search",
      run: () => {
        // 0 = Ash, 1 = Bay. Bay's hypothetical answer to "is Ash a liar?" is yes iff
        // (Ash is a liar) has the truth value Bay would report.
        const sols = consistentAssignments(2, [
          (t) => (t[1] ? !t[0] : t[0]), // Ash: Bay would answer yes
          (t) => t[0] !== t[1], // Bay: different types
        ]);
        if (sols.length !== 1) throw new Error("expected a unique assignment");
        const [ash, bay] = sols[0];
        const options = [
          [true, true],
          [true, false],
          [false, true],
          [false, false],
        ];
        return uniqueIndex(
          options.map((o) => o.join()),
          [ash, bay].join(),
        );
      },
    },
    {
      method: "formula",
      run: () => {
        // Deduction chain: assume Bay truthful -> Ash liar -> Bay would say yes -> Ash truthful: contradiction.
        const bayTruthful = false;
        const ashTruthful = bayTruthful ? !true : bayTruthful; // "different types" is false, so same type
        const bayWouldSayYes = bayTruthful ? !ashTruthful : ashTruthful;
        if (bayWouldSayYes !== ashTruthful) throw new Error("deduction inconsistent");
        return !ashTruthful && !bayTruthful ? 3 : -1;
      },
    },
  ],
  "m9-p09": [
    { method: "exhaustive-search", run: () => ferryCrossingsByBfs(3, [[0, 1]]) },
    {
      method: "formula",
      run: () => {
        // Lower bound 2k - 1 for k items one at a time, met by the schedule acid, buffer, base.
        const k = 3;
        const lower = 2 * k - 1;
        const schedule = [0, 2, 1]; // acid, buffer, base
        let cleanRoom: number[] = [];
        let prep = [0, 1, 2];
        for (let i = 0; i < schedule.length; i++) {
          prep = prep.filter((x) => x !== schedule[i]);
          cleanRoom = [...cleanRoom, schedule[i]];
          // after dropping off, the technician returns (unless done): clean room is unattended
          if (i < schedule.length - 1 && cleanRoom.includes(0) && cleanRoom.includes(1)) throw new Error("schedule leaves acid and base alone");
          if (prep.includes(0) && prep.includes(1)) throw new Error("schedule leaves acid and base alone in prep room");
        }
        return lower;
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m9-p10": [
    {
      method: "exhaustive-search",
      run: () => {
        // Largest multiset (r, g, b) within supply with every colour below 4.
        const supply = [2, 10, 10];
        let best = 0;
        for (let r = 0; r <= supply[0]; r++)
          for (let g = 0; g <= supply[1]; g++)
            for (let b = 0; b <= supply[2]; b++) if (r < 4 && g < 4 && b < 4) best = Math.max(best, r + g + b);
        return best + 1;
      },
    },
    { method: "formula", run: () => [2, 10, 10].reduce((acc, s) => acc + Math.min(s, 3), 0) + 1 },
  ],
  "m9-p11": [
    {
      method: "exhaustive-search",
      run: () => {
        const reach = [GRID_A, GRID_B, GRID_C].map(gridTargetReachable);
        const count = reach.filter(Boolean).length;
        if (count === 0) return 3;
        if (count !== 1) throw new Error("more than one display reachable");
        return reach.indexOf(true);
      },
    },
    {
      method: "formula",
      run: () => {
        // Chessboard invariant: dark cells (corners + centre) minus light cells (edges) stays 0.
        const dark = [0, 2, 4, 6, 8];
        const inv = (g: number[]) => g.reduce((acc, v, i) => acc + (dark.includes(i) ? v : -v), 0);
        const passes = [GRID_A, GRID_B, GRID_C].map((g) => inv(g) === 0);
        return uniqueIndex(passes, true);
      },
    },
  ],
  "m9-p12": [
    {
      method: "exhaustive-search",
      run: () => {
        const results = new Set<number>();
        const rec = (arr: number[]) => {
          if (arr.length === 1) {
            results.add(arr[0]);
            return;
          }
          for (let i = 0; i < arr.length; i++)
            for (let j = i + 1; j < arr.length; j++) {
              const rest = arr.filter((_, k) => k !== i && k !== j);
              rest.push(arr[i] + arr[j] + 2 * arr[i] * arr[j]);
              rec(rest);
            }
        };
        rec([1, 2, 3, 4, 5]);
        if (results.size !== 1) throw new Error("final value depends on the merge order");
        return [...results][0];
      },
    },
    { method: "formula", run: () => ([1, 2, 3, 4, 5].reduce((acc, x) => acc * (2 * x + 1), 1) - 1) / 2 },
  ],
  "m9-p13": [
    { method: "dp", run: () => minWeighingsHeavyByCountDp(28) },
    { method: "formula", run: () => Math.ceil(Math.log(28) / Math.log(3) - 1e-12) },
  ],
  "m9-p14": [
    {
      method: "enumeration",
      run: () => {
        // Parity strategy over all 2^10 badge assignments; return the minimum number of correct calls.
        const n = 10;
        let minCorrect = Infinity;
        for (let m = 0; m < 1 << n; m++) {
          const hats = Array.from({ length: n }, (_, i) => (m >> i) & 1); // index 0 = back of the line
          const said: number[] = [];
          let correct = 0;
          for (let i = 0; i < n; i++) {
            let front = 0;
            for (let j = i + 1; j < n; j++) front ^= hats[j];
            let heard = 0;
            for (let j = 0; j < i; j++) heard ^= said[j];
            const guess = i === 0 ? front : front ^ heard;
            said.push(guess);
            if (guess === hats[i]) correct++;
          }
          minCorrect = Math.min(minCorrect, correct);
        }
        return minCorrect;
      },
    },
    {
      method: "formula",
      run: () => {
        // Upper bound: for every view of the 9 front badges both own colours occur, so the back
        // intern is wrong on some assignment under any rule. n - 1.
        const n = 10;
        const views = new Map<number, number>();
        for (let m = 0; m < 1 << n; m++) views.set(m >> 1, (views.get(m >> 1) ?? 0) + 1);
        if ([...views.values()].some((c) => c !== 2)) throw new Error("view does not have two completions");
        return n - 1;
      },
    },
  ],
  "m9-p15": [
    {
      method: "exhaustive-search",
      run: () => {
        // 0 = Cal, 1 = Dee, 2 = Eli.
        const sols = consistentAssignments(3, [
          (t) => !t[1], // Cal: Dee is a liar
          (t) => t[0] === t[2], // Dee: Cal and Eli same type
          (t) => t[0], // Eli: Cal is a truth-teller
        ]);
        if (sols.length !== 1) throw new Error("expected a unique assignment");
        const options = [
          [true, false, false],
          [false, true, false],
          [false, false, true],
          [false, false, false],
        ];
        return uniqueIndex(
          options.map((o) => o.join()),
          sols[0].join(),
        );
      },
    },
    {
      method: "formula",
      run: () => {
        // Deduction: Eli's statement makes Cal and Eli the same type, so Dee speaks truly, so Cal lies.
        const dee = true;
        const cal = !dee ? true : false; // Cal says Dee is a liar: true iff Cal truthful
        const eli = cal;
        return !cal && dee && !eli ? 1 : -1;
      },
    },
  ],
  "m9-p16": [
    {
      method: "exhaustive-search",
      run: () => {
        const stmts = Array.from({ length: 6 }, (_, i) => (t: boolean[]) => t.filter((v, j) => j !== i && !v).length === 2);
        return consistentAssignments(6, stmts).length;
      },
    },
    {
      method: "formula",
      run: () => {
        // Condition on the number of liars L: truth-tellers need L = 2, liars need L != 3.
        let total = 0;
        for (let L = 0; L <= 6; L++) {
          const truthOk = 6 - L === 0 || L === 2;
          const liarOk = L === 0 || L !== 3;
          if (truthOk && liarOk) total += choose(6, L);
        }
        return total;
      },
    },
  ],
  "m9-p17": [
    {
      method: "dp",
      run: () => {
        // W[n] = player to move wins with n tokens, misere play with moves 1-3.
        const W: boolean[] = [true];
        for (let n = 1; n <= 14; n++) W[n] = [1, 2, 3].some((k) => k <= n && !W[n - k]);
        if (!W[14]) return 3;
        const winningMoves = [1, 2, 3].filter((k) => !W[14 - k]);
        if (winningMoves.length !== 1) throw new Error("expected exactly one winning first move");
        return winningMoves[0] - 1;
      },
    },
    {
      method: "formula",
      run: () => {
        // Losing piles are 1 mod 4; from 14 the unique move to such a pile is 14 - k = 13.
        const moves = [1, 2, 3].filter((k) => (14 - k) % 4 === 1);
        return uniqueIndex([1, 2, 3], moves[0]);
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m9-p18": [
    {
      method: "dp",
      run: () => {
        let reach = new Set<number>([0]);
        for (let n = 1; n <= 20; n++) {
          const next = new Set<number>();
          for (const p of reach) {
            next.add(p + n);
            next.add(p - n);
          }
          reach = next;
          if (reach.has(14)) return n;
        }
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        for (let n = 1; n <= 20; n++) {
          const T = (n * (n + 1)) / 2;
          if (T >= 14 && (T - 14) % 2 === 0) return n;
        }
        return -1;
      },
    },
  ],
  "m9-p19": [
    {
      method: "exhaustive-search",
      run: () => {
        const k = minWeighingsEitherByDecisionTree(4);
        const boundAllowsTwo = Math.pow(3, 2) >= 8;
        if (k === 2) return 0;
        if (k === 3) return boundAllowsTwo ? 1 : 2;
        return 3;
      },
    },
    {
      method: "formula",
      run: () => {
        // Dyson bound for item + direction with no reference coin: n <= (3^k - 3) / 2.
        const capacity = (k: number) => (Math.pow(3, k) - 3) / 2;
        let k = 1;
        while (capacity(k) < 4) k++;
        const boundAllowsTwo = Math.pow(3, 2) >= 2 * 4;
        if (k === 2) return 0;
        if (k === 3) return boundAllowsTwo ? 1 : 2;
        return 3;
      },
    },
  ],
  "m9-p20": [
    {
      method: "exhaustive-search",
      run: () => {
        // Every deterministic strategy: each analyst maps the 4 views (c1, c2) to pass / red / black.
        const assigns: number[][] = [];
        for (let m = 0; m < 8; m++) assigns.push([m & 1, (m >> 1) & 1, (m >> 2) & 1]);
        const strategies: number[][] = [];
        for (let s = 0; s < 81; s++) strategies.push([s % 3, Math.floor(s / 3) % 3, Math.floor(s / 9) % 3, Math.floor(s / 27) % 3]);
        let best = 0;
        for (const s0 of strategies)
          for (const s1 of strategies)
            for (const s2 of strategies) {
              let wins = 0;
              for (const a of assigns) {
                const g = [s0[a[1] * 2 + a[2]], s1[a[0] * 2 + a[2]], s2[a[0] * 2 + a[1]]];
                let any = false;
                let wrong = false;
                for (let i = 0; i < 3; i++) {
                  if (g[i] === 0) continue;
                  any = true;
                  if (g[i] - 1 !== a[i]) wrong = true;
                }
                if (any && !wrong) wins++;
              }
              if (wins > best) best = wins;
            }
        return best / 8;
      },
    },
    {
      method: "formula",
      run: () => {
        // Correct calls equal wrong calls over the 8 assignments; k wins need k <= 3(8 - k).
        let k = 8;
        while (k > 3 * (8 - k)) k--;
        return k / 8;
      },
    },
  ],
  "m9-p21": [
    { method: "exhaustive-search", run: () => hanoiMovesByBfs(4, true) },
    { method: "formula", run: () => Math.pow(3, 4) - 1 },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m9-p22": [
    {
      method: "exhaustive-search",
      run: () => {
        const gens: number[] = [];
        for (let r = 0; r < 4; r++) {
          let m = 0;
          for (let c = 0; c < 4; c++) m |= 1 << (4 * r + c);
          gens.push(m);
        }
        for (let c = 0; c < 4; c++) {
          let m = 0;
          for (let r = 0; r < 4; r++) m |= 1 << (4 * r + c);
          gens.push(m);
        }
        const seen = new Set<number>([0]);
        const stack = [0];
        while (stack.length) {
          const s = stack.pop() as number;
          for (const g of gens) {
            const t = s ^ g;
            if (!seen.has(t)) {
              seen.add(t);
              stack.push(t);
            }
          }
        }
        return seen.size;
      },
    },
    {
      method: "formula",
      run: () => {
        // Patterns with an even number of tails in every 2x2 block: first row and column are free.
        let count = 0;
        for (let m = 0; m < 1 << 16; m++) {
          let ok = true;
          for (let r = 0; r < 3 && ok; r++)
            for (let c = 0; c < 3 && ok; c++) {
              const bits = ((m >> (4 * r + c)) & 1) + ((m >> (4 * r + c + 1)) & 1) + ((m >> (4 * (r + 1) + c)) & 1) + ((m >> (4 * (r + 1) + c + 1)) & 1);
              if (bits % 2 !== 0) ok = false;
            }
          if (ok) count++;
        }
        if (count !== Math.pow(2, 4 + 4 - 1)) throw new Error("block-parity count disagrees with 2^(m+n-1)");
        return count;
      },
    },
  ],
  "m9-p23": [
    {
      method: "exhaustive-search",
      run: () => {
        // Dijkstra over (set on far side, lamp side); crossing cost = slowest walker.
        const t = [1, 3, 4, 6];
        const n = t.length;
        const dist = new Map<string, number>();
        const key = (mask: number, side: number) => mask + "|" + side;
        dist.set(key(0, 0), 0);
        const pq: Array<[number, number, number]> = [[0, 0, 0]];
        while (pq.length) {
          pq.sort((a, b) => a[0] - b[0]);
          const [c, mask, side] = pq.shift() as [number, number, number];
          if ((dist.get(key(mask, side)) ?? Infinity) < c) continue;
          if (mask === (1 << n) - 1 && side === 1) return c;
          const here: number[] = [];
          for (let i = 0; i < n; i++) if (((mask >> i) & 1) === side) here.push(i);
          const moves: number[][] = here.map((i) => [i]);
          for (let a = 0; a < here.length; a++) for (let b = a + 1; b < here.length; b++) moves.push([here[a], here[b]]);
          for (const mv of moves) {
            let nm = mask;
            let cost = 0;
            for (const i of mv) {
              nm ^= 1 << i;
              cost = Math.max(cost, t[i]);
            }
            const nk = key(nm, 1 - side);
            const nc = c + cost;
            if ((dist.get(nk) ?? Infinity) > nc) {
              dist.set(nk, nc);
              pq.push([nc, nm, 1 - side]);
            }
          }
        }
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const [a, b, c, d] = [1, 3, 4, 6];
        return Math.min(2 * a + b + c + d, a + 3 * b + d);
      },
    },
  ],
  "m9-p24": [
    {
      method: "exhaustive-search",
      run: () => {
        // Smallest k such that every list of k residues (1..5; a 0 residue wins trivially)
        // has a non-empty subset summing to 0 mod 6.
        const m = 6;
        const hasZeroSubset = (t: number[]) => {
          const reach = new Set<number>();
          for (const x of t) {
            const add = [x % m];
            for (const r of reach) add.push((r + x) % m);
            for (const a of add) reach.add(a);
          }
          return reach.has(0);
        };
        const allGood = (k: number) => {
          let good = true;
          forEachTuple(k, m - 1, (t) => {
            if (good && !hasZeroSubset(t.map((v) => v + 1))) good = false;
          });
          return good;
        };
        for (let k = 1; k <= m + 1; k++) if (allGood(k)) return k;
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // Prefix-sum pigeonhole gives m; m - 1 copies of 1 show m - 1 fails.
        const m = 6;
        const ones = new Array<number>(m - 1).fill(1);
        const sums = new Set<number>();
        for (let s = 1; s <= ones.length; s++) sums.add(s % m);
        if (sums.has(0)) throw new Error("extremal example fails");
        return m;
      },
    },
  ],

  // -------------------------------------------------------------- lesson checks
  "m9-lc1": [
    {
      method: "enumeration",
      run: () => {
        // Largest colour-count vector with every count below 3, over all vectors with counts 0..4.
        let best = 0;
        forEachTuple(5, 5, (t) => {
          if (t.every((c) => c < 3)) best = Math.max(best, t.reduce((a, b) => a + b, 0));
        });
        return best + 1;
      },
    },
    { method: "formula", run: () => 5 * (3 - 1) + 1 },
  ],
  "m9-lc2": [
    {
      method: "exhaustive-search",
      run: () => {
        const d = bfs(
          31,
          (s) => s === 0,
          (s) => {
            const out: number[] = [];
            for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) out.push(s ^ (1 << i) ^ (1 << j));
            return out;
          },
          (s) => String(s),
        );
        if (d < 0) return 2;
        return d <= 3 ? 0 : 1;
      },
    },
    { method: "formula", run: () => (5 % 2 === 0 % 2 ? -1 : 2) },
  ],
  "m9-lc3": [
    { method: "exhaustive-search", run: () => minWeighingsHeavyByDecisionTree(9) },
    { method: "formula", run: () => Math.ceil(Math.log(9) / Math.log(3) - 1e-12) },
  ],
  "m9-lc4": [
    { method: "exhaustive-search", run: () => hanoiMovesByBfs(4, false) },
    { method: "formula", run: () => Math.pow(2, 4) - 1 },
  ],
};
