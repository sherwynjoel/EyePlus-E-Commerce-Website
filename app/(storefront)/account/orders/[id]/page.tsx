import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderForCurrentUser } from "@/lib/services/order-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatInr } from "@/lib/utils/currency";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderForCurrentUser(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {order.placedAt.toLocaleDateString("en-IN")}
          </p>
        </div>
        <Badge variant="secondary">{STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const activeReturn = item.returnRequests.find((r) => r.status !== "REJECTED");
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productNameSnapshot}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatInr(item.lineTotal.toString())}</TableCell>
                    <TableCell className="text-right">
                      {activeReturn ? (
                        <Badge variant="secondary">{activeReturn.status}</Badge>
                      ) : order.status === "DELIVERED" ? (
                        <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/account/returns/${item.id}`} />}>
                          Request return
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end text-sm font-semibold">
            Total: {formatInr(order.grandTotal.toString())}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Order timeline</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {order.statusHistory.map((entry) => (
            <p key={entry.id}>
              {STATUS_LABELS[entry.status] ?? entry.status} — {entry.changedAt.toLocaleString("en-IN")}
            </p>
          ))}
          {order.deliveryAssignment?.trackingNumber ? (
            <p className="pt-2">
              Tracking: {order.deliveryAssignment.trackingNumber}
              {order.deliveryAssignment.courierName ? ` (${order.deliveryAssignment.courierName})` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
