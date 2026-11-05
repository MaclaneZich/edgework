export function formatDuration(ms: number, opts: { compact?: boolean } = {}): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (opts.compact) {
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

export function formatHours(minutes: number, digits = 1): string {
  return `${(minutes / 60).toFixed(digits)}h`;
}

export function formatPercent(x: number | null | undefined, digits = 0): string {
  if (x === null || x === undefined || Number.isNaN(x)) return "–";
  return `${(100 * x).toFixed(digits)}%`;
}

export function formatDate(d: string | number | Date, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }): string {
  const date = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T00:00:00") : new Date(d);
  return date.toLocaleDateString(undefined, opts);
}

export function formatRelativeDay(date: string, today: string): string {
  const diff = Math.round((new Date(date + "T00:00:00Z").getTime() - new Date(today + "T00:00:00Z").getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatDate(date, { weekday: "short", month: "short", day: "numeric" });
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function formatNumber(x: number, digits = 4): string {
  if (Number.isInteger(x)) return x.toLocaleString();
  if (Math.abs(x) >= 1e6 || (Math.abs(x) < 1e-4 && x !== 0)) return x.toExponential(3);
  return Number(x.toPrecision(digits)).toString();
}
