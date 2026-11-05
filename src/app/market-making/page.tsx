"use client";

import clsx from "clsx";
import { ArrowRight, CandlestickChart, RotateCcw, Scale } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FERMI_QUESTIONS } from "@/content/fermi";
import { parseAnswer } from "@/lib/answer";
import { formatNumber } from "@/lib/format";
import { INFORMED_LEVELS, SCENARIOS, botTrade, conditionalMean, conditionalSd, expectedPnl, fermiScore, optimalHalfSpread, type InformedLevel, type RoundOutcome } from "@/lib/marketGame";
import { mulberry32, type Rng } from "@/lib/rng";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";

const ROUNDS = 10;

export default function MarketMakingPage() {
  const [tab, setTab] = useState<"market" | "fermi">("market");
  return (
    <div>
      <PageHeader
        eyebrow="Trading intuition"
        title="Make a market"
        description="Quote a bid and an ask on a hidden value. A bot trades against you; sometimes it knows the answer. Learn to centre on the conditional expectation, widen for uncertainty and informed flow, and read the feedback."
      />
      <Tabs items={[{ id: "market", label: "Market-making game" }, { id: "fermi", label: "Fermi estimation drill" }]} value={tab} onChange={setTab} className="mb-6" />
      {tab === "market" ? <MarketGame /> : <FermiDrill />}
    </div>
  );
}

interface Round {
  info: string;
  value: number;
  conditional: Map<number, number>;
  bid: number;
  ask: number;
  outcome: RoundOutcome;
  fair: number;
  optHalf: number;
}

