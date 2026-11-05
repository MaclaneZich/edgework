"use client";

import clsx from "clsx";
import { ArrowRight, Flame, Hourglass, Target } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { MODULE_META } from "@/content";
import { TAGS, type ModuleId } from "@/content/types";
import { brierScore } from "@/lib/calibration";
import { allModuleStats, calibrationAttempts, currentPlan, nextBestAction, overallPercent, problemsSolvedCount, recentAttempts, studiedMinutes, studiedMinutesToday, tagStats, tagsForModule } from "@/lib/derived";
import { formatDate, formatDuration, formatHours, formatMinutes, plural } from "@/lib/format";
import { daysBetween, todayString, todaysTasks } from "@/lib/schedule";
import { useData, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { getProblem } from "@/content";

export default function DashboardPage() {
  const data = useData();
  const setChecklist = useStore((s) => s.setChecklist);
  const today = todayString();
  const stats = useMemo(() => allModuleStats(data), [data]);
  const overall = overallPercent(stats);
  const minutes = studiedMinutes(data);
  const goalMinutes = data.settings.hoursGoal * 60;
  const todayMinutes = studiedMinutesToday(data, today);
  const action = useMemo(() => nextBestAction(data), [data]);
  const plan = useMemo(() => currentPlan(data, today), [data, today]);
  const todays = todaysTasks(plan);
  const daysLeft = daysBetween(today, data.settings.testDate);
  const tags = useMemo(() => tagStats(data), [data]);
  const brier = brierScore(calibrationAttempts(data));
  const recent = recentAttempts(data, 6);
  const solved = problemsSolvedCount(data);
  const greeting = data.settings.name ? `Welcome back, ${data.settings.name}` : "Welcome back";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{formatDate(today, { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{greeting}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Flame size={16} className={data.streak.current ? "text-accent" : "text-faint"} />
            {plural(data.streak.current, "day streak", "day streak")}
          </span>
          <span className="text-faint">·</span>
          <span>{plural(solved, "problem solved", "problems solved")}</span>
        </div>
      </div>

      {/* Top row */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-soft blur-3xl" aria-hidden />
          <CardBody className="relative pt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Next best action</div>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{action.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{action.description}</p>
            <div className="mt-5">
              <Button href={action.href} rightIcon={<ArrowRight size={16} />}>
                {action.cta}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-5 pt-5">
            <ProgressRing value={overall} size={104} stroke={9} label={`Overall progress ${overall} percent`}>
              <span className="font-mono text-2xl font-semibold tabular">{overall}%</span>
              <span className="text-[10px] uppercase tracking-wider text-faint">overall</span>
            </ProgressRing>
            <div className="flex flex-col gap-3">
              <Stat label="Hours studied" value={formatHours(minutes)} hint={`of ${data.settings.hoursGoal}h goal`} />
              <ProgressBar value={minutes} max={goalMinutes} size="sm" tone={minutes >= goalMinutes ? "success" : "accent"} />
              <span className="text-xs text-muted">
                Today: {formatMinutes(todayMinutes)} / {formatMinutes(data.settings.dailyGoalMinutes)}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="flex items-start justify-between">
              <Stat label="Test countdown" value={daysLeft > 0 ? daysLeft : daysLeft === 0 ? "Today" : "Done"} hint={daysLeft > 0 ? `${daysLeft === 1 ? "day" : "days"} until ${formatDate(data.settings.testDate, { month: "long", day: "numeric" })}` : formatDate(data.settings.testDate, { month: "long", day: "numeric" })} />
              <Hourglass size={18} className="text-faint" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Brier" value={brier === null ? "–" : brier.toFixed(2)} hint={brier === null ? "no data yet" : brier < 0.15 ? "well calibrated" : brier < 0.25 ? "decent" : "overconfident?"} />
              <Stat label="Plan" value={plan.behind ? "Behind" : "On track"} hint={plan.behind ? `${Math.round(plan.dailyMinutes)} min/day needed` : `${Math.round(plan.dailyMinutes)} min/day`} mono={false} />
            </div>
            <Link href="/settings" className="mt-3 inline-block text-xs text-muted hover:text-fg">
              Change test date
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Today's plan */}
        <Card>
          <CardHeader title="Today's plan" subtitle={todays.length ? `${formatMinutes(todays.reduce((s, t) => s + t.minutes, 0))} across ${plural(todays.length, "task")}` : "Nothing scheduled for today"} action={<Link href="/schedule" className="text-xs text-muted hover:text-fg">Full schedule</Link>} />
          <CardBody>
            {todays.length === 0 ? (
              <p className="text-sm text-muted">Either you are ahead of plan or the test date has passed. A Smart Session is never wasted.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {todays.map((t) => {
                  const manual = t.type === "sample" || t.type === "review" || t.type === "checklist";
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                      {manual ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--accent-fill)]"
                          checked={Boolean(data.checklist[`task:${t.id}`])}
                          onChange={(e) => setChecklist(`task:${t.id}`, e.target.checked)}
                          aria-label={`Mark ${t.label} done`}
                        />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-border-strong" aria-hidden />
                      )}
                      <Link href={t.href} className="min-w-0 flex-1 truncate text-fg hover:text-accent">
                        {t.label}
                      </Link>
                      <span className="font-mono text-xs tabular text-faint">{t.minutes}m</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Module progress */}
        <Card>
          <CardHeader title="Modules" subtitle="Progress blends lesson, practice, quiz and hard set" action={<Link href="/modules" className="text-xs text-muted hover:text-fg">All modules</Link>} />
          <CardBody>
            <ul className="flex flex-col gap-3">
              {stats.map((s) => {
                const meta = MODULE_META[s.id - 1];
                return (
                  <li key={s.id}>
                    <Link href={`/modules/${s.id}`} className="group flex items-center gap-3">
                      <span className="w-5 font-mono text-xs tabular text-faint">{s.id}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm text-fg group-hover:text-accent">{meta.title}</span>
                          <span className="flex items-center gap-2">
                            {!s.hasContent && (
                              <Badge tone="outline" size="xs">
                                soon
                              </Badge>
                            )}
                            {s.quizPassed && (
                              <Badge tone="success" size="xs">
                                mastered
                              </Badge>
                            )}
                            <span className="font-mono text-xs tabular text-muted">{s.percent}%</span>
                          </span>
                        </span>
                        <ProgressBar value={s.percent} size="xs" className="mt-1.5" tone={s.quizPassed ? "success" : "accent"} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Heatmap */}
        <Card>
          <CardHeader title="Weakness heatmap" subtitle="Accuracy by tag. Click a tag for a focused session." action={<Link href="/calibration" className="text-xs text-muted hover:text-fg">Calibration</Link>} />
          <CardBody>
            <div className="flex flex-col gap-3">
              {MODULE_META.map((m) => {
                const moduleTags = tagsForModule(m.id as ModuleId);
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <span className="mt-1 w-5 font-mono text-[11px] tabular text-faint">{m.id}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {moduleTags.map((tag) => {
                        const t = tags.find((x) => x.tag === tag)!;
                        const acc = t.accuracy;
                        const style = acc === null ? undefined : { backgroundColor: heat(acc), borderColor: "transparent" };
                        return (
                          <Link
                            key={tag}
                            href={`/smart?tag=${tag}`}
                            className={clsx("rounded-md border border-border px-2 py-1 text-[11px] leading-none transition-transform hover:scale-[1.03]", acc === null ? "bg-surface-2 text-muted" : "text-[#0d0f12] font-medium")}
                            style={style}
                            title={acc === null ? `${TAGS[tag]}: not attempted yet` : `${TAGS[tag]}: ${Math.round(acc * 100)}% accuracy over ${t.attempts} attempts${t.mastery !== null ? `, mastery ${t.mastery}%` : ""}`}
                          >
                            {TAGS[tag]}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-faint">
              <span>weak</span>
              <span className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(90deg, #fb7185, #f2b84b, #4ade80)" }} aria-hidden />
              <span>strong</span>
              <span className="ml-3 h-3 w-3 rounded-sm border border-border bg-surface-2" aria-hidden /> <span>not attempted</span>
            </div>
          </CardBody>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader title="Recent" subtitle={data.attempts.length ? `${data.attempts.length} attempts logged` : "Your attempts will show up here"} action={<Target size={16} className="text-faint" />} />
          <CardBody>
            {recent.length === 0 ? (
              <p className="text-sm text-muted">Start with the first lesson, or jump into a practice set if you already know the basics.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recent.map((a) => {
                  const p = getProblem(a.problemId);
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className={clsx("h-2 w-2 shrink-0 rounded-full", a.correct ? "bg-success" : "bg-danger")} aria-label={a.correct ? "correct" : "incorrect"} />
                      <span className="min-w-0 flex-1 truncate text-fg">{p?.title ?? a.problemId}</span>
                      <span className="font-mono text-xs tabular text-faint">{Math.round(a.confidence * 100)}%</span>
                      <span className="font-mono text-xs tabular text-faint">{formatDuration(a.timeMs)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/** Color for an accuracy in [0, 1]: coral -> amber -> mint. */
function heat(acc: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [0, [251, 113, 133]],
    [0.6, [242, 184, 75]],
    [1, [74, 222, 128]],
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (acc >= stops[i][0] && acc <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const t = b[0] === a[0] ? 0 : (acc - a[0]) / (b[0] - a[0]);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
