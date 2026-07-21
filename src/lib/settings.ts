import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import type { Currency } from "@/lib/money";

async function fetchSettings() {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export const getSettings = unstable_cache(fetchSettings, ["site-settings"], {
  tags: [CACHE_TAGS.settings],
});

export async function getSetting(key: string): Promise<string | undefined> {
  const settings = await getSettings();
  return settings[key];
}

export async function getCurrency(): Promise<Currency> {
  const value = await getSetting("currency");
  return value === "LEK" ? "LEK" : "EUR";
}

export async function getShippingSettings() {
  const settings = await getSettings();
  const freeShippingRaw = settings.freeShippingOverCents?.trim();

  return {
    shippingFeeCents: Number.parseInt(settings.shippingFeeCents ?? "0", 10) || 0,
    freeShippingOverCents:
      freeShippingRaw && freeShippingRaw.length > 0
        ? Number.parseInt(freeShippingRaw, 10) || null
        : null,
  };
}

export type ContactSettings = {
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
};

export async function getContactSettings(): Promise<ContactSettings> {
  const settings = await getSettings();

  return {
    contactAddress: settings.contactAddress ?? "PLACEHOLDER — Adresa",
    contactPhone: settings.contactPhone ?? "PLACEHOLDER — Telefon",
    contactEmail: settings.contactEmail ?? "PLACEHOLDER — Email",
    whatsappNumber: settings.whatsappNumber ?? "355000000000",
    instagramUrl: settings.instagramUrl ?? "#",
    facebookUrl: settings.facebookUrl ?? "#",
  };
}

export async function getLogoUrl(): Promise<string | null> {
  const value = await getSetting("logoUrl");
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
