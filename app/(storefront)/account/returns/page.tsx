import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { RotateCcw } from "lucide-react";

export default async function ReturnsPage() {
  const session = await requireUser();
  const returns = await prisma.returnRequest.findMany({
    where: { order: { userId: session.userId } },
    include: { orderItem: true },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Returns</h1>

      {returns.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={RotateCcw}
            title="No return requests"
            description="If something isn't right with an order, you can request a return from your order history."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 rounded-lg border border-border/60">
          {returns.map((r) => (
            <div key={r.id} className="px-4 py-4 text-sm">
              <p className="font-medium">{r.orderItem.productNameSnapshot}</p>
              <p className="text-muted-foreground">{r.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
