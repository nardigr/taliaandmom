import Image from "next/image";
import Link from "next/link";
import type { Currency } from "@/lib/money";
import { formatPrice } from "@/lib/money";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import type { ProductListItem } from "@/lib/catalog/filters";

type ProductCardProps = {
  product: ProductListItem;
  currency: Currency;
  priority?: boolean;
};

export function ProductCard({ product, currency, priority = false }: ProductCardProps) {
  const image = product.images[0];
  const imageUrl = image ? getProductImageUrl(image.path) : null;
  const onSale =
    product.compareAtCents != null &&
    product.compareAtCents > product.priceCents;

  return (
    <article className="group">
      <Link href={`/produkt/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-beige bg-cream">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={image?.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-cream text-sm text-choco-soft">
              PLACEHOLDER
            </div>
          )}

          {onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-soft px-3 py-1 text-[11px] uppercase tracking-wider text-choco">
              {t.ulje}
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70">
              <span className="rounded-full bg-choco/90 px-4 py-2 text-xs uppercase tracking-wider text-ivory">
                {t.jashteStokut}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg text-choco">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-medium text-choco">
              {formatPrice(product.priceCents, currency)}
            </span>
            {onSale && product.compareAtCents != null && (
              <span className="text-sm text-choco-soft line-through">
                {formatPrice(product.compareAtCents, currency)}
              </span>
            )}
          </div>
          <span className="mt-2 inline-block text-xs uppercase tracking-wider text-choco-soft transition-colors group-hover:text-choco">
            {t.shikoDetajet}
          </span>
        </div>
      </Link>
    </article>
  );
}
