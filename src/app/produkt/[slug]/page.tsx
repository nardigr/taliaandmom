import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  ProductGallery,
  ProductPurchasePanel,
} from "@/components/product/ProductDetailClient";
import { FloralMotif } from "@/components/ui/FloralMotif";
import { CATEGORIES } from "@/lib/config";
import { getCollectionBySlug } from "@/lib/collections";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice } from "@/lib/money";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCurrency } from "@/lib/settings";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Talja&mom" };
  }

  const season = await getCollectionBySlug(product.season);
  const category = CATEGORIES.find((item) => item.key === product.category);

  return {
    ...pageMetadata({
      title: `${product.name}${category ? ` — ${category.label}` : ""}${season ? ` — ${season.label}` : ""}`,
      description: product.description.slice(0, 160),
      path: `/produkt/${slug}`,
    }),
    openGraph: product.images[0]
      ? { images: [{ url: getProductImageUrl(product.images[0].path) }] }
      : undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [currency, related, season] = await Promise.all([
    getCurrency(),
    getRelatedProducts(product.id, product.season, product.category),
    getCollectionBySlug(product.season),
  ]);

  const category = CATEGORIES.find((item) => item.key === product.category);
  const onSale =
    product.compareAtCents != null &&
    product.compareAtCents > product.priceCents;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => getProductImageUrl(image.path)),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {[category?.label, season?.label].filter(Boolean).join(" · ")}
            </p>

            <h1 className="mt-3 font-display text-4xl text-choco sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-medium text-choco">
                {formatPrice(product.priceCents, currency)}
              </span>
              {onSale && product.compareAtCents != null && (
                <>
                  <span className="text-lg text-choco-soft line-through">
                    {formatPrice(product.compareAtCents, currency)}
                  </span>
                  <span className="rounded-full bg-rose-soft px-3 py-1 text-[11px] uppercase tracking-wider text-choco">
                    {t.ulje}
                  </span>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-beige pt-8">
              <ProductPurchasePanel
                productId={product.id}
                slug={product.slug}
                name={product.name}
                priceCents={product.priceCents}
                sizes={product.sizes}
                colorKey={product.color}
                image={product.images[0]?.path ?? null}
                inStock={product.inStock}
              />
            </div>

            <div className="mt-10 border-t border-beige pt-10">
              <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
                {t.pershkrimi}
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-beige pt-20">
            <FloralMotif variant="divider" />
            <h2 className="mt-8 text-center font-display text-3xl text-choco">
              {t.teNgjashme}
            </h2>
            <div className="mt-12">
              <ProductGrid products={related} currency={currency} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
