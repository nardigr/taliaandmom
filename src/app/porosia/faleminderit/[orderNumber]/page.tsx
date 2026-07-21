import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import { formatPrice } from "@/lib/money";
import { getCurrency, getSettings } from "@/lib/settings";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `${t.faleminderit} — ${orderNumber} | Talja&mom`,
  };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const [currency, settings] = await Promise.all([getCurrency(), getSettings()]);
  const showBankDetails = order.paymentMethod === PaymentMethod.BANK_TRANSFER;

  return (
    <>
      <ClearCartOnMount />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-4xl text-choco sm:text-5xl">
        {t.faleminderit}
      </h1>

      <p className="mt-6 text-lg text-ink">{t.doJuKontaktojme}</p>

      <div className="mt-8 rounded-lg border border-beige bg-cream p-6 text-left">
        <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
          {t.numriPorosise}
        </p>
        <p className="mt-2 font-display text-2xl text-choco">{order.orderNumber}</p>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.nentotali}</span>
            <span>{formatPrice(order.subtotalCents, currency)}</span>
          </div>
          <div className="flex justify-between text-choco-soft">
            <span>{t.transporti}</span>
            <span>
              {order.shippingCents === 0
                ? t.transportFalas
                : formatPrice(order.shippingCents, currency)}
            </span>
          </div>
          <div className="flex justify-between pt-2 font-medium text-choco">
            <span>{t.totali}</span>
            <span>{formatPrice(order.totalCents, currency)}</span>
          </div>
        </div>
      </div>

      {showBankDetails && (
        <div className="mt-8 rounded-lg border border-beige bg-ivory p-6 text-left">
          <h2 className="font-display text-2xl text-choco">{t.teDhenatBankare}</h2>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.banka}
              </dt>
              <dd className="mt-1 text-ink">{settings.bankName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.llogaria}
              </dt>
              <dd className="mt-1 text-ink">{settings.bankIban}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.perfituesi}
              </dt>
              <dd className="mt-1 text-ink">{settings.bankHolder}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.pershkrimiPageses}
              </dt>
              <dd className="mt-1 text-ink">{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.totali}
              </dt>
              <dd className="mt-1 font-medium text-choco">
                {formatPrice(order.totalCents, currency)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-10">
        <Button href="/koleksioni">{t.vazhdoBlerjet}</Button>
      </div>

      <p className="mt-6">
        <Link href="/" className="text-sm text-choco-soft hover:text-choco">
          {t.ktheuNeKryefaqe}
        </Link>
      </p>
    </div>
    </>
  );
}
