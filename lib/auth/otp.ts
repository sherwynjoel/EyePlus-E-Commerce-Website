import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { notify } from "@/lib/sms/notification-service";
import type { OtpPurpose } from "@/lib/generated/prisma/client";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export class OtpRateLimitError extends Error {}
export class OtpInvalidError extends Error {}
export class OtpExpiredError extends Error {}

export async function requestOtp(phone: string, purpose: OtpPurpose): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpChallenge.count({
    where: { phone, purpose, createdAt: { gte: oneHourAgo } },
  });

  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    throw new OtpRateLimitError("Too many OTP requests. Please try again later.");
  }

  const code = generateCode();

  await prisma.otpChallenge.create({
    data: {
      phone,
      purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await notify(phone, "OTP_LOGIN", { code });
}

export async function verifyOtp(phone: string, purpose: OtpPurpose, code: string): Promise<void> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    throw new OtpInvalidError("No pending OTP request found for this phone number.");
  }

  if (challenge.expiresAt < new Date()) {
    throw new OtpExpiredError("This OTP has expired. Please request a new one.");
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw new OtpInvalidError("Too many incorrect attempts. Please request a new OTP.");
  }

  if (challenge.codeHash !== hashCode(code)) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    throw new OtpInvalidError("Incorrect OTP.");
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
}
