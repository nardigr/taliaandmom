"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { updateCustomerNotesAction } from "@/lib/admin/customer-actions";
import type { AdminActionState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";

type CustomerNotesFormProps = {
  customerId: string;
  notes: string;
  tags: string[];
};

const initialState: AdminActionState = {};

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";

export function CustomerNotesForm({ customerId, notes, tags }: CustomerNotesFormProps) {
  const boundAction = updateCustomerNotesAction.bind(null, customerId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco">
          {state.success}
        </div>
      )}
      <label className="block">
        <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
          {t.shenimeKlienti}
        </span>
        <textarea
          name="notes"
          rows={5}
          defaultValue={notes}
          className={`mt-2 ${inputClass}`}
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">{t.etiketat}</span>
        <input
          name="tags"
          defaultValue={tags.join(", ")}
          placeholder="vip, vere, tirane"
          className={`mt-2 ${inputClass}`}
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? t.dukeUDerguar : t.ruaj}
      </Button>
    </form>
  );
}
