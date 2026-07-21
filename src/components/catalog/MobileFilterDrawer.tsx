"use client";

import { useEffect, useState } from "react";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import type { CatalogSearchParams } from "@/lib/catalog/filters";
import { t } from "@/lib/i18n/sq";

type MobileFilterDrawerProps = {
  basePath: string;
  searchParams: CatalogSearchParams;
  collections?: { slug: string; label: string }[];
  showSeasonFilter?: boolean;
  fixedSeasonSlug?: string;
  activeSeasonSlug?: string;
  activeCategory?: string;
  activeSize?: string;
  activeColor?: string;
};

export function MobileFilterDrawer(props: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-beige px-5 py-2.5 text-sm uppercase tracking-wider text-choco transition-colors hover:bg-cream lg:hidden"
      >
        {t.filtro}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t.mbyll}
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.filtro}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-ivory p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-choco">{t.filtro}</h2>
              <button
                type="button"
                aria-label={t.mbyll}
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-choco hover:bg-cream"
              >
                ×
              </button>
            </div>

            <FilterPanel {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
