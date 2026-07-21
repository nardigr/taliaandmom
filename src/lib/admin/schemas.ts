import { Category } from "@prisma/client";
import { z } from "zod";
import { isCategoryValidForSeason } from "@/lib/catalog/filters";
import type { CategoryKey, SeasonKey } from "@/lib/config";
import { t } from "@/lib/i18n/sq";

export const productImageInputSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1),
  alt: z.string().min(1, t.fushaDetyrueshme),
  sortOrder: z.number().int().min(0),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, t.fushaDetyrueshme),
    slug: z.string().trim().min(1, t.fushaDetyrueshme),
    description: z.string().trim().min(1, t.fushaDetyrueshme),
    priceCents: z.coerce.number().int().min(1),
    compareAtCents: z.coerce.number().int().min(0).optional().or(z.literal("")),
    season: z
      .string()
      .trim()
      .min(1, t.fushaDetyrueshme)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t.slugInvalid),
    category: z.nativeEnum(Category),
    color: z.string().min(1, t.fushaDetyrueshme),
    sizes: z.array(z.string()).default([]),
    inStock: z.coerce.boolean(),
    featured: z.coerce.boolean(),
    images: z.array(productImageInputSchema).min(1, t.fushaDetyrueshme),
  })
  .superRefine((data, ctx) => {
    if (
      !isCategoryValidForSeason(
        data.category as CategoryKey,
        data.season as SeasonKey,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t.kategoriaStinaInvalid,
        path: ["category"],
      });
    }

    const compareAt =
      data.compareAtCents === "" || data.compareAtCents == null
        ? null
        : Number(data.compareAtCents);

    if (compareAt != null && compareAt <= data.priceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t.cmimiKrahasuesInvalid,
        path: ["compareAtCents"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const settingsFormSchema = z.object({
  currency: z.enum(["EUR", "LEK"]),
  shippingFeeCents: z.coerce.number().int().min(0),
  freeShippingOverCents: z.coerce.number().int().min(0).optional().or(z.literal("")),
  bankName: z.string().trim().min(1, t.fushaDetyrueshme),
  bankIban: z.string().trim().min(1, t.fushaDetyrueshme),
  bankHolder: z.string().trim().min(1, t.fushaDetyrueshme),
  contactPhone: z.string().trim().min(1, t.fushaDetyrueshme),
  contactEmail: z.string().trim().email(t.emailInvalid),
  contactAddress: z.string().trim().min(1, t.fushaDetyrueshme),
  whatsappNumber: z.string().trim().min(1, t.fushaDetyrueshme),
  instagramUrl: z.string().trim().url(t.urlInvalid),
  facebookUrl: z.string().trim().url(t.urlInvalid),
  logoUrl: z.string().trim().optional().or(z.literal("")),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const aiSettingsFormSchema = z.object({
  aiAssistantEnabled: z.coerce.boolean(),
  aiAssistantName: z.string().trim().min(1, t.fushaDetyrueshme).max(60),
  aiAssistantAvatarUrl: z.string().trim().optional().or(z.literal("")),
  aiFabCaption: z.string().trim().max(200).optional().or(z.literal("")),
  aiKnowledgeBase: z.string().trim().max(20000).optional().or(z.literal("")),
  aiSystemPrompt: z.string().trim().max(20000).optional().or(z.literal("")),
});

export type AiSettingsFormValues = z.infer<typeof aiSettingsFormSchema>;

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, t.fushaDetyrueshme).max(100),
  email: z.string().trim().email(t.emailInvalid),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, t.fushaDetyrueshme),
    newPassword: z.string().min(8, t.fjalekalimiShkurter),
    confirmPassword: z.string().min(1, t.fushaDetyrueshme),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t.fjalekalimetNukPerputhen,
    path: ["confirmPassword"],
  });

export const createAdminUserSchema = z
  .object({
    name: z.string().trim().min(1, t.fushaDetyrueshme).max(100),
    email: z.string().trim().email(t.emailInvalid),
    password: z.string().min(8, t.fjalekalimiShkurter),
    confirmPassword: z.string().min(1, t.fushaDetyrueshme),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t.fjalekalimetNukPerputhen,
    path: ["confirmPassword"],
  });

export const customerNotesSchema = z.object({
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
});

export const contactStatusSchema = z.object({
  status: z.string().trim().min(1),
});

export const pageContentSectionSchema = z.object({
  sectionKey: z.string().min(1),
  value: z.string(),
  imageUrl: z.string().optional().nullable(),
});

export const pageContentFormSchema = z.object({
  pageSlug: z.string().min(1),
  sections: z.array(pageContentSectionSchema),
});

export const seoSettingsFormSchema = z.object({
  siteTitle: z.string().trim().min(1, t.fushaDetyrueshme).max(70),
  siteDescription: z.string().trim().min(1, t.fushaDetyrueshme).max(160),
  siteKeywords: z.string().trim().optional().or(z.literal("")),
  businessName: z.string().trim().optional().or(z.literal("")),
  businessType: z.string().trim().optional().or(z.literal("")),
  businessDescription: z.string().trim().optional().or(z.literal("")),
  businessPhone: z.string().trim().optional().or(z.literal("")),
  businessEmail: z.union([z.literal(""), z.string().email(t.emailInvalid)]).optional(),
  businessAddress: z.string().trim().optional().or(z.literal("")),
  businessCity: z.string().trim().optional().or(z.literal("")),
  businessCountry: z.string().trim().optional().or(z.literal("")),
  ogImage: z.string().trim().optional().or(z.literal("")),
  ga4MeasurementId: z.string().trim().optional().or(z.literal("")),
  googleSiteVerification: z.string().trim().optional().or(z.literal("")),
});

export const pageSeoFormSchema = z.object({
  pageSlug: z.string().trim().min(1, t.fushaDetyrueshme),
  pageTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  metaKeywords: z.string().trim().max(255).optional().or(z.literal("")),
  ogTitle: z.string().trim().max(70).optional().or(z.literal("")),
  ogDescription: z.string().trim().max(160).optional().or(z.literal("")),
  ogImage: z.string().trim().optional().or(z.literal("")),
  isActive: z.coerce.boolean(),
});
