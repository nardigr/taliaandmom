"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FloralMotif } from "@/components/ui/FloralMotif";
import { t } from "@/lib/i18n/sq";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app:error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <FloralMotif variant="divider" />
      <h1 className="mt-8 font-display text-4xl text-choco sm:text-5xl">
        {t.gabimTitull}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-choco-soft">
        {t.gabimPershkrim}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button type="button" onClick={reset}>
          {t.provoPerseri}
        </Button>
        <Button href="/" variant="secondary">
          {t.ktheuNeKryefaqe}
        </Button>
      </div>
    </div>
  );
}
