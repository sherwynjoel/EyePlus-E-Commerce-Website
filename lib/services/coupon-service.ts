import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/rbac";
import type { CouponType } from "@/lib/generated/prisma/client";

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
  perUserLimit?: number;
  active: boolean;
}

export async function getCouponById(id: string) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.coupon.findUnique({ where: { id } });
}

export async function createCoupon(input: CouponInput) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      maxDiscount: input.maxDiscount,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      usageLimit: input.usageLimit,
      perUserLimit: input.perUserLimit,
      active: input.active,
    },
  });
}

export async function updateCoupon(id: string, input: CouponInput) {
  await requireRole(["ADMIN", "STAFF"]);
  return prisma.coupon.update({
    where: { id },
    data: {
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      maxDiscount: input.maxDiscount,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      usageLimit: input.usageLimit,
      perUserLimit: input.perUserLimit,
      active: input.active,
    },
  });
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountAmount?: number;
}

export async function validateAndComputeCoupon(
  code: string,
  userId: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.active) return { valid: false, reason: "Coupon not found." };
  if (coupon.startsAt && coupon.startsAt > new Date()) return { valid: false, reason: "Coupon is not active yet." };
  if (coupon.endsAt && coupon.endsAt < new Date()) return { valid: false, reason: "Coupon has expired." };
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return { valid: false, reason: `Minimum order value is ${coupon.minOrderValue}.` };
  }

  if (coupon.usageLimit) {
    const totalRedemptions = await prisma.couponRedemption.count({ where: { couponId: coupon.id } });
    if (totalRedemptions >= coupon.usageLimit) return { valid: false, reason: "Coupon usage limit reached." };
  }

  if (coupon.perUserLimit) {
    const userRedemptions = await prisma.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (userRedemptions >= coupon.perUserLimit) return { valid: false, reason: "You've already used this coupon." };
  }

  let discountAmount =
    coupon.type === "PERCENT" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);

  if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
  discountAmount = Math.min(discountAmount, subtotal);

  return { valid: true, discountAmount: Math.round(discountAmount) };
}
