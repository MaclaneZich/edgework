import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, children, interactive, ...rest }: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; children?: ReactNode }) {
  return (
    <div
      className={clsx(
        "card",
        interactive && "transition-[border-color,transform,box-shadow] duration-150 hover:border-border-strong hover:-translate-y-px",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold leading-tight text-fg">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("px-5 pb-5 pt-4", className)}>{children}</div>;
}

export function Stat({ label, value, hint, className, mono = true }: { label: ReactNode; value: ReactNode; hint?: ReactNode; className?: string; mono?: boolean }) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{label}</span>
      <span className={clsx("text-2xl font-semibold leading-none text-fg", mono && "font-mono tabular")}>{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
