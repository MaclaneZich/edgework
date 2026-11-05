"use client";

import clsx from "clsx";
import { Check, Code2, Lightbulb } from "lucide-react";
import { useState } from "react";
import { CODING_PROBLEMS } from "@/content/coding";
import { useStore } from "@/lib/store";
import { CodingPane, initialCodingState, type CodingState } from "@/components/mock/CodingPane";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

export default function CodingPage() {
  const results = useStore((s) => s.coding);
  const saveCoding = useStore((s) => s.saveCoding);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, CodingState>>({});
  const [hints, setHints] = useState(0);
  const active = CODING_PROBLEMS.find((p) => p.id === activeId) ?? null;
  const passed = CODING_PROBLEMS.filter((p) => results[p.id]?.passed).length;

  return (
    <div>
      <PageHeader
        eyebrow="Module 10 · light"
        title="Coding warmup"
        description="The real test has one coding question out of twelve, so this is deliberately short: eight HackerRank-style problems covering arrays, hashing, sorting, simple DP and simulation. JavaScript runs in your browser; Python downloads a runtime the first time."
      />
      <ProgressBar value={passed} max={CODING_PROBLEMS.length} className="mb-6" label={`${passed} of ${CODING_PROBLEMS.length} passed`} showValue />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Problems" action={<Code2 size={18} className="text-faint" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-border">
              {CODING_PROBLEMS.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setActiveId(p.id);
                      setHints(0);
                    }}
                    className={clsx("flex w-full items-center gap-2 px-1 py-2.5 text-left text-sm hover:bg-surface-2/60", activeId === p.id && "text-accent")}
                  >
                    <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", results[p.id]?.passed ? "bg-success-soft text-success" : "border border-border-strong text-transparent")}>
                      <Check size={12} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <Badge tone={p.difficulty === 1 ? "neutral" : p.difficulty === 2 ? "info" : "accent"} size="xs">
                      {p.difficulty === 1 ? "easy" : p.difficulty === 2 ? "medium" : "harder"}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <div>
          {!active ? (
            <Card className="p-8 text-sm text-muted">
              <p className="mb-2 font-medium text-fg">Approach for the test&apos;s coding question</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Read the examples before the prose and restate the task in one sentence.</li>
                <li>Write the brute force first if it is obvious; a correct O(n²) beats a broken O(n).</li>
                <li>Then ask: can a hash map, a sort, or a running value remove a loop?</li>
                <li>Test an empty input, a single element, and the example by hand before submitting.</li>
              </ol>
            </Card>
          ) : (
            <div className="space-y-4">
              <CodingPane
                problem={active}
                state={states[active.id] ?? initialCodingState(active)}
                onChange={(s) => {
                  setStates((all) => ({ ...all, [active.id]: s }));
                  if (s.lastRun && s.lastRun !== states[active.id]?.lastRun) {
                    saveCoding({ problemId: active.id, passed: s.lastRun.ok, language: s.language, timestamp: Date.now(), code: s.code[s.language] });
                  }
                }}
                showPromptSolution={Boolean(results[active.id]?.passed) || hints >= 3}
              />
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-fg">Hints</span>
                  <Button size="sm" variant="ghost" leftIcon={<Lightbulb size={14} />} onClick={() => setHints((h) => Math.min(3, h + 1))} disabled={hints >= 3}>
                    {hints === 0 ? "Show a hint" : hints < 3 ? "Next hint" : "All shown"}
                  </Button>
                </div>
                {hints > 0 && (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                    {active.hints.slice(0, hints).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ol>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
