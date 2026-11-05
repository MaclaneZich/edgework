import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export function ComingSoon({ title, description, stage }: { title: string; description: string; stage: "B" | "C" }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={<Hourglass size={22} />}
        title={`Arrives in build stage ${stage}`}
        description="The app ships in stages so you can start studying immediately. Modules 1-4, practice, mental math and the test simulator are ready now."
        action={<Button href="/modules">Go to modules</Button>}
      />
    </div>
  );
}
