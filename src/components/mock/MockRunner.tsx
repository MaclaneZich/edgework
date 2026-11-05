"use client";

import clsx from "clsx";
import { Calculator as CalcIcon, Check, ChevronLeft, ChevronRight, Code2, Flag, Lock, Maximize, PenLine, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProblem } from "@/content";
import { CODING_BY_ID } from "@/content/coding";
import type { Problem } from "@/content/types";
import { gradeAnswer } from "@/lib/answer";
import { formatDuration } from "@/lib/format";
import { useStore, type MockQuestionResult, type MockResult } from "@/lib/store";
import { MathText } from "@/components/Math";
import { AnswerInput } from "@/components/session/AnswerInput";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Calculator } from "./Calculator";
import { CodingPane, initialCodingState, type CodingState } from "./CodingPane";
import { MockReview } from "./MockReview";

export interface MockRunConfig {
  id: string;
  title: string;
  kind: "standard" | "hard" | "drill";
  problemIds: string[];
  codingId: string | null;
  minutes: number;
  description?: string;
}

type Slot = { kind: "math"; problem: Problem } | { kind: "coding"; problemId: string };

const SKIP_NUDGE_MS = 4 * 60_000;

export function MockRunner({ config }: { config: MockRunConfig }) {
  const [phase, setPhase] = useState<"intro" | "running" | "review">("intro");
  const [codingFirst, setCodingFirst] = useState(false);
  const [lockdown, setLockdown] = useState(false);
  const [result, setResult] = useState<MockResult | null>(null);
  const history = useStore((s) => s.mockResults);

  const mathProblems = useMemo(() => config.problemIds.map(getProblem).filter((p): p is Problem => Boolean(p)), [config.problemIds]);
  const slots = useMemo<Slot[]>(() => {
    const math: Slot[] = mathProblems.map((p) => ({ kind: "math", problem: p }));
    if (!config.codingId || !CODING_BY_ID.has(config.codingId)) return math;
    const coding: Slot = { kind: "coding", problemId: config.codingId };
    return codingFirst ? [coding, ...math] : [...math, coding];
  }, [mathProblems, config.codingId, codingFirst]);

  if (phase === "intro") {
    return (
      <Intro
        config={config}
        slots={slots}
        codingFirst={codingFirst}
        setCodingFirst={setCodingFirst}
        lockdown={lockdown}
        setLockdown={setLockdown}
        onStart={async () => {
          if (lockdown) {
            try {
              await document.documentElement.requestFullscreen?.();
            } catch {
              /* fullscreen is best-effort */
            }
          }
          setPhase("running");
        }}
      />
    );
  }

  if (phase === "review" && result) {
    return <MockReview result={result} slots={slots.map((s) => (s.kind === "math" ? { kind: "math", problemId: s.problem.id } : { kind: "coding", problemId: s.problemId }))} history={history.filter((h) => h.id !== result.id && h.kind === result.kind).map((h) => h.score)} />;
  }

  return (
    <Running
      config={config}
      slots={slots}
      lockdown={lockdown}
      onSubmit={(r) => {
        setResult(r);
        setPhase("review");
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
      }}
    />
  );
}

