import { db } from "@/lib/db";
import {
  PAGE_SIZE,
  buildProductOrderBy,
  buildProductWhere,
  type CatalogFilters,
  productListSelect,
} from "@/lib/catalog/filters";

export async function getProductsPage(filters: CatalogFilters) {
  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(filters.sort);
  const skip = (filters.page - 1) * PAGE_SIZE;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: productListSelect,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  });
}

/** Newest products for the homepage New Arrivals row. */
export async function getNewArrivalsProducts(limit = 12) {
  return db.product.findMany({
    where: { images: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  });
}

/** Featured products with images, falling back to newest products for the homepage hero. */
export async function getHeroShowcaseProducts(limit = 6) {
  const featured = await db.product.findMany({
    where: { featured: true, images: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  });

  if (featured.length >= 2) return featured;

  return db.product.findMany({
    where: { images: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  season: string,
  category: string,
  limit = 4,
) {
  return db.product.findMany({
    where: {
      id: { not: productId },
      season: season as never,
      category: category as never,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productListSelect,
  });
}

export async function getSeasonCoverImage(seasonKey: string) {
  const product = await db.product.findFirst({
    where: { season: seasonKey as never },
    orderBy: { createdAt: "desc" },
    select: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { path: true },
      },
    },
  });

  return product?.images[0]?.path ?? null;
}
