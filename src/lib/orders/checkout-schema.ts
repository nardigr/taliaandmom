import { z } from "zod";
import { PaymentMethod } from "@prisma/client";
import { t } from "@/lib/i18n/sq";

function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

function isValidAlbanianPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, "");

  if (digits.length < 9) return false;

  if (normalized.startsWith("+355")) {
    return digits.length >= 11 && digits.length <= 12;
  }

  if (normalized.startsWith("00355")) {
    return digits.length >= 12 && digits.length <= 13;
  }

  if (normalized.startsWith("06") || normalized.startsWith("07")) {
    return digits.length >= 9 && digits.length <= 10;
  }

  return digits.length >= 9 && digits.length <= 15;
}

export const checkoutCartItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().nullable(),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutClientSchema = z.object({
  firstName: z.string().trim().min(1, t.fushaDetyrueshme),
  lastName: z.string().trim().min(1, t.fushaDetyrueshme),
  phone: z
    .string()
    .trim()
    .min(1, t.fushaDetyrueshme)
    .refine(isValidAlbanianPhone, t.telefonInvalid),
  email: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      t.emailInvalid,
    ),
  city: z.string().trim().min(1, t.fushaDetyrueshme),
  address: z.string().trim().min(1, t.fushaDetyrueshme),
  notes: z.string().trim().optional(),
  paymentMethod: z.enum([
    PaymentMethod.CASH_ON_DELIVERY,
    PaymentMethod.BANK_TRANSFER,
  ]),
  website: z.string().optional(),
});

export const checkoutFormSchema = checkoutClientSchema.extend({
  items: z.array(checkoutCartItemSchema).min(1, t.shportaBosh),
});

export type CheckoutClientValues = z.infer<typeof checkoutClientSchema>;

export type CheckoutCartItemInput = z.infer<typeof checkoutCartItemSchema>;
