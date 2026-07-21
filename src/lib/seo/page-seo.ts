import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";

async function fetchPageSeo(pageSlug: string) {
  return db.pageSeo.findUnique({ where: { pageSlug } });
}

async function fetchAllPageSeo() {
  return db.pageSeo.findMany({ orderBy: { pageSlug: "asc" } });
}

export async function getPageSeo(pageSlug: string) {
  return unstable_cache(
    () => fetchPageSeo(pageSlug),
    ["page-seo", pageSlug],
    { tags: [CACHE_TAGS.seo] },
  )();
}

export async function getAllPageSeo() {
  return unstable_cache(fetchAllPageSeo, ["page-seo-all"], {
    tags: [CACHE_TAGS.seo],
  })();
}

export type PageSeoRecord = Awaited<ReturnType<typeof fetchPageSeo>>;
