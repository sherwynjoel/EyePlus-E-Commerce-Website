import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { formatInr } from "@/lib/utils/currency";
import { Package } from "lucide-react";

export default async function OrderHistoryPage() {
  const session = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { placedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Order history</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Orders you place will show up here with live status tracking."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 rounded-lg border border-border/60">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-4 py-4 text-sm">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-muted-foreground">{order.status}</p>
              </div>
              <p className="font-medium">{formatInr(order.grandTotal.toString())}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
