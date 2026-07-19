import { prisma } from "@/lib/db/client";

export interface ServiceabilityResult {
  serviceable: boolean;
  estimatedDays: number | null;
  codAvailable: boolean;
}

export async function checkPincodeServiceability(pincode: string): Promise<ServiceabilityResult> {
  const record = await prisma.pincodeServiceability.findUnique({ where: { pincode } });

  if (!record) {
    // Unknown pincodes are treated as non-serviceable until added to the serviceability table.
    return { serviceable: false, estimatedDays: null, codAvailable: false };
  }

  return {
    serviceable: record.serviceable,
    estimatedDays: record.serviceable ? record.estimatedDays : null,
    codAvailable: record.codAvailable,
  };
}
