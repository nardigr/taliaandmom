"use client";

import { useTransition } from "react";
import { deleteChatSessionAction } from "@/lib/admin/ai-actions";
import { t } from "@/lib/i18n/sq";

export function DeleteChatSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(t.konfirmoFshirjen)) return;
        startTransition(async () => {
          await deleteChatSessionAction(sessionId);
        });
      }}
      className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm text-choco transition-colors hover:bg-rose-soft disabled:opacity-50"
    >
      {pending ? t.dukeUDerguar : t.fshiBiseden}
    </button>
  );
}
