"use client";

import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { getProblem } from "@/content";
import { formatRelativeDay } from "@/lib/format";
import { todayString } from "@/lib/schedule";
import { dueCards, isGraduated } from "@/lib/srs";
import { useData } from "@/lib/store";
import { useStartSession } from "@/components/StartSessionButton";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function RedoPage() {
  const data = useData();
  const start = useStartSession();
  const now = Date.now();
  const due = useMemo(() => dueCards(data.srs, now).filter((c) => getProblem(c.problemId)), [data.srs, now]);
  const upcoming = useMemo(
    () =>
      Object.values(data.srs)
        .filter((c) => c.due > now && !isGraduated(c) && getProblem(c.problemId))
        .sort((a, b) => a.due - b.due)
        .slice(0, 20),
    [data.srs, now],
  );
  const graduated = Object.values(data.srs).filter(isGraduated).length;
  const today = todayString();

  const redo = (ids: string[], title: string) => start({ title, problemIds: ids, context: "redo", returnHref: "/redo" });

  return (
    <div>
      <PageHeader
        eyebrow="Spaced repetition"
        title="Redo Queue"
        description="Every miss, hint, or shaky answer comes back on an SM-2 schedule: a day later, then six days, then longer each time you get it right cleanly."
        actions={
          due.length > 0 && (
            <>
              <Button variant="secondary" onClick={() => redo(due.slice(0, 5).map((c) => c.problemId), "Redo: next five")}>
                Next five
              </Button>
              <Button onClick={() => redo(due.map((c) => c.problemId), "Redo: everything due")} leftIcon={<RotateCcw size={16} />}>
                Redo all {due.length}
              </Button>
            </>
          )
        }
      />
      {due.length === 0 ? (
        <EmptyState icon={<RotateCcw size={22} />} title="Nothing due" description={upcoming.length ? `Next review ${formatRelativeDay(new Date(upcoming[0].due).toISOString().slice(0, 10), today).toLowerCase()}. ${graduated} problem${graduated === 1 ? "" : "s"} graduated.` : "Miss a problem or answer with low confidence and it will show up here."} action={<Button href="/smart">Smart Session instead</Button>} />
      ) : (
        <Card>
          <CardHeader title={`${due.length} due`} subtitle="Oldest first. Each redo asks for confidence again, so the calibration keeps improving." />
          <CardBody className="pt-2">
            <ul className="divide-y divide-border">
              {due.map((c) => {
                const p = getProblem(c.problemId)!;
                const overdueDays = Math.floor((now - c.due) / 86_400_000);
                return (
                  <li key={c.problemId} className="flex items-center gap-3 py-2.5 text-sm">
                    <button onClick={() => redo([p.id], p.title)} className="min-w-0 flex-1 truncate text-left text-fg hover:text-accent">
                      {p.title}
                    </button>
                    <span className="hidden text-xs text-muted sm:inline">Module {p.module}</span>
                    {c.lapses > 0 && <Badge tone="danger">{c.lapses} lapse{c.lapses > 1 ? "s" : ""}</Badge>}
                    {overdueDays > 0 && <Badge tone="neutral">{overdueDays}d overdue</Badge>}
                    <DifficultyBadge level={p.difficulty} />
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}

      {upcoming.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Coming up" subtitle="Scheduled reviews that are not due yet." />
          <CardBody className="pt-2">
            <ul className="divide-y divide-border">
              {upcoming.map((c) => {
                const p = getProblem(c.problemId)!;
                return (
                  <li key={c.problemId} className="flex items-center gap-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate text-fg">{p.title}</span>
                    <span className="font-mono text-xs text-faint">interval {c.interval}d</span>
                    <span className="w-24 text-right text-xs text-muted">{formatRelativeDay(new Date(c.due).toISOString().slice(0, 10), today)}</span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
