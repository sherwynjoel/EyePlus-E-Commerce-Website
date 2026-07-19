"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/rbac";
import { addToCart, removeCartItem, updateCartItemQuantity } from "@/lib/services/cart-service";
import { createAddressForCurrentUser } from "@/lib/services/address-service";
import { createOrderFromCart, confirmOrderPayment, getOrderForCurrentUser } from "@/lib/services/order-service";
import { createRazorpayOrder, verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/payments/razorpay";

export async function addToCartAction(formData: FormData): Promise<void> {
  const session = await requireUser().catch(() => null);
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (!session) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectTo || "/cart")}`);
  }

  await addToCart(variantId, quantity);
  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartItemAction(formData: FormData): Promise<void> {
  const cartItemId = String(formData.get("cartItemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  await updateCartItemQuantity(cartItemId, quantity);
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  const cartItemId = String(formData.get("cartItemId") ?? "");
  await removeCartItem(cartItemId);
  revalidatePath("/cart");
}

export async function toggleWishlistAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const variantId = String(formData.get("variantId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");

  const existing = await prisma.wishlist.findUnique({
    where: { userId_variantId: { userId: session.userId, variantId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({ data: { userId: session.userId, variantId } });
  }

  if (redirectTo) revalidatePath(redirectTo);
  revalidatePath("/account/wishlist");
}

export async function addAddressAction(formData: FormData): Promise<void> {
  await requireUser();

  const label = String(formData.get("label") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const line2 = String(formData.get("line2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/account/addresses");

  if (!line1 || !city || !state || !pincode || !phone) {
    redirect(`${redirectTo}?error=missing_fields`);
  }

  await createAddressForCurrentUser({
    label: label || undefined,
    line1,
    line2: line2 || undefined,
    city,
    state,
    pincode,
    phone,
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect(redirectTo);
}

export async function placeOrderAction(formData: FormData): Promise<void> {
  await requireUser();
  const addressId = String(formData.get("addressId") ?? "");

  let order;
  try {
    order = await createOrderFromCart(addressId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place order.";
    redirect(`/checkout?error=${encodeURIComponent(message)}`);
  }

  const amountPaise = Math.round(Number(order.grandTotal) * 100);
  const razorpayOrder = await createRazorpayOrder(amountPaise, order.orderNumber);

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  redirect(`/checkout/pay/${order.id}`);
}

export async function confirmPaymentAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const razorpayOrderId = String(formData.get("razorpay_order_id") ?? "");
  const razorpayPaymentId = String(formData.get("razorpay_payment_id") ?? "");
  const razorpaySignature = String(formData.get("razorpay_signature") ?? "");
  const isMock = formData.get("mock") === "true";

  const order = await getOrderForCurrentUser(orderId);
  if (!order) {
    redirect("/checkout?error=Order not found.");
  }

  if (isRazorpayConfigured()) {
    const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      redirect(`/checkout/pay/${orderId}?error=payment_verification_failed`);
    }
  } else if (!isMock) {
    redirect(`/checkout/pay/${orderId}?error=payment_verification_failed`);
  }

  await confirmOrderPayment(orderId, {
    razorpayOrderId: razorpayOrderId || undefined,
    razorpayPaymentId: razorpayPaymentId || (isMock ? `mock_payment_${orderId}` : undefined),
    razorpaySignature: razorpaySignature || undefined,
    method: isMock ? undefined : "CARD",
  });

  redirect(`/checkout/success?orderId=${orderId}`);
}
