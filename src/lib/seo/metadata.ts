import type { Metadata } from "next";
import { env } from "@/lib/env";

const siteName = "Talja&mom";

export function getSiteUrl() {
  return env.NEXT_PUBLIC_SITE_URL;
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} — Modë femrash`,
    template: `%s | ${siteName}`,
  },
  description:
    "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.",
  openGraph: {
    type: "website",
    locale: "sq_AL",
    siteName,
    title: `${siteName} — Modë femrash`,
    description:
      "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: `${siteName} — Modë femrash` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Modë femrash`,
    description:
      "Elegancë për çdo stinë. Koleksione të përzgjedhura për çdo moment.",
  },
  alternates: {
    canonical: "/",
  },
};

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    },
    alternates: path ? { canonical: path } : undefined,
  };
}
