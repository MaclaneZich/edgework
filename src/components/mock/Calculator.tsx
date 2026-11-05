"use client";

import { useState } from "react";
import { formatValue, parseAnswer } from "@/lib/answer";
import { Input } from "@/components/ui/Input";

export function Calculator() {
  const [expr, setExpr] = useState("");
  const [history, setHistory] = useState<Array<{ expr: string; value: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const evaluate = () => {
    if (!expr.trim()) return;
    const r = parseAnswer(expr);
    if (!r.ok || r.value === undefined) {
      setError(r.error ?? "Could not evaluate");
      return;
    }
    setError(null);
    setHistory((h) => [{ expr, value: formatValue(r.value!) }, ...h].slice(0, 12));
    setExpr("");
  };

  const insert = (s: string) => setExpr((e) => e + s);

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <Input
          mono
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              evaluate();
            }
          }}
          placeholder="e.g. C(10,3) * (1/2)^10"
          aria-label="Calculator expression"
          autoComplete="off"
        />
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-danger">{error ?? ""}</span>
          <span className="text-faint">Enter to evaluate</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          ["C(", "choose"],
          ["P(", "perm"],
          ["!", "n!"],
          ["^", "power"],
          ["sqrt(", "√"],
          ["ln(", "ln"],
          ["exp(", "eˣ"],
          ["pi", "π"],
          ["(", "("],
          [")", ")"],
          [",", ","],
          ["/", "÷"],
        ].map(([ins, label]) => (
          <button key={ins} onClick={() => insert(ins)} className="rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-xs text-fg hover:bg-surface-2">
            {label}
          </button>
        ))}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface-2/40 p-2 font-mono text-xs">
        {history.length === 0 && <li className="p-2 text-faint">Results appear here. Click one to reuse it.</li>}
        {history.map((h, i) => (
          <li key={i}>
            <button className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-2" onClick={() => setExpr((e) => e + h.value)}>
              <span className="truncate text-muted">{h.expr}</span>
              <span className="shrink-0 text-fg">= {h.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
