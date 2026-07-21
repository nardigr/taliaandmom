import Link from "next/link";
import {
  buildCatalogQueryString,
  type CatalogSearchParams,
} from "@/lib/catalog/filters";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type CategoryChipsProps = {
  basePath: string;
  searchParams: CatalogSearchParams;
  categories: ReadonlyArray<{ key: string; slug: string; label: string }>;
  activeCategory?: string;
  fixedSeasonSlug?: string;
};

export function CategoryChips({
  basePath,
  searchParams,
  categories,
  activeCategory,
  fixedSeasonSlug,
}: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        href={`${basePath}${buildCatalogQueryString(searchParams, { kategoria: undefined, faqe: undefined }, { fixedSeasonSlug })}`}
        active={!activeCategory}
        label={t.teGjitha}
      />
      {categories.map((category) => (
        <Chip
          key={category.key}
          href={`${basePath}${buildCatalogQueryString(searchParams, {
            kategoria: category.slug,
            faqe: undefined,
          }, { fixedSeasonSlug })}`}
          active={activeCategory === category.slug}
          label={category.label}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-choco bg-choco text-ivory"
          : "border-beige bg-ivory text-choco hover:bg-cream",
      )}
    >
      {label}
    </Link>
  );
}
