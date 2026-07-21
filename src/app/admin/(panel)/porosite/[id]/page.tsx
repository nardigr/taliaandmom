import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OrderControls,
  paymentMethodLabel,
} from "@/components/admin/OrderControls";
import { OrderEventsList } from "@/components/admin/AdminTables";
import { PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice } from "@/lib/money";
import { getCurrency } from "@/lib/settings";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!order) notFound();

  const currency = await getCurrency();

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.numriPorosise}
          </p>
          <h1 className="font-display text-4xl text-choco">{order.orderNumber}</h1>
        </div>
        <OrderControls
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-beige bg-cream p-6">
          <h2 className="font-display text-2xl text-choco">{t.klienti}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              {order.firstName} {order.lastName}
            </div>
            <div>{order.phone}</div>
            {order.email && <div>{order.email}</div>}
            <div>
              {order.address}, {order.city}
            </div>
            {order.notes && <div>{order.notes}</div>}
            {order.customer && (
              <div className="pt-2">
                <Link
                  href={`/admin/klientet/${order.customer.id}`}
                  className="text-choco hover:underline"
                >
                  {t.shikoDetajet} →
                </Link>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-lg border border-beige bg-cream p-6">
          <h2 className="font-display text-2xl text-choco">{t.menyraPageses}</h2>
          <p className="mt-4 text-sm">{paymentMethodLabel(order.paymentMethod)}</p>
          <p className="mt-2 text-sm text-choco-soft">
            {order.paymentStatus === PaymentStatus.PAID ? t.paguar : t.papaguar}
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-beige p-6">
        <h2 className="font-display text-2xl text-choco">{t.artikujt}</h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-t border-beige pt-4 first:border-t-0 first:pt-0">
              {item.imageSnapshot && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getProductImageUrl(item.imageSnapshot)}
                  alt={item.nameSnapshot}
                  className="h-16 w-12 rounded object-cover"
                />
              )}
              <div className="flex-1 text-sm">
                <p className="font-medium text-choco">{item.nameSnapshot}</p>
                {item.size && (
                  <p className="text-choco-soft">
                    {t.madhesia}: {item.size}
                  </p>
                )}
                <p className="text-choco-soft">
                  {t.sasia}: {item.quantity}
                </p>
              </div>
              <span>{formatPrice(item.priceCentsSnap * item.quantity, currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-beige pt-6 text-sm">
          <div className="flex justify-between">
            <span>{t.nentotali}</span>
            <span>{formatPrice(order.subtotalCents, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.transporti}</span>
            <span>
              {order.shippingCents === 0
                ? t.transportFalas
                : formatPrice(order.shippingCents, currency)}
            </span>
          </div>
          <div className="flex justify-between font-medium text-choco">
            <span>{t.totali}</span>
            <span>{formatPrice(order.totalCents, currency)}</span>
          </div>
        </div>
      </section>

      <OrderEventsList orderId={order.id} />
    </div>
  );
}
