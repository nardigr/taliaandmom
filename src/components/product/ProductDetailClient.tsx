"use client";

import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/lib/config";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type ProductImage = {
  id: string;
  path: string;
  alt: string;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return (
      <div className="aspect-[3/4] rounded-lg border border-beige bg-cream" />
    );
  }

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-beige bg-cream">
        <Image
          src={getProductImageUrl(activeImage.path)}
          alt={activeImage.alt || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                aria-label={`${productName} — foto ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-md border transition-colors",
                  index === activeIndex
                    ? "border-choco"
                    : "border-beige hover:border-choco-soft",
                )}
              >
                <Image
                  src={getProductImageUrl(image.path)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ProductPurchasePanelProps = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  sizes: string[];
  colorKey: string;
  image: string | null;
  inStock: boolean;
};

export function ProductPurchasePanel({
  productId,
  slug,
  name,
  priceCents,
  sizes,
  colorKey,
  image,
  inStock,
}: ProductPurchasePanelProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const color = COLORS.find((item) => item.key === colorKey);

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    addItem(
      {
        productId,
        slug,
        name,
        priceCents,
        size: selectedSize,
        color: colorKey,
        image,
      },
      quantity,
    );
  }

  return (
    <div className="space-y-6">
      {color && (
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.ngjyra}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span
              aria-hidden
              className="h-6 w-6 rounded-full border border-beige"
              style={{
                backgroundColor: color.hex === "linear" ? undefined : color.hex,
                background:
                  color.hex === "linear"
                    ? "conic-gradient(#EFC6C2, #D9C7B2, #2C3E70, #4E6E58, #EFC6C2)"
                    : undefined,
              }}
            />
            <span className="text-ink">{color.label}</span>
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
            {t.madhesia}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selectedSize === size
                    ? "border-choco bg-choco text-ivory"
                    : "border-beige text-choco hover:bg-cream",
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-2 text-sm text-[#B94A48]">{t.zgjidhniMadhesine}</p>
          )}
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-choco-soft">
          {t.sasia}
        </p>
        <div className="mt-3 inline-flex items-center rounded-full border border-beige">
          <button
            type="button"
            aria-label={t.zvogeloSasine}
            disabled={!inStock || quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-10 w-10 items-center justify-center text-choco disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-10 text-center text-choco">{quantity}</span>
          <button
            type="button"
            aria-label={t.rritSasine}
            disabled={!inStock}
            onClick={() => setQuantity((value) => value + 1)}
            className="flex h-10 w-10 items-center justify-center text-choco disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {inStock ? (
        <Button className="w-full" onClick={handleAddToCart}>
          {t.shtoNeShporte}
        </Button>
      ) : (
        <Button className="w-full" disabled>
          {t.jashteStokut}
        </Button>
      )}
    </div>
  );
}
