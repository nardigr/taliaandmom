import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductListItem } from "@/lib/catalog/filters";
import type { Currency } from "@/lib/money";

type ProductGridProps = {
  products: ProductListItem[];
  currency: Currency;
};

export function ProductGrid({ products, currency }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            currency={currency}
            priority={index < 4}
          />
        </li>
      ))}
    </ul>
  );
}
