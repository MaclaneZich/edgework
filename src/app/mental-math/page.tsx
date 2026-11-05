"use client";

import clsx from "clsx";
import { BookOpen, Play, RotateCcw, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DRILLS, genDrill, genEighty, genZetamac, slowestOperations, type DrillKey, type MMQuestion } from "@/lib/mentalMath";
import { mulberry32 } from "@/lib/rng";
import { formatDate, formatDuration } from "@/lib/format";
import { useStore, type MentalMathResult } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";

type Mode = "zetamac" | "eighty" | "drill";
type Tab = "play" | "history";

interface GameConfig {
  mode: Mode;
  durationSec: number;
  drill?: DrillKey;
  questionLimit?: number;
}

interface PerOp {
  [k: string]: { n: number; correct: number; totalMs: number };
}

export default function MentalMathPage() {
  const [tab, setTab] = useState<Tab>("play");
  const [game, setGame] = useState<GameConfig | null>(null);
  const [lastResult, setLastResult] = useState<MentalMathResult | null>(null);
  const [drill, setDrill] = useState<DrillKey>("x7");
  const results = useStore((s) => s.mentalMath);
  const save = useStore((s) => s.saveMentalMath);

  const onFinish = useCallback(
    (r: Omit<MentalMathResult, "id">) => {
      save(r);
      setLastResult({ ...r, id: "last" });
      setGame(null);
    },
    [save],
  );

  const best = (mode: Mode) => results.filter((r) => r.mode === mode).reduce((m, r) => Math.max(m, r.score), 0);

  if (game) {
    return <Game config={game} onFinish={onFinish} onQuit={() => setGame(null)} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mental math · secondary skill"
        title="Fast, accurate arithmetic"
        description="A calculator is allowed on the Susquehanna test, so this matters less there and more in live interviews, where you will be asked to quote numbers out loud. Ten minutes every other day is plenty."
        actions={
          <Button variant="secondary" href="/mental-math/cheatsheet" leftIcon={<BookOpen size={16} />}>
            Speed tricks
          </Button>
        }
      />
      <Tabs
        items={[
          { id: "play", label: "Play" },
          { id: "history", label: "History", count: results.length },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {lastResult && tab === "play" && (
        <Card className="mb-6 border-accent-fill/40">
          <CardBody className="flex flex-wrap items-center justify-between gap-4 pt-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Last game</div>
              <div className="mt-1 font-display text-2xl font-semibold">
                {lastResult.score} point{lastResult.score === 1 ? "" : "s"}
                <span className="ml-3 text-base font-normal text-muted">
                  {lastResult.correct}/{lastResult.attempted} correct · {lastResult.mode === "zetamac" ? "sprint" : lastResult.mode === "eighty" ? "80 in 8" : DRILLS[lastResult.drill as DrillKey]?.label}
                </span>
              </div>
            </div>
            <PerOpSummary perOp={lastResult.perOp} />
          </CardBody>
        </Card>
      )}

      {tab === "play" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader title="120-second sprint" subtitle="Zetamac defaults: add 2-100, multiply 2-12 by 2-100, with the inverse subtraction and division." action={<Zap size={18} className="text-accent" />} />
            <CardBody className="mt-auto">
              <div className="mb-4 flex gap-6">
                <Stat label="Best" value={best("zetamac") || "–"} />
                <Stat label="Games" value={results.filter((r) => r.mode === "zetamac").length} />
              </div>
              <p className="mb-4 text-xs text-muted">Typing the right answer advances automatically, exactly like the original. A score above 40 is solid; above 60 is fast.</p>
              <Button onClick={() => setGame({ mode: "zetamac", durationSec: 120 })} leftIcon={<Play size={16} />}>
                Start sprint
              </Button>
            </CardBody>
          </Card>

          <Card className="flex flex-col">
            <CardHeader title="80 questions in 8 minutes" subtitle="Multiple choice with penalty scoring: +1 right, −1 wrong, 0 skipped. Mixed decimals, percentages and 3-digit arithmetic." />
            <CardBody className="mt-auto">
              <div className="mb-4 flex gap-6">
                <Stat label="Best" value={best("eighty") || "–"} hint="out of 80" />
                <Stat label="Games" value={results.filter((r) => r.mode === "eighty").length} />
              </div>
              <p className="mb-4 text-xs text-muted">Six seconds a question. Skipping is free, so skip anything you cannot see in two seconds.</p>
              <Button onClick={() => setGame({ mode: "eighty", durationSec: 480, questionLimit: 80 })} leftIcon={<Play size={16} />} variant="secondary">
                Start test
              </Button>
            </CardBody>
          </Card>

          <Card className="flex flex-col">
            <CardHeader title="Operation drills" subtitle="60 seconds on one operation. Pick whatever the slowest-operations report flags." />
            <CardBody className="mt-auto">
              <div className="mb-4 flex flex-wrap gap-1.5">
                {(Object.keys(DRILLS) as DrillKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setDrill(k)}
                    className={clsx("rounded-lg border px-2.5 py-1.5 font-mono text-sm transition-colors", drill === k ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}
                    aria-pressed={drill === k}
                  >
                    {DRILLS[k].label}
                  </button>
                ))}
              </div>
              <p className="mb-4 text-xs text-muted">{DRILLS[drill].description}</p>
              <Button onClick={() => setGame({ mode: "drill", durationSec: 60, drill })} leftIcon={<Play size={16} />} variant="secondary">
                Drill {DRILLS[drill].label}
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : (
        <History results={results} />
      )}
    </div>
  );
}

function PerOpSummary({ perOp }: { perOp: PerOp }) {
  const rows = slowestOperations([perOp]);
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((r) => (
        <span key={r.opKey} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs">
          <span className="text-muted">{r.label}</span> <span className="font-mono tabular text-fg">{(r.avgMs / 1000).toFixed(1)}s</span>
          <span className="ml-1 font-mono tabular text-faint">{Math.round(r.accuracy * 100)}%</span>
        </span>
      ))}
    </div>
  );
}

