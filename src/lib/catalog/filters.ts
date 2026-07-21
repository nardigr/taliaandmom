import type { Category, Prisma } from "@prisma/client";
import {
  CATEGORIES,
  COLORS,
  DEFAULT_COLLECTIONS,
  SIZES,
  type CategoryKey,
  type ColorKey,
  type SeasonKey,
} from "@/lib/config";

export const PAGE_SIZE = 12;

export type SortKey = "me-te-rejat" | "cmimi-ulet" | "cmimi-larte";

export type CatalogFilters = {
  season?: SeasonKey;
  category?: CategoryKey;
  size?: string;
  color?: ColorKey;
  q?: string;
  sort: SortKey;
  page: number;
};

export type CatalogSearchParams = {
  stina?: string;
  kategoria?: string;
  madhesia?: string;
  ngjyra?: string;
  kerko?: string;
  rendit?: string;
  faqe?: string;
};

/** Known default slugs — dynamic collections still resolve by slug equality */
const DEFAULT_SLUGS = new Set<string>(DEFAULT_COLLECTIONS.map((item) => item.slug));

export function seasonFromSlug(slug: string): SeasonKey | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  // Accept any slug shape; catalog page validates against DB separately when needed
  if (DEFAULT_SLUGS.has(normalized) || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    return normalized;
  }
  return null;
}

export function seasonToSlug(key: SeasonKey): string {
  return key;
}

export function categoryFromSlug(slug: string): CategoryKey | null {
  const category = CATEGORIES.find((item) => item.slug === slug);
  return category?.key ?? null;
}

export function categoryToSlug(key: CategoryKey): string {
  return CATEGORIES.find((item) => item.key === key)!.slug;
}

export function colorFromKey(key: string): ColorKey | null {
  return COLORS.some((color) => color.key === key) ? (key as ColorKey) : null;
}

export function getCategoriesForSeason(seasonKey: SeasonKey) {
  return CATEGORIES.filter(
    (category) =>
      category.seasons === "ALL" ||
      (category.seasons as readonly string[]).includes(seasonKey),
  );
}

export function isCategoryValidForSeason(
  categoryKey: CategoryKey,
  seasonKey: SeasonKey,
): boolean {
  return getCategoriesForSeason(seasonKey).some(
    (category) => category.key === categoryKey,
  );
}

export function parseCatalogFilters(
  searchParams: CatalogSearchParams,
  fixedSeason?: SeasonKey,
): CatalogFilters {
  const season =
    fixedSeason ??
    (searchParams.stina ? seasonFromSlug(searchParams.stina) ?? undefined : undefined);

  const categorySlug = searchParams.kategoria;
  const category = categorySlug ? categoryFromSlug(categorySlug) ?? undefined : undefined;

  const size = searchParams.madhesia;
  const validSize = size && SIZES.includes(size as (typeof SIZES)[number]) ? size : undefined;

  const colorKey = searchParams.ngjyra;
  const color = colorKey ? colorFromKey(colorKey) ?? undefined : undefined;

  const sortParam = searchParams.rendit;
  const sort: SortKey =
    sortParam === "cmimi-ulet" || sortParam === "cmimi-larte"
      ? sortParam
      : "me-te-rejat";

  const page = Math.max(1, Number.parseInt(searchParams.faqe ?? "1", 10) || 1);

  const q = searchParams.kerko?.trim() || undefined;

  const validatedCategory =
    category && season && !isCategoryValidForSeason(category, season)
      ? undefined
      : category;

  return {
    season,
    category: validatedCategory,
    size: validSize,
    color,
    q,
    sort,
    page,
  };
}

export function buildProductWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.season) {
    where.season = filters.season;
  }

  if (filters.category) {
    where.category = filters.category as Category;
  }

  if (filters.size) {
    where.sizes = { has: filters.size };
  }

  if (filters.color) {
    where.color = filters.color;
  }

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildProductOrderBy(
  sort: SortKey,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "cmimi-ulet":
      return { priceCents: "asc" };
    case "cmimi-larte":
      return { priceCents: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export function buildCatalogQueryString(
  current: CatalogSearchParams,
  updates: Partial<CatalogSearchParams>,
  options?: { fixedSeasonSlug?: string },
): string {
  const merged: CatalogSearchParams = { ...current, ...updates };

  if (options?.fixedSeasonSlug) {
    delete merged.stina;
  }

  const params = new URLSearchParams();

  if (merged.kategoria) params.set("kategoria", merged.kategoria);
  if (merged.madhesia) params.set("madhesia", merged.madhesia);
  if (merged.ngjyra) params.set("ngjyra", merged.ngjyra);
  if (merged.kerko) params.set("kerko", merged.kerko);
  if (merged.rendit && merged.rendit !== "me-te-rejat") {
    params.set("rendit", merged.rendit);
  }
  if (merged.faqe && merged.faqe !== "1") params.set("faqe", merged.faqe);
  if (!options?.fixedSeasonSlug && merged.stina) params.set("stina", merged.stina);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const productListSelect = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  compareAtCents: true,
  inStock: true,
  season: true,
  category: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { path: true, alt: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductListItem = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;
