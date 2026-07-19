"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils/currency";
import { confirmPaymentAction } from "@/actions/storefront-actions";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: () => void): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; contact?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function CheckoutPayment({
  orderId,
  orderNumber,
  amount,
  razorpayOrderId,
  razorpayKeyId,
  isConfigured,
  customerName,
  customerPhone,
}: {
  orderId: string;
  orderNumber: string;
  amount: number;
  razorpayOrderId: string;
  razorpayKeyId: string | null;
  isConfigured: boolean;
  customerName?: string;
  customerPhone: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMockPayment() {
    setLoading(true);
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("mock", "true");
    await confirmPaymentAction(formData);
  }

  function handleRealPayment() {
    setLoading(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new window.Razorpay({
        key: razorpayKeyId!,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "EyePlus",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: { name: customerName, contact: customerPhone },
        handler: async (response) => {
          const formData = new FormData();
          formData.set("orderId", orderId);
          formData.set("razorpay_order_id", response.razorpay_order_id);
          formData.set("razorpay_payment_id", response.razorpay_payment_id);
          formData.set("razorpay_signature", response.razorpay_signature);
          await confirmPaymentAction(formData);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    };
    document.body.appendChild(script);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete payment</CardTitle>
        <CardDescription>Order {orderNumber}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-2xl font-semibold">{formatInr(amount)}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {isConfigured ? (
          <Button className="w-full" size="lg" onClick={handleRealPayment} disabled={loading}>
            {loading ? "Opening payment…" : `Pay ${formatInr(amount)}`}
          </Button>
        ) : (
          <>
            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Test mode — Razorpay keys aren&apos;t configured yet, so this simulates a successful payment
              instead of charging a real card. Add RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to switch to real payments.
            </p>
            <Button className="w-full" size="lg" onClick={handleMockPayment} disabled={loading}>
              {loading ? "Confirming…" : "Simulate successful payment"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
