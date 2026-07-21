import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { t } from "@/lib/i18n/sq";
import { getCurrency, getShippingSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: `${t.teDhenatEPorosise} | Talja&mom`,
};

export default async function PorosiaPage() {
  const [currency, shipping] = await Promise.all([
    getCurrency(),
    getShippingSettings(),
  ]);

  return <CheckoutForm currency={currency} shipping={shipping} />;
}
