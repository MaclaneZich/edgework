"use client";

import clsx from "clsx";
import { Hourglass, Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MODULE_META } from "@/content";
import { formatDate, formatDuration, formatMinutes } from "@/lib/format";
import { addDays, todayString } from "@/lib/schedule";
import { useData, useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

const PRESETS = [
  { label: "25 / 5", work: 25, rest: 5 },
  { label: "45 / 10", work: 45, rest: 10 },
  { label: "15 / 3", work: 15, rest: 3 },
];

export default function TimerPage() {
  const data = useData();
  const logStudy = useStore((s) => s.logStudy);
  const setTimerRunning = useStore((s) => s.setTimerRunning);
  const [preset, setPreset] = useState(0);
  const [moduleId, setModuleId] = useState<string>("");
  const [phase, setPhase] = useState<"idle" | "work" | "rest">("idle");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState(0);
  const lastTick = useRef<number | null>(null);
  const workedMs = useRef(0);
  const [manualMinutes, setManualMinutes] = useState("30");

  const work = PRESETS[preset].work * 60_000;
  const rest = PRESETS[preset].rest * 60_000;
  const target = phase === "rest" ? rest : work;

  useEffect(() => {
    setTimerRunning(running && phase === "work");
    return () => setTimerRunning(false);
  }, [running, phase, setTimerRunning]);

  const commit = useCallback(() => {
    const minutes = Math.round(workedMs.current / 60_000);
    if (minutes >= 1) logStudy({ module: moduleId ? (Number(moduleId) as 1) : null, minutes, startedAt: Date.now() - workedMs.current, source: "timer" });
    workedMs.current = 0;
  }, [logStudy, moduleId]);

  useEffect(() => {
    if (!running) {
      lastTick.current = null;
      return;
    }
    const t = setInterval(() => {
      const now = Date.now();
      const delta = lastTick.current ? now - lastTick.current : 0;
      lastTick.current = now;
      if (phase === "work") workedMs.current += delta;
      setElapsed((e) => {
        const next = e + delta;
        if (next >= target) {
          if (phase === "work") {
            commit();
            setSessions((s) => s + 1);
            setPhase("rest");
            if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Edgework", { body: "Work block done. Take the break." });
          } else {
            setPhase("work");
          }
          return 0;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(t);
  }, [running, phase, target, commit]);

  const startWork = () => {
    setPhase("work");
    setElapsed(0);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
    commit();
    setPhase("idle");
    setElapsed(0);
  };

  const week = useMemo(() => {
    const today = todayString();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6);
      const minutes = data.studyLog.filter((e) => todayString(new Date(e.startedAt)) === date).reduce((s, e) => s + e.minutes, 0);
      return { date, label: formatDate(date, { weekday: "short" }), minutes };
    });
  }, [data.studyLog]);
  const byModule = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of data.studyLog) {
      const k = e.module ? `M${e.module}` : "General";
      m.set(k, (m.get(k) ?? 0) + e.minutes);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.studyLog]);
  const total = data.studyLog.reduce((s, e) => s + e.minutes, 0);

  return (
    <div>
      <PageHeader eyebrow="Study log" title="Study timer" description="Pomodoro-style blocks logged by module toward the twenty-hour goal. Practice sessions and mocks log themselves automatically while the timer is stopped, so run the timer for lessons, reading and notes." />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardBody className="flex flex-col items-center pt-6">
            <div className="mb-3 inline-flex rounded-lg bg-surface-2 p-0.5 text-xs">
              {PRESETS.map((p, i) => (
                <button key={p.label} onClick={() => setPreset(i)} disabled={running} className={clsx("rounded-md px-3 py-1.5 font-mono", preset === i ? "bg-surface text-fg" : "text-muted")} aria-pressed={preset === i}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className={clsx("font-mono text-6xl font-semibold tabular", phase === "rest" ? "text-success" : "text-fg")} aria-live="off">
              {formatDuration(Math.max(0, target - elapsed))}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-faint">{phase === "idle" ? "ready" : phase === "work" ? "focus" : "break"}</div>
            <ProgressBar value={elapsed} max={target} size="sm" className="mt-4" tone={phase === "rest" ? "success" : "accent"} />
            <div className="mt-5 w-full">
              <Field label="Logging to">
                <Select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                  <option value="">General study</option>
                  {MODULE_META.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}. {m.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              {phase === "idle" ? (
                <Button onClick={startWork} leftIcon={<Play size={16} />} size="lg">
                  Start block
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setRunning((r) => !r)} leftIcon={running ? <Pause size={16} /> : <Play size={16} />}>
                    {running ? "Pause" : "Resume"}
                  </Button>
                  <Button variant="danger" onClick={stop} leftIcon={<Square size={16} />}>
                    Stop and log
                  </Button>
                </>
              )}
            </div>
            <div className="mt-3 text-xs text-muted">{sessions} block{sessions === 1 ? "" : "s"} completed this visit</div>
            <button
              className="mt-2 text-xs text-faint hover:text-fg"
              onClick={() => {
                if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
              }}
            >
              Enable a browser notification when a block ends
            </button>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="This week" subtitle={`${formatMinutes(week.reduce((s, d) => s + d.minutes, 0))} in the last seven days`} action={<Hourglass size={18} className="text-faint" />} />
            <CardBody>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={week} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--elev)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v} min`, "studied"]} cursor={{ fill: "var(--surface-2)" }} />
                    <Bar dataKey="minutes" fill="var(--accent-fill)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="By module" />
              <CardBody>
                <Stat label="Total" value={formatMinutes(total)} hint={`of ${data.settings.hoursGoal}h goal`} className="mb-3" />
                {byModule.length === 0 ? (
                  <p className="text-sm text-faint">Nothing logged yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {byModule.map(([k, m]) => (
                      <li key={k} className="flex items-center gap-3 text-sm">
                        <span className="w-16 text-muted">{k}</span>
                        <ProgressBar value={m} max={Math.max(...byModule.map((x) => x[1]))} size="xs" className="flex-1" />
                        <span className="w-14 text-right font-mono text-xs tabular text-fg">{formatMinutes(m)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Log time manually" subtitle="Reading a chapter, the official sample test, a whiteboard session with a friend." />
              <CardBody className="flex items-end gap-2">
                <Field label="Minutes" className="flex-1">
                  <Input type="number" min={1} max={600} value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} />
                </Field>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const m = Number(manualMinutes);
                    if (m > 0) logStudy({ module: moduleId ? (Number(moduleId) as 1) : null, minutes: m, startedAt: Date.now() - m * 60_000, source: "timer", label: "manual" });
                  }}
                >
                  Log
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
