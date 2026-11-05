"use client";

import clsx from "clsx";
import { useId, type ReactNode } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  size = "md",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label="Sections" className={clsx("inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1", className)}>
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            id={`${id}-${it.id}`}
            aria-selected={active}
            disabled={it.disabled}
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => {
              const idx = items.findIndex((x) => x.id === value);
              if (e.key === "ArrowRight") onChange(items[(idx + 1) % items.length].id);
              if (e.key === "ArrowLeft") onChange(items[(idx - 1 + items.length) % items.length].id);
            }}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-40",
              size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active ? "bg-surface text-fg shadow-[var(--shadow)]" : "text-muted hover:text-fg",
            )}
          >
            {it.label}
            {typeof it.count === "number" && (
              <span className={clsx("rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular", active ? "bg-accent-soft text-accent" : "bg-surface-3 text-faint")}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
