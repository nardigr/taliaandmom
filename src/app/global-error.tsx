"use client";

import { t } from "@/lib/i18n/sq";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="sq">
      <body className="flex min-h-screen items-center justify-center bg-[#fdfbf6] px-4 font-sans text-[#2e211c]">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold text-[#4a2f26]">{t.gabimTitull}</h1>
          <p className="mt-4 text-base leading-relaxed text-[#6e4e40]">
            {t.gabimPershkrim}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full bg-[#4a2f26] px-6 py-3 text-sm font-medium text-[#fdfbf6] transition-colors hover:bg-[#6e4e40]"
          >
            {t.provoPerseri}
          </button>
        </div>
      </body>
    </html>
  );
}
