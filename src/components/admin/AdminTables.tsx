import Link from "next/link";
import { Category, OrderStatus } from "@prisma/client";
import {
  bulkToggleProductStockAction,
  toggleProductFeaturedAction,
  toggleProductStockAction,
} from "@/lib/admin/actions";
import { CATEGORIES, SEASONS } from "@/lib/config";
import { db } from "@/lib/db";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice } from "@/lib/money";
import { getCurrency } from "@/lib/settings";
import { cn } from "@/lib/utils";

type ProductsTableProps = {
  query?: string;
  season?: string;
  category?: Category;
  outOfStock?: boolean;
  /** Hide season/category columns when already scoped by a section frame */
  compact?: boolean;
  emptyMessage?: string;
};

export async function ProductsTable({
  query,
  season,
  category,
  outOfStock,
  compact = false,
  emptyMessage,
}: ProductsTableProps) {
  const currency = await getCurrency();

  const where = {
    ...(season ? { season } : {}),
    ...(category ? { category } : {}),
    ...(outOfStock ? { inStock: false } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { slug: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const products = await db.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return <p className="text-choco-soft">{emptyMessage ?? t.asnjeProdukt}</p>;
  }

  const productIds = products.map((p) => p.id).join(",");
  const showMeta = !compact;

  return (
    <div className="space-y-4">
      <form action={bulkToggleProductStockAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="productIds" value={productIds} />
        <button
          type="submit"
          name="inStock"
          value="true"
          className="rounded-lg border border-beige bg-cream px-3 py-1.5 text-xs text-choco hover:bg-ivory"
        >
          {t.teGjitha} → {t.neStok}
        </button>
        <button
          type="submit"
          name="inStock"
          value="false"
          className="rounded-lg border border-beige bg-cream px-3 py-1.5 text-xs text-choco hover:bg-ivory"
        >
          {t.teGjitha} → {t.jashteStokut}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-beige">
        <table className="min-w-full text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-[0.2em] text-choco-soft">
            <tr>
              <th className="px-4 py-3">{t.fotot}</th>
              <th className="px-4 py-3">{t.emriProduktit}</th>
              {showMeta && <th className="px-4 py-3">{t.stina}</th>}
              {showMeta && <th className="px-4 py-3">{t.kategoria}</th>}
              <th className="px-4 py-3">{t.cmimi}</th>
              <th className="px-4 py-3">{t.stok}</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = product.images[0];
              const seasonLabel = SEASONS.find((item) => item.key === product.season);
              const categoryLabel = CATEGORIES.find((item) => item.key === product.category);

              return (
                <tr key={product.id} className="border-t border-beige">
                  <td className="px-4 py-3">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProductImageUrl(image.path)}
                        alt={image.alt}
                        className="h-14 w-11 rounded object-cover"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-medium text-choco">{product.name}</td>
                  {showMeta && <td className="px-4 py-3">{seasonLabel?.label}</td>}
                  {showMeta && <td className="px-4 py-3">{categoryLabel?.label}</td>}
                  <td className="px-4 py-3">{formatPrice(product.priceCents, currency)}</td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProductStockAction(product.id, !product.inStock);
                      }}
                    >
                      <button
                        type="submit"
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs",
                          product.inStock
                            ? "border-beige text-choco"
                            : "border-rose-deep bg-rose-soft text-choco",
                        )}
                      >
                        {product.inStock ? t.po : t.jo}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProductFeaturedAction(product.id, !product.featured);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-beige px-3 py-1 text-xs"
                      >
                        {product.featured ? t.po : t.jo}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/produktet/${product.id}`}
                      className="text-choco hover:text-choco-soft"
                    >
                      {t.ndrysho}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function ProductsCategorySection({
  season,
  category,
  categoryLabel,
  count,
}: {
  season: string;
  category: Category;
  categoryLabel: string;
  count: number;
}) {
  const addHref = `/admin/produktet/i-ri?season=${season}&category=${category}`;

  return (
    <section className="space-y-4 rounded-xl border border-beige bg-cream p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-choco">{categoryLabel}</h2>
          <p className="mt-1 text-sm text-choco-soft">
            {count} {t.produkteNeKoleksion}
          </p>
        </div>
        <Link
          href={addHref}
          className="rounded-full border border-dashed border-choco px-4 py-2 text-sm text-choco hover:bg-ivory"
        >
          + {t.shtoNeKategori}
        </Link>
      </div>
      <ProductsTable
        season={season}
        category={category}
        compact
        emptyMessage={t.asnjeProduktNeKategori}
      />
    </section>
  );
}

export async function getProductCountsBySeasonCategory() {
  const rows = await db.product.groupBy({
    by: ["season", "category"],
    _count: { _all: true },
  });
  const bySeason: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const row of rows) {
    bySeason[row.season] = (bySeason[row.season] ?? 0) + row._count._all;
    const key = `${row.season}:${row.category}`;
    byCategory[key] = row._count._all;
  }
  return { bySeason, byCategory, total: rows.reduce((s, r) => s + r._count._all, 0) };
}

export async function OrdersTable({ status }: { status?: OrderStatus }) {
  const currency = await getCurrency();
  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusLabel: Record<OrderStatus, string> = {
    E_RE: t.eRe,
    KONFIRMUAR: t.eKonfirmuar,
    DERGUAR: t.eDerguar,
    DOREZUAR: t.eDorezuar,
    ANULUAR: t.eAnuluar,
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-beige">
      <table className="min-w-full text-sm">
        <thead className="bg-cream text-left text-xs uppercase tracking-[0.2em] text-choco-soft">
          <tr>
            <th className="px-4 py-3">{t.numriPorosise}</th>
            <th className="px-4 py-3">{t.klienti}</th>
            <th className="px-4 py-3">{t.statusi}</th>
            <th className="px-4 py-3">{t.totali}</th>
            <th className="px-4 py-3">{t.data}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-beige">
              <td className="px-4 py-3 font-medium text-choco">{order.orderNumber}</td>
              <td className="px-4 py-3">
                {order.firstName} {order.lastName}
              </td>
              <td className="px-4 py-3">{statusLabel[order.status]}</td>
              <td className="px-4 py-3">{formatPrice(order.totalCents, currency)}</td>
              <td className="px-4 py-3">
                {new Intl.DateTimeFormat("sq-AL").format(order.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/porosite/${order.id}`} className="text-choco">
                  {t.ndrysho}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function CustomersTable({
  query,
  city,
}: {
  query?: string;
  city?: string;
}) {
  const customers = await db.customer.findMany({
    where: {
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  if (customers.length === 0) {
    return <p className="text-choco-soft">{t.asnjeKlient}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-beige">
      <table className="min-w-full text-sm">
        <thead className="bg-cream text-left text-xs uppercase tracking-[0.2em] text-choco-soft">
          <tr>
            <th className="px-4 py-3">{t.klienti}</th>
            <th className="px-4 py-3">{t.emailAdmin}</th>
            <th className="px-4 py-3">{t.numriTelefonit}</th>
            <th className="px-4 py-3">{t.qyteti}</th>
            <th className="px-4 py-3">{t.totalPorosi}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-beige">
              <td className="px-4 py-3 font-medium text-choco">
                {customer.firstName} {customer.lastName}
              </td>
              <td className="px-4 py-3 text-choco-soft">{customer.email ?? "—"}</td>
              <td className="px-4 py-3">{customer.phone}</td>
              <td className="px-4 py-3">{customer.city ?? "—"}</td>
              <td className="px-4 py-3">{customer._count.orders}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/klientet/${customer.id}`} className="text-choco">
                  {t.shikoDetajet}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function OrderEventsList({ orderId }: { orderId: string }) {
  const events = await db.orderEvent.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display text-xl text-choco">{t.ngjarjetPorosise}</h3>
      <ul className="space-y-2 rounded-lg border border-beige bg-cream p-4 text-sm">
        {events.map((event) => (
          <li key={event.id} className="flex flex-wrap gap-2 text-choco-soft">
            <span>{new Intl.DateTimeFormat("sq-AL").format(event.createdAt)}</span>
            <span className="text-choco">{event.eventType}</span>
            {event.fromValue && event.toValue ? (
              <span>
                {event.fromValue} → {event.toValue}
              </span>
            ) : null}
            {event.note ? <span>({event.note})</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
