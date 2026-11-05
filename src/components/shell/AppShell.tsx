"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Flame, Menu, Trophy, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useStore } from "@/lib/store";
import { ACHIEVEMENT_BY_ID } from "@/lib/achievements";
import { PageSkeleton } from "@/components/ui/EmptyState";
import { ALL_NAV_ITEMS, NAV } from "./nav";
import { daysBetween, todayString } from "@/lib/schedule";

/** Mirrors theme settings onto <html> and into localStorage for the pre-paint script. */
function ThemeSync() {
  const theme = useStore((s) => s.settings.theme);
  const fontSize = useStore((s) => s.settings.fontSize);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const apply = () => {
      const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
      root.classList.toggle("dark", resolved === "dark");
      root.setAttribute("data-font", fontSize);
      if (reducedMotion === "reduce") root.setAttribute("data-motion", "reduce");
      else root.removeAttribute("data-motion");
    };
    apply();
    try {
      localStorage.setItem("edgework-ui", JSON.stringify({ theme, fontSize, reducedMotion }));
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, fontSize, reducedMotion, hydrated]);
  return null;
}

function ToastHost() {
  const pending = useStore((s) => s.pendingUnlocks);
  const clear = useStore((s) => s.clearPendingUnlocks);
  const [visible, setVisible] = useState<string[]>([]);
  useEffect(() => {
    if (pending.length === 0) return;
    setVisible((v) => [...v, ...pending]);
    clear();
  }, [pending, clear]);
  useEffect(() => {
    if (visible.length === 0) return;
    const t = setTimeout(() => setVisible((v) => v.slice(1)), 4200);
    return () => clearTimeout(t);
  }, [visible]);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {visible.slice(0, 3).map((id) => {
          const a = ACHIEVEMENT_BY_ID.get(id);
          if (!a) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-auto glass flex items-center gap-3 rounded-xl px-4 py-3 shadow-[var(--shadow)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Trophy size={18} />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Achievement</div>
                <div className="text-sm font-semibold text-fg">{a.title}</div>
                <div className="text-xs text-muted">{a.description}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function useGoShortcuts() {
  const router = useRouter();
  useEffect(() => {
    let armed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!armed && e.key === "g") {
        armed = true;
        timer = setTimeout(() => (armed = false), 900);
        return;
      }
      if (armed) {
        armed = false;
        if (timer) clearTimeout(timer);
        const item = ALL_NAV_ITEMS.find((i) => i.key === e.key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

function NavLinks({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="Primary">
      {NAV.map((group) => (
        <div key={group.title}>
          {!collapsed && <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">{group.title}</div>}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={clsx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      active ? "bg-accent-soft text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-accent-fill" aria-hidden />}
                    <Icon size={17} className={clsx("shrink-0", active ? "text-accent" : "text-faint group-hover:text-muted")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.key && (
                      <kbd className="ml-auto hidden rounded border border-border px-1 font-mono text-[10px] text-faint group-hover:inline-block" aria-hidden>
                        g {item.key}
                      </kbd>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Countdown() {
  const testDate = useStore((s) => s.settings.testDate);
  const streak = useStore((s) => s.streak);
  const days = daysBetween(todayString(), testDate);
  return (
    <div className="card flex items-center justify-between gap-3 px-3 py-2.5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">Test in</div>
        <div className="font-mono text-xl font-semibold tabular text-fg">
          {days > 0 ? days : days === 0 ? "today" : "done"}
          {days > 0 && <span className="ml-1 text-xs font-normal text-muted">{days === 1 ? "day" : "days"}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-muted" title={`Best streak ${streak.best} days`}>
        <Flame size={16} className={streak.current > 0 ? "text-accent" : "text-faint"} />
        <span className="font-mono tabular">{streak.current}</span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  useGoShortcuts();

  // Safety net: never leave the app stuck on the skeleton if storage misbehaves.
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 2000);
    return () => clearTimeout(t);
  }, [setHydrated]);

  useEffect(() => setDrawer(false), [pathname]);

  const immersive = useMemo(() => /^\/mock\/[^/]+$/.test(pathname) && !pathname.endsWith("/checklist"), [pathname]);

  return (
    <>
      <ThemeSync />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent-fill focus:px-3 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <div className="flex min-h-screen w-full">
        {!immersive && (
          <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border bg-elev/60 px-3 py-4 backdrop-blur lg:flex">
            <Link href="/" className="mb-5 flex items-center px-2" aria-label="Edgework home">
              <Logo />
            </Link>
            <div className="mb-4">
              <Countdown />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <NavLinks />
            </div>
            <div className="mt-3 px-2 text-[11px] text-faint">
              Press <kbd className="rounded border border-border px-1 font-mono">g</kbd> then a letter to jump.
            </div>
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {!immersive && (
            <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-elev/80 px-4 py-3 backdrop-blur lg:hidden">
              <Link href="/" aria-label="Edgework home">
                <Logo />
              </Link>
              <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Open navigation" aria-expanded={drawer}>
                <Menu size={20} />
              </button>
            </header>
          )}

          <main id="main" className={clsx("flex-1", immersive ? "" : "mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8")}>
            {hydrated ? children : <PageSkeleton />}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden />
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-elev p-4 shadow-2xl"
              role="dialog"
              aria-label="Navigation"
            >
              <div className="mb-4 flex items-center justify-between">
                <Logo />
                <button onClick={() => setDrawer(false)} className="rounded-lg p-2 text-muted hover:bg-surface-2" aria-label="Close navigation">
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <Countdown />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <NavLinks onNavigate={() => setDrawer(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastHost />
    </>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-faint" />}
          {it.href ? (
            <Link href={it.href} className="hover:text-fg">
              {it.label}
            </Link>
          ) : (
            <span className="text-fg">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
