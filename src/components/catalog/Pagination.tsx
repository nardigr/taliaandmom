import Link from "next/link";
import { buildCatalogQueryString, type CatalogSearchParams } from "@/lib/catalog/filters";
import { cn } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  searchParams: CatalogSearchParams;
  page: number;
  pageCount: number;
  fixedSeasonSlug?: string;
};

export function Pagination({
  basePath,
  searchParams,
  page,
  pageCount,
  fixedSeasonSlug,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = getPageNumbers(page, pageCount);

  return (
    <nav aria-label="Faqëzimi" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-2">
        <PageLink
          href={pageHref(basePath, searchParams, page - 1, fixedSeasonSlug)}
          disabled={page <= 1}
          label="‹"
        />

        {pages.map((item, index) =>
          item === "..." ? (
            <li key={`ellipsis-${index}`} className="px-2 text-choco-soft">
              …
            </li>
          ) : (
            <PageLink
              key={item}
              href={pageHref(basePath, searchParams, item, fixedSeasonSlug)}
              active={item === page}
              label={String(item)}
            />
          ),
        )}

        <PageLink
          href={pageHref(basePath, searchParams, page + 1, fixedSeasonSlug)}
          disabled={page >= pageCount}
          label="›"
        />
      </ul>
    </nav>
  );
}

function pageHref(
  basePath: string,
  searchParams: CatalogSearchParams,
  targetPage: number,
  fixedSeasonSlug?: string,
) {
  return `${basePath}${buildCatalogQueryString(searchParams, {
    faqe: targetPage <= 1 ? undefined : String(targetPage),
  }, { fixedSeasonSlug })}`;
}

function PageLink({
  href,
  label,
  active = false,
  disabled = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <li>
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-choco-soft/40">
          {label}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
          active
            ? "bg-choco text-ivory"
            : "text-choco hover:bg-cream",
        )}
      >
        {label}
      </Link>
    </li>
  );
}

function getPageNumbers(current: number, total: number): Array<number | "..."> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "..."> = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}
