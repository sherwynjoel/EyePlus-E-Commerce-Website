"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/rbac";
import { applyAsDealer } from "@/lib/services/dealer-service";
import { createSession } from "@/lib/auth/session";

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
