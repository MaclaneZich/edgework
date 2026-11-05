"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SessionRunner } from "@/components/session/SessionRunner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";

export default function SessionPage() {
  const session = useStore((s) => s.session);
  const clearSession = useStore((s) => s.clearSession);
  const router = useRouter();
  const onExit = useCallback(() => {
    clearSession();
  }, [clearSession]);

  if (!session) {
    return (
      <EmptyState
        icon={<Sparkles size={22} />}
        title="No session in progress"
        description="Start a practice set from a module, build a Smart Session, or open the Redo Queue."
        action={
          <div className="flex gap-2">
            <Button href="/modules" variant="secondary">
              Browse modules
            </Button>
            <Button onClick={() => router.push("/smart")}>Smart Session</Button>
          </div>
        }
      />
    );
  }
  return <SessionRunner key={session.id} config={session} onExit={onExit} />;
}
