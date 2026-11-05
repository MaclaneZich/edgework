import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl pt-10">
      <EmptyState
        icon={<Compass size={22} />}
        title="This page does not exist"
        description="The probability of landing here by accident is small but nonzero. Head back to the dashboard."
        action={<Button href="/">Dashboard</Button>}
      />
    </div>
  );
}
