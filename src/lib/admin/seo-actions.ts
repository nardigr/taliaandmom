"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { requireAdmin } from "@/lib/auth/require-admin";
import { pageSeoFormSchema, seoSettingsFormSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { PAGE_SEO_PRESETS } from "@/lib/page-content/schema";
import { t } from "@/lib/i18n/sq";

export type AdminActionState = {
  error?: string;
  success?: string;
};

function revalidateSeo(pageSlug?: string) {
  revalidateTag(CACHE_TAGS.seo, "max");
  revalidatePath("/", "layout");
  if (pageSlug) {
    const preset = PAGE_SEO_PRESETS.find((p) => p.slug === pageSlug);
    if (preset) revalidatePath(preset.path);
  }
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function saveSeoSettingsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = seoSettingsFormSchema.safeParse({
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
    siteKeywords: formData.get("siteKeywords"),
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    businessDescription: formData.get("businessDescription"),
    businessPhone: formData.get("businessPhone"),
    businessEmail: formData.get("businessEmail"),
    businessAddress: formData.get("businessAddress"),
    businessCity: formData.get("businessCity"),
    businessCountry: formData.get("businessCountry"),
    ogImage: formData.get("ogImage"),
    ga4MeasurementId: formData.get("ga4MeasurementId"),
    googleSiteVerification: formData.get("googleSiteVerification"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const data = parsed.data;
  await db.seoSettings.upsert({
    where: { id: "default" },
    update: {
      siteTitle: data.siteTitle,
      siteDescription: data.siteDescription,
      siteKeywords: emptyToNull(data.siteKeywords),
      businessName: emptyToNull(data.businessName),
      businessType: emptyToNull(data.businessType),
      businessDescription: emptyToNull(data.businessDescription),
      businessPhone: emptyToNull(data.businessPhone),
      businessEmail: emptyToNull(data.businessEmail),
      businessAddress: emptyToNull(data.businessAddress),
      businessCity: emptyToNull(data.businessCity),
      businessCountry: emptyToNull(data.businessCountry),
      ogImage: emptyToNull(data.ogImage),
      ga4MeasurementId: emptyToNull(data.ga4MeasurementId),
      googleSiteVerification: emptyToNull(data.googleSiteVerification),
    },
    create: {
      id: "default",
      siteTitle: data.siteTitle,
      siteDescription: data.siteDescription,
      siteKeywords: emptyToNull(data.siteKeywords),
      businessName: emptyToNull(data.businessName),
      businessType: emptyToNull(data.businessType),
      businessDescription: emptyToNull(data.businessDescription),
      businessPhone: emptyToNull(data.businessPhone),
      businessEmail: emptyToNull(data.businessEmail),
      businessAddress: emptyToNull(data.businessAddress),
      businessCity: emptyToNull(data.businessCity),
      businessCountry: emptyToNull(data.businessCountry),
      ogImage: emptyToNull(data.ogImage),
      ga4MeasurementId: emptyToNull(data.ga4MeasurementId),
      googleSiteVerification: emptyToNull(data.googleSiteVerification),
    },
  });

  revalidateSeo();
  revalidatePath("/admin/seo");
  return { success: t.uRuajt };
}

export async function savePageSeoAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = pageSeoFormSchema.safeParse({
    pageSlug: formData.get("pageSlug"),
    pageTitle: formData.get("pageTitle"),
    metaDescription: formData.get("metaDescription"),
    metaKeywords: formData.get("metaKeywords"),
    ogTitle: formData.get("ogTitle"),
    ogDescription: formData.get("ogDescription"),
    ogImage: formData.get("ogImage"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const data = parsed.data;
  await db.pageSeo.upsert({
    where: { pageSlug: data.pageSlug },
    update: {
      pageTitle: emptyToNull(data.pageTitle),
      metaDescription: emptyToNull(data.metaDescription),
      metaKeywords: emptyToNull(data.metaKeywords),
      ogTitle: emptyToNull(data.ogTitle),
      ogDescription: emptyToNull(data.ogDescription),
      ogImage: emptyToNull(data.ogImage),
      isActive: data.isActive,
    },
    create: {
      pageSlug: data.pageSlug,
      pageTitle: emptyToNull(data.pageTitle),
      metaDescription: emptyToNull(data.metaDescription),
      metaKeywords: emptyToNull(data.metaKeywords),
      ogTitle: emptyToNull(data.ogTitle),
      ogDescription: emptyToNull(data.ogDescription),
      ogImage: emptyToNull(data.ogImage),
      isActive: data.isActive,
    },
  });

  revalidateSeo(data.pageSlug);
  revalidatePath("/admin/seo");
  return { success: t.uRuajt };
}

export async function deletePageSeoAction(pageSlug: string): Promise<AdminActionState> {
  await requireAdmin();
  await db.pageSeo.deleteMany({ where: { pageSlug } });
  revalidateSeo(pageSlug);
  revalidatePath("/admin/seo");
  return { success: t.uFshi };
}

export async function saveAnalyticsExcludedIpsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const value = String(formData.get("analyticsExcludedIps") ?? "").trim();
  await db.setting.upsert({
    where: { key: "analyticsExcludedIps" },
    update: { value },
    create: { key: "analyticsExcludedIps", value },
  });
  revalidatePath("/admin/statistika");
  return { success: t.uRuajt };
}