function Intro({
  config,
  slots,
  codingFirst,
  setCodingFirst,
  lockdown,
  setLockdown,
  onStart,
}: {
  config: MockRunConfig;
  slots: Slot[];
  codingFirst: boolean;
  setCodingFirst: (v: boolean) => void;
  lockdown: boolean;
  setLockdown: (v: boolean) => void;
  onStart: () => void;
}) {
  const hasCoding = slots.some((s) => s.kind === "coding");
  const checklistDone = useStore((s) => Object.keys(s.checklist).filter((k) => k.startsWith("check:") && s.checklist[k]).length);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <Link href="/mock" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ChevronLeft size={16} /> All mocks
      </Link>
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{config.kind === "drill" ? "Pacing drill" : config.kind === "hard" ? "Hard mock" : "Standard mock"}</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">{config.title}</h1>
      {config.description && <p className="mt-3 text-[15px] leading-relaxed text-muted">{config.description}</p>}

      <div className="card mt-8 divide-y divide-border">
        <Row label="Format">
          {slots.length} questions · {config.minutes} minutes · about {(config.minutes / slots.length).toFixed(1)} minutes each
        </Row>
        <Row label="Navigation">Free. Flag any question and come back. Answers save as you type.</Row>
        <Row label="Pausing">None. The clock runs until you submit or time expires, exactly like the real test.</Row>
        <Row label="Tools">A calculator and a scratchpad (type or draw) sit in the side panel. Paper is allowed in the real test too.</Row>
        {config.kind !== "drill" && (
          <Row label="Pacing">Six minutes a question. At four minutes on one question the app reminds you of the skip rule.</Row>
        )}
      </div>

      {hasCoding && (
        <div className="card mt-4 p-5">
          <div className="mb-2 text-sm font-medium">Start with</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setCodingFirst(false)} className={clsx("rounded-xl border px-4 py-3 text-left text-sm", !codingFirst ? "border-accent-fill bg-accent-soft" : "border-border hover:border-border-strong")} aria-pressed={!codingFirst}>
              <div className="font-medium text-fg">Math first</div>
              <div className="text-xs text-muted">Coding question last</div>
            </button>
            <button onClick={() => setCodingFirst(true)} className={clsx("rounded-xl border px-4 py-3 text-left text-sm", codingFirst ? "border-accent-fill bg-accent-soft" : "border-border hover:border-border-strong")} aria-pressed={codingFirst}>
              <div className="font-medium text-fg">Coding first</div>
              <div className="text-xs text-muted">Then the eleven math questions</div>
            </button>
          </div>
          <p className="mt-2 text-xs text-faint">The real test lets you choose too. Most candidates do the math first and leave twelve to fifteen minutes for the code.</p>
        </div>
      )}

      <div className="card mt-4 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent-fill)]" checked={lockdown} onChange={(e) => setLockdown(e.target.checked)} />
          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-fg">
              <Lock size={14} /> Lockdown rehearsal
            </span>
            <span className="mt-1 block text-xs text-muted">
              Goes fullscreen and warns the moment you switch tabs or windows. The real test ends your attempt if you leave the browser, so practise not leaving it.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onStart} leftIcon={<Maximize size={16} />}>
          Start the clock
        </Button>
        <Link href="/mock/checklist" className="text-sm text-muted hover:text-fg">
          Pre-test checklist {checklistDone ? `(${checklistDone} done)` : ""}
        </Link>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[120px_1fr]">
      <span className="text-muted">{label}</span>
      <span className="text-fg">{children}</span>
    </div>
  );
}

