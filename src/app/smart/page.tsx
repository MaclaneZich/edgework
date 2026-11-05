"use client";

import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PROBLEMS } from "@/content";
import { TAGS, type Tag } from "@/content/types";
import { buildSmartSession } from "@/lib/select";
import { mulberry32 } from "@/lib/rng";
import { dueCards } from "@/lib/srs";
import { useData } from "@/lib/store";
import { useStartSession } from "@/components/StartSessionButton";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState, PageSkeleton } from "@/components/ui/EmptyState";
import { Field, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

function SmartInner() {
  const data = useData();
  const search = useSearchParams();
  const initialTag = search.get("tag");
  const [minutes, setMinutes] = useState(30);
  const [tag, setTag] = useState<string>(initialTag && initialTag in TAGS ? initialTag : "");
  const [seed, setSeed] = useState(() => Date.now() % 100_000);
  const start = useStartSession();

  const candidates = useMemo(() => PROBLEMS.filter((p) => p.kind === "practice"), []);
  const picked = useMemo(
    () =>
      buildSmartSession(
        {
          candidates,
          mastery: data.mastery,
          srs: data.srs,
          attempts: data.attempts,
          now: Date.now(),
          rng: mulberry32(seed),
          focusTags: tag ? [tag as Tag] : undefined,
        },
        minutes,
      ),
    [candidates, data, seed, tag, minutes],
  );
  const due = dueCards(data.srs, Date.now()).length;
  const total = picked.reduce((s, p) => s + p.minutes, 0);

  if (candidates.length === 0) {
    return <EmptyState icon={<Sparkles size={22} />} title="No problems yet" description="Content is still being written." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Adaptive"
        title="Smart Session"
        description="Built from your weakest tags and anything due for review. Difficulty ramps up after three quick correct answers and eases after two misses."
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Settings" />
          <CardBody className="space-y-4">
            <Field label="Length">
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45].map((m) => (
                  <button key={m} onClick={() => setMinutes(m)} className={`rounded-xl border px-3 py-2 font-mono text-sm ${minutes === m ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg"}`} aria-pressed={minutes === m}>
                    {m} min
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Focus on a tag (optional)" hint="Use this for the calibration flags or a weak heatmap cell.">
              <Select value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">Weakest tags automatically</option>
                {(Object.keys(TAGS) as Tag[]).map((t) => (
                  <option key={t} value={t}>
                    {TAGS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="text-xs text-muted">{due} problem{due === 1 ? "" : "s"} due for review right now.</div>
            <div className="flex gap-2">
              <Button onClick={() => start({ title: tag ? `Focus: ${TAGS[tag as Tag]}` : "Smart Session", problemIds: picked.map((p) => p.id), context: "smart", returnHref: "/smart", adaptive: true, pool: candidates.filter((p) => !tag || p.tags.includes(tag as Tag)).map((p) => p.id) })} leftIcon={<Sparkles size={16} />} disabled={picked.length === 0}>
                Start session
              </Button>
              <Button variant="secondary" onClick={() => setSeed((s) => s + 1)}>
                Reshuffle
              </Button>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={`${picked.length} problems, about ${total} minutes`} subtitle="Reviews first, then new problems from the tags that need the most work." />
          <CardBody className="pt-2">
            {picked.length === 0 ? (
              <p className="text-sm text-muted">No problems match that focus. Choose another tag.</p>
            ) : (
              <ol className="divide-y divide-border">
                {picked.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-5 font-mono text-xs text-faint">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-fg">{p.title}</span>
                    {data.srs[p.id] && data.srs[p.id].due <= Date.now() && <Badge tone="info">review</Badge>}
                    <span className="hidden text-xs text-muted sm:inline">{TAGS[p.tags[0]]}</span>
                    <span className="font-mono text-xs text-faint">{p.minutes}m</span>
                    <DifficultyBadge level={p.difficulty} />
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function SmartPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SmartInner />
    </Suspense>
  );
}
