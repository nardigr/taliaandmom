"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import type { Currency } from "@/lib/money";
import type { ContactSettings } from "@/lib/settings";

type CartShellProps = {
  children: React.ReactNode;
  currency: Currency;
  contact: ContactSettings;
  footerTagline: string;
  logoUrl?: string | null;
  collections: { slug: string; label: string }[];
};

export function CartShell({
  children,
  currency,
  contact,
  footerTagline,
  logoUrl,
  collections,
}: CartShellProps) {
  return (
    <>
      <PageViewTracker />
      <Header logoUrl={logoUrl} collections={collections} />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} tagline={footerTagline} collections={collections} />
      <CartDrawer currency={currency} />
    </>
  );
}
