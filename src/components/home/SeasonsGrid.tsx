import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { getSeasonCoverImage } from "@/lib/catalog/queries";
import { getActiveCollections } from "@/lib/collections";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";

function resolveImageSrc(imagePath: string) {
  if (imagePath.startsWith("http") || imagePath.startsWith("/")) {
    return imagePath;
  }
  return getProductImageUrl(imagePath);
}

export async function SeasonsGrid({ title }: { title?: string }) {
  const collections = await getActiveCollections();
  const items = (
    await Promise.all(
      collections.map(async (collection) => {
        const imagePath =
          collection.coverImageUrl || (await getSeasonCoverImage(collection.slug));
        return {
          slug: collection.slug,
          label: collection.label,
          sortOrder: collection.sortOrder,
          imageSrc: imagePath ? resolveImageSrc(imagePath) : null,
          unoptimized: Boolean(
            imagePath &&
              !imagePath.startsWith("http://") &&
              !imagePath.startsWith("https://"),
          ),
        };
      }),
    )
  ).filter((item) => item.slug);

  if (items.length === 0) return null;

  return (
    <CollectionsGrid
      title={title ?? t.zgjidhStinen}
      eyebrow={t.koleksioni}
      items={items}
    />
  );
}