function Game({ config, onFinish, onQuit }: { config: GameConfig; onFinish: (r: Omit<MentalMathResult, "id">) => void; onQuit: () => void }) {
  const rngRef = useRef(mulberry32((Date.now() % 1_000_000) + 17));
  const gen = useCallback((): MMQuestion => {
    const rng = rngRef.current;
    if (config.mode === "zetamac") return genZetamac(rng);
    if (config.mode === "eighty") return genEighty(rng);
    return genDrill(rng, config.drill ?? "x7");
  }, [config]);

  const [q, setQ] = useState<MMQuestion>(() => gen());
  const [value, setValue] = useState("");
  const [left, setLeft] = useState(config.durationSec);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const perOp = useRef<PerOp>({});
  const qStart = useRef(Date.now());
  const started = useRef(Date.now());
  const finishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const record = useCallback(
    (isCorrect: boolean, skipped = false) => {
      const ms = Date.now() - qStart.current;
      const cur = perOp.current[q.opKey] ?? { n: 0, correct: 0, totalMs: 0 };
      if (!skipped) {
        cur.n += 1;
        cur.correct += isCorrect ? 1 : 0;
        cur.totalMs += ms;
        perOp.current[q.opKey] = cur;
        setAttempted((a) => a + 1);
        if (isCorrect) setCorrect((c) => c + 1);
        setScore((s) => s + (isCorrect ? 1 : config.mode === "eighty" ? -1 : 0));
        setFlash(isCorrect ? "ok" : "bad");
        setTimeout(() => setFlash(null), 180);
      }
      setQ(gen());
      setValue("");
      qStart.current = Date.now();
    },
    [q, gen, config.mode],
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      mode: config.mode,
      drill: config.drill,
      score,
      attempted,
      correct,
      durationSec: Math.round((Date.now() - started.current) / 1000),
      timestamp: Date.now(),
      perOp: perOp.current,
    });
  }, [onFinish, config, score, attempted, correct]);

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      const remaining = config.durationSec - elapsed;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) finish();
    }, 250);
    return () => clearInterval(t);
  }, [config.durationSec, finish]);

  useEffect(() => {
    if (config.questionLimit && attempted >= config.questionLimit) finish();
  }, [attempted, config.questionLimit, finish]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [q]);

  // Zetamac behaviour: advance as soon as the typed value equals the answer.
  useEffect(() => {
    if (config.mode === "eighty") return;
    if (value.trim() !== "" && Number(value) === q.answer) record(true);
  }, [value, q, config.mode, record]);

  useEffect(() => {
    if (config.mode !== "eighty") return;
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key) && q.choices) {
        const idx = Number(e.key) - 1;
        record(q.choices[idx] === q.answer);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        record(false, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [config.mode, q, record]);

  const pct = (100 * left) / config.durationSec;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      <div className="mb-6 flex w-full items-center justify-between text-sm">
        <Button variant="ghost" size="sm" onClick={onQuit}>
          Quit
        </Button>
        <div className="flex items-center gap-6">
          <span className="font-mono tabular text-muted">
            score <span className="text-fg">{score}</span>
          </span>
          {config.questionLimit && (
            <span className="font-mono tabular text-muted">
              {attempted}/{config.questionLimit}
            </span>
          )}
          <span className={clsx("font-mono text-xl font-semibold tabular", left <= 10 ? "text-danger" : "text-fg")} aria-live="off">
            {formatDuration(left * 1000)}
          </span>
        </div>
      </div>
      <ProgressBar value={pct} size="xs" className="mb-10" tone={left <= 10 ? "danger" : "accent"} />

      <div
        className={clsx(
          "card flex w-full flex-col items-center px-6 py-10 transition-colors",
          flash === "ok" && "border-success/60 bg-success-soft",
          flash === "bad" && "border-danger/60 bg-danger-soft",
        )}
        aria-live="polite"
      >
        <div className="font-mono text-5xl font-semibold tabular text-fg md:text-6xl">{q.text}</div>
        {config.mode === "eighty" && q.choices ? (
          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            {q.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => record(c === q.answer)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 font-mono text-lg tabular text-fg hover:border-border-strong"
              >
                <span>{c}</span>
                <kbd className="rounded border border-border px-1.5 text-[10px] text-faint">{i + 1}</kbd>
              </button>
            ))}
            <button onClick={() => record(false, true)} className="col-span-2 rounded-xl border border-dashed border-border py-2 text-sm text-muted hover:text-fg">
              Skip (Enter) · 0 points
            </button>
          </div>
        ) : (
          <Input
            ref={inputRef}
            mono
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9.-]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim() !== "") {
                if (Number(value) !== q.answer) record(false);
              }
            }}
            className="mt-8 h-14 max-w-xs text-center text-3xl"
            inputMode="decimal"
            aria-label="Answer"
            autoComplete="off"
          />
        )}
      </div>
      <p className="mt-4 text-xs text-faint">{config.mode === "eighty" ? "Keys 1-4 answer, Enter skips." : "Correct answers advance automatically. Enter submits a wrong one so you can move on."}</p>
    </div>
  );
}

