import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllCollections } from "@/lib/collections";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    getAllCollections(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-choco">{t.ndrysho}</h1>
      <ProductForm collections={collections} product={product} />
    </div>
  );
}
