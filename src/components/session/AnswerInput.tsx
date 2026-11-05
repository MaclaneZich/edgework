"use client";

import clsx from "clsx";
import { useMemo } from "react";
import type { Answer } from "@/content/types";
import { formatValue, parseAnswer } from "@/lib/answer";
import { InlineMath } from "@/components/Math";
import { Input } from "@/components/ui/Input";

export function AnswerInput({
  answer,
  value,
  onChange,
  onSubmit,
  disabled,
  autoFocus,
}: {
  answer: Answer;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const preview = useMemo(() => {
    if (answer.type !== "numeric" || !value.trim()) return null;
    const r = parseAnswer(value);
    if (!r.ok || r.value === undefined) return { ok: false as const, text: r.error ?? "" };
    // only show the preview when it adds information (fractions, expressions, percents)
    const plain = /^-?\d*\.?\d+$/.test(value.trim());
    return { ok: true as const, text: plain ? "" : `= ${formatValue(r.value)}` };
  }, [answer.type, value]);

  if (answer.type === "choice") {
    return (
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
        {answer.options.map((opt, i) => {
          const active = value === String(i);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(String(i))}
              className={clsx(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors disabled:opacity-60",
                active ? "border-accent-fill bg-accent-soft text-fg" : "border-border bg-surface text-fg hover:border-border-strong",
              )}
            >
              <span className={clsx("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs", active ? "bg-accent-fill text-accent-ink" : "bg-surface-2 text-muted")}>
                {String.fromCharCode(65 + i)}
              </span>
              <InlineMath>{opt}</InlineMath>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Input
          mono
          autoFocus={autoFocus}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={answer.unit ? `Answer in ${answer.unit}` : "e.g. 3/8, 0.375, 37.5%, 1 - (5/6)^4"}
          aria-label="Your answer"
          aria-invalid={preview ? !preview.ok : undefined}
          className="text-base"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
        />
        {answer.unit && <span className="text-sm text-muted">{answer.unit}</span>}
      </div>
      <div className="mt-1.5 flex min-h-[18px] items-center justify-between text-xs">
        <span className={clsx("font-mono", preview?.ok === false ? "text-danger" : "text-muted")}>{preview?.text ?? ""}</span>
        <span className="text-faint">Fractions, decimals, percents and expressions all work</span>
      </div>
    </div>
  );
}