function History({ results }: { results: MentalMathResult[] }) {
  const sorted = useMemo(() => [...results].sort((a, b) => a.timestamp - b.timestamp), [results]);
  const slow = useMemo(() => slowestOperations(results.map((r) => r.perOp)), [results]);
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted">No games yet. Play one and your score history and slowest operations appear here.</p>
      </Card>
    );
  }
  const chart = sorted.map((r, i) => ({ i: i + 1, sprint: r.mode === "zetamac" ? r.score : null, eighty: r.mode === "eighty" ? r.score : null, date: formatDate(r.timestamp) }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader title="Score history" subtitle="Sprint scores in amber, 80-in-8 scores in blue." />
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="i" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--elev)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} labelFormatter={(l) => `Game ${l}`} />
                <Line type="monotone" dataKey="sprint" stroke="var(--accent-fill)" strokeWidth={2} connectNulls dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eighty" stroke="var(--info)" strokeWidth={2} connectNulls dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 max-h-56 divide-y divide-border overflow-y-auto text-sm">
            {[...sorted].reverse().map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-muted">{formatDate(r.timestamp, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                <Badge tone={r.mode === "zetamac" ? "accent" : r.mode === "eighty" ? "info" : "neutral"}>{r.mode === "zetamac" ? "sprint" : r.mode === "eighty" ? "80 in 8" : DRILLS[r.drill as DrillKey]?.label ?? "drill"}</Badge>
                <span className="font-mono tabular text-fg">{r.score}</span>
                <span className="font-mono text-xs tabular text-faint">
                  {r.correct}/{r.attempted}
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Slowest operations" subtitle="Average seconds per question, slowest first. Drill the top one." />
        <CardBody>
          <ul className="flex flex-col gap-2">
            {slow.map((s) => (
              <li key={s.opKey} className="flex items-center gap-3 text-sm">
                <span className="w-36 truncate text-fg">{s.label}</span>
                <ProgressBar value={Math.min(10000, s.avgMs)} max={10000} size="xs" className="flex-1" tone={s.avgMs > 6000 ? "danger" : s.avgMs > 3500 ? "accent" : "success"} />
                <span className="w-12 text-right font-mono text-xs tabular text-fg">{(s.avgMs / 1000).toFixed(1)}s</span>
                <span className="w-10 text-right font-mono text-xs tabular text-faint">{Math.round(s.accuracy * 100)}%</span>
              </li>
            ))}
          </ul>
          <Link href="/mental-math/cheatsheet" className="mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
            <RotateCcw size={12} /> Review the speed tricks
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
