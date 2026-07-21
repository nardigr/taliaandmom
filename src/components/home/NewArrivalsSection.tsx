import { NewArrivalsCarousel } from "@/components/home/NewArrivalsCarousel";
import { getNewArrivalsProducts } from "@/lib/catalog/queries";
import { getCurrency } from "@/lib/settings";

export async function NewArrivalsSection({ title }: { title: string }) {
  const [products, currency] = await Promise.all([
    getNewArrivalsProducts(12),
    getCurrency(),
  ]);

  if (products.length === 0) return null;

  return (
    <NewArrivalsCarousel title={title} products={products} currency={currency} />
  );
}
