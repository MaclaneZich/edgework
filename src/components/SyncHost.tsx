"use client";

import { Cloud, CloudCheck, CloudOff, Download, RefreshCw, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { formatHours } from "@/lib/format";
import { selectData, useStore, type EdgeworkData } from "@/lib/store";
import { resolveConflict, startSync, useSync, type SyncStatus } from "@/lib/sync";
import { summarize } from "@/lib/syncLogic";

export function syncLabel(status: SyncStatus): string {
  switch (status) {
    case "checking":
      return "Checking account";
    case "unavailable":
      return "Saved on this device";
    case "signed-out":
      return "Sign in to sync";
    case "syncing":
      return "Syncing";
    case "pending":
      return "Saving soon";
    case "synced":
      return "Synced";
    case "offline":
      return "Not synced yet";
    case "conflict":
      return "Choose a copy";
  }
}

/** Small account and sync indicator for the sidebar. Links to the account page. */
export function SyncBadge({ onNavigate }: { onNavigate?: () => void }) {
  const status = useSync((s) => s.status);
  const email = useSync((s) => s.email);
  if (status === "unavailable" || status === "checking") return null;
  const Icon = !email ? UserRound : status === "synced" ? CloudCheck : status === "offline" || status === "conflict" ? CloudOff : status === "syncing" ? RefreshCw : Cloud;
  return (
    <Link
      href="/account"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-[12.5px] text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label={email ? "Account: " + syncLabel(status) : "Sign in to sync your progress"}
    >
      <Icon size={15} className={status === "synced" ? "text-success" : status === "offline" || status === "conflict" ? "text-danger" : "text-faint"} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-fg">{email ?? "Sign in to sync"}</span>
        {email && <span className="block truncate text-[11px] text-muted">{syncLabel(status)}</span>}
      </span>
    </Link>
  );
}

function CopySummary({ title, data, note }: { title: string; data: EdgeworkData; note: string }) {
  const s = summarize(data);
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <div className="text-sm font-semibold text-fg">{title}</div>
      <div className="mt-0.5 text-xs text-muted">{note}</div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Problems attempted</dt>
          <dd className="font-mono tabular text-fg">{s.attempts}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Time studied</dt>
          <dd className="font-mono tabular text-fg">{formatHours(s.studyMinutes)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Lessons finished</dt>
          <dd className="font-mono tabular text-fg">{s.lessons}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Mock tests</dt>
          <dd className="font-mono tabular text-fg">{s.mocks}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Last activity</dt>
          <dd className="text-fg">{s.lastActivity ? new Date(s.lastActivity).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "None"}</dd>
        </div>
      </dl>
    </div>
  );
}

function ConflictDialog() {
  const conflict = useSync((s) => s.conflict);
  const exportJSON = useStore((s) => s.exportJSON);
  const [working, setWorking] = useState<"device" | "account" | null>(null);
  // Read the device copy only while the dialog is open, so it does not re-render the shell on every answer.
  const local = conflict ? selectData(useStore.getState()) : null;

  const choose = async (keep: "device" | "account") => {
    setWorking(keep);
    try {
      await resolveConflict(keep);
    } finally {
      setWorking(null);
    }
  };

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edgework-this-device-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={Boolean(conflict)} onClose={() => undefined} dismissible={false} title="Two copies of your progress" size="lg">
      {conflict && local && (
        <>
          <p className="text-sm leading-relaxed text-muted">
            This device and your account hold different progress, and Edgework will not guess which one you want. Pick the copy to keep. The other one is replaced
            on both this device and your account.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CopySummary title="This device" note="What is in this browser now" data={local} />
            <CopySummary title="Your account" note="Last saved from another device" data={conflict.remote} />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={download} leftIcon={<Download size={15} />}>
              Download this device&apos;s copy first
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void choose("account")} loading={working === "account"} disabled={working !== null}>
                Keep account copy
              </Button>
              <Button onClick={() => void choose("device")} loading={working === "device"} disabled={working !== null}>
                Keep this device
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}

/** Starts account sync once local progress has really loaded, and hosts the conflict prompt. */
export function SyncHost() {
  useEffect(() => {
    // Wait for the real load from storage, not the shell's timeout fallback: syncing an
    // empty in-memory store over an account would be the one way to lose progress.
    if (useStore.persist.hasHydrated()) {
      startSync();
      return;
    }
    return useStore.persist.onFinishHydration(() => startSync());
  }, []);
  return <ConflictDialog />;
}
