import type { VerifySpec } from "../types";
import type { Rng } from "@/lib/rng";
import { choose, die, forEachMask, forEachPermutation, forEachSubset, simulate, solveLinear } from "./helpers";

/**
 * Independent checks for brainteasers bt-041 .. bt-080. Logic and search puzzles are
 * settled by brute force over the whole state space (BFS, backtracking, game-tree search,
 * enumeration of truth assignments); counts are paired with a closed form or a DP table;
 * probability items pair an exact enumeration with a seeded simulation.
 */

// ------------------------------------------------------------------ generic helpers

/** Breadth-first shortest distance from `start` to the first state satisfying `isGoal`. */
function bfs<S>(start: S, key: (s: S) => string, next: (s: S) => S[], isGoal: (s: S) => boolean): number {
  const dist = new Map<string, number>([[key(start), 0]]);
  const queue: S[] = [start];
  let head = 0;
  while (head < queue.length) {
    const s = queue[head++];
    const d = dist.get(key(s))!;
    if (isGoal(s)) return d;
    for (const t of next(s)) {
      const k = key(t);
      if (!dist.has(k)) {
        dist.set(k, d + 1);
        queue.push(t);
      }
    }
  }
  return -1;
}

/** All states reachable from `start` (as a set of keys). */
function reachable<S>(start: S, key: (s: S) => string, next: (s: S) => S[]): Set<string> {
  const seen = new Set<string>([key(start)]);
  const queue: S[] = [start];
  let head = 0;
  while (head < queue.length) {
    const s = queue[head++];
    for (const t of next(s)) {
      const k = key(t);
      if (!seen.has(k)) {
        seen.add(k);
        queue.push(t);
      }
    }
  }
  return seen;
}

type Piece = Array<[number, number]>;
const STRAIGHT_TROMINO: Piece[] = [
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
];
const DOMINO: Piece[] = [
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
];
const DOMINO_AND_SQUARE: Piece[] = [...DOMINO, [[0, 0], [0, 1], [1, 0], [1, 1]]];

/** Count exact tilings of a rows x cols board (with some cells removed) by the given pieces, by backtracking on the first empty cell. */
function countTilings(rows: number, cols: number, removed: Array<[number, number]>, pieces: Piece[]): number {
  const grid: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  for (const [r, c] of removed) grid[r][c] = true;
  let count = 0;
  const rec = (): void => {
    let fr = -1;
    let fc = -1;
    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c]) {
          fr = r;
          fc = c;
          break outer;
        }
      }
    }
    if (fr < 0) {
      count++;
      return;
    }
    for (const p of pieces) {
      let ok = true;
      for (const [dr, dc] of p) {
        const r = fr + dr;
        const c = fc + dc;
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (const [dr, dc] of p) grid[fr + dr][fc + dc] = true;
      rec();
      for (const [dr, dc] of p) grid[fr + dr][fc + dc] = false;
    }
  };
  rec();
  return count;
}

function popcount(mask: number): number {
  let c = 0;
  while (mask) {
    mask &= mask - 1;
    c++;
  }
  return c;
}

/** Win/lose table for a subtraction game: W[n] = mover from n wins. `terminalWin` is W[0] (normal play: false; misere: true). */
function subtractionTable(n: number, moves: number[], terminalWin: boolean): boolean[] {
  const W: boolean[] = [terminalWin];
  for (let i = 1; i <= n; i++) W[i] = moves.some((m) => m <= i && !W[i - m]);
  return W;
}

// ------------------------------------------------------------------ item-specific models

/** bt-041: chip bowl moves (take one of two colours, add two of the third). */
function chipNext(s: number[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === j || s[i] === 0 || s[j] === 0) continue;
      const k = 3 - i - j;
      const n = s.slice();
      n[i]--;
      n[j]--;
      n[k] += 2;
      out.push(n);
    }
  }
  return out;
}

/** bt-045: effect mask of pressing button i on a row of n lamps. */
function lampPress(n: number, i: number): number {
  let m = 1 << i;
  if (i > 0) m |= 1 << (i - 1);
  if (i < n - 1) m |= 1 << (i + 1);
  return m;
}

/** bt-050: statements on a cycle of n: "both my neighbours are the opposite type to me". Consistent iff every speaker's statement truth equals their type. */
function cycleConsistent(mask: number, n: number): boolean {
  for (let i = 0; i < n; i++) {
    const me = (mask >> i) & 1;
    const left = (mask >> ((i + n - 1) % n)) & 1;
    const right = (mask >> ((i + 1) % n)) & 1;
    const stmt = left !== me && right !== me ? 1 : 0;
    if (stmt !== me) return false;
  }
  return true;
}

/**
 * Generic river-crossing BFS: items on the far bank as a mask plus the boat's side; `safe` judges an
 * unattended bank. With `allowEmpty` (a ferryman who can cross alone) the empty load is legal; without
 * it (a raft paddled by the passengers themselves) every crossing must carry at least one item.
 */
function riverCrossings(
  nItems: number,
  capacity: number,
  safe: (bank: number) => boolean,
  allowedPair?: (i: number, j: number) => boolean,
  allowEmpty = true,
): number {
  const full = (1 << nItems) - 1;
  type S = { far: number; side: number };
  return bfs<S>(
    { far: 0, side: 0 },
    (s) => `${s.far}:${s.side}`,
    (s) => {
      const here = s.side === 0 ? ~s.far & full : s.far;
      const idx: number[] = [];
      for (let i = 0; i < nItems; i++) if ((here >> i) & 1) idx.push(i);
      const loads: number[][] = allowEmpty ? [[]] : [];
      for (const i of idx) loads.push([i]);
      if (capacity >= 2) for (const i of idx) for (const j of idx) if (j > i && (!allowedPair || allowedPair(i, j))) loads.push([i, j]);
      const out: S[] = [];
      for (const load of loads) {
        let far = s.far;
        for (const i of load) far = s.side === 0 ? far | (1 << i) : far & ~(1 << i);
        const side = 1 - s.side;
        const unattended = side === 0 ? far : ~far & full;
        if (!safe(unattended)) continue;
        out.push({ far, side });
      }
      return out;
    },
    (s) => s.far === full && s.side === 1,
  );
}

