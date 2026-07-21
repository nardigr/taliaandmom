import { Category } from "@prisma/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllCollections } from "@/lib/collections";
import { CATEGORIES } from "@/lib/config";
import { t } from "@/lib/i18n/sq";

type PageProps = {
  searchParams: Promise<{ season?: string; category?: string }>;
};

function parseCategory(value?: string): Category | undefined {
  if (!value) return undefined;
  return CATEGORIES.some((c) => c.key === value) ? (value as Category) : undefined;
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const collections = await getAllCollections();
  const defaultSeason = collections.some((c) => c.slug === params.season)
    ? params.season
    : undefined;
  const defaultCategory = parseCategory(params.category);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-choco">{t.shtoProdukt}</h1>
      <ProductForm
        collections={collections}
        defaultSeason={defaultSeason}
        defaultCategory={defaultCategory}
      />
    </div>
  );
}
