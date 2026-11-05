"use client";

import clsx from "clsx";
import { Puzzle, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { BRAINTEASERS } from "@/content";
import { TAGS, type Tag } from "@/content/types";
import { mulberry32, shuffle } from "@/lib/rng";
import { useData } from "@/lib/store";
import { useStartSession } from "@/components/StartSessionButton";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

export default function BrainteasersPage() {
  const data = useData();
  const start = useStartSession();
  const [tag, setTag] = useState<string>("");
  const [diff, setDiff] = useState<number>(0);
  const solved = useMemo(() => new Set(data.attempts.filter((a) => a.correct).map((a) => a.problemId)), [data.attempts]);
  const attempted = useMemo(() => new Set(data.attempts.map((a) => a.problemId)), [data.attempts]);
  const tags = useMemo(() => {
    const s = new Set<Tag>();
    for (const p of BRAINTEASERS) for (const t of p.tags) s.add(t);
    return [...s].sort((a, b) => TAGS[a].localeCompare(TAGS[b]));
  }, []);
  const filtered = BRAINTEASERS.filter((p) => (!tag || p.tags.includes(tag as Tag)) && (!diff || p.difficulty === diff));

  if (BRAINTEASERS.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Logic" title="Brainteasers" description="Eighty puzzles across pigeonhole, invariants, weighing, hats, knights and knaves, number puzzles and structured search." />
        <EmptyState icon={<Puzzle size={22} />} title="The bank is being written" description="The eighty brainteasers are authored and verified in the final content stage. Module 9's lesson and practice set carry the techniques." action={<Button href="/modules/9">Module 9</Button>} />
      </div>
    );
  }

  const randomSet = () => {
    const pool = filtered.filter((p) => !solved.has(p.id));
    const picked = shuffle(pool.length >= 5 ? pool : filtered, mulberry32(Date.now() % 100_000)).slice(0, 5);
    start({ title: "Brainteasers: random five", problemIds: picked.map((p) => p.id), context: "brainteaser", returnHref: "/brainteasers" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Logic"
        title="Brainteasers"
        description="Eighty puzzles that interviewers love because the answer matters less than how you structure the search. Every one has a checkable answer and a worked route."
        actions={
          <Button onClick={randomSet} leftIcon={<Shuffle size={16} />}>
            Random five
          </Button>
        }
      />
      <ProgressBar value={BRAINTEASERS.filter((p) => solved.has(p.id)).length} max={BRAINTEASERS.length} className="mb-5" label={`${BRAINTEASERS.filter((p) => solved.has(p.id)).length} of ${BRAINTEASERS.length} solved`} showValue />
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => setTag("")} className={clsx("rounded-full border px-3 py-1 text-xs", !tag ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}>
          All
        </button>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(tag === t ? "" : t)} className={clsx("rounded-full border px-3 py-1 text-xs", tag === t ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}>
            {TAGS[t]}
          </button>
        ))}
        <span className="mx-2 text-faint">·</span>
        {[0, 2, 3, 4, 5].map((d) => (
          <button key={d} onClick={() => setDiff(d)} className={clsx("rounded-full border px-3 py-1 font-mono text-xs", diff === d ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}>
            {d === 0 ? "any" : `d${d}`}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader title={`${filtered.length} puzzles`} subtitle="Click one to work it with hints and the full solution." />
        <CardBody className="pt-2">
          <ul className="divide-y divide-border">
            {filtered.map((p) => (
              <li key={p.id}>
                <button onClick={() => start({ title: p.title, problemIds: [p.id], context: "brainteaser", returnHref: "/brainteasers" })} className="flex w-full items-center gap-3 px-1 py-2.5 text-left text-sm hover:bg-surface-2/60">
                  <span className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", solved.has(p.id) ? "bg-success" : attempted.has(p.id) ? "bg-danger" : "border border-border-strong")} aria-label={solved.has(p.id) ? "solved" : attempted.has(p.id) ? "attempted" : "new"} />
                  <span className="w-14 font-mono text-[11px] text-faint">{p.id}</span>
                  <span className="min-w-0 flex-1 truncate text-fg">{p.title}</span>
                  <span className="hidden gap-1 md:flex">
                    {p.tags.slice(0, 2).map((t) => (
                      <Badge key={t} tone="outline" size="xs">
                        {TAGS[t]}
                      </Badge>
                    ))}
                  </span>
                  <span className="font-mono text-[11px] text-faint">{p.minutes}m</span>
                  <DifficultyBadge level={p.difficulty} />
                </button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
