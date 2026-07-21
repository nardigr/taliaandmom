import { unstable_cache } from "next/cache";
import type { Collection } from "@prisma/client";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";

export type CollectionItem = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  active: boolean;
  coverImageUrl: string | null;
};

function toItem(row: Collection): CollectionItem {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    sortOrder: row.sortOrder,
    active: row.active,
    coverImageUrl: row.coverImageUrl,
  };
}

async function fetchCollections(activeOnly: boolean): Promise<CollectionItem[]> {
  try {
    const rows = await db.collection.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
    return rows.map(toItem);
  } catch (error) {
    console.warn("[collections] query failed:", error);
    return [];
  }
}

export const getActiveCollections = unstable_cache(
  () => fetchCollections(true),
  ["collections-active"],
  { tags: [CACHE_TAGS.collections] },
);

export const getAllCollections = unstable_cache(
  () => fetchCollections(false),
  ["collections-all"],
  { tags: [CACHE_TAGS.collections] },
);

export async function getCollectionBySlug(slug: string): Promise<CollectionItem | null> {
  const rows = await getAllCollections();
  return rows.find((item) => item.slug === slug) ?? null;
}

export async function getCollectionById(id: string) {
  return db.collection.findUnique({ where: { id } });
}
