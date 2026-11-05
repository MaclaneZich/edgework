"use client";

import clsx from "clsx";
import { Check, Play, RotateCcw, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { CodingProblem } from "@/content/coding";
import { runCode, type RunOutcome } from "@/lib/codeRunner";
import { MathText } from "@/components/Math";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => <div className="skeleton h-full min-h-[280px]" />,
});

export type Language = "js" | "py";

export interface CodingState {
  language: Language;
  code: Record<Language, string>;
  lastRun: RunOutcome | null;
}

export function initialCodingState(problem: CodingProblem): CodingState {
  return { language: "js", code: { js: problem.starter.js, py: problem.starter.py }, lastRun: null };
}

export function CodingPane({
  problem,
  state,
  onChange,
  showPromptSolution = false,
  compact = false,
}: {
  problem: CodingProblem;
  state: CodingState;
  onChange: (s: CodingState) => void;
  showPromptSolution?: boolean;
  compact?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [plain, setPlain] = useState(false);
  const [dark, setDark] = useState(true);
  const [solutionOpen, setSolutionOpen] = useState(false);

  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const lang = state.language;
  const code = state.code[lang];

  const run = async () => {
    setRunning(true);
    setStatus(null);
    const out = await runCode(problem, code, lang, setStatus);
    onChange({ ...state, lastRun: out });
    setRunning(false);
    setStatus(null);
  };

  return (
    <div className={clsx("flex flex-col gap-3", compact ? "" : "")}>
      <div className="card p-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{problem.title}</div>
        <MathText className="text-[15px] text-fg">{problem.prompt}</MathText>
        <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-muted">{lang === "js" ? problem.signature.js : problem.signature.py}</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-surface-2 p-0.5 text-xs">
          {(["js", "py"] as Language[]).map((l) => (
            <button key={l} onClick={() => onChange({ ...state, language: l })} className={clsx("rounded-md px-3 py-1.5 font-medium", lang === l ? "bg-surface text-fg" : "text-muted hover:text-fg")} aria-pressed={lang === l}>
              {l === "js" ? "JavaScript" : "Python"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPlain((p) => !p)} className="text-xs text-muted hover:text-fg">
            {plain ? "Rich editor" : "Plain editor"}
          </button>
          <Button size="sm" variant="ghost" leftIcon={<RotateCcw size={14} />} onClick={() => onChange({ ...state, code: { ...state.code, [lang]: problem.starter[lang] } })}>
            Reset
          </Button>
          <Button size="sm" onClick={run} loading={running} leftIcon={<Play size={14} />}>
            Run tests
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border" style={{ height: compact ? 300 : 380 }}>
        {plain ? (
          <Textarea value={code} onChange={(e) => onChange({ ...state, code: { ...state.code, [lang]: e.target.value } })} className="h-full resize-none rounded-none border-0 font-mono text-[13px]" spellCheck={false} aria-label="Code editor" />
        ) : (
          <MonacoEditor
            height="100%"
            language={lang === "js" ? "javascript" : "python"}
            theme={dark ? "vs-dark" : "light"}
            value={code}
            onChange={(v) => onChange({ ...state, code: { ...state.code, [lang]: v ?? "" } })}
            options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "JetBrains Mono, Consolas, monospace", scrollBeyondLastLine: false, automaticLayout: true, tabSize: lang === "py" ? 4 : 2, wordWrap: "on" }}
          />
        )}
      </div>

      {status && <div className="text-xs text-muted">{status}</div>}

      {state.lastRun && (
        <div className={clsx("rounded-xl border p-3 text-sm", state.lastRun.ok ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft")} role="status">
          {state.lastRun.error ? (
            <div className="font-mono text-xs text-danger">{state.lastRun.error}</div>
          ) : (
            <>
              <div className={clsx("mb-2 font-medium", state.lastRun.ok ? "text-success" : "text-danger")}>
                {state.lastRun.results.filter((r) => r.passed).length}/{state.lastRun.results.length} tests passed
              </div>
              <ul className="flex flex-col gap-1">
                {state.lastRun.results.map((r) => (
                  <li key={r.name} className="flex items-start gap-2 font-mono text-xs">
                    {r.passed ? <Check size={14} className="mt-0.5 shrink-0 text-success" /> : <X size={14} className="mt-0.5 shrink-0 text-danger" />}
                    <span className="text-fg">{r.name}</span>
                    {!r.passed && (
                      <span className="text-muted">
                        {r.error ? `threw ${r.error}` : `expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.received)}`}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {state.lastRun.logs.length > 0 && <pre className="mt-2 max-h-24 overflow-auto rounded bg-surface-2 p-2 font-mono text-[11px] text-muted">{state.lastRun.logs.join("\n")}</pre>}
            </>
          )}
        </div>
      )}

      {showPromptSolution && (
        <div className="card">
          <button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium" onClick={() => setSolutionOpen((o) => !o)} aria-expanded={solutionOpen}>
            Reference solution (JavaScript)
            <span className="text-xs text-muted">{solutionOpen ? "hide" : "show"}</span>
          </button>
          {solutionOpen && (
            <div className="border-t border-border p-4">
              <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-fg">{problem.solution.js}</pre>
              <p className="mt-3 text-sm text-muted">{problem.solution.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
