import type { VerifySpec } from "../types";
import {
  choose,
  die,
  factorial,
  forEachDice,
  forEachMask,
  forEachPermutation,
  forEachSubset,
  forEachTuple,
  perm,
  simulateProb,
} from "./helpers";

/**
 * Independent checks for module 1 problems. Each check recomputes the answer by a route
 * that does not reuse the worked solution's reasoning (brute force enumeration or
 * Monte Carlo simulation wherever possible), paired with a closed form or a DP table.
 */

/** Number of monotone lattice paths from (0,0) to (east, north) avoiding the blocked points. */
function latticePaths(east: number, north: number, blocked: Array<[number, number]> = []): number {
  const grid: number[][] = Array.from({ length: east + 1 }, () => new Array<number>(north + 1).fill(0));
  grid[0][0] = 1;
  for (let x = 0; x <= east; x++) {
    for (let y = 0; y <= north; y++) {
      if (x === 0 && y === 0) continue;
      if (blocked.some(([bx, by]) => bx === x && by === y)) {
        grid[x][y] = 0;
        continue;
      }
      grid[x][y] = (x > 0 ? grid[x - 1][y] : 0) + (y > 0 ? grid[x][y - 1] : 0);
    }
  }
  return grid[east][north];
}

/** Inclusion-exclusion sum for the derangement count D_n (not the recurrence in helpers). */
function derangementsByInclusionExclusion(n: number): number {
  let sum = 0;
  for (let k = 0; k <= n; k++) sum += ((k % 2 === 0 ? 1 : -1) * factorial(n)) / factorial(k);
  return Math.round(sum);
}

/** Count of perfect matchings on `n` labelled points by always matching the lowest unmatched point. */
function countMatchings(n: number): number {
  const used = new Array<boolean>(n).fill(false);
  const rec = (): number => {
    const first = used.indexOf(false);
    if (first === -1) return 1;
    used[first] = true;
    let total = 0;
    for (let j = first + 1; j < n; j++) {
      if (used[j]) continue;
      used[j] = true;
      total += rec();
      used[j] = false;
    }
    used[first] = false;
    return total;
  };
  return rec();
}

function popcount(mask: number): number {
  let c = 0;
  while (mask) {
    mask &= mask - 1;
    c++;
  }
  return c;
}

