"use client";

import { useRouter } from "next/navigation";
import {
  buildCatalogQueryString,
  type CatalogSearchParams,
} from "@/lib/catalog/filters";
import { t } from "@/lib/i18n/sq";

type SortSelectProps = {
  basePath: string;
  searchParams: CatalogSearchParams;
  value: string;
  fixedSeasonSlug?: string;
};

export function SortSelect({
  basePath,
  searchParams,
  value,
  fixedSeasonSlug,
}: SortSelectProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="rendit" className="text-xs uppercase tracking-[0.25em] text-choco-soft">
        {t.renditSipas}
      </label>
      <select
        id="rendit"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          router.push(
            `${basePath}${buildCatalogQueryString(searchParams, {
              rendit: next === "me-te-rejat" ? undefined : next,
              faqe: undefined,
            }, { fixedSeasonSlug })}`,
          );
        }}
        className="rounded-full border border-beige bg-ivory px-4 py-2 text-sm text-choco outline-none focus-visible:ring-2 focus-visible:ring-choco"
      >
        <option value="me-te-rejat">{t.meTeRejat}</option>
        <option value="cmimi-ulet">{t.cmimiUlet}</option>
        <option value="cmimi-larte">{t.cmimiLarte}</option>
      </select>
    </div>
  );
}
