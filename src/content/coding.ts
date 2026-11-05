/**
 * Coding warmup problems. Each has a JavaScript and a Python starter, hidden tests that run
 * client-side, hints and a reference solution. Framings and tests are original.
 */

export interface CodingTest {
  name: string;
  args: unknown[];
  expected: unknown;
  /** Numeric tolerance for floating answers. */
  tolerance?: number;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  minutes: number;
  prompt: string;
  functionName: string;
  signature: { js: string; py: string };
  starter: { js: string; py: string };
  tests: CodingTest[];
  hints: [string, string, string];
  solution: { js: string; explanation: string };
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "c-pair-target",
    title: "Two fills that sum to a target",
    difficulty: 1,
    tags: ["hashing", "arrays"],
    minutes: 8,
    prompt: String.raw`You are given an array of integer fill prices and a target. Return the indices $[i, j]$ with $i < j$ of the first pair (smallest $j$, then smallest $i$) whose prices sum to the target. If no pair exists return $[-1, -1]$.

Example: prices $[4, 9, 2, 7, 5]$, target $9$ gives $[2, 3]$ because $2 + 7 = 9$ and no pair ends earlier than index 3 ($4 + 5 = 9$ ends at index 4).`,
    functionName: "pairToTarget",
    signature: { js: "function pairToTarget(prices, target) -> number[]", py: "def pair_to_target(prices: list[int], target: int) -> list[int]" },
    starter: {
      js: `function pairToTarget(prices, target) {\n  // return [i, j] with i < j, or [-1, -1]\n  \n}`,
      py: `def pair_to_target(prices, target):\n    # return [i, j] with i < j, or [-1, -1]\n    pass\n`,
    },
    tests: [
      { name: "example", args: [[4, 9, 2, 7, 5], 9], expected: [2, 3] },
      { name: "first pair wins", args: [[1, 8, 3, 6, 5, 4], 9], expected: [0, 1] },
      { name: "no pair", args: [[1, 2, 3], 100], expected: [-1, -1] },
      { name: "duplicates", args: [[5, 5, 5], 10], expected: [0, 1] },
      { name: "negative numbers", args: [[-3, 10, 7, -4], 3], expected: [2, 3] },
      { name: "single element", args: [[7], 7], expected: [-1, -1] },
    ],
    hints: [
      "A double loop works but think about the order the answer wants: smallest j first.",
      "Walk j from left to right and keep a map from price to the smallest index seen so far.",
      "At each j, check whether target - prices[j] is in the map; the map only contains indices less than j.",
    ],
    solution: {
      js: `function pairToTarget(prices, target) {\n  const seen = new Map();\n  for (let j = 0; j < prices.length; j++) {\n    const need = target - prices[j];\n    if (seen.has(need)) return [seen.get(need), j];\n    if (!seen.has(prices[j])) seen.set(prices[j], j);\n  }\n  return [-1, -1];\n}`,
      explanation: "One pass with a hash map of earlier prices gives O(n). Storing only the first index for each price makes the smallest i win when several would do.",
    },
  },
  {
    id: "c-best-window",
    title: "Best single trade",
    difficulty: 2,
    tags: ["arrays", "scan"],
    minutes: 8,
    prompt: String.raw`Given an array of daily closing prices, return the maximum profit from buying on one day and selling on a later day. If no profitable trade exists return $0$.

Example: $[7, 1, 5, 3, 6, 4]$ gives $5$ (buy at 1, sell at 6).`,
    functionName: "bestTrade",
    signature: { js: "function bestTrade(prices) -> number", py: "def best_trade(prices: list[float]) -> float" },
    starter: { js: `function bestTrade(prices) {\n  \n}`, py: `def best_trade(prices):\n    pass\n` },
    tests: [
      { name: "example", args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { name: "falling market", args: [[9, 7, 5, 3]], expected: 0 },
      { name: "late dip", args: [[3, 8, 1, 2]], expected: 5 },
      { name: "two days", args: [[2, 10]], expected: 8 },
      { name: "flat", args: [[4, 4, 4]], expected: 0 },
      { name: "decimals", args: [[1.5, 0.5, 2.25]], expected: 1.75, tolerance: 1e-9 },
    ],
    hints: [
      "For each day, the best sell is the price minus the lowest price seen before it.",
      "Keep a running minimum and a running best profit.",
      "One pass: update best = max(best, price - minSoFar), then minSoFar = min(minSoFar, price).",
    ],
    solution: {
      js: `function bestTrade(prices) {\n  let minSoFar = Infinity;\n  let best = 0;\n  for (const p of prices) {\n    best = Math.max(best, p - minSoFar);\n    minSoFar = Math.min(minSoFar, p);\n  }\n  return best;\n}`,
      explanation: "Track the cheapest buy so far and the best profit so far in one O(n) pass.",
    },
  },
  {
    id: "c-top-k",
    title: "Most frequent symbols",
    difficulty: 2,
    tags: ["hashing", "sorting"],
    minutes: 10,
    prompt: String.raw`Given a list of ticker symbols (strings) and an integer $k$, return the $k$ most frequent symbols, most frequent first. Break ties alphabetically.

Example: $[\text{"AB"}, \text{"CD"}, \text{"AB"}, \text{"EF"}, \text{"CD"}, \text{"AB"}]$ with $k = 2$ gives $[\text{"AB"}, \text{"CD"}]$.`,
    functionName: "topSymbols",
    signature: { js: "function topSymbols(symbols, k) -> string[]", py: "def top_symbols(symbols: list[str], k: int) -> list[str]" },
    starter: { js: `function topSymbols(symbols, k) {\n  \n}`, py: `def top_symbols(symbols, k):\n    pass\n` },
    tests: [
      { name: "example", args: [["AB", "CD", "AB", "EF", "CD", "AB"], 2], expected: ["AB", "CD"] },
      { name: "ties alphabetical", args: [["Z", "Y", "X"], 2], expected: ["X", "Y"] },
      { name: "k larger than distinct", args: [["A", "A", "B"], 5], expected: ["A", "B"] },
      { name: "mixed ties", args: [["B", "A", "B", "A", "C"], 3], expected: ["A", "B", "C"] },
      { name: "empty", args: [[], 3], expected: [] },
    ],
    hints: [
      "Count with a map first.",
      "Turn the map into an array of [symbol, count] pairs and sort it.",
      "Sort by count descending, then by symbol ascending; slice the first k.",
    ],
    solution: {
      js: `function topSymbols(symbols, k) {\n  const counts = new Map();\n  for (const s of symbols) counts.set(s, (counts.get(s) ?? 0) + 1);\n  return [...counts.entries()]\n    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))\n    .slice(0, k)\n    .map(([s]) => s);\n}`,
      explanation: "Counting is O(n); sorting the distinct symbols is O(m log m). A heap would be faster for huge inputs but is not needed here.",
    },
  },
  {
    id: "c-longest-run",
    title: "Longest streak of heads",
    difficulty: 1,
    tags: ["arrays", "strings"],
    minutes: 6,
    prompt: String.raw`A string of H and T characters records coin flips. Return the length of the longest run of consecutive H's. Return $0$ if there are none.

Example: "HHTHHHTH" gives $3$.`,
    functionName: "longestHeads",
    signature: { js: "function longestHeads(flips) -> number", py: "def longest_heads(flips: str) -> int" },
    starter: { js: `function longestHeads(flips) {\n  \n}`, py: `def longest_heads(flips):\n    pass\n` },
    tests: [
      { name: "example", args: ["HHTHHHTH"], expected: 3 },
      { name: "all tails", args: ["TTTT"], expected: 0 },
      { name: "all heads", args: ["HHHHH"], expected: 5 },
      { name: "run at end", args: ["THTHHHH"], expected: 4 },
      { name: "empty", args: [""], expected: 0 },
    ],
    hints: ["Scan once with a counter for the current run.", "Reset the counter on T, extend it on H.", "Keep the maximum seen; do not forget a run that ends at the last character."],
    solution: {
      js: `function longestHeads(flips) {\n  let best = 0;\n  let cur = 0;\n  for (const c of flips) {\n    cur = c === "H" ? cur + 1 : 0;\n    if (cur > best) best = cur;\n  }\n  return best;\n}`,
      explanation: "A single pass with a running count; updating the maximum inside the loop handles a run that ends at the final character.",
    },
  },
  {
    id: "c-dice-sums",
    title: "Ways to roll a sum",
    difficulty: 2,
    tags: ["dp", "probability"],
    minutes: 10,
    prompt: String.raw`Return the number of ordered outcomes of rolling $n$ fair six-sided dice whose faces sum to exactly $s$. For example, with $n = 2$ and $s = 7$ the answer is $6$. With $n = 3$ and $s = 10$ it is $27$.`,
    functionName: "waysToRoll",
    signature: { js: "function waysToRoll(n, s) -> number", py: "def ways_to_roll(n: int, s: int) -> int" },
    starter: { js: `function waysToRoll(n, s) {\n  \n}`, py: `def ways_to_roll(n, s):\n    pass\n` },
    tests: [
      { name: "two dice seven", args: [2, 7], expected: 6 },
      { name: "three dice ten", args: [3, 10], expected: 27 },
      { name: "impossible", args: [2, 13], expected: 0 },
      { name: "one die", args: [1, 4], expected: 1 },
      { name: "four dice fourteen", args: [4, 14], expected: 146 },
      { name: "eight dice 28", args: [8, 28], expected: 135954 },
    ],
    hints: [
      "Build up one die at a time: ways[k][t] = number of ways k dice sum to t.",
      "ways[k][t] = sum over face f = 1..6 of ways[k-1][t-f].",
      "Base case ways[0][0] = 1. Keep a 1-D array and iterate t downward, or use two rows.",
    ],
    solution: {
      js: `function waysToRoll(n, s) {\n  let ways = new Array(s + 1).fill(0);\n  ways[0] = 1;\n  for (let k = 1; k <= n; k++) {\n    const next = new Array(s + 1).fill(0);\n    for (let t = 1; t <= s; t++) {\n      for (let f = 1; f <= 6 && f <= t; f++) next[t] += ways[t - f];\n    }\n    ways = next;\n  }\n  return ways[s];\n}`,
      explanation: "Classic convolution DP: each die adds one of six faces to every reachable sum. O(n · s · 6).",
    },
  },
  {
    id: "c-merge-windows",
    title: "Merge trading windows",
    difficulty: 2,
    tags: ["sorting", "intervals"],
    minutes: 10,
    prompt: String.raw`Each trading window is a pair $[start, end]$ of integers with $start \le end$. Merge every set of overlapping or touching windows (touching means one ends exactly where another starts) and return the merged list sorted by start.

Example: $[[1,3],[2,6],[8,10],[10,12],[15,18]]$ gives $[[1,6],[8,12],[15,18]]$.`,
    functionName: "mergeWindows",
    signature: { js: "function mergeWindows(windows) -> number[][]", py: "def merge_windows(windows: list[list[int]]) -> list[list[int]]" },
    starter: { js: `function mergeWindows(windows) {\n  \n}`, py: `def merge_windows(windows):\n    pass\n` },
    tests: [
      { name: "example", args: [[[1, 3], [2, 6], [8, 10], [10, 12], [15, 18]]], expected: [[1, 6], [8, 12], [15, 18]] },
      { name: "unsorted input", args: [[[5, 7], [1, 2], [6, 9]]], expected: [[1, 2], [5, 9]] },
      { name: "nested", args: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]] },
      { name: "single", args: [[[3, 3]]], expected: [[3, 3]] },
      { name: "empty", args: [[]], expected: [] },
    ],
    hints: ["Sort by start first.", "Walk the sorted list keeping the current merged window.", "If the next start is <= current end, extend the end to the max; otherwise push and start a new window."],
    solution: {
      js: `function mergeWindows(windows) {\n  const sorted = windows.map((w) => [...w]).sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const w of sorted) {\n    const last = out[out.length - 1];\n    if (last && w[0] <= last[1]) last[1] = Math.max(last[1], w[1]);\n    else out.push(w);\n  }\n  return out;\n}`,
      explanation: "After sorting by start, overlaps are always with the most recent merged window, so one pass suffices. O(n log n).",
    },
  },
  {
    id: "c-grid-paths",
    title: "Paths through a blocked grid",
    difficulty: 3,
    tags: ["dp", "grids"],
    minutes: 12,
    prompt: String.raw`A grid has $r$ rows and $c$ columns. You start at the top-left cell and may move only right or down. Some cells are blocked, given as a list of $[row, col]$ pairs (0-indexed). Return the number of distinct paths to the bottom-right cell. If the start or the end is blocked, return $0$.

Example: a $3 \times 3$ grid with the centre cell $[1,1]$ blocked has $2$ paths.`,
    functionName: "gridPaths",
    signature: { js: "function gridPaths(r, c, blocked) -> number", py: "def grid_paths(r: int, c: int, blocked: list[list[int]]) -> int" },
    starter: { js: `function gridPaths(r, c, blocked) {\n  \n}`, py: `def grid_paths(r, c, blocked):\n    pass\n` },
    tests: [
      { name: "centre blocked", args: [3, 3, [[1, 1]]], expected: 2 },
      { name: "no blocks", args: [3, 3, []], expected: 6 },
      { name: "start blocked", args: [2, 2, [[0, 0]]], expected: 0 },
      { name: "wall", args: [3, 4, [[0, 2], [1, 2], [2, 2]]], expected: 0 },
      { name: "larger", args: [5, 6, [[1, 1], [3, 4]]], expected: 26 },
      { name: "single cell", args: [1, 1, []], expected: 1 },
    ],
    hints: [
      "paths[i][j] = paths[i-1][j] + paths[i][j-1] unless the cell is blocked.",
      "Store the blocked cells in a Set of strings like 'i,j' for O(1) lookup.",
      "Fill the table row by row starting from paths[0][0] = 1 (if not blocked).",
    ],
    solution: {
      js: `function gridPaths(r, c, blocked) {\n  const bad = new Set(blocked.map(([i, j]) => i + "," + j));\n  const dp = Array.from({ length: r }, () => new Array(c).fill(0));\n  for (let i = 0; i < r; i++) {\n    for (let j = 0; j < c; j++) {\n      if (bad.has(i + "," + j)) { dp[i][j] = 0; continue; }\n      if (i === 0 && j === 0) { dp[i][j] = 1; continue; }\n      dp[i][j] = (i > 0 ? dp[i - 1][j] : 0) + (j > 0 ? dp[i][j - 1] : 0);\n    }\n  }\n  return dp[r - 1][c - 1];\n}`,
      explanation: "Standard lattice-path DP with blocked cells zeroed out. Without blocks the answer is choose(r + c - 2, r - 1).",
    },
  },
  {
    id: "c-sim-until-six",
    title: "Simulate rolls until a six",
    difficulty: 2,
    tags: ["simulation", "probability"],
    minutes: 10,
    prompt: String.raw`Write a function that estimates the expected number of rolls of a fair die until the first six, by simulation. It receives a function $\text{rand}()$ that returns a uniform number in $[0, 1)$ and a number of trials. Run that many trials, each rolling until a six appears (a roll is $1 + \lfloor 6 \cdot \text{rand}() \rfloor$), and return the average number of rolls.

The tests pass a seeded generator and 200,000 trials; the true value is $6$, and your estimate must land within $0.1$ of it.`,
    functionName: "expectedRollsUntilSix",
    signature: { js: "function expectedRollsUntilSix(rand, trials) -> number", py: "def expected_rolls_until_six(rand, trials: int) -> float" },
    starter: { js: `function expectedRollsUntilSix(rand, trials) {\n  // rand() gives a uniform number in [0, 1)\n  \n}`, py: `def expected_rolls_until_six(rand, trials):\n    # rand() gives a uniform number in [0, 1)\n    pass\n` },
    tests: [
      { name: "seed 1", args: ["__rng__:1", 200000], expected: 6, tolerance: 0.1 },
      { name: "seed 2", args: ["__rng__:2", 200000], expected: 6, tolerance: 0.1 },
    ],
    hints: ["One trial: count rolls until 1 + floor(6 * rand()) equals 6.", "Sum the counts over all trials and divide by trials.", "Do not create arrays per trial; a plain counter loop is enough."],
    solution: {
      js: `function expectedRollsUntilSix(rand, trials) {\n  let total = 0;\n  for (let t = 0; t < trials; t++) {\n    let rolls = 0;\n    for (;;) {\n      rolls++;\n      if (1 + Math.floor(6 * rand()) === 6) break;\n    }\n    total += rolls;\n  }\n  return total / trials;\n}`,
      explanation: "A geometric wait with success probability 1/6 has mean 6. The simulation's standard error with 200k trials is about 0.012, so landing within 0.1 is comfortable if the code is right.",
    },
  },
];

export const CODING_BY_ID = new Map(CODING_PROBLEMS.map((p) => [p.id, p]));
