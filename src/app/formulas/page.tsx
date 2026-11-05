"use client";

import clsx from "clsx";
import { Printer, Search, Sigma } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LESSONS, MODULE_META } from "@/content";
import { FAMILIES } from "@/content/families";
import type { ModuleId } from "@/content/types";
import { DisplayMath, InlineMath } from "@/components/Math";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";

function FormulasInner() {
  const search = useSearchParams();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"formulas" | "families">(search.get("family") ? "families" : "formulas");
  const [moduleFilter, setModuleFilter] = useState<number>(Number(search.get("module")) || 0);
  const highlight = search.get("family");

  const entries = useMemo(() => {
    const out: Array<{ module: ModuleId; name: string; latex: string; note: string }> = [];
    for (const m of MODULE_META) {
      const lesson = LESSONS[m.id];
      if (!lesson) continue;
      for (const f of lesson.formulas) out.push({ module: m.id, ...f });
    }
    return out;
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = entries.filter((e) => (!moduleFilter || e.module === moduleFilter) && (!needle || e.name.toLowerCase().includes(needle) || e.note.toLowerCase().includes(needle) || e.latex.toLowerCase().includes(needle)));
  const families = FAMILIES.filter((f) => (!moduleFilter || f.module === moduleFilter) && (!needle || f.name.toLowerCase().includes(needle) || f.trick.toLowerCase().includes(needle)));
  const modulesWithContent = MODULE_META.filter((m) => LESSONS[m.id]);

  return (
    <div>
      <PageHeader
        eyebrow="Reference"
        title="Formula and tricks sheet"
        description="Built automatically from the lessons, so it grows as modules land. Search, filter by module, and print it for the desk."
        actions={
          <Button variant="secondary" onClick={() => window.print()} leftIcon={<Printer size={16} />} className="no-print">
            Print
          </Button>
        }
      />
      <div className="no-print mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search formulas and families" className="pl-9" aria-label="Search" />
        </div>
        <Tabs items={[{ id: "formulas", label: "Formulas", count: filtered.length }, { id: "families", label: "Classic families", count: families.length }]} value={tab} onChange={setTab} size="sm" />
      </div>
      <div className="no-print mb-6 flex flex-wrap gap-1.5">
        <button onClick={() => setModuleFilter(0)} className={clsx("rounded-full border px-3 py-1 text-xs", moduleFilter === 0 ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")}>
          All modules
        </button>
        {MODULE_META.map((m) => (
          <button key={m.id} onClick={() => setModuleFilter(m.id)} className={clsx("rounded-full border px-3 py-1 text-xs", moduleFilter === m.id ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg", !LESSONS[m.id] && tab === "formulas" && "opacity-50")} title={m.title}>
            M{m.id}
          </button>
        ))}
      </div>

      {tab === "formulas" ? (
        filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">{entries.length === 0 ? "Formulas appear here as lessons are published." : "No formulas match."}</Card>
        ) : (
          <div className="space-y-6">
            {modulesWithContent
              .filter((m) => filtered.some((e) => e.module === m.id))
              .map((m) => (
                <section key={m.id}>
                  <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                    <span className="font-mono text-sm text-faint">{String(m.id).padStart(2, "0")}</span>
                    {m.title}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {filtered
                      .filter((e) => e.module === m.id)
                      .map((e, i) => (
                        <Card key={i} className="p-4">
                          <div className="mb-1 text-sm font-semibold text-fg">{e.name}</div>
                          <DisplayMath tex={e.latex} className="my-2 text-fg" />
                          <p className="text-xs text-muted">
                            <InlineMath>{e.note}</InlineMath>
                          </p>
                        </Card>
                      ))}
                  </div>
                </section>
              ))}
          </div>
        )
      ) : (
        <Card>
          <CardHeader title="Classic problem families" subtitle="Each family's one-line trick. Problems link here from their solutions." action={<Sigma size={18} className="text-faint" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-border">
              {families.map((f) => (
                <li key={f.id} id={`family-${f.id}`} className={clsx("flex flex-col gap-1 py-3 md:flex-row md:items-start md:gap-4", highlight === f.id && "rounded-lg bg-accent-soft px-3")}>
                  <div className="md:w-56 md:shrink-0">
                    <div className="font-medium text-fg">{f.name}</div>
                    <div className="text-xs text-muted">Module {f.module}</div>
                  </div>
                  <p className="text-sm text-fg">
                    <InlineMath>{f.trick}</InlineMath>
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function FormulasPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FormulasInner />
    </Suspense>
  );
}
