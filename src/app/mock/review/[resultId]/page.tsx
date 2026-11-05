"use client";

import { useParams } from "next/navigation";
import { MockReview } from "@/components/mock/MockReview";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";

export default function MockReviewPage() {
  const params = useParams<{ resultId: string }>();
  const results = useStore((s) => s.mockResults);
  const result = results.find((r) => r.id === params.resultId);
  if (!result) {
    return <EmptyState title="Result not found" description="It may have been removed or belongs to another device." action={<Button href="/mock">All mocks</Button>} />;
  }
  const history = results.filter((r) => r.id !== result.id && r.kind === result.kind).map((r) => r.score);
  return <MockReview result={result} slots={result.questions.map((q) => ({ kind: q.isCoding ? "coding" : "math", problemId: q.problemId }))} history={history} />;
}