/** bt-054: Dijkstra over (mask across, lamp side) with pair cost = slower member. */
function bridgeTime(times: number[]): number {
  const n = times.length;
  const full = (1 << n) - 1;
  const key = (m: number, s: number) => m * 2 + s;
  const dist = new Map<number, number>([[key(0, 0), 0]]);
  const done = new Set<number>();
  for (;;) {
    let bestKey = -1;
    let bestD = Infinity;
    for (const [k, d] of dist) {
      if (!done.has(k) && d < bestD) {
        bestD = d;
        bestKey = k;
      }
    }
    if (bestKey < 0) return -1;
    done.add(bestKey);
    const m = bestKey >> 1;
    const s = bestKey & 1;
    if (m === full) return bestD;
    const here = s === 0 ? ~m & full : m;
    const idx: number[] = [];
    for (let i = 0; i < n; i++) if ((here >> i) & 1) idx.push(i);
    const loads: number[][] = [];
    for (const i of idx) {
      loads.push([i]);
      for (const j of idx) if (j > i) loads.push([i, j]);
    }
    for (const load of loads) {
      let nm = m;
      for (const i of load) nm = s === 0 ? nm | (1 << i) : nm & ~(1 << i);
      const cost = Math.max(...load.map((i) => times[i]));
      const nk = key(nm, 1 - s);
      if (bestD + cost < (dist.get(nk) ?? Infinity)) dist.set(nk, bestD + cost);
    }
  }
}

/** bt-055: jug states (a in big jug, b in small jug) with fill / empty / pour moves. */
function jugNext(A: number, B: number): (s: [number, number]) => Array<[number, number]> {
  return ([a, b]) => {
    const p1 = Math.min(a, B - b);
    const p2 = Math.min(b, A - a);
    return [
      [A, b],
      [a, B],
      [0, b],
      [a, 0],
      [a - p1, b + p1],
      [a + p2, b - p2],
    ];
  };
}

/** bt-062 / bt-065: memoised cold-position test for two- and three-heap games. */
function makeColdTest(moves: (p: number[]) => number[][]): (p: number[]) => boolean {
  const memo = new Map<string, boolean>();
  const cold = (p: number[]): boolean => {
    const s = p.slice().sort((x, y) => x - y);
    const k = s.join(",");
    const hit = memo.get(k);
    if (hit !== undefined) return hit;
    let anyCold = false;
    for (const q of moves(s)) {
      if (cold(q)) {
        anyCold = true;
        break;
      }
    }
    memo.set(k, !anyCold);
    return !anyCold;
  };
  return cold;
}

function nimMoves(p: number[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < p.length; i++) for (let t = 1; t <= p[i]; t++) {
    const q = p.slice();
    q[i] -= t;
    out.push(q);
  }
  return out;
}

function wythoffMoves(p: number[]): number[][] {
  const out = nimMoves(p);
  const m = Math.min(p[0], p[1]);
  for (let t = 1; t <= m; t++) out.push([p[0] - t, p[1] - t]);
  return out;
}

/** bt-070: clockwise-only Hanoi state = post of each disc (0..2), index 0 = smallest. */
function cyclicHanoiMoves(n: number): number {
  const start = new Array<number>(n).fill(0);
  return bfs<number[]>(
    start,
    (s) => s.join(""),
    (s) => {
      const out: number[][] = [];
      for (let post = 0; post < 3; post++) {
        const top = s.indexOf(post); // smallest disc on this post
        if (top < 0) continue;
        const dest = (post + 1) % 3;
        const destTop = s.indexOf(dest);
        if (destTop >= 0 && destTop < top) continue; // would land on a smaller disc
        const t = s.slice();
        t[top] = dest;
        out.push(t);
      }
      return out;
    },
    (s) => s.every((p) => p === 1),
  );
}

/** bt-072: profile DP for domino tilings of a rows x cols board (column by column). */
function dominoTilingsProfile(rows: number, cols: number): number {
  const full = (1 << rows) - 1;
  // dp[mask] = number of ways where `mask` marks cells of the current column already covered (by horizontal dominoes from the previous column)
  let dp = new Map<number, number>([[0, 1]]);
  for (let c = 0; c < cols; c++) {
    const nd = new Map<number, number>();
    const fill = (mask: number, nextMask: number, row: number, ways: number): void => {
      if (row === rows) {
        nd.set(nextMask, (nd.get(nextMask) ?? 0) + ways);
        return;
      }
      if ((mask >> row) & 1) {
        fill(mask, nextMask, row + 1, ways);
        return;
      }
      // horizontal domino into the next column
      if (c + 1 < cols) fill(mask, nextMask | (1 << row), row + 1, ways);
      // vertical domino with the cell below
      if (row + 1 < rows && !((mask >> (row + 1)) & 1)) fill(mask | (1 << (row + 1)), nextMask, row + 2, ways);
    };
    for (const [mask, ways] of dp) fill(mask, 0, 0, ways);
    dp = nd;
  }
  return dp.get(0) ?? 0;
}

/** bt-076: the three-statement filter on a list of (letter, digit) slots. */
function commonKnowledgeSlots(codes: Array<[string, number]>): Array<[string, number]> {
  const byL = (l: string) => codes.filter((c) => c[0] === l);
  const byN = (n: number) => codes.filter((c) => c[1] === n);
  // Lena: does not know (letter has >= 2 slots) and is sure Omar does not know (every digit under her letter is non-unique).
  const s1 = codes.filter((c) => byL(c[0]).length >= 2 && byL(c[0]).every((d) => byN(d[1]).length >= 2));
  const letters1 = new Set(s1.map((c) => c[0]));
  // Omar: did not know (digit non-unique) but now does (exactly one slot with his digit has a surviving letter).
  const s2 = s1.filter((c) => byN(c[1]).length >= 2 && codes.filter((d) => d[1] === c[1] && letters1.has(d[0])).length === 1);
  // Lena: now knows (exactly one surviving slot with her letter).
  return s2.filter((c) => s2.filter((d) => d[0] === c[0]).length === 1);
}

