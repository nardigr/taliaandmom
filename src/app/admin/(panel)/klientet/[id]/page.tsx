import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerNotesForm } from "@/components/admin/CustomerNotesForm";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { t } from "@/lib/i18n/sq";
import { getCurrency } from "@/lib/settings";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const currency = await getCurrency();

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      contactRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) notFound();

  const chatSessions = customer.email
    ? await db.chatSession.findMany({
        where: { leadEmail: customer.email },
        orderBy: { lastActivityAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/klientet" className="text-sm text-choco-soft hover:text-choco">
          ← {t.klientet}
        </Link>
        <h1 className="mt-2 font-display text-3xl text-choco">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="mt-1 text-sm text-choco-soft">
          {customer.email ?? "—"} · {customer.phone}
          {customer.city ? ` · ${customer.city}` : ""}
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-beige bg-cream p-6">
          <h2 className="mb-4 font-display text-xl text-choco">{t.shenimeKlienti}</h2>
          <CustomerNotesForm
            customerId={customer.id}
            notes={customer.notes ?? ""}
            tags={customer.tags}
          />
        </div>
        <dl className="space-y-3 rounded-lg border border-beige bg-cream p-6 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-choco-soft">{t.adresa}</dt>
            <dd className="mt-1 text-ink">{customer.address ?? "—"}</dd>
          </div>
          {customer.tags.length > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-choco-soft">{t.etiketat}</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-beige bg-ivory px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl text-choco">{t.porositeKlientit}</h2>
        {customer.orders.length === 0 ? (
          <p className="text-choco-soft">{t.asnjeProdukt}</p>
        ) : (
          <ul className="space-y-2">
            {customer.orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/porosite/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-beige bg-ivory px-4 py-3 text-sm hover:bg-cream"
                >
                  <span className="font-medium text-choco">{order.orderNumber}</span>
                  <span>{formatPrice(order.totalCents, currency)}</span>
                  <span className="text-choco-soft">
                    {new Intl.DateTimeFormat("sq-AL").format(order.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(customer.contactRequests.length > 0 || chatSessions.length > 0) && (
        <section className="grid gap-8 lg:grid-cols-2">
          {customer.contactRequests.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-xl text-choco">{t.kerkesatKlientit}</h2>
              <ul className="space-y-2 text-sm">
                {customer.contactRequests.map((req) => (
                  <li key={req.id} className="rounded-lg border border-beige bg-cream p-3">
                    <p className="font-medium text-choco">{req.subject}</p>
                    <p className="text-choco-soft">{req.status}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {chatSessions.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-xl text-choco">{t.bisedatKlientit}</h2>
              <ul className="space-y-2 text-sm">
                {chatSessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/admin/bisedat/${session.id}`}
                      className="text-choco hover:underline"
                    >
                      {new Intl.DateTimeFormat("sq-AL").format(session.lastActivityAt)} —{" "}
                      {session.messageCount} {t.mesazhe}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
