import clsx from "clsx";
import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "danger" | "info" | "outline";

export function Badge({ children, tone = "neutral", className, size = "sm" }: { children: ReactNode; tone?: BadgeTone; className?: string; size?: "xs" | "sm" }) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-surface-2 text-muted border-border",
    accent: "bg-accent-soft text-accent border-transparent",
    success: "bg-success-soft text-success border-transparent",
    danger: "bg-danger-soft text-danger border-transparent",
    info: "bg-info-soft text-info border-transparent",
    outline: "bg-transparent text-muted border-border-strong",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-medium leading-none whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const DIFF_LABEL = ["", "Warm-up", "Standard", "Test level", "Hard", "Brutal"];

export function DifficultyBadge({ level, showLabel = false }: { level: 1 | 2 | 3 | 4 | 5; showLabel?: boolean }) {
  const tone: BadgeTone = level <= 2 ? "neutral" : level === 3 ? "info" : level === 4 ? "accent" : "danger";
  return (
    <Badge tone={tone} className="font-mono" aria-label={`Difficulty ${level} of 5, ${DIFF_LABEL[level]}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={clsx("h-1.5 w-1.5 rounded-full", i <= level ? "bg-current" : "bg-current opacity-25")} />
        ))}
      </span>
      {showLabel && <span className="ml-1 font-sans">{DIFF_LABEL[level]}</span>}
    </Badge>
  );
}

export function difficultyLabel(level: number): string {
  return DIFF_LABEL[level] ?? "";
}
