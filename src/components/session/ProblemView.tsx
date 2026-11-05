"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Clock, Lightbulb, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "@/content/types";
import { TAGS } from "@/content/types";
import { FAMILY_BY_ID } from "@/content/families";
import { MODULE_META } from "@/content";
import { gradeAnswer } from "@/lib/answer";
import { formatDuration } from "@/lib/format";
import type { MistakeCategory } from "@/lib/store-types";
import { useStore } from "@/lib/store";
import { speak, synthesisSupported } from "@/lib/useSpeech";
import { InlineMath, MathText } from "@/components/Math";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AnswerInput } from "./AnswerInput";
import { ConfidencePicker } from "./ConfidencePicker";

export interface GradedOutcome {
  correct: boolean;
  confidence: number;
  timeMs: number;
  hintsUsed: number;
  given: string;
  gaveUp: boolean;
}

export const MISTAKE_LABELS: Record<MistakeCategory, string> = {
  setup: "Set-up",
  arithmetic: "Arithmetic",
  misread: "Misread",
  concept: "Concept gap",
  time: "Ran out of time",
  unsure: "Not sure yet",
};

export function ProblemView({
  problem,
  index,
  total,
  onGraded,
  onNext,
  onMistake,
  nextLabel = "Next",
  paceMinutes,
  showModuleLink = true,
  compact = false,
}: {
  problem: Problem;
  index?: number;
  total?: number;
  onGraded: (o: GradedOutcome) => void;
  onNext: () => void;
  onMistake?: (category: MistakeCategory, lesson: string) => void;
  nextLabel?: string;
  paceMinutes?: number;
  showModuleLink?: boolean;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [graded, setGraded] = useState<GradedOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showVariation, setShowVariation] = useState(false);
  const [category, setCategory] = useState<MistakeCategory | null>(null);
  const [lesson, setLesson] = useState("");
  const startRef = useRef<number>(Date.now());
  const reduce = useReducedMotion();
  const readAloud = useStore((s) => s.settings.readAloud);

  // reset per problem
  useEffect(() => {
    setValue("");
    setConfidence(null);
    setHintsShown(0);
    setGraded(null);
    setError(null);
    setElapsed(0);
    setShowVariation(false);
    setCategory(null);
    setLesson("");
    startRef.current = Date.now();
  }, [problem.id]);

  useEffect(() => {
    if (graded) return;
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => clearInterval(t);
  }, [graded, problem.id]);

  const submit = useCallback(() => {
    if (graded) return;
    if (!value.trim()) {
      setError(problem.answer.type === "choice" ? "Pick an option first." : "Type an answer first.");
      return;
    }
    if (confidence === null) {
      setError("Pick your confidence before checking. It is the whole point.");
      return;
    }
    const g = gradeAnswer(problem.answer, problem.answer.type === "choice" ? Number(value) : value);
    if (g.error && g.given === undefined) {
      setError(g.error);
      return;
    }
    const outcome: GradedOutcome = {
      correct: g.correct,
      confidence,
      timeMs: Date.now() - startRef.current,
      hintsUsed: hintsShown,
      given: problem.answer.type === "choice" ? problem.answer.options[Number(value)] ?? value : value,
      gaveUp: false,
    };
    setError(null);
    setGraded(outcome);
    onGraded(outcome);
  }, [graded, value, confidence, problem, hintsShown, onGraded]);

  const giveUp = useCallback(() => {
    if (graded) return;
    const outcome: GradedOutcome = {
      correct: false,
      confidence: confidence ?? 0.5,
      timeMs: Date.now() - startRef.current,
      hintsUsed: hintsShown,
      given: "(showed solution)",
      gaveUp: true,
    };
    setGraded(outcome);
    onGraded(outcome);
  }, [graded, confidence, hintsShown, onGraded]);

  // Enter advances after grading (when focus is not in a text field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "Enter" && graded && tag !== "TEXTAREA" && tag !== "INPUT") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [graded, onNext]);

  const pace = paceMinutes ?? problem.minutes;
  const overPace = elapsed > pace * 60_000;
  const nearSkip = elapsed > 4 * 60_000 && paceMinutes !== undefined;
  const moduleMeta = MODULE_META.find((m) => m.id === problem.module);
  const family = problem.family ? FAMILY_BY_ID.get(problem.family) : undefined;
  const exact = useMemo(() => (problem.answer.type === "numeric" ? problem.answer.exact : problem.answer.options[problem.answer.correct]), [problem]);

  return (
    <div className={clsx("flex flex-col gap-5", compact ? "" : "")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {typeof index === "number" && typeof total === "number" && (
            <span className="font-mono text-xs tabular text-faint">
              {index + 1} / {total}
            </span>
          )}
          <DifficultyBadge level={problem.difficulty} showLabel />
          {problem.tags.slice(0, 3).map((t) => (
            <Badge key={t} tone="outline">
              {TAGS[t]}
            </Badge>
          ))}
          {showModuleLink && moduleMeta && (
            <Link href={`/modules/${problem.module}`} className="text-xs text-muted hover:text-fg">
              Module {problem.module}
            </Link>
          )}
        </div>
        <div className={clsx("flex items-center gap-1.5 font-mono text-sm tabular", overPace && !graded ? "text-danger" : "text-muted")} aria-live="off">
          {readAloud && synthesisSupported() && (
            <button type="button" onClick={() => speak(problem.prompt)} className="mr-2 rounded p-1 text-muted hover:text-fg" aria-label="Read the problem aloud">
              <Volume2 size={14} />
            </button>
          )}
          <Clock size={14} />
          <span>{formatDuration(graded ? graded.timeMs : elapsed)}</span>
          <span className="text-faint">/ {pace} min</span>
        </div>
      </div>

      {nearSkip && !graded && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          Four minutes in. In the real test, flag it and move on; come back if time remains.
        </div>
      )}

      <div className="card p-5 md:p-6">
        <h2 className="sr-only">Problem</h2>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{problem.title}</div>
        <MathText className="text-[17px] leading-[1.65] text-fg">{problem.prompt}</MathText>
      </div>

      {hintsShown > 0 && (
        <ol className="flex flex-col gap-2" aria-label="Hints">
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm text-fg"
            >
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <span className="mr-2 font-mono text-[11px] text-faint">Hint {i + 1}</span>
                <InlineMath>{h}</InlineMath>
              </div>
            </motion.li>
          ))}
        </ol>
      )}

      {!graded ? (
        <div className="card flex flex-col gap-4 p-5">
          <AnswerInput answer={problem.answer} value={value} onChange={setValue} onSubmit={submit} autoFocus />
          <ConfidencePicker value={confidence} onChange={setConfidence} />
          {error && (
            <div role="alert" className="text-sm text-danger">
              {error}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setHintsShown((h) => Math.min(3, h + 1))} disabled={hintsShown >= 3} leftIcon={<Lightbulb size={14} />}>
                {hintsShown === 0 ? "Hint" : hintsShown < 3 ? `Hint ${hintsShown + 1}` : "No more hints"}
              </Button>
              <Button variant="ghost" size="sm" onClick={giveUp}>
                Show solution
              </Button>
            </div>
            <Button onClick={submit} rightIcon={<Check size={16} />}>
              Check answer
            </Button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="graded"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div
              className={clsx(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                graded.correct ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft",
              )}
              role="status"
            >
              <div className="flex items-center gap-3">
                <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full", graded.correct ? "bg-success text-accent-ink" : "bg-danger text-white")}>
                  {graded.correct ? <Check size={18} /> : <X size={18} />}
                </span>
                <div>
                  <div className={clsx("font-semibold", graded.correct ? "text-success" : "text-danger")}>
                    {graded.gaveUp ? "Solution revealed" : graded.correct ? "Correct" : "Not quite"}
                  </div>
                  <div className="text-xs text-muted">
                    {graded.gaveUp ? "Counted as a miss." : `You answered ${graded.given}.`} Confidence {Math.round(graded.confidence * 100)}%, {formatDuration(graded.timeMs)}
                    {graded.hintsUsed ? `, ${graded.hintsUsed} hint${graded.hintsUsed > 1 ? "s" : ""}` : ""}.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Exact answer</span>
                <span className="rounded-lg bg-surface px-2.5 py-1 font-mono text-fg">
                  <InlineMath>{`$${exact}$`}</InlineMath>
                </span>
              </div>
            </div>

            {!graded.correct && graded.confidence >= 0.9 && (
              <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs text-muted">
                You were {Math.round(graded.confidence * 100)}% sure and wrong. That gap is what the calibration page tracks; the error log entry for this problem is already open.
              </div>
            )}

            <div className="card p-5 md:p-6">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Worked solution</div>
              <MathText className="text-[15.5px] text-fg">{problem.solution}</MathText>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoTile label="Key idea" text={problem.keyIdea} tone="accent" />
              <InfoTile label="Common mistake" text={problem.commonMistake} tone="danger" />
              <InfoTile label="Fast path" text={problem.fastPath} tone="info" />
            </div>

            <div className="card">
              <button className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium text-fg" onClick={() => setShowVariation((v) => !v)} aria-expanded={showVariation}>
                <span>Interviewer follow-up</span>
                <ChevronDown size={16} className={clsx("text-muted transition-transform", showVariation && "rotate-180")} />
              </button>
              {showVariation && (
                <div className="border-t border-border px-5 py-4 text-sm">
                  <MathText className="text-fg">{problem.variation}</MathText>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted hover:text-fg">Show the answer sketch</summary>
                    <MathText className="mt-2 text-muted">{problem.variationAnswer}</MathText>
                  </details>
                </div>
              )}
            </div>

            {family && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Classic family:</span>
                <Link href={`/formulas?family=${family.id}`} className="font-medium text-accent hover:underline">
                  {family.name}
                </Link>
                <span className="text-faint">·</span>
                <span>{family.trick}</span>
              </div>
            )}

            {(!graded.correct || graded.confidence < 0.7 || graded.hintsUsed > 0) && onMistake && (
              <div className="card p-4">
                <div className="mb-2 text-sm font-medium text-fg">What went wrong?</div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(MISTAKE_LABELS) as MistakeCategory[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        onMistake(c, lesson);
                      }}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        category === c ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:border-border-strong hover:text-fg",
                      )}
                      aria-pressed={category === c}
                    >
                      {MISTAKE_LABELS[c]}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="One-line lesson learned (optional)"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    onBlur={() => category && onMistake(category, lesson)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (category) onMistake(category, lesson);
                        onNext();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-faint">Press Enter to continue</span>
              <Button onClick={onNext} size="lg">
                {nextLabel}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function InfoTile({ label, text, tone }: { label: string; text: string; tone: "accent" | "danger" | "info" }) {
  const cls = { accent: "text-accent", danger: "text-danger", info: "text-info" }[tone];
  return (
    <div className="card p-4">
      <div className={clsx("mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]", cls)}>{label}</div>
      <MathText className="text-sm text-fg">{text}</MathText>
    </div>
  );
}
