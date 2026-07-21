"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { collectionFormSchema } from "@/lib/admin/collection-schemas";
import type { AdminActionState } from "@/lib/admin/actions";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { slugify } from "@/lib/admin/slug";
import { t } from "@/lib/i18n/sq";

function revalidateCollections(slug?: string) {
  revalidateTag(CACHE_TAGS.collections, "max");
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath("/");
  revalidatePath("/koleksioni");
  revalidatePath("/admin/koleksionet");
  revalidatePath("/admin/produktet");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/koleksioni/${slug}`);
  }
}

export async function saveCollectionAction(
  collectionId: string | null,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = collectionFormSchema.safeParse({
    label: formData.get("label"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder") || "0",
    active: formData.get("active") === "true",
    coverImageUrl: formData.get("coverImageUrl") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const { label, slug, sortOrder, active, coverImageUrl } = parsed.data;
  const cover = coverImageUrl?.trim() ? coverImageUrl.trim() : null;

  try {
    if (collectionId) {
      const existing = await db.collection.findUnique({ where: { id: collectionId } });
      if (!existing) return { error: t.gabimRuajtjes };

      const slugTaken = await db.collection.findFirst({
        where: { slug, NOT: { id: collectionId } },
      });
      if (slugTaken) return { error: t.slugPerdorur };

      await db.$transaction(async (tx) => {
        await tx.collection.update({
          where: { id: collectionId },
          data: { label, slug, sortOrder, active, coverImageUrl: cover },
        });

        if (existing.slug !== slug) {
          await tx.product.updateMany({
            where: { season: existing.slug },
            data: { season: slug },
          });
        }
      });

      revalidateCollections(slug);
      if (existing.slug !== slug) {
        revalidatePath(`/koleksioni/${existing.slug}`);
      }
    } else {
      const slugTaken = await db.collection.findUnique({ where: { slug } });
      if (slugTaken) return { error: t.slugPerdorur };

      await db.collection.create({
        data: { label, slug, sortOrder, active, coverImageUrl: cover },
      });
      revalidateCollections(slug);
    }
  } catch {
    return { error: t.gabimRuajtjes };
  }

  return { success: t.uRuajt };
}

export async function deleteCollectionAction(
  collectionId: string,
): Promise<AdminActionState> {
  await requireAdmin();

  const existing = await db.collection.findUnique({ where: { id: collectionId } });
  if (!existing) return { error: t.gabimRuajtjes };

  const productCount = await db.product.count({ where: { season: existing.slug } });
  if (productCount > 0) {
    return { error: t.koleksioniKaProdukte };
  }

  try {
    await db.collection.delete({ where: { id: collectionId } });
  } catch {
    return { error: t.gabimRuajtjes };
  }

  revalidateCollections(existing.slug);
  return { success: t.uFshi };
}

export async function suggestCollectionSlug(label: string) {
  return slugify(label);
}
