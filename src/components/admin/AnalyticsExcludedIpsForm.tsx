"use client";

import { useActionState } from "react";
import {
  saveAnalyticsExcludedIpsAction,
  type AdminActionState,
} from "@/lib/admin/seo-actions";
import { t } from "@/lib/i18n/sq";

type AnalyticsExcludedIpsFormProps = {
  defaultValue: string;
  currentIp: string;
};

export function AnalyticsExcludedIpsForm({
  defaultValue,
  currentIp,
}: AnalyticsExcludedIpsFormProps) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    saveAnalyticsExcludedIpsAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-choco-soft">IP: {currentIp || "—"}</p>
      <textarea
        name="analyticsExcludedIps"
        rows={3}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-beige bg-cream px-4 py-3 text-sm"
      />
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-choco px-6 py-2 text-sm text-ivory disabled:opacity-50"
      >
        {pending ? t.dukeUDerguar : t.ruaj}
      </button>
    </form>
  );
}
