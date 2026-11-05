"use client";

import clsx from "clsx";
import { ArrowRight, Check, ChevronRight, Lock, RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LESSONS, MODULE_META, getProblem } from "@/content";
import type { ModuleId, Problem, TryIt, WorkedExample } from "@/content/types";
import { gradeAnswer } from "@/lib/answer";
import { useStore } from "@/lib/store";
import { DisplayMath, InlineMath, MathText } from "@/components/Math";
import { Breadcrumbs } from "@/components/shell/AppShell";
import { AnswerInput } from "@/components/session/AnswerInput";
import { ProblemView, type GradedOutcome } from "@/components/session/ProblemView";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) as ModuleId;
  const meta = MODULE_META.find((m) => m.id === id);
  const lesson = meta ? LESSONS[id] : null;
  const completeLesson = useStore((s) => s.completeLesson);
  const done = useStore((s) => Boolean(s.lessonsCompleted[String(id)]));
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkResults, setCheckResults] = useState<boolean[]>([]);
  const checks = useMemo(() => (lesson ? lesson.checkIds.map(getProblem).filter((p): p is Problem => Boolean(p)) : []), [lesson]);
  const [readPct, setReadPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setReadPct(max > 0 ? Math.min(100, Math.round((100 * window.scrollY) / max)) : 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!meta) return <EmptyState title="No such module" action={<Button href="/modules">All modules</Button>} />;
  if (!lesson) {
    return (
      <div>
        <Breadcrumbs items={[{ href: "/modules", label: "Modules" }, { href: `/modules/${id}`, label: `Module ${id}` }, { label: "Lesson" }]} />
        <EmptyState icon={<Lock size={22} />} title="Lesson coming in the next stage" description={meta.description} action={<Button href={`/modules/${id}`}>Back to module</Button>} />
      </div>
    );
  }

  const sections = ["Why it matters", "Concepts", "Worked examples", "Try it", "Quick checks", "Wrap up"];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="fixed left-0 right-0 top-0 z-40 h-0.5 bg-transparent" aria-hidden>
        <div className="h-full bg-accent-fill transition-[width] duration-150" style={{ width: `${readPct}%` }} />
      </div>
      <Breadcrumbs items={[{ href: "/modules", label: "Modules" }, { href: `/modules/${id}`, label: meta.title }, { label: "Lesson" }]} />
      <div className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Module {id} lesson</div>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted">{meta.subtitle}</p>
        <nav aria-label="Lesson sections" className="mt-4 flex flex-wrap gap-1.5 text-xs">
          {sections.map((s, i) => (
            <a key={s} href={`#sec-${i}`} className="rounded-md border border-border px-2 py-1 text-muted hover:text-fg">
              {s}
            </a>
          ))}
        </nav>
      </div>

      <section id="sec-0" className="mb-10">
        <MathText className="text-[16.5px] leading-[1.75] text-fg">{lesson.intro}</MathText>
      </section>

      <section id="sec-1" className="mb-10">
        <SectionTitle n={1}>Concepts</SectionTitle>
        <div className="grid gap-4">
          {lesson.cards.map((card, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-xs text-accent">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-tight">{card.title}</h3>
                  <MathText className="mt-2 text-[15px] text-fg">{card.body}</MathText>
                  {card.formula && (
                    <div className="mt-3 rounded-xl border border-border bg-surface-2/60 px-4 py-2 text-fg">
                      <DisplayMath tex={card.formula} />
                    </div>
                  )}
                  {card.example && (
                    <div className="mt-3 flex gap-2 text-sm text-muted">
                      <span className="shrink-0 font-semibold text-accent">Intuition</span>
                      <InlineMath>{card.example}</InlineMath>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="sec-2" className="mb-10">
        <SectionTitle n={2}>Worked examples</SectionTitle>
        <div className="grid gap-4">
          {lesson.workedExamples.map((ex, i) => (
            <WorkedExampleCard key={i} example={ex} />
          ))}
        </div>
      </section>

      <section id="sec-3" className="mb-10">
        <SectionTitle n={3}>Try it yourself</SectionTitle>
        <TryItCard tryIt={lesson.tryIt} />
      </section>

      <section id="sec-4" className="mb-10">
        <SectionTitle n={4}>Quick checks</SectionTitle>
        <p className="mb-4 text-sm text-muted">Four one-minute questions. They count toward your calibration, so pick your confidence honestly.</p>
        {checks.length === 0 ? (
          <p className="text-sm text-muted">No checks for this module yet.</p>
        ) : checkIndex < checks.length ? (
          <div className="card p-5">
            <ProgressBar value={checkIndex} max={checks.length} size="xs" className="mb-5" label={`Check ${checkIndex + 1} of ${checks.length}`} />
            <LessonCheck
              key={checks[checkIndex].id}
              problem={checks[checkIndex]}
              onDone={(correct) => {
                setCheckResults((r) => [...r, correct]);
                setCheckIndex((i) => i + 1);
              }}
              last={checkIndex === checks.length - 1}
            />
          </div>
        ) : (
          <div className="card flex flex-col items-start gap-3 p-5">
            <div className="flex items-center gap-2 text-fg">
              <Check size={18} className="text-success" />
              <span className="font-medium">
                Checks done: {checkResults.filter(Boolean).length}/{checks.length} correct
              </span>
            </div>
            <p className="text-sm text-muted">{checkResults.every(Boolean) ? "Clean. Move on to the practice sets." : "Misses are already in your Redo Queue; the practice set will reinforce them."}</p>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={() => {
                setCheckIndex(0);
                setCheckResults([]);
              }}
            >
              Redo checks
            </Button>
          </div>
        )}
      </section>

      <section id="sec-5" className="mb-10">
        <SectionTitle n={5}>Wrap up</SectionTitle>
        <MathText className="text-[15.5px] leading-relaxed text-fg">{lesson.outro}</MathText>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => completeLesson(id)}
            variant={done ? "secondary" : "primary"}
            leftIcon={done ? <Check size={16} /> : undefined}
            disabled={done}
          >
            {done ? "Lesson complete" : "Mark lesson complete"}
          </Button>
          <Button href={`/modules/${id}`} variant={done ? "primary" : "secondary"} rightIcon={<ArrowRight size={16} />}>
            Go to practice sets
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold">
      <span className="font-mono text-sm text-faint">{String(n).padStart(2, "0")}</span>
      {children}
    </h2>
  );
}

function WorkedExampleCard({ example }: { example: WorkedExample }) {
  const [shown, setShown] = useState(0);
  const total = example.steps.length;
  return (
    <Card>
      <CardHeader title={example.title} subtitle="Reveal one step at a time; try to predict each before you click." />
      <CardBody>
        <div className="rounded-xl border border-border bg-surface-2/60 p-4">
          <MathText className="text-[15px] text-fg">{example.prompt}</MathText>
        </div>
        <ol className="mt-4 flex flex-col gap-3">
          {example.steps.slice(0, shown).map((step, i) => (
            <li key={i} className="flex gap-3 fade-up">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <MathText className="text-[15px] text-fg">{step.text}</MathText>
                {step.math && <DisplayMath tex={step.math} className="mt-1 text-fg" />}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs tabular text-faint">
            {shown}/{total} steps
          </span>
          {shown < total ? (
            <Button size="sm" variant="secondary" onClick={() => setShown((s) => s + 1)} rightIcon={<ChevronRight size={14} />}>
              {shown === 0 ? "Reveal first step" : "Next step"}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm text-fg">
                Answer: <InlineMath>{example.answer}</InlineMath>
              </span>
              <Button size="sm" variant="ghost" onClick={() => setShown(0)}>
                Reset
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function TryItCard({ tryIt }: { tryIt: TryIt }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | { correct: boolean; error?: string }>(null);
  const [revealed, setRevealed] = useState(false);
  const check = useCallback(() => {
    const g = gradeAnswer(tryIt.answer, tryIt.answer.type === "choice" ? Number(value) : value);
    if (g.error && g.given === undefined) {
      setResult({ correct: false, error: g.error });
      return;
    }
    setResult({ correct: g.correct });
    if (g.correct) setRevealed(true);
  }, [tryIt, value]);
  return (
    <Card>
      <CardBody className="pt-5">
        <MathText className="text-[15.5px] text-fg">{tryIt.prompt}</MathText>
        <div className="mt-4">
          <AnswerInput answer={tryIt.answer} value={value} onChange={setValue} onSubmit={check} />
        </div>
        {result && (
          <div className={clsx("mt-3 text-sm", result.error ? "text-danger" : result.correct ? "text-success" : "text-danger")} role="status">
            {result.error ?? (result.correct ? "Correct." : "Not yet. Try once more, or reveal the solution.")}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={check}>
            Check
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRevealed(true)}>
            Show solution
          </Button>
        </div>
        {revealed && (
          <div className="mt-4 rounded-xl border border-border bg-surface-2/60 p-4 fade-up">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Solution</div>
            <MathText className="text-[15px] text-fg">{tryIt.solution}</MathText>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function LessonCheck({ problem, onDone, last }: { problem: Problem; onDone: (correct: boolean) => void; last: boolean }) {
  const recordAttempt = useStore((s) => s.recordAttempt);
  const [outcome, setOutcome] = useState<GradedOutcome | null>(null);
  return (
    <ProblemView
      problem={problem}
      compact
      showModuleLink={false}
      onGraded={(o) => {
        setOutcome(o);
        recordAttempt({
          problemId: problem.id,
          module: problem.module,
          tags: problem.tags,
          difficulty: problem.difficulty,
          estMinutes: problem.minutes,
          correct: o.correct,
          confidence: o.confidence,
          timeMs: o.timeMs,
          hintsUsed: o.hintsUsed,
          given: o.given,
          context: "lesson",
        });
      }}
      onNext={() => onDone(outcome?.correct ?? false)}
      nextLabel={last ? "Finish checks" : "Next check"}
    />
  );
}
