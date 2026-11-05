/**
 * Market-making game logic. A hidden value with partial information is revealed to the
 * player, who quotes a bid and an ask of size one. A bot trades against the quote: with
 * probability `informed` it knows the true value and only trades when the quote is wrong;
 * otherwise it is a noise trader who is less likely to trade the wider the spread.
 */

import { randInt, type Rng } from "./rng";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  /** Lower and upper bound of the hidden value. */
  range: [number, number];
  /** Draw a hidden value and the public information. */
  draw: (rng: Rng) => { value: number; info: string; conditional: Map<number, number> };
  /** A spread this wide (or wider) gets no noise flow. */
  maxSpread: number;
}

function pmfOfSum(dice: number, sides = 6, offset = 0): Map<number, number> {
  let dist = new Map<number, number>([[offset, 1]]);
  for (let d = 0; d < dice; d++) {
    const next = new Map<number, number>();
    for (const [s, p] of dist) for (let f = 1; f <= sides; f++) next.set(s + f, (next.get(s + f) ?? 0) + p / sides);
    dist = next;
  }
  return dist;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "three-dice",
    title: "Three dice, one shown",
    description: "The value is the sum of three fair dice. You see the first die before you quote.",
    range: [3, 18],
    maxSpread: 8,
    draw: (rng) => {
      const d1 = randInt(rng, 1, 6);
      const d2 = randInt(rng, 1, 6);
      const d3 = randInt(rng, 1, 6);
      return { value: d1 + d2 + d3, info: `The first die shows ${d1}.`, conditional: pmfOfSum(2, 6, d1) };
    },
  },
  {
    id: "ten-flips",
    title: "Ten flips, four seen",
    description: "The value is the number of heads in ten fair flips. You see the first four flips.",
    range: [0, 10],
    maxSpread: 6,
    draw: (rng) => {
      const flips: number[] = Array.from({ length: 10 }, () => (rng() < 0.5 ? 1 : 0));
      const seen = flips.slice(0, 4);
      const h = seen.reduce((a, b) => a + b, 0);
      const cond = new Map<number, number>();
      for (let k = 0; k <= 6; k++) {
        let c = 1;
        for (let i = 1; i <= k; i++) c = (c * (6 - k + i)) / i;
        cond.set(h + k, c / 64);
      }
      return { value: flips.reduce((a, b) => a + b, 0), info: `The first four flips were ${seen.map((f) => (f ? "H" : "T")).join(" ")}.`, conditional: cond };
    },
  },
  {
    id: "two-cards",
    title: "Two cards, one face up",
    description: "The value is the sum of two cards (ace = 1 up to king = 13) drawn without replacement from a 52-card deck. You see the first card.",
    range: [2, 26],
    maxSpread: 10,
    draw: (rng) => {
      const deck = Array.from({ length: 52 }, (_, i) => (i % 13) + 1);
      const i = randInt(rng, 0, 51);
      const first = deck[i];
      deck.splice(i, 1);
      const second = deck[randInt(rng, 0, 50)];
      const cond = new Map<number, number>();
      for (let r = 1; r <= 13; r++) {
        const count = r === first ? 3 : 4;
        cond.set(first + r, (cond.get(first + r) ?? 0) + count / 51);
      }
      return { value: first + second, info: `The first card is a ${first === 1 ? "ace (1)" : first === 11 ? "jack (11)" : first === 12 ? "queen (12)" : first === 13 ? "king (13)" : String(first)}.`, conditional: cond };
    },
  },
  {
    id: "noisy-signal",
    title: "Hidden number, noisy signal",
    description: "The value is a whole number from 1 to 100, uniformly random. You see the value plus independent noise uniform on −10 to +10.",
    range: [1, 100],
    maxSpread: 30,
    draw: (rng) => {
      const v = randInt(rng, 1, 100);
      const noise = randInt(rng, -10, 10);
      const s = v + noise;
      const cond = new Map<number, number>();
      let total = 0;
      for (let x = Math.max(1, s - 10); x <= Math.min(100, s + 10); x++) total++;
      for (let x = Math.max(1, s - 10); x <= Math.min(100, s + 10); x++) cond.set(x, 1 / total);
      return { value: v, info: `The signal reads ${s}.`, conditional: cond };
    },
  },
];

