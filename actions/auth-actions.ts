"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requestOtp, verifyOtp, OtpInvalidError, OtpExpiredError, OtpRateLimitError } from "@/lib/auth/otp";
import { createSession, destroySession } from "@/lib/auth/session";
import { normalizePhone, otpCodeSchema, phoneSchema } from "@/lib/validation/auth";

function roleHome(role: string): string {
  if (role === "ADMIN" || role === "STAFF") return "/admin";
  if (role === "DEALER") return "/dealer";
  return "/account";
}

export async function requestLoginOtpAction(formData: FormData): Promise<void> {
  const rawPhone = String(formData.get("phone") ?? "");
  const nextPath = String(formData.get("next") ?? "");
  const nextQuery = nextPath && nextPath.startsWith("/") ? `&next=${encodeURIComponent(nextPath)}` : "";
  const parsed = phoneSchema.safeParse(rawPhone);

  if (!parsed.success) {
    redirect(`/auth/login?error=invalid_phone${nextQuery}`);
  }

  const phone = normalizePhone(parsed.data);

  try {
    await requestOtp(phone, "LOGIN");
  } catch (error) {
    if (error instanceof OtpRateLimitError) {
      redirect(`/auth/login?error=rate_limited${nextQuery}`);
    }
    throw error;
  }

  redirect(`/auth/verify?phone=${encodeURIComponent(phone)}${nextQuery}`);
}

export async function verifyLoginOtpAction(formData: FormData): Promise<void> {
  const phone = String(formData.get("phone") ?? "");
  const rawCode = String(formData.get("code") ?? "");
  const nextPath = String(formData.get("next") ?? "");
  const parsedCode = otpCodeSchema.safeParse(rawCode);

  if (!parsedCode.success) {
    redirect(`/auth/verify?phone=${encodeURIComponent(phone)}&error=invalid_code`);
  }

  try {
    await verifyOtp(phone, "LOGIN", parsedCode.data);
  } catch (error) {
    if (error instanceof OtpInvalidError || error instanceof OtpExpiredError) {
      redirect(`/auth/verify?phone=${encodeURIComponent(phone)}&error=${error instanceof OtpExpiredError ? "expired" : "invalid_code"}`);
    }
    throw error;
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: { lastLoginAt: new Date() },
    create: { phone, role: "CUSTOMER", lastLoginAt: new Date() },
  });

  await createSession({ userId: user.id, role: user.role });

  redirect(nextPath && nextPath.startsWith("/") ? nextPath : roleHome(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
