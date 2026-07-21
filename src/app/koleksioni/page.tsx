import type { Metadata } from "next";
import { CatalogPageContent } from "@/components/catalog/CatalogPageContent";
import {
  parseCatalogFilters,
  type CatalogSearchParams,
} from "@/lib/catalog/filters";
import { getActiveCollections } from "@/lib/collections";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { t } from "@/lib/i18n/sq";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    pageSlug: "koleksioni",
    fallbackTitle: t.koleksioni,
    fallbackDescription: t.heroSubtitull,
    path: "/koleksioni",
  });
}

type PageProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export default async function KoleksioniPage({ searchParams }: PageProps) {
  const [params, collections] = await Promise.all([
    searchParams,
    getActiveCollections(),
  ]);
  const filters = parseCatalogFilters(params);
  const title = filters.q
    ? `${t.kerko}: “${filters.q}”`
    : t.koleksioni;

  return (
    <CatalogPageContent
      title={title}
      basePath="/koleksioni"
      searchParams={params}
      filters={filters}
      showSeasonFilter
      showCategoryChips={Boolean(filters.season)}
      collections={collections}
    />
  );
}