function MarketGame() {
  const save = useStore((s) => s.saveMarketGame);
  const history = useStore((s) => s.marketGame);
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [level, setLevel] = useState<InformedLevel>("medium");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const informed = INFORMED_LEVELS[level];
  const [rng, setRng] = useState<Rng | null>(null);
  const [current, setCurrent] = useState<{ info: string; value: number; conditional: Map<number, number> } | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [bid, setBid] = useState("");
  const [ask, setAsk] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const finished = rounds.length >= ROUNDS;

  const startGame = () => {
    const r = mulberry32((Date.now() % 1_000_000) + 3);
    setRng(() => r);
    setRounds([]);
    setCurrent(scenario.draw(r));
    setBid("");
    setAsk("");
    setError(null);
    setShowHint(false);
  };

  const quote = () => {
    if (!current || !rng) return;
    const b = parseAnswer(bid);
    const a = parseAnswer(ask);
    if (!b.ok || !a.ok || b.value === undefined || a.value === undefined) {
      setError("Enter numbers for both the bid and the ask.");
      return;
    }
    if (a.value <= b.value) {
      setError("The ask must be above the bid.");
      return;
    }
    setError(null);
    const outcome = botTrade(rng, current.value, b.value, a.value, informed, scenario.maxSpread);
    const fair = conditionalMean(current.conditional);
    const opt = optimalHalfSpread(current.conditional, informed, scenario.maxSpread);
    const round: Round = { ...current, bid: b.value, ask: a.value, outcome, fair, optHalf: opt.half };
    const next = [...rounds, round];
    setRounds(next);
    setBid("");
    setAsk("");
    setShowHint(false);
    if (next.length >= ROUNDS) {
      const pnl = next.reduce((s, r) => s + r.outcome.pnl, 0);
      save({ scenario: scenario.id, rounds: next.length, pnl, avgSpread: next.reduce((s, r) => s + r.ask - r.bid, 0) / next.length, fills: next.filter((r) => r.outcome.trade !== "none").length, timestamp: Date.now() });
      setCurrent(null);
    } else {
      setCurrent(scenario.draw(rng));
    }
  };

  const pnl = rounds.reduce((s, r) => s + r.outcome.pnl, 0);
  const fairSd = current ? conditionalSd(current.conditional) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardHeader title="Set-up" action={<CandlestickChart size={18} className="text-faint" />} />
        <CardBody className="space-y-4">
          <Field label="Scenario">
            <Select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} disabled={Boolean(current)}>
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-muted">{scenario.description}</p>
          <Field label="Informed flow" hint="Share of trades that come from someone who knows the true value.">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INFORMED_LEVELS) as InformedLevel[]).map((l) => (
                <button key={l} onClick={() => setLevel(l)} disabled={Boolean(current)} className={clsx("rounded-xl border px-2 py-2 text-sm capitalize disabled:opacity-60", level === l ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")} aria-pressed={level === l}>
                  {l} <span className="font-mono text-xs">{Math.round(INFORMED_LEVELS[l] * 100)}%</span>
                </button>
              ))}
            </div>
          </Field>
          <Button onClick={startGame} leftIcon={current ? <RotateCcw size={16} /> : <ArrowRight size={16} />} variant={current ? "secondary" : "primary"}>
            {current ? "Restart" : finished ? "Play again" : `Start ${ROUNDS} rounds`}
          </Button>
          {history.length > 0 && (
            <div className="text-xs text-muted">
              {history.length} game{history.length === 1 ? "" : "s"} played · best P&amp;L <span className="font-mono text-fg">{formatNumber(Math.max(...history.map((h) => h.pnl)), 3)}</span>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="space-y-4">
        {current && (
          <Card>
            <CardBody className="pt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Round {rounds.length + 1} of {ROUNDS}</span>
                <span className="font-mono text-sm tabular text-muted">P&amp;L {formatNumber(pnl, 3)}</span>
              </div>
              <ProgressBar value={rounds.length} max={ROUNDS} size="xs" className="mb-5" />
              <p className="text-lg text-fg">{current.info}</p>
              <p className="mt-1 text-sm text-muted">Quote a two-sided market of size one. The bot may buy at your ask or sell at your bid.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Your bid">
                  <Input mono value={bid} onChange={(e) => setBid(e.target.value)} placeholder="buy at" inputMode="decimal" onKeyDown={(e) => e.key === "Enter" && quote()} />
                </Field>
                <Field label="Your ask">
                  <Input mono value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="sell at" inputMode="decimal" onKeyDown={(e) => e.key === "Enter" && quote()} />
                </Field>
              </div>
              {error && <p className="mt-2 text-sm text-danger">{error}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={quote}>Send quote</Button>
                <button className="text-xs text-muted hover:text-fg" onClick={() => setShowHint((h) => !h)}>
                  {showHint ? "Hide" : "Show"} the fair value
                </button>
                {showHint && (
                  <span className="text-xs text-muted">
                    Conditional mean <span className="font-mono text-fg">{formatNumber(conditionalMean(current.conditional), 4)}</span>, standard deviation <span className="font-mono text-fg">{formatNumber(fairSd, 3)}</span>
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {finished && <Summary rounds={rounds} informed={informed} maxSpread={scenario.maxSpread} />}

        {rounds.length > 0 && (
          <Card>
            <CardHeader title="Rounds" subtitle="Fair = conditional mean given the information. Edge = how far your mid sat from it." />
            <CardBody className="pt-2">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-wider text-faint">
                  <tr>
                    <th className="py-1 pr-2 font-medium">#</th>
                    <th className="py-1 pr-2 font-medium">Quote</th>
                    <th className="py-1 pr-2 font-medium">Fair</th>
                    <th className="py-1 pr-2 font-medium">Value</th>
                    <th className="py-1 pr-2 font-medium">Bot</th>
                    <th className="py-1 text-right font-medium">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-xs tabular">
                  {[...rounds].reverse().map((r, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-2 text-faint">{rounds.length - i}</td>
                      <td className="py-1.5 pr-2 text-fg">
                        {formatNumber(r.bid, 4)} / {formatNumber(r.ask, 4)}
                      </td>
                      <td className="py-1.5 pr-2 text-muted">{formatNumber(r.fair, 4)}</td>
                      <td className="py-1.5 pr-2 text-fg">{r.value}</td>
                      <td className="py-1.5 pr-2">
                        {r.outcome.trade === "none" ? <span className="text-faint">passed</span> : <span className={r.outcome.informed ? "text-danger" : "text-info"}>{r.outcome.trade === "bot-buys" ? "lifted your ask" : "hit your bid"}{r.outcome.informed ? " (informed)" : ""}</span>}
                      </td>
                      <td className={clsx("py-1.5 text-right", r.outcome.pnl > 0 ? "text-success" : r.outcome.pnl < 0 ? "text-danger" : "text-faint")}>{formatNumber(r.outcome.pnl, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}

        {!current && rounds.length === 0 && (
          <Card className="p-8 text-sm text-muted">
            <p className="mb-2 font-medium text-fg">How to play</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Read the information and work out the fair value: the expected value given what you know.</li>
              <li>Quote a bid below it and an ask above it. The bot trades one unit against you, or passes.</li>
              <li>Informed trades only happen when your quote is wrong, so they always lose you money. Noise trades earn the half-spread but dry up as you widen.</li>
              <li>After ten rounds you see how your spread compared with the spread that maximises expected profit against this bot.</li>
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}

function Summary({ rounds, informed, maxSpread }: { rounds: Round[]; informed: number; maxSpread: number }) {
  const pnl = rounds.reduce((s, r) => s + r.outcome.pnl, 0);
  const avgSpread = rounds.reduce((s, r) => s + (r.ask - r.bid), 0) / rounds.length;
  const avgOpt = (2 * rounds.reduce((s, r) => s + r.optHalf, 0)) / rounds.length;
  const avgMidErr = rounds.reduce((s, r) => s + Math.abs((r.bid + r.ask) / 2 - r.fair), 0) / rounds.length;
  const expectedAtYours = rounds.reduce((s, r) => s + expectedPnl(r.conditional, r.bid, r.ask, informed, maxSpread), 0);
  const expectedAtOpt = rounds.reduce((s, r) => s + expectedPnl(r.conditional, r.fair - r.optHalf, r.fair + r.optHalf, informed, maxSpread), 0);
  const informedHits = rounds.filter((r) => r.outcome.informed && r.outcome.trade !== "none").length;
  const verdict =
    avgMidErr > 0.75
      ? "Your mids were off the conditional mean. Compute the fair value first; width comes second."
      : avgSpread > avgOpt * 1.6
        ? "Your markets were too wide: you avoided informed losses but gave up most of the noise flow."
        : avgSpread < avgOpt * 0.6
          ? "Your markets were too tight for this much informed flow; you were picked off."
          : "Width was close to optimal. Now try a higher informed share and watch how much wider you need to go.";
  return (
    <Card className="border-accent-fill/40">
      <CardHeader title={pnl >= 0 ? "Profitable" : "Lost money"} subtitle={verdict} action={<Scale size={18} className="text-accent" />} />
      <CardBody>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Realised P&L" value={formatNumber(pnl, 3)} hint={`${rounds.filter((r) => r.outcome.trade !== "none").length} fills, ${informedHits} informed`} />
          <Stat label="Expected at your quotes" value={formatNumber(expectedAtYours, 3)} hint="over these ten rounds" />
          <Stat label="Expected at optimal" value={formatNumber(expectedAtOpt, 3)} hint={`half-spread ≈ ${formatNumber(avgOpt / 2, 2)}`} />
          <Stat label="Your avg spread" value={formatNumber(avgSpread, 3)} hint={`mid error ${formatNumber(avgMidErr, 2)}`} />
        </div>
        <p className="mt-4 text-sm text-muted">
          Expected P&amp;L per round = informed share × (loss when your quote is on the wrong side of the truth) + noise share × P(noise trades at this width) × half-spread. Widening cuts the first term and shrinks the second; the optimum balances them.
        </p>
      </CardBody>
    </Card>
  );
}

function FermiDrill() {
  const save = useStore((s) => s.saveFermi);
  const results = useStore((s) => s.fermi);
  const [order] = useState(() => {
    const rng = mulberry32((Date.now() % 1_000_000) + 11);
    return [...FERMI_QUESTIONS].sort(() => rng() - 0.5);
  });
  const [index, setIndex] = useState(0);
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const [result, setResult] = useState<ReturnType<typeof fermiScore> | null>(null);
  const q = order[index % order.length];

  const check = useCallback(() => {
    const l = parseAnswer(low);
    const h = parseAnswer(high);
    if (!l.ok || !h.ok || l.value === undefined || h.value === undefined) return;
    const r = fermiScore(l.value, h.value, q.truth);
    setResult(r);
    save({ questionId: q.id, low: l.value, high: h.value, truth: q.truth, score: r.score, timestamp: Date.now() });
  }, [low, high, q, save]);

  const next = () => {
    setIndex((i) => i + 1);
    setLow("");
    setHigh("");
    setResult(null);
  };

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const hits = results.filter((r) => r.truth >= r.low && r.truth <= r.high).length;
    const mean = results.reduce((s, r) => s + r.score, 0) / results.length;
    const widths = results.map((r) => Math.log10(r.high / r.low)).filter((w) => Number.isFinite(w));
    const avgWidth = widths.length ? widths.reduce((a, b) => a + b, 0) / widths.length : 0;
    return { hits, hitRate: hits / results.length, mean, avgWidth };
  }, [results]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardBody className="pt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Estimate a range</div>
          <p className="text-lg text-fg">{q.prompt}</p>
          <p className="mt-1 text-sm text-muted">Give a low and a high such that you are about 90% sure the truth lies between them. Units: {q.unit}. Scientific notation like 3e7 works.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Low">
              <Input mono value={low} onChange={(e) => setLow(e.target.value)} placeholder="e.g. 1e7" disabled={Boolean(result)} />
            </Field>
            <Field label="High">
              <Input mono value={high} onChange={(e) => setHigh(e.target.value)} placeholder="e.g. 5e7" disabled={Boolean(result)} onKeyDown={(e) => e.key === "Enter" && !result && check()} />
            </Field>
          </div>
          {!result ? (
            <Button className="mt-4" onClick={check} disabled={!low || !high}>
              Score my range
            </Button>
          ) : (
            <div className="mt-4 space-y-3 fade-up">
              <div className={clsx("rounded-xl border px-4 py-3", result.hit ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft")}>
                <div className={clsx("font-semibold", result.hit ? "text-success" : "text-danger")}>
                  {result.hit ? `Hit. Score ${result.score}/100` : "Miss. Score 0"}
                </div>
                <div className="mt-1 text-sm text-muted">
                  Truth about <span className="font-mono text-fg">{formatNumber(q.truth, 3)}</span> {q.unit}. Your range spanned {Number.isFinite(result.widthOrders) ? result.widthOrders.toFixed(2) : "?"} orders of magnitude.
                  {!result.hit && " The spread was in the wrong place: the decomposition below shows where the number comes from."}
                  {result.hit && result.widthOrders > 1.5 && " A hit, but the range was wide enough to be nearly uninformative. Tighten it next time."}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">Decomposition</div>
                <p className="text-fg">{q.decomposition}</p>
              </div>
              <Button onClick={next} rightIcon={<ArrowRight size={16} />}>
                Next question
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      <Card className="h-fit">
        <CardHeader title="Your calibration" subtitle="Aim for a 90% hit rate with the narrowest ranges you can defend." />
        <CardBody>
          {!stats ? (
            <p className="text-sm text-faint">Answer a few questions to see your hit rate and average width.</p>
          ) : (
            <div className="space-y-4">
              <Stat label="Hit rate" value={`${Math.round(stats.hitRate * 100)}%`} hint={`${stats.hits} of ${results.length}`} />
              <Stat label="Mean score" value={Math.round(stats.mean)} hint="100 = tight and right" />
              <Stat label="Avg width" value={`${stats.avgWidth.toFixed(2)} oom`} hint="orders of magnitude" />
              <p className="text-xs text-muted">
                {stats.hitRate < 0.7 && results.length >= 5
                  ? "You miss too often: your ranges are overconfident. Widen them until you hit nine times in ten, then earn the width back with better decompositions."
                  : stats.hitRate > 0.95 && stats.avgWidth > 1.5 && results.length >= 5
                    ? "You always hit but your ranges are very wide. Commit to a tighter band."
                    : "Decompose into factors you can bound, multiply, then widen by the product of your uncertainties."}
              </p>
              <Badge tone="outline">{results.length} scored</Badge>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
