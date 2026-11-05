"use client";

import clsx from "clsx";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[background-color,color,box-shadow,transform] duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-[var(--ring)] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-accent-fill text-accent-ink hover:brightness-105 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_18px_-8px_var(--accent-fill)]",
  secondary: "bg-surface-2 text-fg hover:bg-surface-3 border border-border",
  outline: "border border-border-strong text-fg hover:bg-surface-2",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger-soft text-danger hover:brightness-110 border border-transparent",
  success: "bg-success-soft text-success hover:brightness-110 border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, href, leftIcon, rightIcon, loading, children, ...rest },
  ref,
) {
  const cls = clsx(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={rest.disabled || undefined} aria-label={rest["aria-label"]} title={rest.title}>
        {leftIcon}
        {children}
        {rightIcon}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} {...rest} disabled={rest.disabled || loading}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
