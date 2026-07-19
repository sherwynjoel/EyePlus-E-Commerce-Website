import { prisma } from "@/lib/db/client";

function generateDealerCode(): string {
  return `DLR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function applyAsDealer(userId: string, input: { businessName: string; gstNumber?: string }) {
  const existing = await prisma.dealerProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const dealerProfile = await tx.dealerProfile.create({
      data: {
        userId,
        businessName: input.businessName,
        gstNumber: input.gstNumber,
        dealerCode: generateDealerCode(),
      },
    });
    await tx.user.update({ where: { id: userId }, data: { role: "DEALER" } });
    return dealerProfile;
  });
}

export async function approveDealer(dealerProfileId: string) {
  return prisma.dealerProfile.update({
    where: { id: dealerProfileId },
    data: { approvalStatus: "APPROVED" },
  });
}

export async function rejectDealer(dealerProfileId: string) {
  return prisma.dealerProfile.update({
    where: { id: dealerProfileId },
    data: { approvalStatus: "REJECTED" },
  });
}
