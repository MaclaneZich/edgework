"use client";

import clsx from "clsx";
import { ClipboardCheck, Flame, Play, Timer, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { MODULE_META, PROBLEMS } from "@/content";
import { CODING_PROBLEMS } from "@/content/coding";
import { assembleMocks } from "@/lib/mocks";
import { drillProblems } from "@/lib/select";
import { mulberry32 } from "@/lib/rng";
import { formatDate, formatDuration } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function MockListPage() {
  const results = useStore((s) => s.mockResults);
  const attempts = useStore((s) => s.attempts);
  const router = useRouter();
  const mocks = useMemo(() => assembleMocks(PROBLEMS, CODING_PROBLEMS.map((c) => c.id)), []);
  const bankSize = PROBLEMS.filter((p) => p.kind === "practice").length;

  const startDrill = () => {
    const pool = PROBLEMS.filter((p) => p.kind === "practice");
    const picked = drillProblems(pool, attempts, mulberry32(Date.now() % 1_000_000));
    router.push(`/mock/drill?ids=${picked.map((p) => p.id).join(",")}`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Test simulator"
        title="Seventy-five minutes, twelve questions"
        description="The SIG format: eleven math, probability and logic questions plus one coding question, free navigation, flagging, calculator allowed, no pausing. Two standard mocks match the real difficulty; four hard mocks sit above it so the real thing feels easy."
        actions={
          <Button variant="secondary" href="/mock/checklist" leftIcon={<ClipboardCheck size={16} />}>
            Pre-test checklist
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader title="Pacing drill: 3 problems in 18 minutes" subtitle="Six minutes each, with the skip-rule reminder at four. Fresh problems every time." action={<Zap size={18} className="text-accent" />} />
          <CardBody className="mt-auto">
            <Button onClick={startDrill} leftIcon={<Play size={16} />} variant="secondary">
              Start a drill
            </Button>
          </CardBody>
        </Card>
        <Card className="flex flex-col">
          <CardHeader title="Official sample test" subtitle="Take the HackerRank sample from your invite once early and once near the end. This app cannot replicate that exact environment." action={<Timer size={18} className="text-faint" />} />
          <CardBody className="mt-auto text-sm text-muted">Tick it off on the dashboard&apos;s plan when done; the planner schedules both passes.</CardBody>
        </Card>
      </div>

      <h2 className="mb-3 font-display text-xl font-semibold">Full mocks</h2>
      <p className="mb-4 text-sm text-muted">
        Assembled from the {bankSize}-problem bank by module and difficulty with no problem repeated across mocks. As more modules land, the mix fills out automatically.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {mocks.map((m) => {
          const taken = results.filter((r) => r.mockId === m.id);
          const best = taken.reduce((b, r) => Math.max(b, r.score), 0);
          const byModule = new Map<number, number>();
          for (const id of m.problemIds) {
            const p = PROBLEMS.find((x) => x.id === id);
            if (p) byModule.set(p.module, (byModule.get(p.module) ?? 0) + 1);
          }
          const hardCount = m.problemIds.filter((id) => (PROBLEMS.find((x) => x.id === id)?.difficulty ?? 0) >= 4).length;
          return (
            <Card key={m.id} className={clsx("flex flex-col p-5", m.kind === "hard" && "border-accent-fill/30")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{m.title}</h3>
                    {m.kind === "hard" ? (
                      <Badge tone="accent">
                        <Flame size={10} /> hard
                      </Badge>
                    ) : (
                      <Badge tone="info">standard</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                </div>
                {taken.length > 0 && (
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold tabular text-fg">
                      {best}/{12}
                    </div>
                    <div className="text-[11px] text-faint">best of {taken.length}</div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {[...byModule.entries()]
                  .sort((a, b) => a[0] - b[0])
                  .map(([mod, n]) => (
                    <span key={mod} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-muted" title={MODULE_META[mod - 1]?.title}>
                      M{mod} ×{n}
                    </span>
                  ))}
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-muted">{hardCount} at d4-5</span>
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-muted">1 coding</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button href={`/mock/${m.id}`} leftIcon={<Play size={16} />} variant={m.kind === "hard" ? "primary" : "secondary"} disabled={m.problemIds.length < 3} aria-label={`${taken.length ? "Retake" : "Start"} ${m.title}`}>
                  {taken.length ? "Retake" : "Start"}
                </Button>
                {m.problemIds.length < 11 && <span className="text-xs text-faint">{m.problemIds.length} math questions available so far</span>}
              </div>
            </Card>
          );
        })}
      </div>

      {results.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-display text-xl font-semibold">Past results</h2>
          <Card>
            <ul className="divide-y divide-border">
              {[...results]
                .sort((a, b) => b.finishedAt - a.finishedAt)
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="w-28 shrink-0 text-muted">{formatDate(r.finishedAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <Link href={`/mock/review/${r.id}`} className="min-w-0 flex-1 truncate text-fg hover:text-accent">
                      {r.title}
                    </Link>
                    <Badge tone={r.kind === "hard" || r.kind === "final" ? "accent" : r.kind === "drill" ? "neutral" : "info"}>{r.kind}</Badge>
                    <span className="font-mono tabular text-fg">
                      {r.score}/{r.total}
                    </span>
                    <span className="hidden font-mono text-xs tabular text-faint sm:inline">{formatDuration(r.durationMs)}</span>
                  </li>
                ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
