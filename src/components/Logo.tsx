import clsx from "clsx";

/**
 * Edgework mark: three bars of an "E" whose middle bar is sheared forward past the edge,
 * cut by a diagonal that reads as both a price path and a knife edge.
 */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="16" className="fill-[var(--surface-2)] dark:fill-[var(--surface-3)]" />
      <path d="M17 18h26a3 3 0 0 1 0 6H17a3 3 0 0 1 0-6Z" className="fill-[var(--fg)]" />
      <path d="M17 40h20a3 3 0 0 1 0 6H17a3 3 0 0 1 0-6Z" className="fill-[var(--fg)]" />
      <path d="M22 29h30a3 3 0 0 1 0 6H22a3 3 0 0 1 0-6Z" className="fill-[var(--accent-fill)]" />
      <path d="M44 48 L54 14" stroke="var(--accent-fill)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-fg">
          Edge<span className="text-accent">work</span>
        </span>
      )}
    </span>
  );
}
