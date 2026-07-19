import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderForCurrentUser } from "@/lib/services/order-service";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils/currency";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrderForCurrentUser(orderId) : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-500" strokeWidth={1.5} />
      <h1 className="text-2xl font-semibold tracking-tight">Order confirmed!</h1>
      {order ? (
        <>
          <p className="text-sm text-muted-foreground">
            Order <span className="font-medium text-foreground">{order.orderNumber}</span> for{" "}
            <span className="font-medium text-foreground">{formatInr(order.grandTotal.toString())}</span> has been placed.
          </p>
          {order.coupon ? (
            <p className="text-xs text-muted-foreground">
              Coupon <span className="font-medium">{order.coupon.code}</span> saved you{" "}
              {formatInr(order.discountTotal.toString())}.
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            A confirmation has been sent to your phone. You can track this order from your account.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Your order has been placed.</p>
      )}
      <div className="mt-2 flex gap-3">
        <Button nativeButton={false} render={<Link href="/account/orders" />}>View orders</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>Continue shopping</Button>
      </div>
    </div>
  );
}
