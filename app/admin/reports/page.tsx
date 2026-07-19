import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <div className="mt-6">
        <EmptyState
          icon={BarChart3}
          title="Sales, revenue & inventory reports coming soon"
          description="This will surface aggregate reports computed from live order and inventory data."
        />
      </div>
    </div>
  );
}