export const INFORMED_LEVELS = { low: 0.15, medium: 0.35, high: 0.6 } as const;
export type InformedLevel = keyof typeof INFORMED_LEVELS;

export function conditionalMean(pmf: Map<number, number>): number {
  let m = 0;
  for (const [v, p] of pmf) m += v * p;
  return m;
}

export function conditionalSd(pmf: Map<number, number>): number {
  const m = conditionalMean(pmf);
  let v = 0;
  for (const [x, p] of pmf) v += p * (x - m) * (x - m);
  return Math.sqrt(v);
}

/** Probability a noise trader trades at a given spread. */
export function noiseTradeProb(spread: number, maxSpread: number): number {
  return Math.max(0, 1 - spread / maxSpread);
}

export interface RoundOutcome {
  trade: "none" | "bot-buys" | "bot-sells";
  informed: boolean;
  pnl: number;
  value: number;
}

/** The bot's action for one round. */
export function botTrade(rng: Rng, value: number, bid: number, ask: number, informedProb: number, maxSpread: number): RoundOutcome {
  const informed = rng() < informedProb;
  const spread = ask - bid;
  if (informed) {
    if (value > ask) return { trade: "bot-buys", informed, pnl: ask - value, value };
    if (value < bid) return { trade: "bot-sells", informed, pnl: value - bid, value };
    return { trade: "none", informed, pnl: 0, value };
  }
  if (rng() < noiseTradeProb(spread, maxSpread)) {
    if (rng() < 0.5) return { trade: "bot-buys", informed, pnl: ask - value, value };
    return { trade: "bot-sells", informed, pnl: value - bid, value };
  }
  return { trade: "none", informed, pnl: 0, value };
}

/** Expected P&L per round of a quote (bid, ask) given the conditional distribution. */
export function expectedPnl(pmf: Map<number, number>, bid: number, ask: number, informedProb: number, maxSpread: number): number {
  const mean = conditionalMean(pmf);
  let informedLoss = 0;
  for (const [v, p] of pmf) {
    if (v > ask) informedLoss += p * (ask - v);
    else if (v < bid) informedLoss += p * (v - bid);
  }
  const spread = ask - bid;
  const noise = noiseTradeProb(spread, maxSpread) * 0.5 * (ask - mean + (mean - bid));
  return informedProb * informedLoss + (1 - informedProb) * noise;
}

/** Best symmetric half-spread around the conditional mean, by grid search. */
export function optimalHalfSpread(pmf: Map<number, number>, informedProb: number, maxSpread: number): { half: number; pnl: number } {
  const mean = conditionalMean(pmf);
  let best = { half: 0.5, pnl: -Infinity };
  for (let h = 0.25; h <= maxSpread / 2; h += 0.25) {
    const pnl = expectedPnl(pmf, mean - h, mean + h, informedProb, maxSpread);
    if (pnl > best.pnl) best = { half: h, pnl };
  }
  return best;
}

/** Fermi range score: 100 for a tight hit, 0 for a miss or a range two orders of magnitude wide. */
export function fermiScore(low: number, high: number, truth: number): { hit: boolean; score: number; widthOrders: number } {
  if (!(low > 0) || !(high > 0) || high < low) return { hit: false, score: 0, widthOrders: NaN };
  const widthOrders = Math.log10(high / low);
  const hit = truth >= low && truth <= high;
  const score = hit ? Math.round(100 * Math.max(0, 1 - widthOrders / 2)) : 0;
  return { hit, score, widthOrders };
}
