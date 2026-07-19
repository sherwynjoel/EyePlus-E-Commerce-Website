import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/utils/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { placedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ClipboardList} title="No orders yet" description="Orders placed by customers and dealers will show up here." />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{order.user.phone}</TableCell>
                  <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                  <TableCell className="text-right">{formatInr(order.grandTotal.toString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
