import type { MetadataRoute } from "next";
import { getActiveCollections } from "@/lib/collections";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [products, collections] = await Promise.all([
    db.product.findMany({
      select: { slug: true, updatedAt: true },
    }),
    getActiveCollections(),
  ]);

  const staticPaths = [
    "",
    "/koleksioni",
    "/rreth-nesh",
    "/kontakt",
    "/politika-e-kthimit",
    "/kushtet-e-perdorimit",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
    })),
    ...collections.map((season) => ({
      url: `${base}/koleksioni/${season.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${base}/produkt/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
