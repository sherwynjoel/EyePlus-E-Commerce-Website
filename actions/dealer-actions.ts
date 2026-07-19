"use server";

import { redirect } from "next/navigation";
import { requireUser, requireRole } from "@/lib/auth/rbac";
import { applyAsDealer } from "@/lib/services/dealer-service";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { createOrderFromCart, confirmOrderPayment } from "@/lib/services/order-service";

export async function applyAsDealerAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const gstNumber = String(formData.get("gstNumber") ?? "").trim();

  if (!businessName) {
    redirect("/dealer-signup?error=missing_business_name");
  }

  await applyAsDealer(session.userId, { businessName, gstNumber: gstNumber || undefined });

  // Refresh the session cookie so its role reflects the new DEALER role immediately.
  await createSession({ userId: session.userId, role: "DEALER" });

  redirect("/dealer");
}

export async function placeDealerOrderAction(formData: FormData): Promise<void> {
  const session = await requireRole(["DEALER"]);
  const addressId = String(formData.get("addressId") ?? "");

  const dealerProfile = await prisma.dealerProfile.findUnique({ where: { userId: session.userId } });
  if (!dealerProfile || dealerProfile.approvalStatus !== "APPROVED") {
    redirect("/dealer");
  }

  let order;
  try {
    order = await createOrderFromCart(addressId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place order.";
    redirect(`/dealer/orders/new?error=${encodeURIComponent(message)}`);
  }

  // Dealer orders are placed on account terms — there's no online payment step.
  await confirmOrderPayment(order.id, {});

  redirect(`/account/orders/${order.id}`);
}
