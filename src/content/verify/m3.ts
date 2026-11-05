import type { VerifySpec } from "../types";
import { coin, die, forEachDice, forEachSubset, forEachTuple, randInt, shuffle, simulateProb, type SimResult } from "./helpers";

/**
 * Independent checks for module 3 (conditional probability and Bayes).
 *
 * Conditional probabilities are checked two ways wherever possible: an exact brute force
 * over the full joint sample space (host behaviour, which child was met, which side of a
 * card is up, ... all enumerated with their probabilities) and a rejection-sampled Monte
 * Carlo estimate that uses the seeded rng supplied by the runner. Screening problems use
 * an odds-form or sequential formula as the exact route. Choice answers return the index
 * of the option whose claim the computation supports.
 */

type Rng = () => number;

/** Rejection-sampled conditional probability: `trial` returns null when the conditioning event fails. */
function condProb(rng: Rng, trials: number, trial: (rng: Rng) => boolean | null): SimResult {
  return simulateProb(rng, trials, (r) => {
    for (;;) {
      const v = trial(r);
      if (v !== null) return v;
    }
  });
}

/** Index of the option whose numeric claim is closest to `value`. */
function nearest(value: number, options: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < options.length; i++) {
    if (Math.abs(options[i] - value) < Math.abs(options[best] - value)) best = i;
  }
  return best;
}

function oddsToProb(odds: number): number {
  return odds / (1 + odds);
}

/** Door indices other than the given ones. */
function others(n: number, ...exclude: number[]): number[] {
  const out: number[] = [];
  for (let d = 0; d < n; d++) if (!exclude.includes(d)) out.push(d);
  return out;
}

// Option values for the choice problems, in option order.
const P15_OPTIONS = [1 / 3, 1 / 2, 2 / 3, 1 / 4];
const P19_OPTIONS = [0.7, 49 / 58, 0.3, 0.5];
const P25_OPTIONS = [0.999, 1 / 501, 0.5, 0.001];

