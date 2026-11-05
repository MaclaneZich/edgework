"use client";

import { NotebookPen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MODULE_META } from "@/content";
import { useStore } from "@/lib/store";
import { MathText } from "@/components/Math";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/EmptyState";
import { Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

function NotesInner() {
  const search = useSearchParams();
  const initial = Number(search.get("module")) || 1;
  const [moduleId, setModuleId] = useState(initial);
  const notes = useStore((s) => s.notes);
  const setNote = useStore((s) => s.setNote);
  const [draft, setDraft] = useState(notes[String(moduleId)] ?? "");

  useEffect(() => {
    setDraft(notes[String(moduleId)] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (draft !== (notes[String(moduleId)] ?? "")) setNote(moduleId, draft);
    }, 500);
    return () => clearTimeout(t);
  }, [draft, moduleId, notes, setNote]);

  const meta = MODULE_META.find((m) => m.id === moduleId)!;
  const filled = MODULE_META.filter((m) => (notes[String(m.id)] ?? "").trim().length > 0).length;

  return (
    <div>
      <PageHeader
        eyebrow="Notebook"
        title="Notes per module"
        description="Free-form notes with KaTeX: wrap math in $...$ or $$...$$. Saved automatically as you type. Write the tricks in your own words; that is what sticks."
        actions={
          <Select value={moduleId} onChange={(e) => setModuleId(Number(e.target.value))} className="w-64" aria-label="Module">
            {MODULE_META.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}. {m.title}
                {(notes[String(m.id)] ?? "").trim() ? " ●" : ""}
              </option>
            ))}
          </Select>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Module ${moduleId}: ${meta.title}`} subtitle={`${filled} of 10 modules have notes`} action={<NotebookPen size={18} className="text-faint" />} />
          <CardBody>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={"Example:\n\nThe complement trick: P(at least one) = 1 - P(none).\n\n$$P(\\text{no six in } n) = (5/6)^n$$\n\n- Birthday: 23 people, 50%\n- Derangements: about 1/e"}
              className="min-h-[420px] font-mono text-[13px]"
              aria-label="Notes"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Preview" subtitle="Rendered with KaTeX" />
          <CardBody>
            {draft.trim() ? <MathText className="text-[15px] text-fg">{draft}</MathText> : <p className="text-sm text-faint">Start typing on the left.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotesInner />
    </Suspense>
  );
}
