"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useStore, type SessionConfig } from "@/lib/store";

/** Starts a session (stores the config) and navigates to /session. */
export function StartSessionButton({
  config,
  children,
  ...rest
}: { config: Omit<SessionConfig, "id"> | (() => Omit<SessionConfig, "id"> | null); children: ReactNode } & Omit<ButtonProps, "onClick" | "href">) {
  const router = useRouter();
  const startSession = useStore((s) => s.startSession);
  return (
    <Button
      {...rest}
      onClick={() => {
        const cfg = typeof config === "function" ? config() : config;
        if (!cfg || cfg.problemIds.length === 0) return;
        startSession(cfg);
        router.push("/session");
      }}
    >
      {children}
    </Button>
  );
}

export function useStartSession() {
  const router = useRouter();
  const startSession = useStore((s) => s.startSession);
  return (cfg: Omit<SessionConfig, "id">) => {
    if (cfg.problemIds.length === 0) return;
    startSession(cfg);
    router.push("/session");
  };
}