export const spec: VerifySpec = {
  "m1-p01": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachTuple(4, 10, (t) => {
          if (new Set(t).size === 4) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => perm(10, 4) },
  ],
  "m1-p02": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachDice(5, (d) => {
          total++;
          if (d.includes(5)) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          for (let i = 0; i < 5; i++) if (die(r) === 5) return true;
          return false;
        }),
    },
  ],

  // -------------------------------------------------------------- difficulty 1
  "m1-p03": [
    {
      method: "enumeration",
      run: () => {
        // Position 0 is a letter (26 symbols); positions 1 and 2 must be digits (symbols 0-9).
        let count = 0;
        forEachTuple(3, 26, (t) => {
          if (t[1] < 10 && t[2] < 10) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => 26 * 10 * 10 },
  ],
  "m1-p04": [
    {
      method: "enumeration",
      run: () => {
        // Symbols: 0 = B, 1 = S, 2 = C. Count strings with exactly 4 B, 2 S, 1 C.
        let count = 0;
        forEachTuple(7, 3, (t) => {
          const n = [0, 0, 0];
          for (const x of t) n[x]++;
          if (n[0] === 4 && n[1] === 2 && n[2] === 1) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(7, 4) * choose(3, 2) },
  ],
  "m1-p05": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) count++;
        return count;
      },
    },
    { method: "formula", run: () => (12 * 11) / 2 },
  ],

  // -------------------------------------------------------------- difficulty 2
  "m1-p06": [
    {
      method: "enumeration",
      run: () => {
        // Canonicalise every row seating by rotating person 0 to the front; count distinct classes.
        const classes = new Set<string>();
        forEachPermutation(7, (p) => {
          const i = p.indexOf(0);
          classes.add(p.slice(i).concat(p.slice(0, i)).join(","));
        });
        return classes.size;
      },
    },
    { method: "formula", run: () => factorial(6) },
  ],
  "m1-p07": [
    {
      method: "enumeration",
      run: () => {
        // Analyst 0 is the lead (must be in), analyst 1 is on leave (must be out).
        let count = 0;
        forEachSubset(10, 4, (s) => {
          if (s.includes(0) && !s.includes(1)) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(8, 3) },
  ],
  "m1-p08": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachTuple(4, 11, (t) => {
          if (t[0] + t[1] + t[2] + t[3] === 10) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(13, 3) },
  ],
  "m1-p09": [
    {
      method: "enumeration",
      run: () => {
        // Tokens 0-4 are red, 5-11 are blue.
        let hit = 0;
        let total = 0;
        forEachSubset(12, 3, (s) => {
          total++;
          if (s.some((x) => x < 5)) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const red = 5;
          let total = 12;
          for (let i = 0; i < 3; i++) {
            if (r() * total < red) return true;
            total--;
          }
          return false;
        }),
    },
  ],
  "m1-p10": [
    { method: "dp", run: () => latticePaths(5, 4) },
    { method: "formula", run: () => choose(9, 4) },
  ],
  "m1-p11": [
    {
      method: "enumeration",
      run: () => {
        // Books 0 and 1 are the two volumes.
        let count = 0;
        forEachPermutation(6, (p) => {
          if (Math.abs(p.indexOf(0) - p.indexOf(1)) === 1) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => 2 * factorial(5) },
  ],

  // -------------------------------------------------------------- difficulty 3
  "m1-p12": [
    {
      method: "enumeration",
      run: () => {
        // People 0, 1, 2 are the new hires.
        let count = 0;
        forEachPermutation(7, (p) => {
          let ok = true;
          for (let i = 0; i < 6; i++) {
            if (p[i] < 3 && p[i + 1] < 3) {
              ok = false;
              break;
            }
          }
          if (ok) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => factorial(4) * choose(5, 3) * factorial(3) },
  ],
  "m1-p13": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachTuple(4, 16, (t) => {
          if (t[0] + t[1] + t[2] + t[3] === 15 && t.every((x) => x >= 2)) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(10, 3) },
  ],
  "m1-p14": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachTuple(4, 10, (t) => {
          total++;
          if (t.includes(7) && t.includes(0)) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "formula",
      run: () => {
        // Direct multinomial count: a sevens, b zeros, the other 4-a-b digits from the remaining 8.
        let count = 0;
        for (let a = 1; a <= 4; a++) {
          for (let b = 1; a + b <= 4; b++) {
            const rest = 4 - a - b;
            count += (factorial(4) / (factorial(a) * factorial(b) * factorial(rest))) * Math.pow(8, rest);
          }
        }
        return count / Math.pow(10, 4);
      },
    },
  ],
  "m1-p15": [
    { method: "formula", run: () => 1 - perm(100, 12) / Math.pow(100, 12) },
    {
      method: "simulation",
      run: (rng) => {
        const seen = new Int32Array(100).fill(-1);
        let trial = 0;
        return simulateProb(rng, 1_000_000, (r) => {
          trial++;
          for (let i = 0; i < 12; i++) {
            const code = Math.floor(r() * 100);
            if (seen[code] === trial) return true;
            seen[code] = trial;
          }
          return false;
        });
      },
    },
  ],
  "m1-p16": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachPermutation(5, (p) => {
          total++;
          if (p.every((x, i) => x !== i)) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "formula",
      run: () => {
        let sum = 0;
        for (let k = 0; k <= 5; k++) sum += (k % 2 === 0 ? 1 : -1) / factorial(k);
        return sum;
      },
    },
  ],
  "m1-p17": [
    {
      method: "enumeration",
      run: () => {
        // Card c has rank c % 8 and suit floor(c / 8).
        let hit = 0;
        let total = 0;
        forEachSubset(40, 3, (s) => {
          total++;
          if (new Set(s.map((c) => c % 8)).size === 2) hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => (8 * choose(5, 2) * 35) / choose(40, 3) },
  ],
  "m1-p18": [
    {
      method: "enumeration",
      run: () => {
        // People 0-5 are quants, 6-10 are developers.
        let hit = 0;
        let total = 0;
        forEachSubset(11, 5, (s) => {
          total++;
          if (s.filter((x) => x < 6).length >= 3) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "formula",
      run: () => 1 - (choose(6, 2) * choose(5, 3) + choose(6, 1) * choose(5, 4) + choose(6, 0) * choose(5, 5)) / choose(11, 5),
    },
  ],
  "m1-p19": [
    { method: "enumeration", run: () => countMatchings(10) },
    { method: "formula", run: () => 9 * 7 * 5 * 3 * 1 },
  ],
  "m1-p20": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        for (let id = 1; id <= 600; id++) if (id % 3 === 0 || id % 4 === 0 || id % 5 === 0) count++;
        return count;
      },
    },
    {
      method: "formula",
      run: () => {
        const f = (d: number) => Math.floor(600 / d);
        return f(3) + f(4) + f(5) - f(12) - f(15) - f(20) + f(60);
      },
    },
  ],

  // -------------------------------------------------------------- difficulty 4
  "m1-p21": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachTuple(4, 8, (t) => {
          if (t[0] + t[1] + t[2] + t[3] === 20) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(23, 3) - 4 * choose(15, 3) + 6 * choose(7, 3) },
  ],
  "m1-p22": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachTuple(6, 4, (t) => {
          total++;
          if (new Set(t).size === 4) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "dp",
      run: () => {
        // Stirling numbers of the second kind: S(n,k) = k S(n-1,k) + S(n-1,k-1).
        const S: number[][] = Array.from({ length: 7 }, () => new Array<number>(5).fill(0));
        S[0][0] = 1;
        for (let n = 1; n <= 6; n++) for (let k = 1; k <= 4; k++) S[n][k] = k * S[n - 1][k] + S[n - 1][k - 1];
        return (factorial(4) * S[6][4]) / Math.pow(4, 6);
      },
    },
  ],
  "m1-p23": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachPermutation(7, (p) => {
          total++;
          if (p.filter((x, i) => x === i).length === 2) hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => (choose(7, 2) * derangementsByInclusionExclusion(5)) / factorial(7) },
  ],
  "m1-p24": [
    {
      method: "enumeration",
      run: () => {
        // Label each analyst with a team 0-2; keep labellings with 4 per team and analysts 0 (Priya) and 1 (Tom) apart.
        // Each unlabelled division corresponds to 3! labellings.
        let labelled = 0;
        forEachTuple(12, 3, (t) => {
          if (t[0] === t[1]) return;
          const n = [0, 0, 0];
          for (const x of t) n[x]++;
          if (n[0] === 4 && n[1] === 4 && n[2] === 4) labelled++;
        });
        return labelled / factorial(3);
      },
    },
    { method: "formula", run: () => choose(10, 3) * choose(7, 3) },
  ],
  "m1-p25": [
    { method: "dp", run: () => latticePaths(6, 5, [[3, 2]]) },
    { method: "formula", run: () => choose(11, 5) - choose(5, 2) * choose(6, 3) },
  ],

  // -------------------------------------------------------------- difficulty 5
  "m1-p26": [
    {
      method: "enumeration",
      run: () => {
        // Person p belongs to team floor(p / 2).
        let hit = 0;
        let total = 0;
        forEachPermutation(8, (p) => {
          total++;
          let ok = true;
          for (let i = 0; i < 7; i++) {
            if (p[i] >> 1 === p[i + 1] >> 1) {
              ok = false;
              break;
            }
          }
          if (ok) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "formula",
      run: () => {
        let sum = 0;
        for (let k = 0; k <= 4; k++) sum += (k % 2 === 0 ? 1 : -1) * choose(4, k) * Math.pow(2, k) * factorial(8 - k);
        return sum / factorial(8);
      },
    },
  ],
  "m1-p27": [
    {
      method: "enumeration",
      run: () => {
        // Six labelled fills; fill f is in symbol floor(f / 2). Enumerate all 6! orderings.
        let hit = 0;
        let total = 0;
        forEachPermutation(6, (p) => {
          total++;
          let ok = true;
          for (let i = 0; i < 5; i++) {
            if (p[i] >> 1 === p[i + 1] >> 1) {
              ok = false;
              break;
            }
          }
          if (ok) hit++;
        });
        return hit / total;
      },
    },
    {
      method: "formula",
      run: () => {
        // Inclusion-exclusion over glued pairs at the pattern level.
        const patterns = factorial(6) / 8;
        const onePair = factorial(5) / 4;
        const twoPairs = factorial(4) / 2;
        const threePairs = factorial(3);
        return (patterns - 3 * onePair + 3 * twoPairs - threePairs) / patterns;
      },
    },
  ],
  "m1-p28": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachMask(12, (m) => {
          if (popcount(m) !== 6) return;
          total++;
          let level = 0;
          for (let i = 0; i < 12; i++) {
            level += m & (1 << i) ? 1 : -1;
            if (level < 0) return;
          }
          hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => (choose(12, 6) - choose(12, 7)) / choose(12, 6) },
  ],

  // -------------------------------------------------------------- lesson checks
  "m1-lc1": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachPermutation(5, () => count++);
        return count;
      },
    },
    { method: "formula", run: () => factorial(5) },
  ],
  "m1-lc2": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachSubset(7, 2, () => count++);
        return count;
      },
    },
    { method: "formula", run: () => (7 * 6) / 2 },
  ],
  "m1-lc3": [
    {
      method: "enumeration",
      run: () => {
        let hit = 0;
        let total = 0;
        forEachMask(4, (m) => {
          total++;
          if (m !== 0) hit++;
        });
        return hit / total;
      },
    },
    { method: "formula", run: () => 1 - Math.pow(0.5, 4) },
  ],
  "m1-lc4": [
    {
      method: "enumeration",
      run: () => {
        let count = 0;
        forEachTuple(3, 7, (t) => {
          if (t[0] + t[1] + t[2] === 6) count++;
        });
        return count;
      },
    },
    { method: "formula", run: () => choose(8, 2) },
  ],
};
