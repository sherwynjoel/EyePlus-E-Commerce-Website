import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getOrderForAdmin, getValidNextStatuses } from "@/lib/services/order-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatInr } from "@/lib/utils/currency";
import {
  updateOrderStatusAction,
  assignDeliveryAction,
  approveReturnAction,
  rejectReturnAction,
  markReturnRefundedAction,
} from "@/actions/admin-actions";

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

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const staff = await prisma.user.findMany({ where: { role: "STAFF" }, orderBy: { name: "asc" } });
  const nextStatuses = getValidNextStatuses(order.status);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{order.user.phone}</p>
        </div>
        <Badge variant="secondary">{STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productNameSnapshot}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatInr(item.unitPrice.toString())}</TableCell>
                  <TableCell className="text-right">{formatInr(item.lineTotal.toString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end text-sm font-semibold">
            Total: {formatInr(order.grandTotal.toString())}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Status:</span> {order.payment?.status}</p>
            <p><span className="text-muted-foreground">Method:</span> {order.payment?.method ?? "—"}</p>
            <p><span className="text-muted-foreground">Razorpay order:</span> {order.payment?.razorpayOrderId ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Shipping address</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {order.shippingAddress ? (
              <p className="text-muted-foreground">
                {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Update status</CardTitle></CardHeader>
        <CardContent>
          {nextStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No further status transitions available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <form key={status} action={updateOrderStatusAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="status" value={status} />
                  <Button type="submit" variant={status === "CANCELLED" ? "outline" : "default"} size="sm">
                    Mark as {STATUS_LABELS[status]}
                  </Button>
                </form>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium">Status history</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {order.statusHistory.map((entry) => (
                <p key={entry.id}>
                  {STATUS_LABELS[entry.status] ?? entry.status} — {entry.changedAt.toLocaleString("en-IN")}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Delivery assignment</CardTitle></CardHeader>
        <CardContent>
          {order.deliveryAssignment ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Currently assigned to {order.deliveryAssignment.staff?.name ?? order.deliveryAssignment.staff?.phone ?? "unassigned"}
              {order.deliveryAssignment.trackingNumber ? ` · Tracking: ${order.deliveryAssignment.trackingNumber}` : ""}
            </p>
          ) : null}
          <form action={assignDeliveryAction} className="grid gap-4 sm:grid-cols-3">
            <input type="hidden" name="orderId" value={order.id} />
            <div className="space-y-2">
              <Label htmlFor="staffId">Assign to staff</Label>
              <select
                id="staffId"
                name="staffId"
                key={order.deliveryAssignment?.staffId ?? "unassigned"}
                defaultValue={order.deliveryAssignment?.staffId ?? ""}
                className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name ?? s.phone}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courierName">Courier</Label>
              <Input id="courierName" name="courierName" defaultValue={order.deliveryAssignment?.courierName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking number</Label>
              <Input id="trackingNumber" name="trackingNumber" defaultValue={order.deliveryAssignment?.trackingNumber ?? ""} />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">Save assignment</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {order.items.some((item) => item.returnRequests.length > 0) ? (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Return requests</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {order.items.flatMap((item) =>
              item.returnRequests.map((rr) => (
                <div key={rr.id} className="flex items-center justify-between rounded-md border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productNameSnapshot}</p>
                    <p className="text-muted-foreground">{rr.reason}</p>
                    <Badge variant="secondary" className="mt-1">{rr.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {rr.status === "REQUESTED" ? (
                      <>
                        <form action={approveReturnAction}>
                          <input type="hidden" name="returnRequestId" value={rr.id} />
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button size="sm" type="submit">Approve</Button>
                        </form>
                        <form action={rejectReturnAction}>
                          <input type="hidden" name="returnRequestId" value={rr.id} />
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button size="sm" variant="outline" type="submit">Reject</Button>
                        </form>
                      </>
                    ) : null}
                    {rr.status === "APPROVED" ? (
                      <form action={markReturnRefundedAction}>
                        <input type="hidden" name="returnRequestId" value={rr.id} />
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button size="sm" type="submit">Mark refunded</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              )),
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
