"use client";

import clsx from "clsx";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { MODULE_META, getProblem } from "@/content";
import type { Problem } from "@/content/types";
import { brierScore } from "@/lib/calibration";
import { rampDifficulty } from "@/lib/mastery";
import type { Difficulty } from "@/content/types";
import { formatDuration } from "@/lib/format";
import { useStore, type MistakeCategory, type SessionConfig } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";
import { Stat } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/Badge";
import { ProblemView, type GradedOutcome } from "./ProblemView";

interface Result extends GradedOutcome {
  problemId: string;
}

export function SessionRunner({ config, onExit }: { config: SessionConfig; onExit: () => void }) {
  const [queue, setQueue] = useState<string[]>(config.problemIds);
  const [rampNote, setRampNote] = useState<string | null>(null);
  const problems = useMemo(() => queue.map(getProblem).filter((p): p is Problem => Boolean(p)), [queue]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const updateError = useStore((s) => s.updateError);
  const recordQuiz = useStore((s) => s.recordQuiz);
  const logStudy = useStore((s) => s.logStudy);
  const timerRunning = useStore((s) => s.timerRunning);
  const markSolutionSeen = useStore((s) => s.markSolutionSeen);
  const startRef = useRef(Date.now());
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  const current = problems[index];

  const onGraded = useCallback(
    (o: GradedOutcome) => {
      if (!current) return;
      recordAttempt({
        problemId: current.id,
        module: current.module,
        tags: current.tags,
        difficulty: current.difficulty,
        estMinutes: current.minutes,
        correct: o.correct,
        confidence: o.confidence,
        timeMs: o.timeMs,
        hintsUsed: o.hintsUsed,
        given: o.given,
        context: config.context,
      });
      markSolutionSeen(current.id);
      const nextResults = [...results, { ...o, problemId: current.id }];
      setResults(nextResults);
      // Adaptive ramp: after three quick correct answers go up a level, after two misses come down.
      if (config.adaptive && config.pool && index + 1 < queue.length) {
        const recent = nextResults.slice(-3).map((r) => {
          const p = getProblem(r.problemId);
          return { correct: r.correct, fast: Boolean(p) && r.timeMs <= p!.minutes * 60_000 };
        });
        const target = rampDifficulty(current.difficulty, recent);
        const upcoming = getProblem(queue[index + 1]);
        if (upcoming && target !== current.difficulty && upcoming.difficulty !== target) {
          const used = new Set([...queue, ...nextResults.map((r) => r.problemId)]);
          const replacement = config.pool
            .map(getProblem)
            .filter((p): p is Problem => p !== undefined && !used.has(p.id) && p.difficulty === (target as Difficulty))
            .sort((a, b) => b.tags.filter((t) => current.tags.includes(t)).length - a.tags.filter((t) => current.tags.includes(t)).length)[0];
          if (replacement) {
            setQueue((q) => q.map((id, i) => (i === index + 1 ? replacement.id : id)));
            setRampNote(target > current.difficulty ? "Three quick correct answers: next one is a level harder." : "Two misses in a row: next one is a level easier.");
          }
        }
      }
    },
    [current, recordAttempt, config, markSolutionSeen, results, index, queue],
  );

  const onMistake = useCallback(
    (category: MistakeCategory, lesson: string) => {
      if (!current) return;
      // the store opened an entry during recordAttempt; find it fresh from the store
      const entry = useStore.getState().errorLog.find((e) => e.problemId === current.id && e.resolvedAt === null);
      if (entry) updateError(entry.id, { category, lesson });
    },
    [current, updateError],
  );

  const finish = useCallback(
    (finalResults: Result[]) => {
      setFinished(true);
      const minutes = (Date.now() - startRef.current) / 60_000;
      if (!timerRunning && minutes >= 0.5) {
        logStudy({ module: config.module ?? null, minutes: Math.round(minutes * 10) / 10, startedAt: startRef.current, source: "auto", label: config.title });
      }
      if (config.quiz) {
        const score = finalResults.filter((r) => r.correct).length;
        setQuizPassed(recordQuiz(config.quiz.module, score, problems.length, config.quiz.passRatio));
      }
    },
    [timerRunning, logStudy, config, recordQuiz, problems.length],
  );

  const onNext = useCallback(() => {
    setRampNote(null);
    if (index + 1 >= problems.length) finish(results);
    else setIndex((i) => i + 1);
  }, [index, problems.length, finish, results]);

  if (problems.length === 0) {
    return <EmptyState title="Nothing to practise" description="This session has no problems in it. Head back and pick a set." action={<Button href={config.returnHref}>Back</Button>} />;
  }

  if (finished) {
    const correct = results.filter((r) => r.correct).length;
    const totalMs = results.reduce((s, r) => s + r.timeMs, 0);
    const brier = brierScore(results.map((r) => ({ confidence: r.confidence, correct: r.correct, timestamp: 0, tags: [], module: 0 })));
    const missed = results.filter((r) => !r.correct);
    return (
      <div className="mx-auto max-w-3xl space-y-6 fade-up">
        <div className="card p-6 md:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{config.title}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            {config.quiz
              ? quizPassed
                ? "Mastery quiz passed"
                : "Quiz not passed yet"
              : correct === results.length
                ? "Clean sheet"
                : correct >= results.length * 0.7
                  ? "Solid session"
                  : "Useful session"}
          </h1>
          {config.quiz && (
            <p className="mt-2 text-sm text-muted">
              {quizPassed
                ? "The hard set for this module is unlocked. The real test will feel slower than those problems."
                : `You need ${Math.ceil(config.quiz.passRatio * results.length)} of ${results.length}. Review the misses below, then try again; the quiz draws different problems each time.`}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat label="Score" value={`${correct}/${results.length}`} />
            <Stat label="Accuracy" value={`${Math.round((100 * correct) / Math.max(1, results.length))}%`} />
            <Stat label="Time" value={formatDuration(totalMs)} />
            <Stat label="Brier" value={brier === null ? "–" : brier.toFixed(2)} hint={brier !== null ? (brier < 0.15 ? "well calibrated" : brier < 0.25 ? "decent" : "miscalibrated") : undefined} />
          </div>
        </div>

        <div className="card divide-y divide-border">
          {results.map((r, i) => {
            const p = getProblem(r.problemId)!;
            return (
              <div key={r.problemId} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", r.correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                  {r.correct ? <Check size={14} /> : <X size={14} />}
                </span>
                <span className="w-6 font-mono text-xs text-faint">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-fg">{p.title}</span>
                <DifficultyBadge level={p.difficulty} />
                <span className="hidden w-14 text-right font-mono text-xs tabular text-muted sm:inline">{Math.round(r.confidence * 100)}%</span>
                <span className="w-14 text-right font-mono text-xs tabular text-muted">{formatDuration(r.timeMs)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button href={config.returnHref} leftIcon={<ArrowLeft size={16} />} variant="secondary" onClick={onExit}>
            Back
          </Button>
          {missed.length > 0 && (
            <Button href="/redo" variant="outline" leftIcon={<RotateCcw size={16} />}>
              {missed.length} added to the Redo Queue
            </Button>
          )}
          {config.quiz && !quizPassed && (
            <Button href={`/modules/${config.quiz.module}`} onClick={onExit}>
              Back to module
            </Button>
          )}
          <Link href="/calibration" className="self-center text-sm text-muted hover:text-fg">
            See calibration
          </Link>
        </div>
      </div>
    );
  }

  const moduleTitle = config.module ? MODULE_META.find((m) => m.id === config.module)?.title : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{config.title}</div>
          {moduleTitle && <div className="truncate text-xs text-muted">{moduleTitle}</div>}
        </div>
        <Button variant="ghost" size="sm" href={config.returnHref} onClick={onExit} leftIcon={<X size={14} />}>
          Exit
        </Button>
      </div>
      <ProgressBar value={index + (results.length > index ? 1 : 0)} max={problems.length} size="sm" className="mb-6" label={`${results.length} of ${problems.length} answered`} showValue />
      {rampNote && <div className="mb-4 rounded-lg border border-accent-fill/40 bg-accent-soft px-3 py-2 text-xs text-fg">{rampNote}</div>}
      <ProblemView
        key={current.id}
        problem={current}
        index={index}
        total={problems.length}
        onGraded={onGraded}
        onNext={onNext}
        onMistake={onMistake}
        nextLabel={index + 1 >= problems.length ? "Finish" : "Next"}
        paceMinutes={config.paceMinutes}
      />
    </div>
  );
}
