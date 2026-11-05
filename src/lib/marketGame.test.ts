import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { SCENARIOS, botTrade, conditionalMean, expectedPnl, fermiScore, optimalHalfSpread } from "./marketGame";

describe("market game", () => {
  it("conditional distributions sum to one and match the information", () => {
    const rng = mulberry32(5);
    for (const s of SCENARIOS) {
      for (let i = 0; i < 200; i++) {
        const d = s.draw(rng);
        let total = 0;
        for (const p of d.conditional.values()) total += p;
        expect(total).toBeCloseTo(1, 9);
        expect(d.conditional.has(d.value)).toBe(true);
        expect(d.value).toBeGreaterThanOrEqual(s.range[0]);
        expect(d.value).toBeLessThanOrEqual(s.range[1]);
      }
    }
  });

  it("three dice with first die d has conditional mean d + 7", () => {
    const rng = mulberry32(9);
    const d = SCENARIOS[0].draw(rng);
    const shown = Number(d.info.match(/\d+/)![0]);
    expect(conditionalMean(d.conditional)).toBeCloseTo(shown + 7, 9);
  });

  it("informed bots only trade when the quote is wrong, and lose the quoter money", () => {
    const rng = mulberry32(1);
    const out = botTrade(rng, 10, 8, 12, 1, 8);
    expect(out.trade).toBe("none");
    const buys = botTrade(mulberry32(2), 15, 8, 12, 1, 8);
    expect(buys.trade).toBe("bot-buys");
    expect(buys.pnl).toBe(12 - 15);
  });

  it("wider spreads reduce informed losses but also noise flow; an optimum exists", () => {
    const d = SCENARIOS[0].draw(mulberry32(3));
    const mean = conditionalMean(d.conditional);
    const tight = expectedPnl(d.conditional, mean - 0.5, mean + 0.5, 0.35, 8);
    const wide = expectedPnl(d.conditional, mean - 3.9, mean + 3.9, 0.35, 8);
    const opt = optimalHalfSpread(d.conditional, 0.35, 8);
    expect(opt.pnl).toBeGreaterThanOrEqual(tight);
    expect(opt.pnl).toBeGreaterThanOrEqual(wide);
    expect(opt.half).toBeGreaterThan(0);
  });

  it("expected pnl agrees with simulation", () => {
    const d = SCENARIOS[1].draw(mulberry32(4));
    const mean = conditionalMean(d.conditional);
    const bid = mean - 1;
    const ask = mean + 1;
    const rng = mulberry32(77);
    let total = 0;
    const n = 200_000;
    for (let i = 0; i < n; i++) {
      // sample a value from the conditional pmf
      let r = rng();
      let v = 0;
      for (const [x, p] of d.conditional) {
        r -= p;
        v = x;
        if (r <= 0) break;
      }
      total += botTrade(rng, v, bid, ask, 0.35, 6).pnl;
    }
    expect(total / n).toBeCloseTo(expectedPnl(d.conditional, bid, ask, 0.35, 6), 1);
  });

  it("scores Fermi ranges", () => {
    expect(fermiScore(1e7, 1e8, 3e7).score).toBe(50);
    expect(fermiScore(2e7, 4e7, 3e7).score).toBeGreaterThan(80);
    expect(fermiScore(1e5, 1e6, 3e7).hit).toBe(false);
    expect(fermiScore(1, 1e4, 50).score).toBe(0);
  });
});
