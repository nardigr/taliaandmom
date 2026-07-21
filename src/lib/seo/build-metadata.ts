import type { Metadata } from "next";
import { getPageSeo } from "@/lib/seo/page-seo";
import { getSeoSettings } from "@/lib/seo/settings";
import { getSiteUrl, pageMetadata } from "@/lib/seo/metadata";

const siteName = "Talja&mom";

export async function buildPageMetadata({
  pageSlug,
  fallbackTitle,
  fallbackDescription,
  path,
}: {
  pageSlug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
}): Promise<Metadata> {
  const [globalSeo, pageSeo] = await Promise.all([
    getSeoSettings(),
    getPageSeo(pageSlug),
  ]);

  if (pageSeo && !pageSeo.isActive) {
    return pageMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path,
    });
  }

  const title = pageSeo?.pageTitle || fallbackTitle;
  const description = pageSeo?.metaDescription || fallbackDescription;
  const ogTitle = pageSeo?.ogTitle || title;
  const ogDescription = pageSeo?.ogDescription || description;
  const ogImage = pageSeo?.ogImage || globalSeo.ogImage || "/og-default.svg";

  return {
    ...pageMetadata({ title, description, path }),
    openGraph: {
      title: `${ogTitle} | ${siteName}`,
      description: ogDescription,
      images: [{ url: ogImage.startsWith("http") ? ogImage : `${getSiteUrl()}${ogImage}` }],
    },
    keywords: pageSeo?.metaKeywords || globalSeo.siteKeywords || undefined,
  };
}

export async function getRootMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const ogImage = seo.ogImage || "/og-default.svg";

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: seo.siteTitle,
      template: `%s | ${siteName}`,
    },
    description: seo.siteDescription,
    keywords: seo.siteKeywords || undefined,
    verification: seo.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    openGraph: {
      type: "website",
      locale: "sq_AL",
      siteName,
      title: seo.siteTitle,
      description: seo.siteDescription,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : ogImage,
          width: 1200,
          height: 630,
          alt: seo.siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.siteDescription,
    },
    alternates: { canonical: "/" },
  };
}
