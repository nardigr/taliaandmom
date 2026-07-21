"use client";

import { useActionState } from "react";
import { updateContactRequestStatusAction } from "@/lib/admin/contact-actions";
import type { AdminActionState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";

type ContactStatusFormProps = {
  requestId: string;
  currentStatus: string;
};

const initialState: AdminActionState = {};

export function ContactStatusForm({ requestId, currentStatus }: ContactStatusFormProps) {
  const boundAction = updateContactRequestStatusAction.bind(null, requestId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-beige bg-ivory px-3 py-2 text-sm"
      >
        <option value="new">{t.statusiRi}</option>
        <option value="in_progress">{t.statusiNeProces}</option>
        <option value="resolved">{t.statusiZgjidhur}</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-choco px-3 py-2 text-sm text-ivory hover:bg-choco-soft disabled:opacity-50"
      >
        {pending ? t.dukeUDerguar : t.ruaj}
      </button>
      {state.success ? <span className="text-xs text-choco-soft">{state.success}</span> : null}
      {state.error ? <span className="text-xs text-rose-deep">{state.error}</span> : null}
    </form>
  );
}
