import { createHmac } from "node:crypto";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayPublicKey(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}

/**
 * Creates a Razorpay order. Falls back to a mock order (no network call) when
 * RAZORPAY_KEY_ID/SECRET aren't configured yet, so the checkout flow can be
 * exercised end-to-end before real gateway credentials exist.
 */
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
  if (!isRazorpayConfigured()) {
    return { id: `mock_order_${receipt}`, amount: amountPaise, currency: "INR" };
  }

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Verifies the signature Razorpay Checkout returns on successful payment.
 * In mock mode (no keys configured) this always returns true, since there is
 * no real gateway signature to check.
 */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!isRazorpayConfigured()) return true;

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}
