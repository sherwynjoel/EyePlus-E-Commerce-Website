import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getOrderForCurrentUser } from "@/lib/services/order-service";
import { getRazorpayPublicKey, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { CheckoutPayment } from "@/components/storefront/checkout-payment";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { orderId } = await params;
  const { error } = await searchParams;
  const order = await getOrderForCurrentUser(orderId);

  if (!order) redirect("/cart");
  if (order.status !== "PENDING") redirect(`/checkout/success?orderId=${orderId}`);
  if (!order.payment) redirect("/cart");

  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session!.userId } });

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      {error ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Payment could not be verified. Please try again.
        </p>
      ) : null}
      <CheckoutPayment
        orderId={order.id}
        orderNumber={order.orderNumber}
        amount={Number(order.grandTotal)}
        razorpayOrderId={order.payment.razorpayOrderId ?? ""}
        razorpayKeyId={getRazorpayPublicKey()}
        isConfigured={isRazorpayConfigured()}
        customerName={user?.name ?? undefined}
        customerPhone={user?.phone ?? ""}
      />
    </div>
  );
}
