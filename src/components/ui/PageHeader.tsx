import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</div>}
        <h1 className="font-display text-3xl font-semibold leading-[1.1] text-fg md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
