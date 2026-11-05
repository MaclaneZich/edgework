"use client";

import clsx from "clsx";
import { Brain, Flame, Mic, Shield, Sparkles, Target, Timer, TrendingUp, Trophy, Zap } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/Progress";

const ICONS = { sparkles: Sparkles, flame: Flame, target: Target, trophy: Trophy, brain: Brain, timer: Timer, mic: Mic, "trending-up": TrendingUp, shield: Shield, zap: Zap };

export default function AchievementsPage() {
  const unlocked = useStore((s) => s.achievements);
  const count = Object.keys(unlocked).length;
  return (
    <div>
      <PageHeader eyebrow="Milestones" title="Achievements" description="Quiet markers of progress. Nothing here is required; everything here is earned." />
      <ProgressBar value={count} max={ACHIEVEMENTS.length} className="mb-6" label={`${count} of ${ACHIEVEMENTS.length} unlocked`} showValue />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked[a.id];
          const Icon = ICONS[a.icon];
          return (
            <Card key={a.id} className={clsx("flex items-start gap-3 p-4", !at && "opacity-60")}>
              <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", at ? "bg-accent-soft text-accent" : "bg-surface-2 text-faint")}>
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="font-medium text-fg">{a.title}</div>
                <div className="text-xs text-muted">{a.description}</div>
                <div className="mt-1 text-[11px] text-faint">{at ? `Unlocked ${formatDate(at)}` : "Locked"}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
