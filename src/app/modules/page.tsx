"use client";

import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { MODULE_META } from "@/content";
import { allModuleStats } from "@/lib/derived";
import { useData } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

export default function ModulesPage() {
  const data = useData();
  const stats = useMemo(() => allModuleStats(data), [data]);
  return (
    <div>
      <PageHeader
        eyebrow="Curriculum"
        title="Ten modules, about twenty hours"
        description="Each module has an interactive lesson, practice sets by difficulty, a mastery quiz, and a hard set that unlocks when you pass the quiz. Work in order; later modules lean on earlier ones."
      />
      <ol className="grid gap-4 md:grid-cols-2">
        {MODULE_META.map((m) => {
          const s = stats[m.id - 1];
          return (
            <li key={m.id}>
              <Link href={`/modules/${m.id}`} className="block h-full">
                <Card interactive className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 font-mono text-sm font-semibold text-muted">{String(m.id).padStart(2, "0")}</span>
                      <div>
                        <h2 className="font-display text-lg font-semibold leading-tight">{m.title}</h2>
                        <p className="text-xs text-muted">{m.subtitle}</p>
                      </div>
                    </div>
                    {s.quizPassed ? <Badge tone="success">Mastered</Badge> : !s.hasContent ? <Badge tone="outline"><Lock size={10} /> Next stage</Badge> : <Badge tone="neutral">{m.hours}h</Badge>}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{m.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.topics.slice(0, 6).map((t) => (
                      <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                      <span>
                        {s.solved}/{s.total} solved{s.lessonDone ? " · lesson done" : ""}
                        {s.quizBest ? ` · quiz ${s.quizBest}` : ""}
                      </span>
                      <span className="flex items-center gap-1 font-mono tabular">
                        {s.percent}% <ArrowRight size={12} />
                      </span>
                    </div>
                    <ProgressBar value={s.percent} size="sm" tone={s.quizPassed ? "success" : "accent"} />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
