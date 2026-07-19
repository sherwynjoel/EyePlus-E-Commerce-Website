import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export default function DealerReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <div className="mt-6">
        <EmptyState
          icon={BarChart3}
          title="Reports coming soon"
          description="Sales and order volume reports for your account will appear here."
        />
      </div>
    </div>
  );
}
