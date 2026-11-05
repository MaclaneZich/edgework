"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-xl pt-10">
      <EmptyState
        icon={<TriangleAlert size={22} />}
        title="Something broke on this page"
        description={
          <>
            Your progress is safe; it is saved locally after every action. Try again, or go back to the dashboard.
            {error?.message && <span className="mt-2 block font-mono text-xs text-faint">{error.message}</span>}
          </>
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary" href="/">
              Dashboard
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        }
      />
    </div>
  );
}
