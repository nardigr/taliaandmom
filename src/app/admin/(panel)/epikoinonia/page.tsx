import Link from "next/link";
import { ContactStatusForm } from "@/components/admin/ContactStatusForm";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminCommunicationPage({ searchParams }: PageProps) {
  const { tab = "kerkesat" } = await searchParams;

  const [requests, sessions, ordersWithNotes, newRequestCount] = await Promise.all([
    db.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.chatSession.findMany({
      orderBy: { lastActivityAt: "desc" },
      take: 20,
      select: {
        id: true,
        leadName: true,
        leadEmail: true,
        messageCount: true,
        lastActivityAt: true,
        status: true,
      },
    }),
    db.order.findMany({
      where: { notes: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.contactRequest.count({ where: { status: "new" } }),
  ]);

  const tabs = [
    { id: "kerkesat", label: t.kerkesat, badge: newRequestCount },
    { id: "bisedat", label: t.bisedat },
    { id: "porosi", label: t.porosiMeShenime },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-choco">{t.bisedat}</h1>

      <nav className="flex flex-wrap gap-2 border-b border-beige pb-4">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/admin/epikoinonia?tab=${item.id}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              tab === item.id
                ? "bg-choco text-ivory"
                : "border border-beige bg-cream text-choco hover:bg-ivory",
            )}
          >
            {item.label}
            {"badge" in item && item.badge ? ` (${item.badge})` : ""}
          </Link>
        ))}
      </nav>

      {tab === "kerkesat" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-choco-soft">{t.asnjeKerkes}</p>
          ) : (
            requests.map((req) => (
              <article
                key={req.id}
                className="rounded-lg border border-beige bg-cream p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-choco">{req.subject}</h2>
                    <p className="text-sm text-choco-soft">
                      {req.fullName} · {req.email}
                      {req.phone ? ` · ${req.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-choco-soft">
                      {t.burimi}: {req.source} ·{" "}
                      {new Intl.DateTimeFormat("sq-AL").format(req.createdAt)}
                    </p>
                  </div>
                  <ContactStatusForm requestId={req.id} currentStatus={req.status} />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{req.message}</p>
                {req.sessionId && (
                  <Link
                    href={`/admin/bisedat/${req.sessionId}`}
                    className="mt-2 inline-block text-sm text-choco hover:underline"
                  >
                    {t.shikoBiseden}
                  </Link>
                )}
              </article>
            ))
          )}
        </div>
      )}

      {tab === "bisedat" && (
        <div className="overflow-x-auto rounded-lg border border-beige">
          <table className="min-w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-choco-soft">
              <tr>
                <th className="px-4 py-3">{t.klientiAi}</th>
                <th className="px-4 py-3">{t.emailAdmin}</th>
                <th className="px-4 py-3">{t.mesazhe}</th>
                <th className="px-4 py-3">{t.data}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-beige">
                  <td className="px-4 py-3">{session.leadName ?? t.paEmër}</td>
                  <td className="px-4 py-3">{session.leadEmail ?? "—"}</td>
                  <td className="px-4 py-3">{session.messageCount}</td>
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat("sq-AL").format(session.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/bisedat/${session.id}`} className="text-choco">
                      {t.shikoBiseden}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "porosi" && (
        <div className="space-y-4">
          {ordersWithNotes.length === 0 ? (
            <p className="text-choco-soft">{t.asnjeKerkes}</p>
          ) : (
            ordersWithNotes.map((order) => (
              <Link
                key={order.id}
                href={`/admin/porosite/${order.id}`}
                className="block rounded-lg border border-beige bg-cream p-4 hover:bg-ivory"
              >
                <p className="font-medium text-choco">{order.orderNumber}</p>
                <p className="text-sm text-choco-soft">
                  {order.firstName} {order.lastName}
                </p>
                <p className="mt-2 text-sm text-ink">{order.notes}</p>
              </Link>
            ))
          )}
          <div className="pt-4">
            <Link href="/admin/porosite" className="text-sm text-choco hover:underline">
              {t.shikoTeGjitha} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
