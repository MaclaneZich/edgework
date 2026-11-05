"use client";

import { Target } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MODULE_META } from "@/content";
import { TAGS, type ModuleId, type Tag } from "@/content/types";
import { brierScore, brierSeries, calibrationCurve, calibrationFlags, confidenceIndex } from "@/lib/calibration";
import { allModuleStats, calibrationAttempts } from "@/lib/derived";
import { useData } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

const tooltipStyle = { backgroundColor: "var(--elev)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--fg)", fontSize: 12 };

export default function CalibrationPage() {
  const data = useData();
  const attempts = useMemo(() => calibrationAttempts(data), [data]);
  const curve = useMemo(() => calibrationCurve(attempts), [attempts]);
  const series = useMemo(() => brierSeries(attempts, 20), [attempts]);
  const flags = useMemo(() => calibrationFlags(attempts, "tag", 5), [attempts]);
  const brier = brierScore(attempts);
  const index = confidenceIndex(attempts);
  const stats = useMemo(() => allModuleStats(data), [data]);

  if (attempts.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Calibration" title="Know what you know" description="Every problem asks how sure you are before it grades you. This page shows whether your confidence matches reality." />
        <EmptyState icon={<Target size={22} />} title="No attempts yet" description="Solve a few problems and the calibration curve, Brier score and confidence flags appear here." action={<Button href="/modules">Start practising</Button>} />
      </div>
    );
  }

  const curveData = curve.map((c) => ({ confidence: Math.round(c.confidence * 100), accuracy: c.n ? Math.round(c.accuracy * 100) : null, n: c.n }));
  const seriesData = series.map((s) => ({ index: s.index, brier: Number(s.brier.toFixed(3)) }));

  return (
    <div>
      <PageHeader eyebrow="Calibration" title="Know what you know" description="Stated confidence versus actual accuracy. Perfect calibration sits on the diagonal: when you say 90%, you are right nine times in ten." />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <Stat label="Brier score" value={brier === null ? "–" : brier.toFixed(3)} hint="0 is perfect, 0.25 is coin-flip guessing" />
        </Card>
        <Card className="p-5">
          <Stat label="Confidence index" value={index === null ? "–" : index} hint="accuracy 50%, calibration 30%, speed 20%" />
        </Card>
        <Card className="p-5">
          <Stat label="Attempts" value={attempts.length} hint={`${attempts.filter((a) => a.correct).length} correct`} />
        </Card>
        <Card className="p-5">
          <Stat label="Mean confidence" value={`${Math.round((100 * attempts.reduce((s, a) => s + a.confidence, 0)) / attempts.length)}%`} hint={`accuracy ${Math.round((100 * attempts.filter((a) => a.correct).length) / attempts.length)}%`} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Calibration curve" subtitle="Accuracy at each stated confidence level. Points below the line are overconfidence." />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ top: 10, right: 16, bottom: 4, left: -12 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="confidence" type="number" domain={[45, 100]} ticks={[50, 70, 90, 99]} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "accuracy"]} labelFormatter={(l) => `Stated ${l}%`} />
                  <ReferenceLine segment={[{ x: 45, y: 45 }, { x: 100, y: 100 }]} stroke="var(--faint)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="accuracy" stroke="var(--accent-fill)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--accent-fill)", stroke: "var(--bg)" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {curve.map((c) => (
                <div key={c.confidence} className="rounded-lg bg-surface-2 px-2 py-1.5">
                  <div className="font-mono text-muted">{Math.round(c.confidence * 100)}%</div>
                  <div className="font-mono text-fg">{c.n ? `${Math.round(c.accuracy * 100)}%` : "–"}</div>
                  <div className="text-faint">n={c.n}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Brier score over time" subtitle="Rolling 20-attempt window. Lower is better; under 0.15 is well calibrated." />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesData} margin={{ top: 10, right: 16, bottom: 4, left: -12 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="index" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <YAxis domain={[0, 0.5]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `After ${l} attempts`} />
                  <ReferenceLine y={0.15} stroke="var(--success)" strokeDasharray="4 4" label={{ value: "0.15", fill: "var(--success)", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={0.25} stroke="var(--danger)" strokeDasharray="4 4" label={{ value: "0.25", fill: "var(--danger)", fontSize: 10, position: "right" }} />
                  <Line type="monotone" dataKey="brier" stroke="var(--info)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Flags" subtitle="Tags where confidence and accuracy disagree by 15 points or more (at least 5 attempts)." />
          <CardBody>
            {flags.length === 0 ? (
              <p className="text-sm text-muted">No flags. Either you are well calibrated or there is not enough data per tag yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {flags.map((f) => (
                  <li key={f.key} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-fg">{TAGS[f.key as Tag] ?? f.key}</div>
                      <div className="text-xs text-muted">
                        said {Math.round(f.meanConfidence * 100)}%, scored {Math.round(f.accuracy * 100)}% over {f.n}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={f.kind === "over" ? "danger" : "info"}>{f.kind === "over" ? "overconfident" : "underconfident"}</Badge>
                      <Button size="sm" variant="secondary" href={`/smart?tag=${f.key}`}>
                        Drill
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Confidence index by module" subtitle="Blends accuracy, calibration and speed for each module you have touched." />
          <CardBody>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.filter((s) => s.attempts > 0).map((s) => ({ name: `M${s.id}`, value: s.confidenceIndex ?? 0 }))} margin={{ top: 10, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} />
                  <Bar dataKey="value" fill="var(--accent-fill)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {stats
                .filter((s) => s.attempts > 0)
                .map((s) => (
                  <li key={s.id} className="flex items-center gap-3 text-xs">
                    <span className="w-28 truncate text-muted">{MODULE_META[(s.id as ModuleId) - 1].title}</span>
                    <ProgressBar value={s.confidenceIndex ?? 0} size="xs" className="flex-1" />
                    <span className="w-8 text-right font-mono tabular text-fg">{s.confidenceIndex ?? "–"}</span>
                  </li>
                ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
