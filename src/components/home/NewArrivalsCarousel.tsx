"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductListItem } from "@/lib/catalog/filters";
import { getProductImageUrl } from "@/lib/images";
import type { Currency } from "@/lib/money";
import { formatPrice } from "@/lib/money";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type NewArrivalsCarouselProps = {
  title: string;
  products: ProductListItem[];
  currency: Currency;
};

export function NewArrivalsCarousel({
  title,
  products,
  currency,
}: NewArrivalsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-arrival-card]");
      if (!card) {
        setPageCount(1);
        return;
      }
      const perPage = Math.max(1, Math.floor(el.clientWidth / card.offsetWidth));
      setPageCount(Math.max(1, Math.ceil(products.length / perPage)));
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [products.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        setPage(0);
        return;
      }
      const next = Math.round((el.scrollLeft / maxScroll) * (pageCount - 1));
      setPage(Math.min(pageCount - 1, Math.max(0, next)));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pageCount]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  function goToPage(target: number) {
    const el = scrollerRef.current;
    if (!el || pageCount <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({
      left: (target / (pageCount - 1)) * maxScroll,
      behavior: "smooth",
    });
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-ivory py-14 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-beige" />
          <h2 className="relative bg-choco px-5 py-2 font-sans text-[12px] uppercase tracking-[0.28em] text-ivory sm:px-7 sm:text-[13px]">
            {title}
          </h2>
        </div>

        <div className="relative mt-10 sm:mt-12">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByPage(-1)}
            className="absolute -left-1 top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-2xl text-choco-soft transition-colors hover:text-choco sm:flex lg:-left-2"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByPage(1)}
            className="absolute -right-1 top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-2xl text-choco-soft transition-colors hover:text-choco sm:flex lg:-right-2"
          >
            ›
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product, index) => (
              <ArrivalCard
                key={product.id}
                product={product}
                currency={currency}
                priority={index < 4}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2.5">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page}
                  onClick={() => goToPage(i)}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border border-choco transition-colors",
                    i === page ? "bg-choco" : "bg-transparent hover:bg-choco/20",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ArrivalCard({
  product,
  currency,
  priority,
}: {
  product: ProductListItem;
  currency: Currency;
  priority?: boolean;
}) {
  const image = product.images[0];
  const imageUrl = image ? getProductImageUrl(image.path) : null;
  const onSale =
    product.compareAtCents != null && product.compareAtCents > product.priceCents;
  const discountPct = onSale
    ? Math.round(
        ((product.compareAtCents! - product.priceCents) / product.compareAtCents!) * 100,
      )
    : null;

  return (
    <article
      data-arrival-card
      className="w-[42%] shrink-0 snap-start sm:w-[28%] lg:w-[22%]"
    >
      <Link href={`/produkt/${product.slug}`} className="group block text-center">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden bg-cream">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={image?.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
              unoptimized={
                !image!.path.startsWith("http://") && !image!.path.startsWith("https://")
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-choco-soft">
              PLACEHOLDER
            </div>
          )}

          {discountPct != null && discountPct > 0 && (
            <span className="absolute right-2 top-2 text-xs font-medium text-choco">
              -{discountPct}%
            </span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70">
              <span className="text-xs uppercase tracking-wider text-choco">
                {t.jashteStokut}
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-4 px-1 text-sm leading-snug text-ink sm:text-[15px]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline justify-center gap-2 text-sm">
          <span className="font-semibold text-ink">
            {formatPrice(product.priceCents, currency)}
          </span>
          {onSale && product.compareAtCents != null && (
            <span className="text-choco-soft line-through">
              {formatPrice(product.compareAtCents, currency)}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
