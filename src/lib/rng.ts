/** Small deterministic PRNG utilities used by simulations, mocks and tests. */

export type Rng = () => number;

/** mulberry32: fast 32-bit PRNG with a good enough distribution for Monte Carlo checks. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash, for turning ids into seeds. */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFromString(str: string): Rng {
  return mulberry32(hashSeed(str));
}

/** Uniform integer in [lo, hi] inclusive. */
export function randInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sample n distinct items without replacement. */
export function sample<T>(arr: readonly T[], n: number, rng: Rng): T[] {
  return shuffle(arr, rng).slice(0, Math.max(0, Math.min(n, arr.length)));
}

/** Pick one item. */
export function pick<T>(arr: readonly T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Weighted pick; weights need not sum to one. */
export function weightedPick<T>(items: readonly T[], weights: readonly number[], rng: Rng): T {
  let total = 0;
  for (const w of weights) total += Math.max(0, w);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Standard normal via Box-Muller. */
export function randNormal(rng: Rng): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
