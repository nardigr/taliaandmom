"use client";

import { t } from "@/lib/i18n/sq";

export function PrintOrderButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-6 rounded-full border border-beige px-5 py-3 text-xs uppercase tracking-wider text-choco"
    >
      {t.printo}
    </button>
  );
}
