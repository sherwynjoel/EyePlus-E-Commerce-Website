"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { approveDealer, rejectDealer } from "@/lib/services/dealer-service";
import { transitionOrderStatus, assignDelivery } from "@/lib/services/order-service";
import { approveReturn, rejectReturn, markReturnRefunded } from "@/lib/services/return-service";
import { prisma } from "@/lib/db/client";
import { notify } from "@/lib/sms/notification-service";
import type { OrderStatus } from "@/lib/generated/prisma/client";

export async function approveDealerAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const dealerProfileId = String(formData.get("dealerProfileId") ?? "");

  const dealer = await approveDealer(dealerProfileId);
  const user = await prisma.user.findUnique({ where: { id: dealer.userId } });
  if (user) {
    await notify(user.phone, "DEALER_APPROVED", { dealerCode: dealer.dealerCode });
  }

  revalidatePath("/admin/dealers");
}

export async function rejectDealerAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const dealerProfileId = String(formData.get("dealerProfileId") ?? "");

  await rejectDealer(dealerProfileId);

  revalidatePath("/admin/dealers");
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "").trim();

  try {
    await transitionOrderStatus(orderId, status, note || undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update order status.";
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function assignDeliveryAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const orderId = String(formData.get("orderId") ?? "");
  const staffId = String(formData.get("staffId") ?? "");
  const courierName = String(formData.get("courierName") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "");

  await assignDelivery(orderId, { staffId, courierName, trackingNumber });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/delivery");
}

export async function approveReturnAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const returnRequestId = String(formData.get("returnRequestId") ?? "");
  const orderId = String(formData.get("orderId") ?? "");

  await approveReturn(returnRequestId);

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function rejectReturnAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const returnRequestId = String(formData.get("returnRequestId") ?? "");
  const orderId = String(formData.get("orderId") ?? "");

  await rejectReturn(returnRequestId);

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markReturnRefundedAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "STAFF"]);
  const returnRequestId = String(formData.get("returnRequestId") ?? "");
  const orderId = String(formData.get("orderId") ?? "");

  await markReturnRefunded(returnRequestId);

  revalidatePath(`/admin/orders/${orderId}`);
}
