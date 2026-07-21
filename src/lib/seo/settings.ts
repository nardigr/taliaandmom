import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";

const DEFAULT_SEO = {
  id: "default",
  siteTitle: "Talja&mom — Modë femrash",
  siteDescription: "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.",
  siteKeywords: null as string | null,
  businessName: "Talja&mom",
  businessType: "ClothingStore",
  businessDescription: null as string | null,
  businessPhone: null as string | null,
  businessEmail: null as string | null,
  businessAddress: null as string | null,
  businessCity: null as string | null,
  businessCountry: "AL",
  ogImage: "/og-default.svg",
  ga4MeasurementId: null as string | null,
  googleSiteVerification: null as string | null,
};

async function fetchSeoSettings() {
  const row = await db.seoSettings.findUnique({ where: { id: "default" } });
  return row ?? DEFAULT_SEO;
}

export const getSeoSettings = unstable_cache(fetchSeoSettings, ["seo-settings"], {
  tags: [CACHE_TAGS.seo],
});

export { DEFAULT_SEO };
