"use client";

import clsx from "clsx";
import { Check, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { MODULE_META, getProblem } from "@/content";
import { formatDate } from "@/lib/format";
import { useData, useStore, type ErrorEntry, type MistakeCategory } from "@/lib/store";
import { MISTAKE_LABELS } from "@/components/session/ProblemView";
import { useStartSession } from "@/components/StartSessionButton";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";

export default function ErrorLogPage() {
  const data = useData();
  const updateError = useStore((s) => s.updateError);
  const resolveError = useStore((s) => s.resolveError);
  const reopenError = useStore((s) => s.reopenError);
  const removeError = useStore((s) => s.removeError);
  const start = useStartSession();
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const [moduleFilter, setModuleFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const entries = useMemo(() => {
    return data.errorLog
      .filter((e) => (tab === "open" ? e.resolvedAt === null : e.resolvedAt !== null))
      .filter((e) => !moduleFilter || getProblem(e.problemId)?.module === Number(moduleFilter))
      .filter((e) => !catFilter || e.category === catFilter)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [data.errorLog, tab, moduleFilter, catFilter]);

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of data.errorLog) if (e.category) c.set(e.category, (c.get(e.category) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.errorLog]);

  return (
    <div>
      <PageHeader
        eyebrow="Notebook of misses"
        title="Error Log"
        description="Every wrong, hinted or low-confidence answer lands here. Tag the mistake, write the one-line lesson, redo it, then resolve it. The categories tell you what to fix: set-up and concept gaps need the lesson; arithmetic and misreads need slower reading."
      />
      {counts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {counts.map(([cat, n]) => (
            <button key={cat} onClick={() => setCatFilter(catFilter === cat ? "" : cat)} className={clsx("rounded-full border px-3 py-1", catFilter === cat ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}>
              {MISTAKE_LABELS[cat as MistakeCategory]} <span className="font-mono">{n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs items={[{ id: "open", label: "Open", count: data.errorLog.filter((e) => e.resolvedAt === null).length }, { id: "resolved", label: "Resolved", count: data.errorLog.filter((e) => e.resolvedAt !== null).length }]} value={tab} onChange={setTab} />
        <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="w-56" aria-label="Filter by module">
          <option value="">All modules</option>
          {MODULE_META.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}. {m.title}
            </option>
          ))}
        </Select>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={<TriangleAlert size={22} />} title={tab === "open" ? "No open errors" : "Nothing resolved yet"} description={tab === "open" ? "Either you have not missed anything yet or you have cleaned up. Both are fine." : "Resolve entries after you redo them cleanly."} />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <ErrorCard key={e.id} entry={e} onUpdate={(patch) => updateError(e.id, patch)} onResolve={() => resolveError(e.id)} onReopen={() => reopenError(e.id)} onRemove={() => removeError(e.id)} onRedo={() => {
              const p = getProblem(e.problemId);
              if (p) start({ title: `Redo: ${p.title}`, problemIds: [p.id], context: "redo", returnHref: "/errors" });
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorCard({ entry, onUpdate, onResolve, onReopen, onRemove, onRedo }: { entry: ErrorEntry; onUpdate: (p: Partial<Pick<ErrorEntry, "category" | "lesson" | "redoBy">>) => void; onResolve: () => void; onReopen: () => void; onRemove: () => void; onRedo: () => void }) {
  const p = getProblem(entry.problemId);
  const [lesson, setLesson] = useState(entry.lesson);
  if (!p) return null;
  const overdue = entry.resolvedAt === null && entry.redoBy < Date.now();
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-fg">{p.title}</span>
            <DifficultyBadge level={p.difficulty} />
            <Badge tone={entry.reason === "wrong" ? "danger" : entry.reason === "low-confidence" ? "info" : "neutral"}>{entry.reason === "wrong" ? "wrong" : entry.reason === "low-confidence" ? "low confidence" : "used hints"}</Badge>
            <span className="text-xs text-muted">Module {p.module} · {formatDate(entry.createdAt)}</span>
          </div>
          <div className={clsx("mt-1 text-xs", overdue ? "text-danger" : "text-muted")}>
            {entry.resolvedAt ? `Resolved ${formatDate(entry.resolvedAt)}` : `Redo by ${formatDate(entry.redoBy)}${overdue ? " (overdue)" : ""}`}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={onRedo} leftIcon={<RotateCcw size={14} />}>
            Redo
          </Button>
          {entry.resolvedAt === null ? (
            <Button size="sm" variant="success" onClick={onResolve} leftIcon={<Check size={14} />}>
              Resolve
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onReopen}>
              Reopen
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRemove} aria-label="Remove entry">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-[180px_1fr_150px]">
        <Select value={entry.category ?? ""} onChange={(e) => onUpdate({ category: (e.target.value || null) as MistakeCategory | null })} aria-label="Mistake category">
          <option value="">Mistake type…</option>
          {(Object.keys(MISTAKE_LABELS) as MistakeCategory[]).map((c) => (
            <option key={c} value={c}>
              {MISTAKE_LABELS[c]}
            </option>
          ))}
        </Select>
        <Input value={lesson} onChange={(e) => setLesson(e.target.value)} onBlur={() => onUpdate({ lesson })} placeholder="Lesson learned, one line" aria-label="Lesson learned" />
        <Input type="date" value={new Date(entry.redoBy).toISOString().slice(0, 10)} onChange={(e) => e.target.value && onUpdate({ redoBy: new Date(e.target.value + "T09:00:00").getTime() })} aria-label="Redo by date" />
      </div>
      {entry.transcript && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted hover:text-fg">Spoken explanation transcript</summary>
          <p className="mt-1 rounded-lg bg-surface-2 p-3 text-sm text-fg">{entry.transcript}</p>
        </details>
      )}
    </Card>
  );
}
