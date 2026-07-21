import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { t } from "@/lib/i18n/sq";
import { getCurrency, getShippingSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: `${t.shporta} | Talja&mom`,
};

export default async function ShportaPage() {
  const [currency, shipping] = await Promise.all([
    getCurrency(),
    getShippingSettings(),
  ]);

  return (
    <CartPageContent
      currency={currency}
      freeShippingOverCents={shipping.freeShippingOverCents}
    />
  );
}
