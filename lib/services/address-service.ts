import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/rbac";

export async function listAddressesForCurrentUser() {
  const session = await requireUser();
  return prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export interface CreateAddressInput {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export async function createAddressForCurrentUser(input: CreateAddressInput) {
  const session = await requireUser();
  const existingCount = await prisma.address.count({ where: { userId: session.userId } });

  return prisma.address.create({
    data: {
      userId: session.userId,
      label: input.label,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      phone: input.phone,
      isDefault: existingCount === 0,
    },
  });
}

export async function getAddressForCurrentUser(addressId: string) {
  const session = await requireUser();
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.userId) return null;
  return address;
}
