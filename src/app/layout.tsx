import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Poppins } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ChatWidgetLoader } from "@/components/chat/ChatWidgetLoader";
import { CartShell } from "@/components/layout/CartShell";
import { getActiveCollections } from "@/lib/collections";
import { getRootMetadata } from "@/lib/seo/build-metadata";
import { getContactSettings, getCurrency, getLogoUrl } from "@/lib/settings";
import { getPageContentOverrides } from "@/lib/page-content/get-overrides";
import { resolveContentOverride } from "@/lib/page-content/resolve";
import { t } from "@/lib/i18n/sq";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  return getRootMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  const [currency, contact, footerOverrides, logoUrl, collections] = isAdmin
    ? (["EUR", null, {}, null, []] as const)
    : await Promise.all([
        getCurrency(),
        getContactSettings(),
        getPageContentOverrides("footer"),
        getLogoUrl(),
        getActiveCollections(),
      ]);

  const footerTagline = isAdmin
    ? t.footerTagline
    : resolveContentOverride(footerOverrides, "tagline", t.footerTagline);

  const collectionLinks = collections.map((item) => ({
    slug: item.slug,
    label: item.label,
  }));

  return (
    <html
      lang="sq"
      className={`${playfair.variable} ${poppins.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {!isAdmin ? <GoogleAnalytics /> : null}
        {isAdmin ? (
          children
        ) : (
          <>
            <CartShell
              currency={currency}
              contact={contact!}
              footerTagline={footerTagline}
              logoUrl={logoUrl}
              collections={collectionLinks}
            >
              {children}
            </CartShell>
            <ChatWidgetLoader />
          </>
        )}
      </body>
    </html>
  );
}