const EXPECTED_SLOTS: Array<[string, number]> = [
  ["K", 2], ["K", 5], ["K", 8], ["M", 1], ["M", 5], ["M", 7], ["R", 3], ["R", 8], ["T", 1], ["T", 3], ["T", 6], ["W", 2], ["W", 3],
];

// ------------------------------------------------------------------ spec

export const spec: VerifySpec = {
  // -------------------------------------------------------------- invariants and parity
  "bt-041": [
    {
      method: "exhaustive-search",
      run: () => {
        const seen = reachable([5, 8, 10], (s) => s.join(","), chipNext);
        const mono = [[23, 0, 0], [0, 23, 0], [0, 0, 23]].map((t) => seen.has(t.join(",")));
        // options: 0 red only, 1 green only, 2 blue only, 3 any, 4 none
        if (mono.every(Boolean)) return 3;
        if (mono.every((x) => !x)) return 4;
        return mono.indexOf(true) === mono.lastIndexOf(true) ? mono.indexOf(true) : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const [r, g, b] = [5, 8, 10];
        // all colour X reachable only if the other two counts are congruent mod 3
        const canRed = (g - b) % 3 === 0;
        const canGreen = (r - b) % 3 === 0;
        const canBlue = (r - g) % 3 === 0;
        const flags = [canRed, canGreen, canBlue];
        if (flags.filter(Boolean).length !== 1) return -1;
        return flags.indexOf(true);
      },
    },
  ],
  "bt-042": [
    {
      method: "dp",
      run: () => {
        // For each subset of {1..8}, the set of values a merge sequence can leave; a set of size 1 confirms order independence.
        const n = 8;
        const vals: Array<Set<number> | null> = new Array(1 << n).fill(null);
        for (let i = 0; i < n; i++) vals[1 << i] = new Set([i + 1]);
        for (let mask = 1; mask < 1 << n; mask++) {
          if (vals[mask]) continue;
          const set = new Set<number>();
          // split mask into two non-empty disjoint parts (sub, mask ^ sub) with sub containing the lowest bit to avoid double work
          const low = mask & -mask;
          for (let sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
            if (!(sub & low)) continue;
            const rest = mask ^ sub;
            if (!rest) continue;
            for (const a of vals[sub]!) for (const b of vals[rest]!) set.add(a + b + a * b);
          }
          vals[mask] = set;
        }
        const finalSet = vals[(1 << n) - 1]!;
        if (finalSet.size !== 1) return -1;
        return [...finalSet][0];
      },
    },
    {
      method: "formula",
      run: () => {
        let prod = 1;
        for (let i = 1; i <= 8; i++) prod *= 1 + i;
        return prod - 1;
      },
    },
  ],
  "bt-043": [
    {
      method: "exhaustive-search",
      run: () => {
        const ok: Array<[number, number]> = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (countTilings(5, 5, [[r, c]], STRAIGHT_TROMINO) > 0) ok.push([r, c]);
        const corners = ok.filter(([r, c]) => (r === 0 || r === 4) && (c === 0 || c === 4)).length;
        const centre = ok.some(([r, c]) => r === 2 && c === 2);
        if (ok.length === 1 && centre) return 0;
        if (ok.length === 4 && corners === 4) return 1;
        if (ok.length === 5 && corners === 4 && centre) return 2;
        if (ok.length === 25) return 4;
        if (ok.every(([r, c]) => r === 0 || r === 4 || c === 0 || c === 4) && ok.length === 16) return 3;
        return -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // squares passing both diagonal 3-colouring filters
        const count = (f: (r: number, c: number) => number) => {
          const tally = [0, 0, 0];
          for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) tally[f(r, c)]++;
          return tally;
        };
        const mod = (x: number) => ((x % 3) + 3) % 3;
        const t1 = count((r, c) => mod(r + c));
        const t2 = count((r, c) => mod(r - c));
        const surplus1 = t1.indexOf(Math.max(...t1));
        const surplus2 = t2.indexOf(Math.max(...t2));
        const cand: Array<[number, number]> = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (mod(r + c) === surplus1 && mod(r - c) === surplus2) cand.push([r, c]);
        if (cand.length === 1 && cand[0][0] === 2 && cand[0][1] === 2 && countTilings(5, 5, [[2, 2]], STRAIGHT_TROMINO) > 0) return 0;
        return -1;
      },
    },
  ],
  "bt-044": [
    {
      method: "exhaustive-search",
      run: () => {
        const pairs: Array<Array<[number, number]>> = [
          [[0, 0], [5, 5]],
          [[0, 0], [0, 5]],
          [[0, 0], [2, 2]],
          [[1, 1], [4, 4]],
        ];
        const ok = pairs.map((p) => countTilings(6, 6, p, DOMINO) > 0);
        return ok.filter(Boolean).length === 1 ? ok.indexOf(true) : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const pairs = [
          [[1, 1], [6, 6]],
          [[1, 1], [1, 6]],
          [[1, 1], [3, 3]],
          [[2, 2], [5, 5]],
        ];
        const ok = pairs.map(([a, b]) => (a[0] + a[1]) % 2 !== (b[0] + b[1]) % 2);
        return ok.filter(Boolean).length === 1 ? ok.indexOf(true) : -1;
      },
    },
  ],
  "bt-045": [
    {
      method: "exhaustive-search",
      run: () => {
        const n = 7;
        const start = (1 << 1) | (1 << 5); // lamps 2 and 6 lit (0-based bits 1 and 5)
        return bfs<number>(
          start,
          (s) => String(s),
          (s) => Array.from({ length: n }, (_, i) => s ^ lampPress(n, i)),
          (s) => s === (1 << n) - 1,
        );
      },
    },
    {
      method: "enumeration",
      run: () => {
        const n = 7;
        const start = (1 << 1) | (1 << 5);
        const all = (1 << n) - 1;
        let best = Infinity;
        forEachMask(n, (set) => {
          let x = start;
          for (let i = 0; i < n; i++) if ((set >> i) & 1) x ^= lampPress(n, i);
          if (x === all) best = Math.min(best, popcount(set));
        });
        return best;
      },
    },
  ],
  "bt-046": [
    {
      method: "enumeration",
      run: () => {
        const open = new Array<boolean>(61).fill(false);
        for (let k = 1; k <= 30; k++) for (let m = k; m <= 60; m += k) open[m] = !open[m];
        return open.filter(Boolean).length;
      },
    },
    {
      method: "formula",
      run: () => {
        const isSquare = (m: number) => Number.isInteger(Math.sqrt(m));
        let count = 0;
        for (let m = 1; m <= 30; m++) if (isSquare(m)) count++;
        for (let m = 31; m <= 60; m++) if (!isSquare(m)) count++;
        return count;
      },
    },
  ],
  "bt-047": [
    {
      method: "exhaustive-search",
      run: () => {
        const n = 11;
        const start = (1 << 5) - 1; // five face-down cards
        return bfs<number>(
          start,
          (s) => String(s),
          (s) => {
            const out: number[] = [];
            forEachSubset(n, 3, (t) => out.push(s ^ (1 << t[0]) ^ (1 << t[1]) ^ (1 << t[2])));
            return out;
          },
          (s) => s === 0,
        );
      },
    },
    {
      method: "dp",
      run: () => {
        // state = number of face-down cards; a move flips j of them (0..3) and 3 - j face-up ones
        const n = 11;
        return bfs<number>(
          5,
          (d) => String(d),
          (d) => {
            const out: number[] = [];
            for (let j = 0; j <= 3; j++) if (j <= d && 3 - j <= n - d) out.push(d - j + (3 - j));
            return out;
          },
          (d) => d === 0,
        );
      },
    },
  ],

  // -------------------------------------------------------------- knights and knaves
  "bt-048": [
    {
      method: "exhaustive-search",
      run: () => {
        const worlds: Array<[boolean, boolean]> = [];
        for (const A of [false, true]) for (const B of [false, true]) if (A === (A === B)) worlds.push([A, B]);
        const aFixed = worlds.every((w) => w[0] === worlds[0][0]);
        const bFixed = worlds.every((w) => w[1] === worlds[0][1]);
        if (aFixed && !bFixed) return worlds[0][0] ? 0 : 1;
        if (bFixed && !aFixed) return worlds[0][1] ? 2 : 3;
        if (!aFixed && !bFixed) return 4;
        return -1;
      },
    },
  ],
  "bt-049": [
    {
      method: "exhaustive-search",
      run: () => {
        const counts = new Set<number>();
        forEachMask(4, (m) => {
          const P = !!(m & 1);
          const Q = !!(m & 2);
          const R = !!(m & 4);
          const S = !!(m & 8);
          const sP = !Q;
          const sQ = R && S;
          const sR = P !== Q;
          const sS = P === Q;
          if (P === sP && Q === sQ && R === sR && S === sS) counts.add(popcount(m));
        });
        return counts.size === 1 ? [...counts][0] : -1;
      },
    },
  ],
  "bt-050": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachMask(6, (m) => {
          if (cycleConsistent(m, 6)) count++;
        });
        return count;
      },
    },
    {
      method: "dp",
      run: () => {
        // Transfer matrix on consecutive triples: a seat's consistency depends on (left, me, right).
        // Count closed walks: state = (prev, cur); step adds next and checks the middle seat.
        const n = 6;
        const ok = (l: number, me: number, r: number) => ((l !== me && r !== me ? 1 : 0) === me);
        let total = 0;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
          // fix seats 0 = a, 1 = b; dp over seats 2..n-1, then close the cycle
          let states = new Map<string, number>([[`${a},${b}`, 1]]);
          for (let i = 2; i < n; i++) {
            const next = new Map<string, number>();
            for (const [k, w] of states) {
              const [p, c] = k.split(",").map(Number);
              for (let x = 0; x < 2; x++) if (ok(p, c, x)) next.set(`${c},${x}`, (next.get(`${c},${x}`) ?? 0) + w);
            }
            states = next;
          }
          for (const [k, w] of states) {
            const [p, c] = k.split(",").map(Number);
            if (ok(p, c, a) && ok(c, a, b)) total += w;
          }
        }
        return total;
      },
    },
  ],
  "bt-051": [
    {
      method: "exhaustive-search",
      run: () => {
        // roles: 0 Knight, 1 Knave, 2 Joker; people A, B, C
        const consistent: number[][] = [];
        forEachPermutation(3, (roles) => {
          const [A, B, C] = roles;
          const sA = C === 2;
          const sB = A === 0;
          const sC = B !== 1;
          const okRole = (role: number, s: boolean) => (role === 0 ? s : role === 1 ? !s : true);
          if (okRole(A, sA) && okRole(B, sB) && okRole(C, sC)) consistent.push(roles);
        });
        const knights = new Set(consistent.map((r) => r.indexOf(0)));
        if (knights.size !== 1) return 3;
        return [...knights][0];
      },
    },
  ],
  "bt-052": [
    {
      method: "exhaustive-search",
      run: () => {
        const worlds: number[] = [];
        forEachMask(3, (m) => {
          const A = !!(m & 1);
          const B = !!(m & 2);
          const C = !!(m & 4);
          if (A === !B && B === (A === C) && C === !A) worlds.push(m);
        });
        if (worlds.length !== 1) return -1;
        // options as (A, B, C) knight flags
        const options: Array<[boolean, boolean, boolean]> = [
          [true, false, false],
          [false, true, true],
          [true, true, false],
          [false, false, true],
        ];
        const w = worlds[0];
        return options.findIndex((o) => o[0] === !!(w & 1) && o[1] === !!(w & 2) && o[2] === !!(w & 4));
      },
    },
  ],

  // -------------------------------------------------------------- structured search
  "bt-053": [
    {
      method: "exhaustive-search",
      run: () => {
        // items: 0 hawk, 1 dove, 2 seed, 3 tortoise; unattended conflicts hawk-dove and dove-seed
        const safe = (bank: number) => !(((bank >> 0) & 1 && (bank >> 1) & 1) || ((bank >> 1) & 1 && (bank >> 2) & 1));
        return riverCrossings(4, 1, safe);
      },
    },
    {
      method: "formula",
      run: () => {
        // Lower bound: the conflicted middle item must cross forward twice, so forward trips = items + 1 and returns = forward - 1.
        const items = 4;
        const forward = items + 1;
        return forward + (forward - 1);
      },
    },
  ],
  "bt-054": [
    { method: "exhaustive-search", run: () => bridgeTime([1, 3, 6, 8, 12]) },
    {
      method: "dp",
      run: () => {
        const t = [1, 3, 6, 8, 12];
        const C = (k: number): number => {
          if (k === 1) return t[0];
          if (k === 2) return t[1];
          if (k === 3) return t[0] + t[1] + t[2];
          return Math.min(t[0] + 2 * t[1] + t[k - 1], 2 * t[0] + t[k - 2] + t[k - 1]) + C(k - 2);
        };
        return C(t.length);
      },
    },
  ],
  "bt-055": [
    {
      method: "exhaustive-search",
      run: () => bfs<[number, number]>([0, 0], (s) => `${s[0]},${s[1]}`, jugNext(9, 4), (s) => s[0] === 6),
    },
    {
      method: "enumeration",
      run: () => {
        // Depth-limited enumeration of all action sequences; the smallest depth that reaches 6 in the big jug.
        const next = jugNext(9, 4);
        const reachesAtDepth = (depth: number): boolean => {
          const rec = (s: [number, number], d: number): boolean => {
            if (s[0] === 6) return true;
            if (d === depth) return false;
            return next(s).some((t) => rec(t, d + 1));
          };
          return rec([0, 0], 0);
        };
        for (let d = 0; d <= 12; d++) if (reachesAtDepth(d)) return d;
        return -1;
      },
    },
  ],
  "bt-056": [
    { method: "formula", run: () => Math.ceil(Math.log2(choose(10, 2))) },
    {
      method: "enumeration",
      run: () => {
        let pairs = 0;
        forEachSubset(10, 2, () => pairs++);
        let k = 0;
        while (2 ** k < pairs) k++;
        return k;
      },
    },
  ],
  "bt-057": [
    {
      method: "exhaustive-search",
      run: () => {
        const moves: Array<[number, number]> = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
        return bfs<[number, number]>(
          [0, 0],
          (s) => `${s[0]},${s[1]}`,
          (s) => moves.map(([dr, dc]) => [s[0] + dr, s[1] + dc] as [number, number]).filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8),
          (s) => s[0] === 6 && s[1] === 7, // g8 = file 7 (index 6), rank 8 (index 7)
        );
      },
    },
    {
      method: "enumeration",
      run: () => {
        // Enumerate all move sequences up to length 6 and record the shortest that lands on g8.
        const moves: Array<[number, number]> = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
        let best = Infinity;
        const rec = (f: number, r: number, depth: number): void => {
          if (f === 6 && r === 7) {
            best = Math.min(best, depth);
            return;
          }
          if (depth >= 6 || depth >= best) return;
          for (const [df, dr] of moves) {
            const nf = f + df;
            const nr = r + dr;
            if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;
            rec(nf, nr, depth + 1);
          }
        };
        rec(0, 0, 0);
        return best;
      },
    },
  ],
  "bt-058": [
    {
      method: "exhaustive-search",
      run: () => {
        const start = [3, 5, 0, 2, 1, 4]; // D F A C B E
        return bfs<number[]>(
          start,
          (p) => p.join(""),
          (p) => {
            const out: number[][] = [];
            for (let i = 0; i < p.length; i++) {
              const rest = p.filter((_, j) => j !== i);
              for (let k = 0; k <= rest.length; k++) {
                if (k === i) continue;
                const np = rest.slice();
                np.splice(k, 0, p[i]);
                out.push(np);
              }
            }
            return out;
          },
          (p) => p.every((x, i) => x === i),
        );
      },
    },
    {
      method: "formula",
      run: () => {
        const s = [3, 5, 0, 2, 1, 4];
        const lis = new Array<number>(s.length).fill(1);
        for (let i = 0; i < s.length; i++) for (let j = 0; j < i; j++) if (s[j] < s[i]) lis[i] = Math.max(lis[i], lis[j] + 1);
        return s.length - Math.max(...lis);
      },
    },
  ],
  "bt-059": [
    {
      method: "exhaustive-search",
      run: () => {
        const n = 4;
        const start = "R".repeat(n) + "_" + "B".repeat(n);
        const goal = "B".repeat(n) + "_" + "R".repeat(n);
        return bfs<string>(
          start,
          (s) => s,
          (s) => {
            const g = s.indexOf("_");
            const from: number[] = [];
            if (g - 1 >= 0 && s[g - 1] === "R") from.push(g - 1);
            if (g - 2 >= 0 && s[g - 2] === "R" && s[g - 1] === "B") from.push(g - 2);
            if (g + 1 < s.length && s[g + 1] === "B") from.push(g + 1);
            if (g + 2 < s.length && s[g + 2] === "B" && s[g + 1] === "R") from.push(g + 2);
            return from.map((i) => {
              const arr = s.split("");
              arr[g] = arr[i];
              arr[i] = "_";
              return arr.join("");
            });
          },
          (s) => s === goal,
        );
      },
    },
    { method: "formula", run: () => (4 + 1) ** 2 - 1 },
  ],
  "bt-060": [
    {
      method: "exhaustive-search",
      run: () => {
        const w = [100, 90, 70, 40, 30];
        return riverCrossings(5, 2, () => true, (i, j) => w[i] + w[j] <= 130, false);
      },
    },
    {
      method: "formula",
      run: () => {
        // k forward trips leave at most k + 1 people across, so k >= n - 1 and crossings >= 2k - 1; the light shuttle achieves it.
        const n = 5;
        const w = [100, 90, 70, 40, 30];
        const shuttle = Math.min(...w);
        const everyoneCanRideWithShuttle = w.every((x) => x === shuttle || x + shuttle <= 130);
        return everyoneCanRideWithShuttle ? 2 * (n - 1) - 1 : -1;
      },
    },
  ],

  // -------------------------------------------------------------- game strategy
  "bt-061": [
    {
      method: "exhaustive-search",
      run: () => {
        // Recursive game tree with memo from 25.
        const memo = new Map<number, boolean>();
        const win = (n: number): boolean => {
          if (n === 0) return false;
          const hit = memo.get(n);
          if (hit !== undefined) return hit;
          const w = [1, 3, 4].some((m) => m <= n && !win(n - m));
          memo.set(n, w);
          return w;
        };
        if (!win(25)) return 3;
        const winning = [1, 3, 4].filter((m) => !win(25 - m));
        if (winning.length !== 1) return -1;
        return [1, 3, 4].indexOf(winning[0]);
      },
    },
    {
      method: "formula",
      run: () => {
        // Losing sizes are 0 or 2 mod 7 (verified against the table to 40).
        const losing = (n: number) => n % 7 === 0 || n % 7 === 2;
        const W = subtractionTable(40, [1, 3, 4], false);
        for (let n = 0; n <= 40; n++) if (W[n] === losing(n)) return -1;
        if (losing(25)) return 3;
        const winning = [1, 3, 4].filter((m) => losing(25 - m));
        return winning.length === 1 ? [1, 3, 4].indexOf(winning[0]) : -1;
      },
    },
  ],
  "bt-062": [
    {
      method: "exhaustive-search",
      run: () => {
        const cold = makeColdTest(nimMoves);
        const p = [5, 8, 11];
        const winning: Array<[number, number]> = [];
        for (let i = 0; i < 3; i++) for (let t = 1; t <= p[i]; t++) {
          const q = p.slice();
          q[i] -= t;
          if (cold(q)) winning.push([i, t]);
        }
        return winning.length === 1 ? winning[0][1] : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const p = [5, 8, 11];
        const x = p.reduce((a, b) => a ^ b, 0);
        const moves = p.map((h) => h - (h ^ x)).filter((t) => t > 0);
        return moves.length === 1 ? moves[0] : -1;
      },
    },
  ],
  "bt-063": [
    {
      method: "dp",
      run: () => {
        const c = [4, 9, 1, 7, 6, 3];
        const n = c.length;
        const S: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
        const V: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
        for (let i = 0; i < n; i++) {
          let s = 0;
          for (let j = i; j < n; j++) {
            s += c[j];
            S[i][j] = s;
          }
        }
        for (let len = 1; len <= n; len++) {
          for (let i = 0; i + len - 1 < n; i++) {
            const j = i + len - 1;
            if (len === 1) {
              V[i][j] = c[i];
              continue;
            }
            const takeLeft = c[i] + S[i + 1][j] - V[i + 1][j];
            const takeRight = c[j] + S[i][j - 1] - V[i][j - 1];
            V[i][j] = Math.max(takeLeft, takeRight);
          }
        }
        return V[0][n - 1];
      },
    },
    {
      method: "exhaustive-search",
      run: () => {
        // Plain minimax without memo: first player maximises own total, second minimises it.
        const c = [4, 9, 1, 7, 6, 3];
        const val = (i: number, j: number, firstToMove: boolean): number => {
          if (i > j) return 0;
          const left = (firstToMove ? c[i] : 0) + val(i + 1, j, !firstToMove);
          const right = (firstToMove ? c[j] : 0) + val(i, j - 1, !firstToMove);
          return firstToMove ? Math.max(left, right) : Math.min(left, right);
        };
        return val(0, c.length - 1, true);
      },
    },
  ],
  "bt-064": [
    {
      method: "exhaustive-search",
      run: () => {
        const squares = [1, 4, 9, 16];
        const memo = new Map<number, boolean>();
        const win = (n: number): boolean => {
          if (n === 0) return false;
          const hit = memo.get(n);
          if (hit !== undefined) return hit;
          const w = squares.some((m) => m <= n && !win(n - m));
          memo.set(n, w);
          return w;
        };
        if (!win(22)) return 4;
        const winning = squares.filter((m) => m <= 22 && !win(22 - m));
        return winning.length === 1 ? squares.indexOf(winning[0]) : -1;
      },
    },
    {
      method: "dp",
      run: () => {
        const squares = [1, 4, 9, 16];
        const W = subtractionTable(22, squares, false);
        if (!W[22]) return 4;
        const winning = squares.filter((m) => !W[22 - m]);
        return winning.length === 1 ? squares.indexOf(winning[0]) : -1;
      },
    },
  ],
  "bt-065": [
    {
      method: "exhaustive-search",
      run: () => {
        const cold = makeColdTest(wythoffMoves);
        const [a, b] = [8, 11];
        const winning: number[] = []; // total tokens removed by each winning move
        for (let t = 1; t <= a; t++) if (cold([a - t, b])) winning.push(t);
        for (let t = 1; t <= b; t++) if (cold([a, b - t])) winning.push(t);
        for (let t = 1; t <= a; t++) if (cold([a - t, b - t])) winning.push(2 * t);
        return winning.length === 1 ? winning[0] : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // Cold pairs (floor(k phi), floor(k phi^2)); find the unique one reachable from (8, 11).
        const phi = (1 + Math.sqrt(5)) / 2;
        const coldPairs: Array<[number, number]> = [[0, 0]];
        for (let k = 1; k <= 20; k++) coldPairs.push([Math.floor(k * phi), Math.floor(k * phi * phi)]);
        const isCold = (x: number, y: number) => {
          const [a, b] = x <= y ? [x, y] : [y, x];
          return coldPairs.some(([p, q]) => p === a && q === b);
        };
        const [a, b] = [8, 11];
        const winning: number[] = [];
        for (let t = 1; t <= a; t++) if (isCold(a - t, b)) winning.push(t);
        for (let t = 1; t <= b; t++) if (isCold(a, b - t)) winning.push(t);
        for (let t = 1; t <= a; t++) if (isCold(a - t, b - t)) winning.push(2 * t);
        return winning.length === 1 ? winning[0] : -1;
      },
    },
  ],
  "bt-066": [
    {
      method: "exhaustive-search",
      run: () => {
        // Misere: at 0 the player to move has already won (the opponent took the last match).
        const memo = new Map<number, boolean>();
        const win = (n: number): boolean => {
          if (n === 0) return true;
          const hit = memo.get(n);
          if (hit !== undefined) return hit;
          const w = [1, 2, 3].some((m) => m <= n && !win(n - m));
          memo.set(n, w);
          return w;
        };
        if (!win(15)) return 3;
        const winning = [1, 2, 3].filter((m) => !win(15 - m));
        return winning.length === 1 ? winning[0] - 1 : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        const losing = (n: number) => n % 4 === 1;
        if (losing(15)) return 3;
        const winning = [1, 2, 3].filter((m) => losing(15 - m));
        return winning.length === 1 ? winning[0] - 1 : -1;
      },
    },
  ],

  // -------------------------------------------------------------- induction and recursion counts
  "bt-067": [
    {
      method: "dp",
      run: () => {
        const a = [1, 1];
        for (let i = 2; i <= 9; i++) a[i] = a[i - 1] + 2 * a[i - 2];
        return a[9];
      },
    },
    { method: "exhaustive-search", run: () => countTilings(2, 9, [], DOMINO_AND_SQUARE) },
  ],
  "bt-068": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachMask(9, (m) => {
          // bit 1 = loss; reject any three consecutive losses
          let run = 0;
          let ok = true;
          for (let i = 0; i < 9; i++) {
            run = (m >> i) & 1 ? run + 1 : 0;
            if (run === 3) {
              ok = false;
              break;
            }
          }
          if (ok) count++;
        });
        return count;
      },
    },
    {
      method: "dp",
      run: () => {
        const t = [1, 2, 4];
        for (let i = 3; i <= 9; i++) t[i] = t[i - 1] + t[i - 2] + t[i - 3];
        return t[9];
      },
    },
  ],
  "bt-069": [
    { method: "formula", run: () => 1 + choose(7, 2) + choose(7, 4) },
    {
      method: "enumeration",
      run: () => {
        // Place 7 points at irregular angles, count distinct interior chord intersections, apply Euler.
        const n = 7;
        const angles = [0.1, 0.9, 1.7, 2.9, 3.6, 4.8, 5.7];
        const pts = angles.map((a) => [Math.cos(a), Math.sin(a)] as [number, number]);
        const chords: Array<[number, number]> = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) chords.push([i, j]);
        const cross = (p: [number, number], q: [number, number], r: [number, number], s: [number, number]): [number, number] | null => {
          const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
          if (Math.abs(d) < 1e-12) return null;
          const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
          const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
          if (t <= 1e-9 || t >= 1 - 1e-9 || u <= 1e-9 || u >= 1 - 1e-9) return null;
          return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
        };
        const interior = new Set<string>();
        let segmentsOnChords = chords.length;
        for (let a = 0; a < chords.length; a++) {
          let hits = 0;
          for (let b = 0; b < chords.length; b++) {
            if (a === b) continue;
            const [i, j] = chords[a];
            const [k, l] = chords[b];
            if (i === k || i === l || j === k || j === l) continue;
            const x = cross(pts[i], pts[j], pts[k], pts[l]);
            if (x) {
              hits++;
              interior.add(`${x[0].toFixed(7)},${x[1].toFixed(7)}`);
            }
          }
          segmentsOnChords += hits; // each crossing adds one more segment to this chord
        }
        const V = n + interior.size;
        const E = n + segmentsOnChords; // n boundary arcs plus chord segments
        const F = E - V + 2;
        return F - 1; // exclude the outer face
      },
    },
  ],
  "bt-070": [
    { method: "exhaustive-search", run: () => cyclicHanoiMoves(4) },
    {
      method: "recursion",
      run: () => {
        let a = 1; // one post clockwise
        let b = 2; // two posts clockwise
        for (let i = 2; i <= 4; i++) {
          const na = 2 * b + 1;
          const nb = 2 * b + a + 2;
          a = na;
          b = nb;
        }
        return a;
      },
    },
  ],
  "bt-071": [
    {
      method: "dp",
      run: () => {
        const c = [1, 1, 2];
        for (let i = 3; i <= 7; i++) c[i] = c[i - 1] + c[i - 2] + c[i - 3];
        return c[7];
      },
    },
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        const rec = (rem: number): void => {
          if (rem === 0) {
            count++;
            return;
          }
          for (const p of [1, 2, 3]) if (p <= rem) rec(rem - p);
        };
        rec(7);
        return count;
      },
    },
  ],
  "bt-072": [
    { method: "exhaustive-search", run: () => countTilings(3, 8, [], DOMINO) },
    { method: "dp", run: () => dominoTilingsProfile(3, 8) },
  ],

  // -------------------------------------------------------------- logic deductions
  "bt-073": [
    {
      method: "exhaustive-search",
      run: () => {
        // runners: 0 Ana, 1 Ben, 2 Cho, 3 Dev, 4 Eli; perm[position] = runner
        const choPositions = new Set<number>();
        forEachPermutation(5, (p) => {
          const pos = (r: number) => p.indexOf(r);
          if (pos(1) !== pos(0) + 2) return;
          if (pos(4) === 0 || pos(4) === 4) return;
          if (pos(3) !== pos(4) + 1) return;
          if (!(pos(2) < pos(3))) return;
          choPositions.add(pos(2) + 1);
        });
        return choPositions.size === 1 ? [...choPositions][0] : -1;
      },
    },
  ],
  "bt-074": [
    {
      method: "exhaustive-search",
      run: () => {
        // meetings: 0 Risk, 1 Audit, 2 Hiring, 3 Budget; perm[meeting] = day (0 Mon .. 3 Thu)
        const wednesday = new Set<number>();
        let solutions = 0;
        forEachPermutation(4, (d) => {
          const [R, A, H, B] = d;
          if (!(A > R)) return;
          if (Math.abs(H - B) !== 1) return;
          if (R === 0) return;
          if (B === 3) return;
          solutions++;
          wednesday.add(d.indexOf(2));
        });
        if (solutions === 0) return -1;
        return wednesday.size === 1 ? [...wednesday][0] : 4;
      },
    },
  ],
  "bt-075": [
    {
      method: "enumeration",
      run: () => {
        const sols: number[] = [];
        for (let n = 100; n <= 999; n++) {
          const h = Math.floor(n / 100);
          const t = Math.floor(n / 10) % 10;
          const u = n % 10;
          if (new Set([h, t, u]).size !== 3) continue;
          if (h + t + u !== 17) continue;
          if (h !== u + 3) continue;
          if (n % 4 !== 0) continue;
          sols.push(n);
        }
        return sols.length === 1 ? sols[0] : -1;
      },
    },
    {
      method: "formula",
      run: () => {
        // t = 14 - 2u, h = u + 3; digit bounds then the last-two-digits test for 4.
        const sols: number[] = [];
        for (let u = 0; u <= 9; u++) {
          const h = u + 3;
          const t = 14 - 2 * u;
          if (h > 9 || t < 0 || t > 9) continue;
          if (h === t || t === u || h === u) continue;
          if ((10 * t + u) % 4 !== 0) continue;
          sols.push(100 * h + 10 * t + u);
        }
        return sols.length === 1 ? sols[0] : -1;
      },
    },
  ],
  "bt-076": [
    {
      method: "exhaustive-search",
      run: () => {
        const final = commonKnowledgeSlots(EXPECTED_SLOTS);
        return final.length === 1 ? final[0][1] : -1;
      },
    },
  ],

  // -------------------------------------------------------------- probability traps
  "bt-077": [
    {
      method: "enumeration",
      run: () => {
        // Sum the joint law P(N = n, all earlier rolls even) over n and normalise.
        let num = 0;
        let den = 0;
        for (let n = 1; n <= 400; n++) {
          const p = Math.pow(2 / 6, n - 1) * (1 / 6);
          num += n * p;
          den += p;
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng: Rng) =>
        simulate(rng, 1_000_000, (r) => {
          // Rejection sampling: replay the game until a run with only even faces before the 6 occurs.
          for (;;) {
            let n = 0;
            let ok = true;
            for (;;) {
              n++;
              const face = die(r);
              if (face === 6) break;
              if (face % 2 === 1) {
                ok = false;
                break;
              }
            }
            if (ok) return n;
          }
        }),
    },
  ],
  "bt-078": [
    {
      method: "enumeration",
      run: () => {
        let same = 0;
        forEachMask(3, (m) => {
          if (m === 0 || m === 7) same++;
        });
        const evA = (10 * same) / 8;
        const isPrime = (k: number) => k >= 2 && [2, 3, 5, 7].includes(k);
        let primes = 0;
        for (let f = 1; f <= 6; f++) if (isPrime(f)) primes++;
        const evB = (4 * primes) / 6;
        let faces = 0;
        for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) if (r >= 11) faces++;
        const evC = (12 * faces) / 52;
        const evs = [evA, evB, evC];
        const best = Math.max(...evs);
        if (evs.filter((v) => Math.abs(v - best) < 1e-12).length > 1) return 3;
        return evs.indexOf(best);
      },
    },
    {
      method: "formula",
      run: () => {
        const evs = [10 * (2 / 8), 4 * (3 / 6), 12 * (12 / 52)];
        const best = Math.max(...evs);
        if (evs.filter((v) => Math.abs(v - best) < 1e-12).length > 1) return 3;
        return evs.indexOf(best);
      },
    },
  ],
  "bt-079": [
    {
      method: "recursion",
      run: () => {
        // V = (2/6)(-3) + (3 + 4 + 5)/6 + (1/6)(2V)  =>  (1 - 2/6) V = 1
        const [V] = solveLinear([[1 - 2 / 6]], [(2 / 6) * -3 + (3 + 4 + 5) / 6]);
        return V;
      },
    },
    {
      method: "simulation",
      run: (rng: Rng) =>
        // The doubling tail gives the payout a standard deviation near 5.6, so 6M trials are needed for 6se < 1% of 1.5.
        simulate(rng, 6_000_000, (r) => {
          let mult = 1;
          for (;;) {
            const face = die(r);
            if (face <= 2) return -3 * mult;
            if (face <= 5) return face * mult;
            mult *= 2;
          }
        }),
    },
  ],
  "bt-080": [
    {
      method: "enumeration",
      run: () => {
        const moreHeads = (flips: number) => {
          let wins = 0;
          forEachMask(flips, (m) => {
            if (popcount(m) > flips - popcount(m)) wins++;
          });
          return wins / 2 ** flips;
        };
        const pA = moreHeads(4);
        const pB = moreHeads(5);
        if (Math.abs(pA - pB) < 1e-12) return 2;
        return pA > pB ? 0 : 1;
      },
    },
    {
      method: "formula",
      run: () => {
        const pA = (choose(4, 3) + choose(4, 4)) / 16;
        const pB = 0.5;
        if (Math.abs(pA - pB) < 1e-12) return 2;
        return pA > pB ? 0 : 1;
      },
    },
  ],
};
