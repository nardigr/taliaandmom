import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteChatSessionButton } from "@/components/admin/DeleteChatSessionButton";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminChatSessionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await db.chatSession.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/bisedat"
            className="text-sm text-choco-soft underline-offset-2 hover:underline"
          >
            ← {t.bisedatAi}
          </Link>
          <h1 className="mt-2 font-display text-3xl text-choco">
            {session.leadName || t.paEmër}
          </h1>
          <p className="mt-1 text-sm text-choco-soft">
            {session.leadEmail || "Pa email"} · {session.messageCount} {t.mesazhe} ·{" "}
            {session.lastActivityAt.toLocaleString("sq-AL")}
          </p>
        </div>
        <DeleteChatSessionButton sessionId={session.id} />
      </div>

      <div className="space-y-4">
        {session.messages.map((message) => (
          <article
            key={message.id}
            className="rounded-lg border border-beige bg-cream p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-choco-soft">
              <span>{t.roli}: {message.role}</span>
              {message.toolName ? (
                <span>
                  {t.mjeti}: {message.toolName}
                </span>
              ) : null}
              <span>{message.createdAt.toLocaleString("sq-AL")}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-ink">{message.content}</p>
            {message.toolResult != null && (
              <pre className="mt-3 overflow-x-auto rounded bg-ivory p-3 text-xs text-choco-soft">
                {JSON.stringify(message.toolResult, null, 2)}
              </pre>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
