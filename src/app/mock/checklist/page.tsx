"use client";

import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

const ITEMS: Array<{ id: string; label: string; note: string }> = [
  { id: "screensaver", label: "Screensaver and sleep timers off", note: "A locked screen looks like leaving the browser. Set display sleep to never for the next two hours." },
  { id: "notifications", label: "Notifications off, do-not-disturb on", note: "A pop-up that steals focus can count as switching windows. Silence the phone too." },
  { id: "tabs", label: "Only the test tab open", note: "Close every other tab, window and app. Nothing to be tempted by, nothing to crash." },
  { id: "camera", label: "Camera framing checked", note: "If the test is proctored, face and hands visible, good light in front of you, not behind." },
  { id: "room", label: "Quiet room, door closed", note: "Tell housemates the exact window. A knock mid-question costs a question." },
  { id: "paper", label: "Paper and two pens", note: "Scratch work on paper is faster than typing. Two pens because one will fail." },
  { id: "calculator", label: "Calculator ready", note: "A physical one if allowed; otherwise know the on-screen one. Practise C(n,k) on it beforehand." },
  { id: "charger", label: "Laptop plugged in, charger reachable", note: "Battery anxiety is a distraction you can delete." },
  { id: "internet", label: "Stable internet, phone hotspot as backup", note: "Test a video call first. Have the hotspot already paired so the switch takes seconds." },
  { id: "refresh", label: "Promise: no refresh, no back button", note: "Reloading can end the attempt. If something looks frozen, wait twenty seconds before doing anything." },
  { id: "water", label: "Water, bathroom, snack done", note: "Seventy-five minutes with no pause." },
  { id: "id", label: "ID and invite link at hand", note: "Log in ten minutes early. Read the instructions page slowly; the format details matter." },
  { id: "plan", label: "Pacing plan written on the paper", note: "Six minutes a question, skip rule at four, coding last with twelve minutes reserved (or first, if that is your choice)." },
];

export default function ChecklistPage() {
  const checklist = useStore((s) => s.checklist);
  const setChecklist = useStore((s) => s.setChecklist);
  const done = ITEMS.filter((i) => checklist[`check:${i.id}`]).length;
  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ href: "/mock", label: "Test simulator" }, { label: "Pre-test checklist" }]} />
      <PageHeader eyebrow="Before the real test" title="Pre-test checklist" description="Run this the evening before and again thirty minutes before you start. The checks persist, so reset them the day of." />
      <ProgressBar value={done} max={ITEMS.length} className="mb-6" label={`${done} of ${ITEMS.length} ready`} showValue />
      <Card className="divide-y divide-border">
        {ITEMS.map((item) => {
          const checked = Boolean(checklist[`check:${item.id}`]);
          return (
            <label key={item.id} className="flex cursor-pointer items-start gap-3 px-5 py-4 hover:bg-surface-2/40">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? "border-transparent bg-accent-fill text-accent-ink" : "border-border-strong"}`}>
                {checked && <Check size={14} />}
              </span>
              <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => setChecklist(`check:${item.id}`, e.target.checked)} />
              <span>
                <span className={`block text-sm font-medium ${checked ? "text-muted line-through" : "text-fg"}`}>{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.note}</span>
              </span>
            </label>
          );
        })}
      </Card>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => ITEMS.forEach((i) => setChecklist(`check:${i.id}`, false))}>
          Reset for test day
        </Button>
        <Button href="/mock">Back to mocks</Button>
      </div>
    </div>
  );
}
