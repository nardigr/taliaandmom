import Link from "next/link";
import { CategoryChips } from "@/components/catalog/CategoryChips";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { MobileFilterDrawer } from "@/components/catalog/MobileFilterDrawer";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SortSelect } from "@/components/catalog/SortSelect";
import { Button } from "@/components/ui/Button";
import { FloralMotif } from "@/components/ui/FloralMotif";
import {
  buildCatalogQueryString,
  getCategoriesForSeason,
  type CatalogSearchParams,
  type CatalogFilters,
} from "@/lib/catalog/filters";
import { getProductsPage } from "@/lib/catalog/queries";
import type { CollectionItem } from "@/lib/collections";
import { t } from "@/lib/i18n/sq";
import { getCurrency } from "@/lib/settings";

type CatalogPageContentProps = {
  title: string;
  eyebrow?: string;
  basePath: string;
  searchParams: CatalogSearchParams;
  filters: CatalogFilters;
  collections: Pick<CollectionItem, "slug" | "label">[];
  showSeasonFilter?: boolean;
  fixedSeasonSlug?: string;
  showCategoryChips?: boolean;
};

export async function CatalogPageContent({
  title,
  eyebrow,
  basePath,
  searchParams,
  filters,
  collections,
  showSeasonFilter = false,
  fixedSeasonSlug,
  showCategoryChips = false,
}: CatalogPageContentProps) {
  const [currency, { products, page, pageCount, total }] = await Promise.all([
    getCurrency(),
    getProductsPage(filters).then((result) => ({
      products: result.products,
      page: filters.page,
      pageCount: result.pageCount,
      total: result.total,
    })),
  ]);

  const activeSeasonSlug =
    fixedSeasonSlug ?? filters.season ?? searchParams.stina;

  const categories =
    filters.season != null
      ? getCategoriesForSeason(filters.season)
      : [];

  const filterProps = {
    basePath,
    searchParams,
    collections,
    showSeasonFilter,
    fixedSeasonSlug,
    activeSeasonSlug,
    activeCategory: searchParams.kategoria,
    activeSize: searchParams.madhesia,
    activeColor: searchParams.ngjyra,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl text-choco sm:text-5xl">
          {title}
        </h1>
      </header>

      {showCategoryChips && categories.length > 0 && (
        <div className="mb-8">
          <CategoryChips
            basePath={basePath}
            searchParams={searchParams}
            categories={categories}
            activeCategory={searchParams.kategoria}
            fixedSeasonSlug={fixedSeasonSlug}
          />
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <MobileFilterDrawer {...filterProps} />
        <SortSelect
          basePath={basePath}
          searchParams={searchParams}
          value={filters.sort}
          fixedSeasonSlug={fixedSeasonSlug}
        />
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterPanel {...filterProps} />
        </aside>

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <EmptyCatalog
              basePath={basePath}
              searchParams={searchParams}
              fixedSeasonSlug={fixedSeasonSlug}
            />
          ) : (
            <>
              <p className="mb-6 text-sm text-choco-soft">
                {total}{" "}
                {total === 1 ? t.produktSingular : t.produktPlural}
              </p>
              <ProductGrid products={products} currency={currency} />
              <Pagination
                basePath={basePath}
                searchParams={searchParams}
                page={page}
                pageCount={pageCount}
                fixedSeasonSlug={fixedSeasonSlug}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyCatalog({
  basePath,
  searchParams,
  fixedSeasonSlug,
}: {
  basePath: string;
  searchParams: CatalogSearchParams;
  fixedSeasonSlug?: string;
}) {
  const resetHref = `${basePath}${buildCatalogQueryString({}, {}, { fixedSeasonSlug })}`;
  const hasFilters =
    searchParams.kategoria ||
    searchParams.madhesia ||
    searchParams.ngjyra ||
    searchParams.stina ||
    searchParams.kerko;

  return (
    <div className="py-16 text-center">
      <FloralMotif variant="divider" />
      <p className="mt-8 font-display text-2xl text-choco">{t.asnjeProdukt}</p>
      {hasFilters && (
        <div className="mt-8">
          <Button href={resetHref} variant="secondary">
            {t.pastroFiltrat}
          </Button>
        </div>
      )}
    </div>
  );
}
