"use client";

import clsx from "clsx";
import { CloudCheck, LogOut, RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { syncLabel } from "@/components/SyncHost";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStore } from "@/lib/store";
import { authenticate, signOut, syncNow, useSync } from "@/lib/sync";

type Mode = "login" | "signup";

function SignInCard() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notice = useSync((s) => s.error);
  const attempts = useStore((s) => s.attempts.length);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && password.length < 8) return setError("Use a password of at least 8 characters.");
    if (mode === "signup" && password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const result = await authenticate(mode, email, password);
    setBusy(false);
    if (!result.ok) setError(result.error ?? "Something went wrong. Try again.");
    else {
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <Card>
      <CardHeader
        title={mode === "signup" ? "Create an account" : "Sign in"}
        subtitle={
          mode === "signup"
            ? attempts > 0
              ? "The progress already on this device is saved to your new account."
              : "Your progress will follow you to any device you sign in on."
            : "Signing in brings your saved progress to this device."
        }
      />
      <CardBody>
        <div className="mb-5 grid grid-cols-2 gap-2" role="tablist" aria-label="Account action">
          {(
            [
              ["signup", "Create account"],
              ["login", "Sign in"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => {
                setMode(value);
                setError(null);
              }}
              className={clsx(
                "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                mode === value ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <Input type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password" hint={mode === "signup" ? "At least 8 characters. There is no password reset, so store it in a password manager." : undefined}>
            <Input
              type="password"
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={mode === "signup" ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {mode === "signup" && (
            <Field label="Confirm password">
              <Input type="password" name="confirm" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
          )}
          {(error || notice) && (
            <p className="text-sm text-danger" role="alert">
              {error ?? notice}
            </p>
          )}
          <Button type="submit" loading={busy} className="w-full">
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function SignedInCard({ email }: { email: string }) {
  const status = useSync((s) => s.status);
  const lastSyncedAt = useSync((s) => s.lastSyncedAt);
  const error = useSync((s) => s.error);
  const attempts = useStore((s) => s.attempts.length);
  const [busy, setBusy] = useState<"sync" | "out" | null>(null);

  return (
    <Card>
      <CardHeader title="Signed in" subtitle={email} action={<CloudCheck size={20} className={status === "synced" ? "text-success" : "text-faint"} aria-hidden />} />
      <CardBody>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Status</dt>
            <dd className="mt-1 font-medium text-fg" role="status">
              {syncLabel(status)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Last synced</dt>
            <dd className="mt-1 text-fg">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "Not yet"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Attempts on this device</dt>
            <dd className="mt-1 font-mono tabular text-fg">{attempts}</dd>
          </div>
        </dl>
        {error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            loading={busy === "sync"}
            disabled={busy !== null || status === "conflict"}
            leftIcon={<RefreshCw size={16} />}
            onClick={async () => {
              setBusy("sync");
              await syncNow();
              setBusy(null);
            }}
          >
            Sync now
          </Button>
          <Button
            variant="ghost"
            loading={busy === "out"}
            disabled={busy !== null}
            leftIcon={<LogOut size={16} />}
            onClick={async () => {
              setBusy("out");
              await signOut();
              setBusy(null);
            }}
          >
            Sign out
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Signing out stops syncing but leaves your progress in this browser. On a shared computer, use Settings, then Reset everything, after signing out.
        </p>
      </CardBody>
    </Card>
  );
}

export default function AccountPage() {
  const status = useSync((s) => s.status);
  const email = useSync((s) => s.email);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        eyebrow="Account"
        title="Take your progress anywhere"
        description="An account is optional. Without one, everything stays in this browser. With one, your progress is saved to your account and loads on any device you sign in on."
      />
      <div className="space-y-5">
        {status === "checking" && (
          <Card>
            <CardBody>
              <p className="pt-1 text-sm text-muted" role="status">
                Checking your account…
              </p>
            </CardBody>
          </Card>
        )}
        {status === "unavailable" && (
          <Card>
            <CardHeader title="Accounts are not available here" />
            <CardBody>
              <p className="text-sm leading-relaxed text-muted">
                This copy of Edgework has no account storage connected, so progress stays in this browser. Use Export and Import in Settings to move it between devices.
              </p>
            </CardBody>
          </Card>
        )}
        {status !== "checking" && status !== "unavailable" && (email ? <SignedInCard email={email} /> : <SignInCard />)}

        <Card>
          <CardHeader title="How syncing works" />
          <CardBody>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              <li>Progress saves to this browser first, then to your account a few seconds later, so the app keeps working offline.</li>
              <li>Opening Edgework on another device loads the latest saved copy after you sign in.</li>
              <li>If two devices both hold changes the other has not seen, Edgework asks which copy to keep instead of guessing.</li>
              <li>Study on one device at a time. Give it a few seconds to show Synced before switching.</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
