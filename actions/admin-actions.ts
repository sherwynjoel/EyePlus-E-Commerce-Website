"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { approveDealer, rejectDealer } from "@/lib/services/dealer-service";
import { prisma } from "@/lib/db/client";
import { notify } from "@/lib/sms/notification-service";

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
