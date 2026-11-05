"use client";

import clsx from "clsx";
import { BookOpen, Check, Flame, Lock, NotebookPen, Play, Sigma, Trophy, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LESSONS, MODULE_META, hardSetForModule, problemsForModule } from "@/content";
import { TAGS, type Difficulty, type ModuleId, type Problem } from "@/content/types";
import { moduleStats, tagsForModule } from "@/lib/derived";
import { masteryPercent } from "@/lib/mastery";
import { quizProblems } from "@/lib/select";
import { useData } from "@/lib/store";
import { Breadcrumbs } from "@/components/shell/AppShell";
import { useStartSession } from "@/components/StartSessionButton";
import { Badge, DifficultyBadge, difficultyLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";

const QUIZ_SIZE = 8;
const QUIZ_PASS = 0.75;

export default function ModulePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) as ModuleId;
  const meta = MODULE_META.find((m) => m.id === id);
  const data = useData();
  const start = useStartSession();
  const [onlyUnsolved, setOnlyUnsolved] = useState(true);
  const [unlockOverride, setUnlockOverride] = useState(false);

  const practice = useMemo(() => (meta ? problemsForModule(id) : []), [id, meta]);
  const hard = useMemo(() => (meta ? hardSetForModule(id) : []), [id, meta]);
  const stats = useMemo(() => (meta ? moduleStats(data, id) : null), [data, id, meta]);
  const lesson = meta ? LESSONS[id] : null;

  if (!meta || !stats) {
    return <EmptyState title="No such module" description="Modules are numbered 1 to 10." action={<Button href="/modules">All modules</Button>} />;
  }

  const solved = new Set(data.attempts.filter((a) => a.correct).map((a) => a.problemId));
  const attempted = new Map<string, boolean>();
  for (const a of data.attempts) attempted.set(a.problemId, (attempted.get(a.problemId) ?? false) || a.correct);

  const sets: Array<{ key: string; label: string; levels: Difficulty[]; description: string }> = [
    { key: "warmup", label: "Warm-up", levels: [1], description: "Definitions and one-step counts. Build the habit of writing the sample space." },
    { key: "standard", label: "Standard", levels: [2], description: "One idea, two steps. Most of the real test lives one notch above this." },
    { key: "test", label: "Test level", levels: [3], description: "The difficulty of the SIG assessment. Aim for under the estimated time." },
  ];

  const pickIds = (levels: Difficulty[]) => {
    const pool = practice.filter((p) => levels.includes(p.difficulty));
    const filtered = onlyUnsolved ? pool.filter((p) => !solved.has(p.id)) : pool;
    return (filtered.length ? filtered : pool).map((p) => p.id);
  };

  const quizRecord = data.quiz[String(id)];
  const hardUnlocked = stats.quizPassed || unlockOverride;
  const nextModule = MODULE_META.find((m) => m.id === id + 1);

  return (
    <div>
      <Breadcrumbs items={[{ href: "/modules", label: "Modules" }, { label: `Module ${id}` }]} />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Module {id} · {meta.hours}h</div>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted md:text-[15px]">{meta.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" href={`/notes?module=${id}`} leftIcon={<NotebookPen size={16} />}>
            Notes
          </Button>
          <Button variant="secondary" href={`/formulas?module=${id}`} leftIcon={<Sigma size={16} />}>
            Formulas
          </Button>
        </div>
      </div>

      {!stats.hasContent ? (
        <EmptyState
          icon={<Lock size={22} />}
          title="This module arrives in the next build stage"
          description={`${meta.description} The lesson and problem set are being written and verified now; modules 1-4 are ready today.`}
          action={<Button href="/modules">Back to modules</Button>}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody className="grid gap-6 pt-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">Module progress</span>
                  <span className="font-mono tabular text-fg">{stats.percent}%</span>
                </div>
                <ProgressBar value={stats.percent} tone={stats.quizPassed ? "success" : "accent"} />
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  <span className={clsx(stats.lessonDone && "text-success")}>{stats.lessonDone ? "Lesson done" : "Lesson not finished"}</span>
                  <span>
                    {stats.solved}/{stats.total} solved
                  </span>
                  <span className={clsx(stats.quizPassed && "text-success")}>{stats.quizPassed ? `Quiz passed (${stats.quizBest})` : quizRecord ? `Quiz best ${stats.quizBest}` : "Quiz not taken"}</span>
                  <span>
                    {stats.hardSolved}/{stats.hardTotal} hard solved
                  </span>
                </div>
              </div>
              <div className="flex gap-6">
                <Stat label="Mastery" value={stats.mastery === null ? "–" : `${stats.mastery}%`} hint="chance on a hard problem" />
                <Stat label="Confidence idx" value={stats.confidenceIndex === null ? "–" : stats.confidenceIndex} hint="accuracy · calibration · speed" />
                <Stat label="Accuracy" value={stats.accuracy === null ? "–" : `${Math.round(stats.accuracy * 100)}%`} hint={`${stats.attempts} attempts`} />
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader title="Lesson" subtitle={`${lesson?.cards.length ?? 0} concept cards, ${lesson?.workedExamples.length ?? 0} worked examples`} action={<BookOpen size={18} className="text-faint" />} />
              <CardBody className="mt-auto">
                <p className="mb-4 text-sm text-muted">{stats.lessonDone ? "Done. Re-read any card whenever a practice problem surprises you." : "About twenty minutes: concept cards, step-by-step examples, a mini problem, and four quick checks."}</p>
                <Button href={`/modules/${id}/lesson`} variant={stats.lessonDone ? "secondary" : "primary"} leftIcon={stats.lessonDone ? <Check size={16} /> : <Play size={16} />}>
                  {stats.lessonDone ? "Review lesson" : "Start lesson"}
                </Button>
              </CardBody>
            </Card>

            <Card className="flex flex-col">
              <CardHeader title="Mastery quiz" subtitle={`${QUIZ_SIZE} questions, pass at ${Math.round(QUIZ_PASS * 100)}%`} action={<Trophy size={18} className={stats.quizPassed ? "text-success" : "text-faint"} />} />
              <CardBody className="mt-auto">
                <p className="mb-4 text-sm text-muted">
                  {stats.quizPassed
                    ? `Passed with ${stats.quizBest}. Passing unlocked the hard set${nextModule ? ` and the badge for ${nextModule.title}` : ""}.`
                    : quizRecord
                      ? `Best so far ${stats.quizBest} over ${quizRecord.attempts} attempt${quizRecord.attempts === 1 ? "" : "s"}. Each attempt draws a different mix.`
                      : "Mixed difficulty 2-4, drawn from the module. Pass to unlock the hard set."}
                </p>
                <Button
                  variant={stats.quizPassed ? "secondary" : "primary"}
                  leftIcon={<Play size={16} />}
                  onClick={() =>
                    start({
                      title: `Mastery quiz · Module ${id}`,
                      problemIds: quizProblems(practice, id, (quizRecord?.attempts ?? 0) + 1, QUIZ_SIZE).map((p) => p.id),
                      context: "quiz",
                      module: id,
                      returnHref: `/modules/${id}`,
                      quiz: { module: id, passRatio: QUIZ_PASS },
                    })
                  }
                >
                  {stats.quizPassed ? "Retake quiz" : "Take the quiz"}
                </Button>
              </CardBody>
            </Card>

            <Card className={clsx("flex flex-col", !hardUnlocked && "opacity-90")}>
              <CardHeader title="Hard set" subtitle={`${hard.length} problems at difficulty 4-5`} action={hardUnlocked ? <Flame size={18} className="text-accent" /> : <Lock size={18} className="text-faint" />} />
              <CardBody className="mt-auto">
                <p className="mb-4 text-sm text-muted">
                  {hardUnlocked
                    ? "Multi-step problems with interviewer follow-ups. Expect to miss some; that is the point."
                    : "Unlocks when you pass the mastery quiz. These are harder than the real test on purpose."}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    disabled={!hardUnlocked || hard.length === 0}
                    leftIcon={<Flame size={16} />}
                    onClick={() =>
                      start({
                        title: `Hard set · Module ${id}`,
                        problemIds: (onlyUnsolved ? hard.filter((p) => !solved.has(p.id)) : hard).map((p) => p.id),
                        context: "hardset",
                        module: id,
                        returnHref: `/modules/${id}`,
                      })
                    }
                  >
                    Start hard set
                  </Button>
                  {!hardUnlocked && (
                    <button className="text-xs text-muted underline-offset-2 hover:text-fg hover:underline" onClick={() => setUnlockOverride(true)}>
                      Skip the lock
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Practice sets"
              subtitle="Sorted by difficulty. Each problem asks for your confidence before it grades you."
              action={
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--accent-fill)]" checked={onlyUnsolved} onChange={(e) => setOnlyUnsolved(e.target.checked)} />
                  Unsolved first
                </label>
              }
            />
            <CardBody>
              <div className="grid gap-3 md:grid-cols-3">
                {sets.map((set) => {
                  const pool = practice.filter((p) => set.levels.includes(p.difficulty));
                  const done = pool.filter((p) => solved.has(p.id)).length;
                  return (
                    <div key={set.key} className="flex flex-col rounded-xl border border-border bg-surface-2/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-fg">{set.label}</span>
                        <DifficultyBadge level={set.levels[0]} />
                      </div>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{set.description}</p>
                      <ProgressBar value={done} max={Math.max(1, pool.length)} size="xs" className="mt-3" tone={done === pool.length && pool.length > 0 ? "success" : "accent"} />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-xs tabular text-muted">
                          {done}/{pool.length}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pool.length === 0}
                          onClick={() =>
                            start({
                              title: `${set.label} set · Module ${id}`,
                              problemIds: pickIds(set.levels),
                              context: "practice",
                              module: id,
                              returnHref: `/modules/${id}`,
                            })
                          }
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Skills in this module" subtitle="Mastery per tag: the estimated chance of solving a hard problem on that skill." />
            <CardBody>
              <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
                {tagsForModule(id).map((t) => {
                  const m = data.mastery[t];
                  const pct = m ? masteryPercent(m.rating) : 0;
                  return (
                    <li key={t} className="flex items-center gap-3 text-sm">
                      <span className="w-40 truncate text-muted">{TAGS[t]}</span>
                      <ProgressBar value={pct} size="xs" className="flex-1" tone={pct >= 60 ? "success" : "accent"} />
                      <span className="w-14 text-right font-mono text-xs tabular text-fg">{m ? `${pct}%` : "–"}</span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="All problems" subtitle={`${practice.length} practice problems. Click one to work it on its own.`} />
            <CardBody className="pt-2">
              <ul className="divide-y divide-border">
                {practice.map((p) => (
                  <ProblemRow key={p.id} problem={p} status={attempted.has(p.id) ? (attempted.get(p.id) ? "solved" : "missed") : "new"} locked={p.difficulty >= 4 && !hardUnlocked} onStart={() => start({ title: p.title, problemIds: [p.id], context: p.difficulty >= 4 ? "hardset" : "practice", module: id, returnHref: `/modules/${id}` })} />
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProblemRow({ problem, status, locked, onStart }: { problem: Problem; status: "solved" | "missed" | "new"; locked: boolean; onStart: () => void }) {
  return (
    <li>
      <button
        onClick={onStart}
        disabled={locked}
        className="flex w-full items-center gap-3 px-1 py-2.5 text-left text-sm transition-colors hover:bg-surface-2/60 disabled:cursor-not-allowed disabled:opacity-50"
        title={locked ? "Pass the mastery quiz to unlock difficulty 4-5" : undefined}
      >
        <span
          className={clsx(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            status === "solved" ? "bg-success-soft text-success" : status === "missed" ? "bg-danger-soft text-danger" : "border border-border-strong text-transparent",
          )}
          aria-label={status}
        >
          {status === "solved" ? <Check size={12} /> : status === "missed" ? <X size={12} /> : null}
        </span>
        <span className="min-w-0 flex-1 truncate text-fg">{problem.title}</span>
        <span className="hidden gap-1 md:flex">
          {problem.tags.slice(0, 2).map((t) => (
            <Badge key={t} tone="outline" size="xs">
              {TAGS[t]}
            </Badge>
          ))}
        </span>
        <span className="hidden font-mono text-[11px] tabular text-faint sm:inline">{problem.minutes} min</span>
        <DifficultyBadge level={problem.difficulty} />
        {locked && <Lock size={12} className="text-faint" aria-label={`${difficultyLabel(problem.difficulty)} locked`} />}
      </button>
    </li>
  );
}
