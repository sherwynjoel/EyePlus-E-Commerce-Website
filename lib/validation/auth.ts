import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export function normalizePhone(rawPhone: string): string {
  return `+91${rawPhone.trim()}`;
}

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");
