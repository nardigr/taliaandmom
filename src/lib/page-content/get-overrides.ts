import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import type { ContentOverrides } from "@/lib/page-content/resolve";

async function fetchPageContentOverrides(pageSlug: string): Promise<ContentOverrides> {
  const rows = await db.pageContent.findMany({ where: { pageSlug } });
  return Object.fromEntries(
    rows.map((row) => [row.sectionKey, { value: row.value, imageUrl: row.imageUrl }]),
  );
}

async function fetchAllPageContentOverrides(): Promise<ContentOverrides> {
  const rows = await db.pageContent.findMany();
  return Object.fromEntries(
    rows.map((row) => [`${row.pageSlug}.${row.sectionKey}`, { value: row.value, imageUrl: row.imageUrl }]),
  );
}

export async function getPageContentOverrides(pageSlug: string): Promise<ContentOverrides> {
  return unstable_cache(
    () => fetchPageContentOverrides(pageSlug),
    ["page-content", pageSlug],
    { tags: [CACHE_TAGS.pageContent] },
  )();
}

export async function getPageContentOverridesForPages(
  pageSlugs: string[],
): Promise<Record<string, ContentOverrides>> {
  const entries = await Promise.all(
    pageSlugs.map(async (slug) => [slug, await getPageContentOverrides(slug)] as const),
  );
  return Object.fromEntries(entries);
}

export { fetchAllPageContentOverrides };
