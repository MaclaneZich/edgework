"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/** Accessible modal built on the native <dialog> element: focus trapping and Escape for free. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (dismissible) onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose, dismissible]);

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];

  return (
    <dialog
      ref={ref}
      className={clsx(
        "m-auto w-[calc(100%-2rem)] rounded-2xl border border-border bg-elev p-0 text-fg shadow-[var(--shadow)] backdrop:bg-black/60 backdrop:backdrop-blur-sm open:fade-up",
        widths,
        className,
      )}
      onClick={(e) => {
        if (!dismissible) return;
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      <div className="p-6">
        {(title || dismissible) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title ? (
              <h2 id="dialog-title" className="font-display text-xl font-semibold">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {dismissible && (
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close dialog">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
