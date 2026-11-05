"use client";

import clsx from "clsx";
import { Check, ChevronDown, Flag, Minus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getProblem } from "@/content";
import { CODING_BY_ID } from "@/content/coding";
import { formatDuration } from "@/lib/format";
import { scoreBand } from "@/lib/mocks";
import type { MockResult } from "@/lib/store";
import { InlineMath, MathText } from "@/components/Math";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/Badge";

export function MockReview({ result, history }: { result: MockResult; slots?: Array<{ kind: "math" | "coding"; problemId: string }>; history: number[] }) {
  const band = scoreBand(result.score, result.total, history);
  const avgMs = result.questions.length ? result.questions.reduce((s, q) => s + q.timeMs, 0) / result.questions.length : 0;
  const slowest = [...result.questions].sort((a, b) => b.timeMs - a.timeMs)[0];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Score report · {result.title}</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        {result.score} / {result.total}
        <span className="ml-3 text-xl font-normal text-muted">{band.label}</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{band.note}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <Stat label="Time used" value={formatDuration(result.durationMs)} hint={`avg ${formatDuration(avgMs)} per question`} />
        </Card>
        <Card className="p-4">
          <Stat label="Versus your history" value={band.percentileOfOwn === null ? "first" : `${band.percentileOfOwn}%`} hint={band.percentileOfOwn === null ? "no earlier mocks of this kind" : "of your earlier mocks scored lower"} />
        </Card>
        <Card className="p-4">
          <Stat label="Skipped" value={result.questions.filter((q) => q.skipped).length} hint="unanswered counts as wrong" />
        </Card>
        <Card className="p-4">
          <Stat label="Focus" value={result.lockdown ? `${result.focusLosses} exits` : "–"} hint={result.lockdown ? "window or tab switches" : "lockdown was off"} />
        </Card>
      </div>

      {slowest && slowest.timeMs > 7 * 60_000 && (
        <div className="mt-4 rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm text-muted">
          Your slowest question took {formatDuration(slowest.timeMs)}. One slow question costs more than one wrong answer; practise the skip rule.
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Question by question" subtitle="Expand any row for the fastest solve path and the full solution." />
        <CardBody className="pt-2">
          <ol className="divide-y divide-border">
            {result.questions.map((q, i) => (
              <ReviewRow key={i} index={i} q={q} />
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/mock" variant="secondary">
          All mocks
        </Button>
        <Button href="/redo">Redo the misses</Button>
        <Link href="/" className="self-center text-sm text-muted hover:text-fg">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function ReviewRow({ index, q }: { index: number; q: MockResult["questions"][number] }) {
  const [open, setOpen] = useState(false);
  const problem = q.isCoding ? null : getProblem(q.problemId);
  const coding = q.isCoding ? CODING_BY_ID.get(q.problemId) : null;
  const status = q.skipped ? "skipped" : q.correct ? "correct" : "wrong";
  return (
    <li>
      <button className="flex w-full items-center gap-3 py-3 text-left text-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", status === "correct" ? "bg-success-soft text-success" : status === "wrong" ? "bg-danger-soft text-danger" : "bg-surface-2 text-muted")}>
          {status === "correct" ? <Check size={14} /> : status === "wrong" ? <X size={14} /> : <Minus size={14} />}
        </span>
        <span className="w-6 font-mono text-xs text-faint">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-fg">{problem?.title ?? coding?.title ?? q.problemId}</span>
        {q.flagged && <Flag size={13} className="text-accent" aria-label="flagged" />}
        {problem && <DifficultyBadge level={problem.difficulty} />}
        <span className={clsx("w-14 text-right font-mono text-xs tabular", problem && q.timeMs > problem.minutes * 60_000 * 1.5 ? "text-danger" : "text-muted")}>{formatDuration(q.timeMs)}</span>
        <ChevronDown size={16} className={clsx("text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mb-4 ml-9 space-y-3 rounded-xl border border-border bg-surface-2/40 p-4 text-sm fade-up">
          {problem ? (
            <>
              <MathText className="text-fg">{problem.prompt}</MathText>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-muted">Your answer:</span>
                <span className="font-mono text-fg">{q.skipped ? "(skipped)" : q.answer}</span>
                <span className="text-muted">Exact:</span>
                <span className="font-mono text-fg">
                  <InlineMath>{`$${problem.answer.type === "numeric" ? problem.answer.exact : problem.answer.options[problem.answer.correct]}$`}</InlineMath>
                </span>
              </div>
              <div className="rounded-lg border border-info/30 bg-info-soft px-3 py-2">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-info">Fastest path</div>
                <MathText className="text-fg">{problem.fastPath}</MathText>
              </div>
              <details>
                <summary className="cursor-pointer text-xs text-muted hover:text-fg">Full worked solution</summary>
                <MathText className="mt-2 text-fg">{problem.solution}</MathText>
              </details>
            </>
          ) : coding ? (
            <>
              <MathText className="text-fg">{coding.prompt}</MathText>
              <div className="text-xs text-muted">{q.skipped ? "You never ran the tests." : q.correct ? "All tests passed." : "Some tests failed."}</div>
              <details>
                <summary className="cursor-pointer text-xs text-muted hover:text-fg">Reference solution</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-fg">{coding.solution.js}</pre>
                <p className="mt-2 text-muted">{coding.solution.explanation}</p>
              </details>
            </>
          ) : null}
        </div>
      )}
    </li>
  );
}
