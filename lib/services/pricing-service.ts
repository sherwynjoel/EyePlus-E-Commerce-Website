import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import type { PriceListCode } from "@/lib/generated/prisma/client";

export async function resolveViewerPriceListCode(): Promise<PriceListCode> {
  const session = await getSession();
  if (!session || session.role !== "DEALER") return "RETAIL";

  const dealerProfile = await prisma.dealerProfile.findUnique({ where: { userId: session.userId } });
  if (!dealerProfile || dealerProfile.approvalStatus !== "APPROVED") return "RETAIL";

  return `DEALER_${dealerProfile.tier}` as PriceListCode;
}
