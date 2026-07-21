import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import { formatPrice } from "@/lib/money";
import { getCurrency } from "@/lib/settings";

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    currency,
    newOrders,
    ordersThisMonth,
    activeProducts,
    outOfStockProducts,
    newContactRequests,
    recentOrders,
  ] = await Promise.all([
    getCurrency(),
    db.order.count({ where: { status: OrderStatus.E_RE } }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    db.product.count({ where: { inStock: true } }),
    db.product.count({ where: { inStock: false } }),
    db.contactRequest.count({ where: { status: "new" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl text-choco">{t.paneli}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t.porosiTeReja} value={String(newOrders)} />
        <StatCard label={t.porosiKeteMuaj} value={String(ordersThisMonth)} />
        <StatCard label={t.produkteAktive} value={String(activeProducts)} />
        <StatCard
          label={t.produkteJashteStokut}
          value={String(outOfStockProducts)}
          href="/admin/produktet?outOfStock=1"
          alert={outOfStockProducts > 0}
        />
        <StatCard
          label={t.kerkesaTeReja}
          value={String(newContactRequests)}
          href="/admin/epikoinonia?tab=kerkesat"
          alert={newContactRequests > 0}
        />
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl text-choco">{t.lidhjeTeShpejta}</h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/klientet" label={t.klientet} />
          <QuickLink href="/admin/epikoinonia" label={t.epikoinonia} />
          <QuickLink href="/admin/profili" label={t.profili} />
          <QuickLink href="/admin/faqet" label={t.faqet} />
          <QuickLink href="/admin/seo" label={t.seo} />
          <QuickLink href="/admin/statistika" label={t.statistika} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl text-choco">{t.porosite}</h2>
        <div className="overflow-x-auto rounded-lg border border-beige">
          <table className="min-w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-[0.2em] text-choco-soft">
              <tr>
                <th className="px-4 py-3">{t.numriPorosise}</th>
                <th className="px-4 py-3">{t.klienti}</th>
                <th className="px-4 py-3">{t.totali}</th>
                <th className="px-4 py-3">{t.data}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-beige">
                  <td className="px-4 py-3">
                    <Link href={`/admin/porosite/${order.id}`} className="text-choco">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.firstName} {order.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(order.totalCents, currency)}
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat("sq-AL").format(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Link
          href="/admin/porosite"
          className="text-sm uppercase tracking-wider text-choco-soft hover:text-choco"
        >
          {t.shikoTeGjitha} →
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  alert,
}: {
  label: string;
  value: string;
  href?: string;
  alert?: boolean;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">{label}</p>
      <p
        className={`mt-3 font-display text-4xl ${alert ? "text-rose-deep" : "text-choco"}`}
      >
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg border border-beige bg-cream p-6 transition-colors hover:bg-ivory"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg border border-beige bg-cream p-6">{content}</div>;
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-beige bg-ivory px-5 py-2 text-sm text-choco transition-colors hover:bg-cream"
    >
      {label}
    </Link>
  );
}