function Running({ config, slots, lockdown, onSubmit }: { config: MockRunConfig; slots: Slot[]; lockdown: boolean; onSubmit: (r: MockResult) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [coding, setCoding] = useState<Record<number, CodingState>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [tool, setTool] = useState<"none" | "calc" | "pad">("none");
  const [scratch, setScratch] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [focusLosses, setFocusLosses] = useState(0);
  const [warning, setWarning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const startedAt = useRef(Date.now());
  const deadline = startedAt.current + config.minutes * 60_000;
  const timeSpent = useRef<Record<number, number>>({});
  const activeSince = useRef(Date.now());
  const submitted = useRef(false);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const saveMock = useStore((s) => s.saveMock);
  const logStudy = useStore((s) => s.logStudy);
  const timerRunning = useStore((s) => s.timerRunning);

  const accrue = useCallback(() => {
    const t = Date.now();
    timeSpent.current[index] = (timeSpent.current[index] ?? 0) + (t - activeSince.current);
    activeSince.current = t;
  }, [index]);

  const goTo = useCallback(
    (i: number) => {
      accrue();
      setIndex(Math.max(0, Math.min(slots.length - 1, i)));
      activeSince.current = Date.now();
    },
    [accrue, slots.length],
  );

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    accrue();
    const finishedAt = Date.now();
    const questions: MockQuestionResult[] = slots.map((s, i) => {
      const ms = timeSpent.current[i] ?? 0;
      if (s.kind === "coding") {
        const st = coding[i];
        const ran = st?.lastRun ?? null;
        return { problemId: s.problemId, correct: ran ? ran.ok : null, timeMs: ms, flagged: flags.has(i), answer: st ? st.code[st.language] : "", isCoding: true, skipped: !ran };
      }
      const given = answers[i] ?? "";
      const skipped = given.trim() === "";
      const g = skipped ? null : gradeAnswer(s.problem.answer, s.problem.answer.type === "choice" ? Number(given) : given);
      const correct = g ? g.correct : false;
      recordAttempt({
        problemId: s.problem.id,
        module: s.problem.module,
        tags: s.problem.tags,
        difficulty: s.problem.difficulty,
        estMinutes: s.problem.minutes,
        correct,
        confidence: 0.7,
        timeMs: ms,
        hintsUsed: 0,
        given: skipped ? "(skipped)" : s.problem.answer.type === "choice" ? s.problem.answer.options[Number(given)] ?? given : given,
        context: config.kind === "drill" ? "drill" : "mock",
      });
      return { problemId: s.problem.id, correct: skipped ? null : correct, timeMs: ms, flagged: flags.has(i), answer: given, skipped };
    });
    const score = questions.filter((q) => q.correct === true).length;
    const saved = saveMock({
      mockId: config.id,
      title: config.title,
      kind: config.kind === "drill" ? "drill" : lockdown && config.kind === "hard" ? "final" : config.kind,
      startedAt: startedAt.current,
      finishedAt,
      durationMs: finishedAt - startedAt.current,
      questions,
      score,
      total: slots.length,
      lockdown,
      focusLosses,
    });
    const minutes = (finishedAt - startedAt.current) / 60_000;
    if (!timerRunning && minutes >= 1) logStudy({ module: null, minutes: Math.round(minutes), startedAt: startedAt.current, source: "auto", label: config.title });
    onSubmit(saved);
  }, [accrue, slots, coding, answers, flags, recordAttempt, saveMock, config, lockdown, focusLosses, logStudy, timerRunning, onSubmit]);

  // clock
  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= deadline) submit();
    }, 500);
    return () => clearInterval(t);
  }, [deadline, submit]);

  // lockdown: detect leaving the page
  useEffect(() => {
    if (!lockdown) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        setFocusLosses((n) => n + 1);
        setWarning(true);
      }
    };
    const onBlur = () => {
      setFocusLosses((n) => n + 1);
      setWarning(true);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
    };
  }, [lockdown]);

  // warn on refresh / close
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const remaining = Math.max(0, deadline - now);
  const currentSpent = (timeSpent.current[index] ?? 0) + (now - activeSince.current);
  const answeredCount = slots.filter((s, i) => (s.kind === "coding" ? Boolean(coding[i]?.lastRun) : (answers[i] ?? "").trim() !== "")).length;
  const elapsed = now - startedAt.current;
  const perQuestion = (config.minutes * 60_000) / slots.length;
  const expectedDone = elapsed / perQuestion;
  const paceDelta = answeredCount - expectedDone; // positive = ahead
  const slot = slots[index];

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-border bg-elev/80 px-4 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm font-medium text-fg">{config.title}</span>
          {lockdown && (
            <span className="hidden items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] text-danger sm:inline-flex">
              <Lock size={11} /> lockdown{focusLosses ? ` · ${focusLosses} exit${focusLosses > 1 ? "s" : ""}` : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className={clsx("hidden font-mono text-xs tabular sm:inline", paceDelta >= 0 ? "text-success" : paceDelta > -1 ? "text-muted" : "text-danger")} title="Questions answered minus questions the clock expects by now">
            {paceDelta >= 0 ? "ahead" : "behind"} {Math.abs(paceDelta).toFixed(1)}
          </span>
          <span className={clsx("font-mono text-2xl font-semibold tabular", remaining < 5 * 60_000 ? "text-danger" : "text-fg")} aria-live="off" aria-label="Time remaining">
            {formatDuration(remaining)}
          </span>
          <Button size="sm" variant="primary" onClick={() => setConfirm(true)}>
            Submit
          </Button>
        </div>
      </header>

      {/* question strip */}
      <nav className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-elev/50 px-4 py-2" aria-label="Questions">
        {slots.map((s, i) => {
          const answered = s.kind === "coding" ? Boolean(coding[i]?.lastRun) : (answers[i] ?? "").trim() !== "";
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={clsx(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs transition-colors",
                i === index ? "border-accent-fill bg-accent-soft text-fg" : answered ? "border-border bg-surface-2 text-fg" : "border-border text-muted hover:text-fg",
              )}
              aria-current={i === index ? "step" : undefined}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${flags.has(i) ? ", flagged" : ""}`}
            >
              {s.kind === "coding" ? <Code2 size={13} /> : i + 1}
              {flags.has(i) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-fill" aria-hidden />}
            </button>
          );
        })}
        <span className="ml-auto shrink-0 font-mono text-xs tabular text-faint">
          {answeredCount}/{slots.length} answered
        </span>
      </nav>

      <div className="flex min-h-0 flex-1">
        {/* main */}
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-semibold">Question {index + 1}</span>
                <span className={clsx("font-mono text-xs tabular", currentSpent > SKIP_NUDGE_MS ? "text-danger" : "text-faint")}>{formatDuration(currentSpent)} on this one</span>
              </div>
              <button
                onClick={() =>
                  setFlags((f) => {
                    const n = new Set(f);
                    if (n.has(index)) n.delete(index);
                    else n.add(index);
                    return n;
                  })
                }
                className={clsx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs", flags.has(index) ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}
                aria-pressed={flags.has(index)}
              >
                <Flag size={13} /> {flags.has(index) ? "Flagged" : "Flag for review"}
              </button>
            </div>

            {currentSpent > SKIP_NUDGE_MS && config.kind !== "drill" && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <span>Skip rule: four minutes in. Write down your best guess, flag it, and move on. Come back only if time remains.</span>
              </div>
            )}

            {slot.kind === "math" ? (
              <div className="space-y-5">
                <div className="card p-5 md:p-6">
                  <MathText className="text-[17px] leading-[1.65] text-fg">{slot.problem.prompt}</MathText>
                </div>
                <div className="card p-5">
                  <AnswerInput
                    key={index}
                    answer={slot.problem.answer}
                    value={answers[index] ?? ""}
                    onChange={(v) => setAnswers((a) => ({ ...a, [index]: v }))}
                    onSubmit={() => goTo(index + 1)}
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <CodingPane
                problem={CODING_BY_ID.get(slot.problemId)!}
                state={coding[index] ?? initialCodingState(CODING_BY_ID.get(slot.problemId)!)}
                onChange={(s) => setCoding((c) => ({ ...c, [index]: s }))}
              />
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={() => goTo(index - 1)} disabled={index === 0} leftIcon={<ChevronLeft size={16} />}>
                Previous
              </Button>
              {index < slots.length - 1 ? (
                <Button onClick={() => goTo(index + 1)} rightIcon={<ChevronRight size={16} />}>
                  Next
                </Button>
              ) : (
                <Button onClick={() => setConfirm(true)} rightIcon={<Check size={16} />}>
                  Review and submit
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* tools */}
        <aside className={clsx("hidden shrink-0 flex-col border-l border-border bg-elev/60 md:flex", tool === "none" ? "w-12" : "w-[340px]")}>
          <div className="flex flex-col gap-1 p-2">
            <ToolButton active={tool === "calc"} onClick={() => setTool(tool === "calc" ? "none" : "calc")} icon={<CalcIcon size={16} />} label="Calculator" />
            <ToolButton active={tool === "pad"} onClick={() => setTool(tool === "pad" ? "none" : "pad")} icon={<PenLine size={16} />} label="Scratchpad" />
          </div>
          {tool !== "none" && (
            <div className="flex min-h-0 flex-1 flex-col p-3 pt-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">{tool === "calc" ? "Calculator" : "Scratchpad"}</span>
                <button onClick={() => setTool("none")} className="rounded p-1 text-muted hover:text-fg" aria-label="Close panel">
                  <X size={14} />
                </button>
              </div>
              <div className="min-h-0 flex-1">{tool === "calc" ? <Calculator /> : <ScratchpadLazy text={scratch} onText={setScratch} />}</div>
            </div>
          )}
        </aside>
      </div>

      {/* mobile tool bar */}
      <div className="flex items-center gap-2 border-t border-border bg-elev px-3 py-2 md:hidden">
        <Button size="sm" variant={tool === "calc" ? "primary" : "secondary"} onClick={() => setTool(tool === "calc" ? "none" : "calc")} leftIcon={<CalcIcon size={14} />}>
          Calc
        </Button>
        <Button size="sm" variant={tool === "pad" ? "primary" : "secondary"} onClick={() => setTool(tool === "pad" ? "none" : "pad")} leftIcon={<PenLine size={14} />}>
          Pad
        </Button>
      </div>
      {tool !== "none" && (
        <div className="fixed inset-x-0 bottom-12 z-20 h-72 border-t border-border bg-elev p-3 md:hidden">
          {tool === "calc" ? <Calculator /> : <ScratchpadLazy text={scratch} onText={setScratch} />}
        </div>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Submit the test?" size="sm">
        <p className="text-sm text-muted">
          {answeredCount} of {slots.length} answered{flags.size ? `, ${flags.size} flagged` : ""}. {formatDuration(remaining)} remains. Unanswered questions count as wrong.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep working
          </Button>
          <Button onClick={submit}>Submit</Button>
        </div>
      </Dialog>

      <Dialog open={warning} onClose={() => setWarning(false)} title="You left the test window" size="sm" dismissible>
        <p className="text-sm text-muted">In the real assessment, leaving the browser tab or window ends the attempt. The clock here kept running. Exit count: {focusLosses}.</p>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setWarning(false)}>Back to the test</Button>
        </div>
      </Dialog>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-fg")} aria-label={label} aria-pressed={active} title={label}>
      {icon}
    </button>
  );
}

import dynamic from "next/dynamic";
const ScratchpadLazy = dynamic(() => import("./Scratchpad").then((m) => m.Scratchpad), { ssr: false });