export const spec: VerifySpec = {
  // ---------------------------------------------------------------- difficulty 1
  "m3-p01": [
    {
      method: "enumeration",
      run: () => {
        let cond = 0;
        let hit = 0;
        forEachDice(2, (d) => {
          if (d[0] + d[1] >= 9) {
            cond++;
            if (d[0] === d[1]) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 2_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          if (a + b < 9) return null;
          return a === b;
        }),
    },
  ],
  "m3-p02": [
    {
      method: "enumeration",
      run: () => {
        let cond = 0;
        let hit = 0;
        forEachDice(2, (d) => {
          if (d[0] % 2 === 0 || d[1] % 2 === 0) {
            cond++;
            if ((d[0] + d[1]) % 2 === 0) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          if (a % 2 === 1 && b % 2 === 1) return null;
          return (a + b) % 2 === 0;
        }),
    },
  ],
  "m3-p03": [
    {
      method: "enumeration",
      run: () => {
        // Card index 0..51; suit = floor(index / 13); suit 0 plays the role of hearts.
        let cond = 0;
        let hit = 0;
        for (let i = 0; i < 52; i++) {
          for (let j = 0; j < 52; j++) {
            if (i === j) continue;
            if (Math.floor(i / 13) !== 0) continue;
            cond++;
            if (Math.floor(j / 13) === 0) hit++;
          }
        }
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_500_000, (r) => {
          const first = randInt(r, 0, 51);
          let second = randInt(r, 0, 50);
          if (second >= first) second++;
          if (Math.floor(first / 13) !== 0) return null;
          return Math.floor(second / 13) === 0;
        }),
    },
  ],
  "m3-p04": [
    // Complement route: one minus the probability of tails.
    { method: "formula", run: () => 1 - ((2 / 3) * (1 / 2) + (1 / 3) * 0.2) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const which = randInt(r, 0, 2); // coin 0 is the biased one
          return coin(r, which === 0 ? 0.8 : 0.5);
        }),
    },
  ],
  // ---------------------------------------------------------------- difficulty 2
  "m3-p05": [
    {
      method: "enumeration",
      run: () => {
        // Card index 0..51; index % 13 === 0 marks the four aces.
        let cond = 0;
        let hit = 0;
        forEachSubset(52, 2, (s) => {
          const aces = (s[0] % 13 === 0 ? 1 : 0) + (s[1] % 13 === 0 ? 1 : 0);
          if (aces >= 1) {
            cond++;
            if (aces === 2) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      // Ordered draws with inclusion-exclusion for "at least one ace".
      method: "formula",
      run: () => {
        const both = (4 / 52) * (3 / 51);
        const atLeastOne = 4 / 52 + 4 / 52 - both;
        return both / atLeastOne;
      },
    },
  ],
  "m3-p06": [
    { method: "formula", run: () => oddsToProb((0.02 / 0.98) * (0.95 / 0.08)) },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_600_000, (r) => {
          const defective = r() < 0.02;
          const flagged = r() < (defective ? 0.95 : 0.08);
          if (!flagged) return null;
          return defective;
        }),
    },
  ],
  "m3-p07": [
    {
      method: "enumeration",
      run: () => {
        let num = 0;
        let den = 0;
        for (let f = 1; f <= 6; f++) {
          if (f === 3) {
            num += 0.5 / 6;
            den += 0.5 / 6;
          }
        }
        for (let f = 1; f <= 8; f++) if (f === 3) den += 0.5 / 8;
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const six = coin(r);
          const face = die(r, six ? 6 : 8);
          if (face !== 3) return null;
          return six;
        }),
    },
  ],
  "m3-p08": [
    {
      method: "enumeration",
      run: () => {
        let cond = 0;
        let hit = 0;
        forEachTuple(2, 2, (t) => {
          const girls = t[0] + t[1]; // 1 = girl
          if (girls >= 1) {
            cond++;
            if (girls === 2) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const g1 = coin(r);
          const g2 = coin(r);
          if (!g1 && !g2) return null;
          return g1 && g2;
        }),
    },
  ],
  "m3-p09": [
    // Complement route: one minus the probability of blue.
    { method: "formula", run: () => 1 - ((1 / 3) * (2 / 5) + (2 / 3) * (4 / 5)) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const roll = die(r);
          const marble = randInt(r, 1, 5);
          return roll <= 2 ? marble <= 3 : marble <= 1;
        }),
    },
  ],
  "m3-p10": [
    {
      method: "enumeration",
      run: () => {
        let win = 0;
        for (let car = 0; car < 3; car++) {
          for (let pick = 0; pick < 3; pick++) {
            const opts = others(3, car, pick); // doors the knowing host may open
            for (const h of opts) {
              const target = others(3, pick, h)[0];
              if (target === car) win += (1 / 9) * (1 / opts.length);
            }
          }
        }
        return win;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const car = randInt(r, 0, 2);
          const pick = randInt(r, 0, 2);
          const opts = others(3, car, pick);
          const h = opts[randInt(r, 0, opts.length - 1)];
          const target = others(3, pick, h)[0];
          return target === car;
        }),
    },
  ],
  "m3-p11": [
    { method: "formula", run: () => oddsToProb((0.3 / 0.7) * (0.1 / 0.98)) },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 7_000_000, (r) => {
          const spam = r() < 0.3;
          const diverted = r() < (spam ? 0.9 : 0.02);
          if (diverted) return null;
          return spam;
        }),
    },
  ],
  // ---------------------------------------------------------------- difficulty 3
  "m3-p12": [
    {
      // Sequential route: update on model A, then feed the posterior into model B.
      method: "formula",
      run: () => {
        const afterA = (0.01 * 0.9) / (0.01 * 0.9 + 0.99 * 0.05);
        return (afterA * 0.8) / (afterA * 0.8 + (1 - afterA) * 0.1);
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 400_000, (r) => {
          const fraud = r() < 0.01;
          const a = r() < (fraud ? 0.9 : 0.05);
          const b = r() < (fraud ? 0.8 : 0.1);
          if (!(a && b)) return null;
          return fraud;
        }),
    },
  ],
  "m3-p13": [
    {
      // Check the claim behind option 1 for every base rate, and that the stated numbers hold at 30%.
      method: "exhaustive-search",
      run: () => {
        for (let b = 0.01; b < 0.995; b += 0.01) {
          const pA = b * 0.8 + (1 - b) * 0.2;
          const pAB = b * 0.64 + (1 - b) * 0.04;
          if (!(pAB > pA * pA)) return 0; // independence would make option 0 (or 3) right
        }
        const pA = 0.3 * 0.8 + 0.7 * 0.2;
        const pAB = 0.3 * 0.64 + 0.7 * 0.04;
        const pBgivenA = pAB / pA;
        if (Math.abs(pA - 0.38) > 1e-12 || Math.abs(pBgivenA - 0.58) > 0.005) return -1;
        return pBgivenA > pA ? 1 : 2;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const trials = 1_000_000;
        let a = 0;
        let b = 0;
        let ab = 0;
        for (let i = 0; i < trials; i++) {
          const strong = rng() < 0.3;
          const p = strong ? 0.8 : 0.2;
          const ya = rng() < p;
          const yb = rng() < p;
          if (ya) a++;
          if (yb) b++;
          if (ya && yb) ab++;
        }
        const cov = ab / trials - (a / trials) * (b / trials);
        if (Math.abs(cov) < 0.01) return 0;
        return cov > 0 ? 1 : 2;
      },
    },
  ],
  "m3-p14": [
    {
      method: "enumeration",
      run: () => {
        const reds = [1, 2, 3];
        let num = 0;
        let den = 0;
        for (let u = 0; u < 3; u++) {
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (i < reds[u] && j < reds[u]) {
                const p = (1 / 3) * (1 / 16);
                den += p;
                if (u === 2) num += p;
              }
            }
          }
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const reds = [1, 2, 3];
          const u = randInt(r, 0, 2);
          const r1 = randInt(r, 0, 3) < reds[u];
          const r2 = randInt(r, 0, 3) < reds[u];
          if (!(r1 && r2)) return null;
          return u === 2;
        }),
    },
  ],
  "m3-p15": [
    {
      method: "enumeration",
      run: () => {
        let cond = 0;
        let hit = 0;
        forEachTuple(3, 2, (t) => {
          // t[0] elder sex, t[1] younger sex (1 = girl), t[2] which child came along (0 elder, 1 younger)
          const met = t[2] === 0 ? t[0] : t[1];
          if (met === 1) {
            cond++;
            if (t[0] === 1 && t[1] === 1) hit++;
          }
        });
        return nearest(hit / cond, P15_OPTIONS);
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const est = condProb(rng, 1_000_000, (r) => {
          const elder = coin(r);
          const younger = coin(r);
          const met = coin(r) ? elder : younger;
          if (!met) return null;
          return elder && younger;
        });
        return nearest(est.value, P15_OPTIONS);
      },
    },
  ],
  "m3-p16": [
    {
      method: "enumeration",
      run: () => {
        let num = 0;
        let den = 0;
        for (let car = 0; car < 3; car++) {
          for (const h of [1, 2]) {
            const p = (1 / 3) * (1 / 2);
            if (h === car) continue; // the random host revealed the car: outside the conditioning event
            den += p;
            const remaining = h === 1 ? 2 : 1;
            if (remaining === car) num += p;
          }
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const car = randInt(r, 0, 2);
          const h = randInt(r, 1, 2);
          if (h === car) return null;
          const remaining = h === 1 ? 2 : 1;
          return remaining === car;
        }),
    },
  ],
  "m3-p17": [
    {
      method: "enumeration",
      run: () => {
        const cards = [
          [1, 1],
          [1, 1],
          [0, 0],
          [1, 0],
          [1, 0],
          [1, 0],
        ]; // 1 = bull
        let num = 0;
        let den = 0;
        for (const card of cards) {
          for (const side of [0, 1]) {
            if (card[side] !== 1) continue;
            den += 1 / 12;
            if (card[1 - side] === 1) num += 1 / 12;
          }
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const cards = [
            [1, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [1, 0],
            [1, 0],
          ];
          const c = randInt(r, 0, 5);
          const side = randInt(r, 0, 1);
          if (cards[c][side] !== 1) return null;
          return cards[c][1 - side] === 1;
        }),
    },
  ],
  "m3-p18": [
    { method: "formula", run: () => oddsToProb((1 / 9) * Math.pow(1.5, 4)) },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const biased = randInt(r, 0, 9) === 0;
          const p = biased ? 0.75 : 0.5;
          for (let i = 0; i < 4; i++) if (!coin(r, p)) return null;
          return biased;
        }),
    },
  ],
  "m3-p19": [
    {
      method: "formula",
      run: () => {
        const red = 0.5 * 0.7 * 0.7 * 0.3;
        const blue = 0.5 * 0.3 * 0.3 * 0.7;
        return nearest(red / (red + blue), P19_OPTIONS);
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const est = condProb(rng, 1_000_000, (r) => {
          const mostlyRed = coin(r);
          const pRed = mostlyRed ? 0.7 : 0.3;
          const d1 = coin(r, pRed);
          const d2 = coin(r, pRed);
          const d3 = coin(r, pRed);
          if (!(d1 && d2 && !d3)) return null;
          return mostlyRed;
        });
        return nearest(est.value, P19_OPTIONS);
      },
    },
  ],
  "m3-p20": [
    {
      method: "enumeration",
      run: () => {
        let num = 0;
        let den = 0;
        forEachDice(
          2,
          (d) => {
            if (d[0] + d[1] === 7) {
              num += 0.5 / 16;
              den += 0.5 / 16;
            }
          },
          4,
        );
        forEachDice(2, (d) => {
          if (d[0] + d[1] === 7) den += 0.5 / 36;
        });
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const four = coin(r);
          const sides = four ? 4 : 6;
          if (die(r, sides) + die(r, sides) !== 7) return null;
          return four;
        }),
    },
  ],
  // ---------------------------------------------------------------- difficulty 4
  "m3-p21": [
    {
      method: "enumeration",
      run: () => {
        const pick = 0;
        let win = 0;
        for (let car = 0; car < 5; car++) {
          const unpicked = others(5, pick);
          const goats = unpicked.filter((d) => d !== car);
          const pairs: number[][] = [];
          forEachSubset(goats.length, 2, (s) => pairs.push([goats[s[0]], goats[s[1]]]));
          for (const pair of pairs) {
            const remaining = unpicked.filter((d) => !pair.includes(d));
            for (const target of remaining) {
              if (target === car) win += (1 / 5) * (1 / pairs.length) * (1 / remaining.length);
            }
          }
        }
        return win;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const car = randInt(r, 0, 4);
          const pick = randInt(r, 0, 4);
          const unpicked = others(5, pick);
          const goats = unpicked.filter((d) => d !== car);
          const opened = shuffle(goats, r).slice(0, 2);
          const remaining = unpicked.filter((d) => !opened.includes(d));
          const target = remaining[randInt(r, 0, remaining.length - 1)];
          return target === car;
        }),
    },
  ],
  "m3-p22": [
    {
      method: "enumeration",
      run: () => {
        // Doors indexed 0, 1, 2 = door 1, 2, 3. You picked door index 0.
        let num = 0;
        let den = 0;
        for (let car = 0; car < 3; car++) {
          const prior = 1 / 3;
          const actions: Array<[opened: number, prob: number]> =
            car === 0 ? [[2, 3 / 4], [1, 1 / 4]] : car === 1 ? [[2, 1]] : [[1, 1]];
          for (const [opened, prob] of actions) {
            if (opened !== 2) continue;
            den += prior * prob;
            if (car === 1) num += prior * prob;
          }
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const car = randInt(r, 0, 2);
          let opened: number;
          if (car === 0) opened = coin(r, 0.75) ? 2 : 1;
          else if (car === 1) opened = 2;
          else opened = 1;
          if (opened !== 2) return null;
          return car === 1;
        }),
    },
  ],
  "m3-p23": [
    {
      method: "enumeration",
      run: () => {
        // Child type 0..23: boy if type < 12, month = type % 12; type 2 is "boy born in March".
        let cond = 0;
        let hit = 0;
        forEachTuple(2, 24, (t) => {
          if (t[0] === 2 || t[1] === 2) {
            cond++;
            if (t[0] < 12 && t[1] < 12) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const boy1 = coin(r);
          const m1 = randInt(r, 1, 12);
          const boy2 = coin(r);
          const m2 = randInt(r, 1, 12);
          if (!((boy1 && m1 === 3) || (boy2 && m2 === 3))) return null;
          return boy1 && boy2;
        }),
    },
  ],
  "m3-p24": [
    { method: "formula", run: () => oddsToProb((0.2 / 0.8) * 4 * 4 * (1 / 4)) },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const blue = r() < 0.2;
          let saysBlue = 0;
          for (let w = 0; w < 3; w++) {
            const correct = coin(r, 0.8);
            if (blue === correct) saysBlue++; // says blue when (blue and correct) or (green and wrong)
          }
          if (saysBlue !== 2) return null;
          return blue;
        }),
    },
  ],
  "m3-p25": [
    {
      method: "formula",
      run: () => {
        const N = 500_000;
        const q = 1 / 1000;
        return nearest(oddsToProb((1 / (N - 1)) * (1 / q)), P25_OPTIONS);
      },
    },
    {
      // Brute force over who the burglar is: Mr X (index 0) matches surely, anyone else only by chance.
      method: "enumeration",
      run: () => {
        const N = 500_000;
        const q = 1 / 1000;
        let num = 0;
        let den = 0;
        for (let c = 0; c < N; c++) {
          const pMatch = c === 0 ? 1 : q;
          den += (1 / N) * pMatch;
          if (c === 0) num += (1 / N) * pMatch;
        }
        return nearest(num / den, P25_OPTIONS);
      },
    },
  ],
  // ---------------------------------------------------------------- difficulty 5
  "m3-p26": [
    { method: "formula", run: () => oddsToProb((1 / 3) * Math.pow(3, 3) * Math.pow(3 / 5, 2)) },
    {
      // Condition on "three sixes, and the other two rolls are a 2 and a 4" (either order);
      // the posterior is the same as for the exact sequence because the position pattern
      // and the C(5,3)·2 orderings cancel between the two hypotheses.
      method: "simulation",
      run: (rng) =>
        condProb(rng, 300_000, (r) => {
          const loaded = r() < 0.25;
          let sixes = 0;
          let seen2 = 0;
          let seen4 = 0;
          for (let i = 0; i < 5; i++) {
            let face: number;
            if (loaded) face = r() < 0.5 ? 6 : randInt(r, 1, 5);
            else face = die(r);
            if (face === 6) sixes++;
            else if (face === 2) seen2++;
            else if (face === 4) seen4++;
            else return null;
            if (seen2 > 1 || seen4 > 1) return null;
          }
          if (sixes !== 3 || seen2 !== 1 || seen4 !== 1) return null;
          return loaded;
        }),
    },
  ],
  "m3-p27": [
    {
      method: "enumeration",
      run: () => {
        let num = 0;
        let den = 0;
        forEachTuple(5, 2, (t) => {
          // t[0] elder girl?, t[1] elder left-handed?, t[2] younger girl?, t[3] younger left-handed?, t[4] who answered (0 elder, 1 younger)
          const w = 0.5 * (t[1] ? 0.1 : 0.9) * 0.5 * (t[3] ? 0.1 : 0.9) * 0.5;
          const girl = t[4] === 0 ? t[0] : t[2];
          const left = t[4] === 0 ? t[1] : t[3];
          if (girl === 1 && left === 1) {
            den += w;
            if (t[0] === 1 && t[2] === 1) num += w;
          }
        });
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const g1 = coin(r);
          const l1 = coin(r, 0.1);
          const g2 = coin(r);
          const l2 = coin(r, 0.1);
          const elderAnswers = coin(r);
          const girl = elderAnswers ? g1 : g2;
          const left = elderAnswers ? l1 : l2;
          if (!(girl && left)) return null;
          return g1 && g2;
        }),
    },
  ],
  "m3-p28": [
    {
      // P(HHTH) / P(HHT), each averaged over the four coins.
      method: "formula",
      run: () => {
        const ps = [0, 1 / 3, 2 / 3, 1];
        let num = 0;
        let den = 0;
        for (const p of ps) {
          den += (1 / 4) * p * p * (1 - p);
          num += (1 / 4) * p * p * (1 - p) * p;
        }
        return num / den;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 1_000_000, (r) => {
          const ps = [0, 1 / 3, 2 / 3, 1];
          const p = ps[randInt(r, 0, 3)];
          const f1 = coin(r, p);
          const f2 = coin(r, p);
          const f3 = coin(r, p);
          if (!(f1 && f2 && !f3)) return null;
          return coin(r, p);
        }),
    },
  ],
  // ---------------------------------------------------------------- lesson checks
  "m3-lc1": [
    {
      method: "enumeration",
      run: () => {
        let cond = 0;
        let hit = 0;
        forEachDice(2, (d) => {
          if (d[0] + d[1] === 6) {
            cond++;
            if (d[0] === 3 || d[1] === 3) hit++;
          }
        });
        return hit / cond;
      },
    },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 2_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          if (a + b !== 6) return null;
          return a === 3 || b === 3;
        }),
    },
  ],
  "m3-lc2": [
    { method: "formula", run: () => oddsToProb((0.01 / 0.99) * (0.9 / 0.1)) },
    {
      method: "simulation",
      run: (rng) =>
        condProb(rng, 4_500_000, (r) => {
          const user = r() < 0.01;
          const positive = r() < (user ? 0.9 : 0.1);
          if (!positive) return null;
          return user;
        }),
    },
  ],
  "m3-lc3": [
    // Complement route: one minus the probability of blue.
    { method: "formula", run: () => 1 - ((1 / 4) * (1 / 5) + (3 / 4) * (4 / 5)) },
    {
      method: "simulation",
      run: (rng) =>
        simulateProb(rng, 1_000_000, (r) => {
          const urnA = r() < 0.25;
          const marble = randInt(r, 1, 5);
          return urnA ? marble <= 4 : marble <= 1;
        }),
    },
  ],
  "m3-lc4": [
    {
      method: "enumeration",
      run: () => {
        let even = 0;
        let three = 0;
        forEachDice(2, (d) => {
          if (d[0] + d[1] !== 8) return;
          if (d[0] % 2 === 0 && d[1] % 2 === 0) even++;
          if (d[0] === 3 || d[1] === 3) three++;
        });
        if (even === three) return 2;
        return even > three ? 0 : 1;
      },
    },
    {
      method: "simulation",
      run: (rng) => {
        const pEven = condProb(rng, 1_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          if (a + b !== 8) return null;
          return a % 2 === 0 && b % 2 === 0;
        }).value;
        const pThree = condProb(rng, 1_000_000, (r) => {
          const a = die(r);
          const b = die(r);
          if (a + b !== 8) return null;
          return a === 3 || b === 3;
        }).value;
        if (Math.abs(pEven - pThree) < 0.02) return 2;
        return pEven > pThree ? 0 : 1;
      },
    },
  ],
};
