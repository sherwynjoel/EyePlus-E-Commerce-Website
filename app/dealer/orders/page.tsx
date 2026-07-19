import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/utils/currency";
import { ClipboardList } from "lucide-react";

export default async function DealerOrdersPage() {
  const session = await getSession();
  const dealerProfile = await prisma.dealerProfile.findUniqueOrThrow({ where: { userId: session!.userId } });
  const orders = await prisma.order.findMany({
    where: { dealerProfileId: dealerProfile.id },
    orderBy: { placedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No bulk orders yet"
            description="Orders placed from your dealer catalog will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 rounded-lg border border-border/60">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-4 text-sm transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <Badge variant="secondary" className="mt-1">{order.status}</Badge>
              </div>
              <p className="font-medium">{formatInr(order.grandTotal.toString())}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
