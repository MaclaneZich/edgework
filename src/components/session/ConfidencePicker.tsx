"use client";

import clsx from "clsx";
import { useState } from "react";
import { CONFIDENCE_LEVELS } from "@/lib/calibration";

export function ConfidencePicker({ value, onChange, disabled }: { value: number | null; onChange: (v: number) => void; disabled?: boolean }) {
  const [fine, setFine] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">How sure are you?</span>
        <button type="button" onClick={() => setFine((f) => !f)} className="text-xs text-muted underline-offset-2 hover:text-fg hover:underline" disabled={disabled}>
          {fine ? "Use presets" : "Fine-tune"}
        </button>
      </div>
      {fine ? (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={50}
            max={99}
            step={1}
            value={Math.round((value ?? 0.7) * 100)}
            onChange={(e) => onChange(Number(e.target.value) / 100)}
            className="edge-range"
            aria-label="Confidence percent"
            disabled={disabled}
          />
          <span className="w-12 text-right font-mono text-sm tabular text-fg">{Math.round((value ?? 0.7) * 100)}%</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Confidence">
          {CONFIDENCE_LEVELS.map((lvl) => {
            const active = value !== null && Math.abs(value - lvl) < 0.005;
            return (
              <button
                key={lvl}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => onChange(lvl)}
                className={clsx(
                  "flex flex-col items-center rounded-lg border py-2 font-mono text-sm tabular transition-colors disabled:opacity-50",
                  active ? "border-accent-fill bg-accent-soft text-fg" : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                <span className="font-semibold">{Math.round(lvl * 100)}%</span>
                <span className="mt-0.5 font-sans text-[10px] uppercase tracking-wider opacity-80">{lvl === 0.5 ? "guess" : lvl === 0.7 ? "likely" : lvl === 0.9 ? "sure" : "certain"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
