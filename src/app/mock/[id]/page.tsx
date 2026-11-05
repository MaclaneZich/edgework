"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { PROBLEMS } from "@/content";
import { CODING_PROBLEMS } from "@/content/coding";
import { assembleMocks } from "@/lib/mocks";
import { MockRunner, type MockRunConfig } from "@/components/mock/MockRunner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/EmptyState";

function MockPageInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const config = useMemo<MockRunConfig | null>(() => {
    if (params.id === "drill") {
      const ids = (search.get("ids") ?? "").split(",").filter(Boolean);
      if (ids.length === 0) return null;
      return { id: "drill", title: "Pacing drill: 3 in 18", kind: "drill", problemIds: ids, codingId: null, minutes: 6 * ids.length, description: "Three test-level problems, six minutes each. The skip rule fires at four minutes." };
    }
    const mock = assembleMocks(PROBLEMS, CODING_PROBLEMS.map((c) => c.id)).find((m) => m.id === params.id);
    if (!mock) return null;
    return { id: mock.id, title: mock.title, kind: mock.kind, problemIds: mock.problemIds, codingId: mock.codingId, minutes: mock.minutes, description: mock.description };
  }, [params.id, search]);

  if (!config) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState title="Mock not found" description="Pick one from the list." action={<Button href="/mock">All mocks</Button>} />
      </div>
    );
  }
  return <MockRunner key={config.id} config={config} />;
}

export default function MockPage() {
  return (
    <Suspense fallback={<div className="p-8"><PageSkeleton /></div>}>
      <MockPageInner />
    </Suspense>
  );
}
