"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "accent",
  size = "md",
  label,
  showValue,
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "accent" | "success" | "danger" | "info" | "muted";
  size?: "xs" | "sm" | "md";
  label?: string;
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (100 * value) / max)) : 0;
  const reduce = useReducedMotion();
  const toneCls = {
    accent: "bg-accent-fill",
    success: "bg-success",
    danger: "bg-danger",
    info: "bg-info",
    muted: "bg-faint",
  }[tone];
  const h = size === "xs" ? "h-1" : size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={clsx("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>{label}</span>
          {showValue && <span className="font-mono tabular">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={clsx("w-full overflow-hidden rounded-full bg-surface-3", h)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={label ?? "Progress"}
      >
        <motion.div
          className={clsx("h-full rounded-full", toneCls)}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  className,
  children,
  tone = "accent",
  label,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  tone?: "accent" | "success" | "info";
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const reduce = useReducedMotion();
  const color = tone === "accent" ? "var(--accent-fill)" : tone === "success" ? "var(--success)" : "var(--info)";
  return (
    <div className={clsx("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(pct)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
