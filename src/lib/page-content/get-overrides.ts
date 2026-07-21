import { db } from "@/lib/db";
import type { ContentOverrides } from "@/lib/page-content/resolve";

async function fetchPageContentOverrides(pageSlug: string): Promise<ContentOverrides> {
  const rows = await db.pageContent.findMany({ where: { pageSlug } });
  return Object.fromEntries(
    rows.map((row) => [row.sectionKey, { value: row.value, imageUrl: row.imageUrl }]),
  );
}

/** Always fresh — homepage/CMS content must reflect admin saves immediately. */
export async function getPageContentOverrides(pageSlug: string): Promise<ContentOverrides> {
  return fetchPageContentOverrides(pageSlug);
}

export async function getPageContentOverridesForPages(
  pageSlugs: string[],
): Promise<Record<string, ContentOverrides>> {
  const entries = await Promise.all(
    pageSlugs.map(async (slug) => [slug, await getPageContentOverrides(slug)] as const),
  );
  return Object.fromEntries(entries);
}
