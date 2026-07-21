import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPageContent } from "@/components/catalog/CatalogPageContent";
import {
  parseCatalogFilters,
  seasonFromSlug,
  type CatalogSearchParams,
} from "@/lib/catalog/filters";
import { getCollectionBySlug, getActiveCollections } from "@/lib/collections";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ stina: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stina } = await params;
  const season = await getCollectionBySlug(stina);

  if (!season || !season.active) {
    return { title: "Talja&mom" };
  }

  return {
    title: `${season.label} | Talja&mom`,
    description: `Koleksioni ${season.label} — Talja&mom`,
  };
}

export default async function SeasonCollectionPage({
  params,
  searchParams,
}: PageProps) {
  const [{ stina }, query] = await Promise.all([params, searchParams]);
  const seasonKey = seasonFromSlug(stina);
  const season = seasonKey ? await getCollectionBySlug(stina) : null;

  if (!seasonKey || !season || !season.active) notFound();

  const filters = parseCatalogFilters(query, seasonKey);
  const collections = await getActiveCollections();

  return (
    <CatalogPageContent
      title={season.label}
      eyebrow={season.label}
      basePath={`/koleksioni/${stina}`}
      searchParams={query}
      filters={filters}
      fixedSeasonSlug={stina}
      showCategoryChips
      collections={collections}
    />
  );
}
