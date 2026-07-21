import Link from "next/link";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 20;

export default async function AdminChatSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() ?? "";

  const where = search
    ? {
        OR: [
          { leadEmail: { contains: search, mode: "insensitive" as const } },
          { leadName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, sessions] = await Promise.all([
    db.chatSession.count({ where }),
    db.chatSession.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        leadEmail: true,
        leadName: true,
        messageCount: true,
        status: true,
        lastActivityAt: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-choco">{t.bisedatAi}</h1>
        <p className="mt-2 text-sm text-choco-soft">
          Bisedat e vizitorëve me asistentin AI — pyetje, produkte dhe kërkesa kontakti.
        </p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={search}
          placeholder="Kërko me email ose emër..."
          className="min-w-[220px] flex-1 rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-ink outline-none focus:border-choco"
        />
        <button
          type="submit"
          className="rounded-lg bg-choco px-4 py-2 text-sm text-ivory transition-colors hover:bg-choco-soft"
        >
          {t.kerko}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-beige bg-cream">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-beige bg-ivory text-xs uppercase tracking-[0.15em] text-choco-soft">
            <tr>
              <th className="px-4 py-3">{t.klientiAi}</th>
              <th className="px-4 py-3">{t.emailAdmin}</th>
              <th className="px-4 py-3">{t.mesazhe}</th>
              <th className="px-4 py-3">{t.statusi}</th>
              <th className="px-4 py-3">{t.data}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-choco-soft">
                  Nuk ka biseda ende.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="border-b border-beige/70 last:border-0">
                  <td className="px-4 py-3 text-ink">
                    {session.leadName || t.paEmër}
                  </td>
                  <td className="px-4 py-3 text-choco-soft">
                    {session.leadEmail || "—"}
                  </td>
                  <td className="px-4 py-3">{session.messageCount}</td>
                  <td className="px-4 py-3 capitalize">{session.status}</td>
                  <td className="px-4 py-3 text-choco-soft">
                    {session.lastActivityAt.toLocaleString("sq-AL")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bisedat/${session.id}`}
                      className="text-choco underline-offset-2 hover:underline"
                    >
                      {t.shikoBiseden}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm text-choco-soft">
          {page > 1 && (
            <Link
              href={`/admin/bisedat?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className="underline-offset-2 hover:underline"
            >
              ← Mbrapa
            </Link>
          )}
          <span>
            Faqja {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/bisedat?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className="underline-offset-2 hover:underline"
            >
              Para →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
