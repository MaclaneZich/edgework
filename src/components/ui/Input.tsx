"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const field =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 text-fg placeholder:text-faint transition-colors focus:border-border-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--ring)] disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }>(function Input({ className, mono, ...rest }, ref) {
  return <input ref={ref} className={clsx(field, "h-10 text-sm", mono && "font-mono", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={clsx(field, "min-h-[96px] py-2.5 text-sm leading-relaxed", className)} {...rest} />;
});

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(field, "h-10 appearance-none pr-9 text-sm", className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({ label, hint, children, className, htmlFor }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)} htmlFor={htmlFor}>
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-fg">{label}</div>
        {description && <div className="mt-0.5 text-xs text-muted">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50",
          checked ? "border-transparent bg-accent-fill" : "border-border-strong bg-surface-3",
        )}
      >
        <span
          className={clsx("absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")}
          style={{ backgroundColor: checked ? "var(--accent-ink)" : "var(--fg)" }}
        />
      </button>
    </div>
  );
}
