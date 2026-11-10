"use client";

import { Download, Monitor, Moon, Sun, Trash2, Upload, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useSync } from "@/lib/sync";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Toggle } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);
  const resetAll = useStore((s) => s.resetAll);
  const attempts = useStore((s) => s.attempts.length);
  const accountEmail = useSync((s) => s.email);
  const accountsAvailable = useSync((s) => s.status !== "unavailable");
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edgework-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exported. Keep the file somewhere safe; import it on any device.");
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const r = importJSON(text);
    setMessage(r.ok ? "Progress imported." : `Import failed: ${r.error}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Settings" title="Make it yours" description={accountEmail ? "Progress is stored in this browser and synced to your account." : "Everything is stored in this browser. Sign in from the Account page to sync it across devices, or export a file."} />

      <div className="space-y-5">
        <Card>
          <CardHeader title="Appearance" />
          <CardBody className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-medium">Theme</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["dark", "Dark", Moon],
                    ["light", "Light", Sun],
                    ["system", "System", Monitor],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    onClick={() => update({ theme: value })}
                    className={clsx(
                      "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                      settings.theme === value ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg",
                    )}
                    aria-pressed={settings.theme === value}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Font size">
              <Select value={settings.fontSize} onChange={(e) => update({ fontSize: e.target.value as "sm" | "md" | "lg" })}>
                <option value="sm">Compact</option>
                <option value="md">Default</option>
                <option value="lg">Large</option>
              </Select>
            </Field>
            <Field label="Motion" hint="Reduce animations regardless of the operating-system setting.">
              <Select value={settings.reducedMotion} onChange={(e) => update({ reducedMotion: e.target.value as "system" | "reduce" | "allow" })}>
                <option value="system">Follow system</option>
                <option value="reduce">Reduce motion</option>
                <option value="allow">Allow motion</option>
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Study plan" />
          <CardBody className="grid gap-4 md:grid-cols-2">
            <Field label="Test date" hint="Default is November 13; the official deadline is November 16.">
              <Input type="date" value={settings.testDate} onChange={(e) => update({ testDate: e.target.value })} />
            </Field>
            <Field label="Your name (optional)">
              <Input value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="Shown on the dashboard" />
            </Field>
            <Field label="Total hours goal" hint="The planner spreads this across the days before the test.">
              <Input type="number" min={5} max={60} value={settings.hoursGoal} onChange={(e) => update({ hoursGoal: Math.max(5, Number(e.target.value) || 20) })} />
            </Field>
            <Field label="Daily goal (minutes)" hint="Used for the daily progress on the dashboard.">
              <Input type="number" min={15} max={600} step={15} value={settings.dailyGoalMinutes} onChange={(e) => update({ dailyGoalMinutes: Math.max(15, Number(e.target.value) || 150) })} />
            </Field>
            <Field label="Fixed hours per day (optional)" hint="Leave blank to spread the total evenly. Set it and the planner tells you if the work no longer fits.">
              <Input
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={settings.hoursPerDay ?? ""}
                placeholder="auto"
                onChange={(e) => update({ hoursPerDay: e.target.value === "" ? null : Math.max(0.5, Number(e.target.value)) })}
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Voice" subtitle="Both are off by default." />
          <CardBody className="divide-y divide-border">
            <Toggle
              checked={settings.readAloud}
              onChange={(v) => update({ readAloud: v })}
              label="Read problems aloud"
              description="Uses your browser's built-in speech synthesis. Nothing leaves your device."
            />
            <Toggle
              checked={settings.voiceEnabled}
              onChange={(v) => update({ voiceEnabled: v })}
              label="Dictation in Speak-It-Out and the interview simulator"
              description={
                speechSupported
                  ? "Uses the browser's SpeechRecognition API. In Chrome and Edge the audio is sent to Google's or Microsoft's speech service for transcription; Safari processes on-device where available. Typing is always available as a fallback."
                  : "Your browser does not expose SpeechRecognition; you can still type your explanations. Chrome, Edge and Safari support dictation."
              }
              disabled={!speechSupported}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Your data" subtitle={`${attempts} attempts stored locally in IndexedDB (with a localStorage fallback)${accountEmail ? `, synced to ${accountEmail}` : ""}.`} />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={doExport} leftIcon={<Download size={16} />}>
                Export progress
              </Button>
              <Button variant="secondary" onClick={() => fileRef.current?.click()} leftIcon={<Upload size={16} />}>
                Import progress
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void doImport(f);
                  e.target.value = "";
                }}
              />
              {accountsAvailable && (
                <Button variant="secondary" href="/account" leftIcon={<UserRound size={16} />}>
                  {accountEmail ? "Account and sync" : "Sign in to sync"}
                </Button>
              )}
              <Button variant="danger" onClick={() => setConfirmReset(true)} leftIcon={<Trash2 size={16} />}>
                Reset everything
              </Button>
            </div>
            {message && (
              <p className="mt-3 text-sm text-muted" role="status">
                {message}
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all progress?" size="sm">
        <p className="text-sm text-muted">This deletes every attempt, note, mock result and setting on this device{accountEmail ? ", and the reset then syncs to your account, so it is erased there too" : ""}. Export first if there is any chance you want it back.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>
            Keep my data
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetAll();
              setConfirmReset(false);
              setMessage("Everything was reset.");
            }}
          >
            Reset
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
