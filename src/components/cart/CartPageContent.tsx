"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCartSubtotalCents } from "@/lib/cart/types";
import { useCartHydrated } from "@/lib/cart/hooks";
import { useCartStore } from "@/lib/cart/store";
import { COLORS } from "@/lib/config";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice, type Currency } from "@/lib/money";
import type { CartItem } from "@/lib/cart/types";

type CartPageContentProps = {
  currency: Currency;
  freeShippingOverCents: number | null;
};

export function CartPageContent({
  currency,
  freeShippingOverCents,
}: CartPageContentProps) {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const subtotalCents = useCartStore((state) =>
    getCartSubtotalCents(state.items),
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-lg bg-cream" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-4xl text-choco">{t.shporta}</h1>
        <p className="mt-6 text-lg text-choco-soft">{t.shportaBosh}</p>
        <div className="mt-10">
          <Button href="/koleksioni">{t.shikoKoleksionin}</Button>
        </div>
      </div>
    );
  }

  const shippingMessage = getShippingMessage(
    subtotalCents,
    freeShippingOverCents,
    currency,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-choco sm:text-5xl">{t.shporta}</h1>

      <ul className="mt-10 divide-y divide-beige border-y border-beige">
        {items.map((item) => (
          <li key={item.lineId}>
            <CartLineItem
              item={item}
              currency={currency}
              onRemove={() => removeItem(item.lineId)}
              onQuantityChange={(quantity) => setQuantity(item.lineId, quantity)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-3 rounded-lg bg-cream p-6">
        <div className="flex items-center justify-between text-ink">
          <span>{t.nentotali}</span>
          <span className="font-medium text-choco">
            {formatPrice(subtotalCents, currency)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 text-sm text-choco-soft">
          <span>{t.transporti}</span>
          <span className="text-right">{shippingMessage}</span>
        </div>
      </div>

      <div className="mt-8">
        <Button href="/porosia" className="w-full sm:w-auto">
          {t.perfundoPorosine}
        </Button>
      </div>
    </div>
  );
}

function CartLineItem({
  item,
  currency,
  onRemove,
  onQuantityChange,
}: {
  item: CartItem;
  currency: Currency;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const color = COLORS.find((entry) => entry.key === item.color);

  return (
    <article className="flex gap-4 py-6">
      <Link
        href={`/produkt/${item.slug}`}
        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-beige bg-cream"
      >
        {item.image ? (
          <Image
            src={getProductImageUrl(item.image)}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/produkt/${item.slug}`}
              className="font-display text-lg text-choco hover:text-choco-soft"
            >
              {item.name}
            </Link>
            {item.size && (
              <p className="mt-1 text-sm text-choco-soft">
                {t.madhesia}: {item.size}
              </p>
            )}
            {color && (
              <p className="mt-1 text-sm text-choco-soft">
                {t.ngjyra}: {color.label}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label={t.hiq}
            onClick={onRemove}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-choco-soft transition-colors hover:bg-cream hover:text-choco"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="inline-flex items-center rounded-full border border-beige">
            <button
              type="button"
              aria-label={t.zvogeloSasine}
              onClick={() => onQuantityChange(item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center text-choco"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm text-choco">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={t.rritSasine}
              onClick={() => onQuantityChange(item.quantity + 1)}
              className="flex h-9 w-9 items-center justify-center text-choco"
            >
              +
            </button>
          </div>

          <span className="font-medium text-choco">
            {formatPrice(item.priceCents * item.quantity, currency)}
          </span>
        </div>
      </div>
    </article>
  );
}

function getShippingMessage(
  subtotalCents: number,
  freeShippingOverCents: number | null,
  currency: Currency,
): string {
  if (!freeShippingOverCents || freeShippingOverCents <= 0) {
    return t.transportiNeArke;
  }

  if (subtotalCents >= freeShippingOverCents) {
    return t.transportFalas;
  }

  const remaining = freeShippingOverCents - subtotalCents;
  return t.edhePerTransportFalas.replace(
    "{amount}",
    formatPrice(remaining, currency),
  );
}
