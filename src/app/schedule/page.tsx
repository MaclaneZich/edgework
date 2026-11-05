"use client";

import clsx from "clsx";
import { CalendarDays, Check, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { completedTaskIds, currentPlan, studiedMinutes } from "@/lib/derived";
import { formatMinutes, formatRelativeDay } from "@/lib/format";
import { todayString, type PlanTask } from "@/lib/schedule";
import { useData, useStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, Stat } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const TYPE_TONE: Record<PlanTask["type"], "neutral" | "accent" | "success" | "danger" | "info" | "outline"> = {
  lesson: "info",
  practice: "neutral",
  quiz: "accent",
  hardset: "danger",
  mock: "accent",
  drill: "info",
  mental: "outline",
  review: "neutral",
  sample: "info",
  checklist: "success",
  rest: "outline",
};

export default function SchedulePage() {
  const data = useData();
  const setChecklist = useStore((s) => s.setChecklist);
  const today = todayString();
  const plan = useMemo(() => currentPlan(data, today), [data, today]);
  const done = useMemo(() => completedTaskIds(data), [data]);
  const studied = studiedMinutes(data);
  const remaining = plan.days.reduce((s, d) => s + d.minutes, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Planner"
        title="Day by day to the test"
        description={`About ${data.settings.hoursGoal} hours spread over the days to ${plan.testDate}, with a full-length mock two days before and a light final day. Tasks complete themselves from your activity; the plan rebalances whenever you fall behind.`}
        actions={
          <Button variant="secondary" href="/settings">
            Test date and hours
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <Stat label="Remaining" value={formatMinutes(remaining)} hint={`${plan.days.length} day${plan.days.length === 1 ? "" : "s"} including test day`} />
        </Card>
        <Card className="p-4">
          <Stat label="Per study day" value={formatMinutes(plan.dailyMinutes)} hint={data.settings.hoursPerDay ? "fixed budget" : "spread evenly"} />
        </Card>
        <Card className="p-4">
          <Stat label="Studied so far" value={formatMinutes(studied)} hint={`of ${data.settings.hoursGoal}h goal`} />
        </Card>
        <Card className={clsx("p-4", plan.behind && "border-danger/40")}>
          <Stat label="Status" value={plan.behind ? "Behind" : "On track"} hint={plan.overflowMinutes ? `${formatMinutes(plan.overflowMinutes)} does not fit` : "rebalances daily"} mono={false} />
        </Card>
      </div>
      {plan.behind && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <span>
            The remaining work needs more than four hours a day{plan.overflowMinutes ? ", and some of it no longer fits your fixed daily budget" : ""}. Prioritise: lessons and practice for modules 3, 4 and 6, one standard mock, then the hard sets only if time remains.
          </span>
        </div>
      )}

      <ol className="flex flex-col gap-3">
        {plan.days.map((day) => {
          const isToday = day.date === today;
          return (
            <li key={day.date}>
              <Card className={clsx("p-4", isToday && "border-accent-fill/50")}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className={isToday ? "text-accent" : "text-faint"} />
                    <span className={clsx("font-medium", isToday ? "text-accent" : "text-fg")}>{formatRelativeDay(day.date, today)}</span>
                    {day.note && <span className="text-xs text-muted">· {day.note}</span>}
                  </div>
                  <span className="font-mono text-xs tabular text-muted">{formatMinutes(day.minutes)}</span>
                </div>
                {day.tasks.length === 0 ? (
                  <p className="text-sm text-faint">Free day.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {day.tasks.map((t) => {
                      const manual = t.type === "sample" || t.type === "review" || t.type === "checklist";
                      const isDone = done.has(t.id);
                      return (
                        <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                          {manual ? (
                            <input type="checkbox" className="h-4 w-4 accent-[var(--accent-fill)]" checked={Boolean(data.checklist[`task:${t.id}`])} onChange={(e) => setChecklist(`task:${t.id}`, e.target.checked)} aria-label={`Mark ${t.label} done`} />
                          ) : (
                            <span className={clsx("flex h-4 w-4 items-center justify-center rounded-full border", isDone ? "border-transparent bg-success text-accent-ink" : "border-border-strong")} aria-label={isDone ? "done" : "not done"}>
                              {isDone && <Check size={10} />}
                            </span>
                          )}
                          <Link href={t.href} className={clsx("min-w-0 flex-1 truncate hover:text-accent", isDone ? "text-muted line-through" : "text-fg")}>
                            {t.label}
                          </Link>
                          <Badge tone={TYPE_TONE[t.type]} size="xs">
                            {t.type}
                          </Badge>
                          <span className="w-10 text-right font-mono text-xs tabular text-faint">{t.minutes}m</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
