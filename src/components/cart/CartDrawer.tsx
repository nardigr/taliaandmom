"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart/store";
import { COLORS } from "@/lib/config";
import { getProductImageUrl } from "@/lib/images";
import { t } from "@/lib/i18n/sq";
import { formatPrice, type Currency } from "@/lib/money";
import type { CartItem } from "@/lib/cart/types";

type CartDrawerProps = {
  currency: Currency;
};

export function CartDrawer({ currency }: CartDrawerProps) {
  const drawerOpen = useCartStore((state) => state.drawerOpen);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    if (drawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  useEffect(() => {
    if (drawerOpen) {
      panelRef.current?.focus();
    }
  }, [drawerOpen]);

  if (!drawerOpen || !lastAddedItem) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.mbyll}
        className="absolute inset-0 bg-ink/40"
        onClick={closeDrawer}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.uShtuaNeShporte}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-beige px-6 py-5">
          <h2 className="font-display text-2xl text-choco">
            {t.uShtuaNeShporte} ✓
          </h2>
          <button
            type="button"
            aria-label={t.mbyll}
            onClick={closeDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full text-choco hover:bg-cream"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <DrawerItemSummary item={lastAddedItem} currency={currency} />
        </div>

        <div className="space-y-3 border-t border-beige px-6 py-6">
          <Button href="/shporta" className="w-full" onClick={closeDrawer}>
            {t.shikoShporten}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={closeDrawer}
          >
            {t.vazhdoBlerjet}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DrawerItemSummary({
  item,
  currency,
}: {
  item: CartItem;
  currency: Currency;
}) {
  const color = COLORS.find((entry) => entry.key === item.color);

  return (
    <div className="flex gap-4">
      <div className="relative h-28 w-[88px] shrink-0 overflow-hidden rounded-lg border border-beige bg-cream">
        {item.image ? (
          <Image
            src={getProductImageUrl(item.image)}
            alt={item.name}
            fill
            sizes="88px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
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
        <p className="mt-2 text-sm text-choco-soft">
          {t.sasia}: {item.quantity}
        </p>
        <p className="mt-2 font-medium text-choco">
          {formatPrice(item.priceCents * item.quantity, currency)}
        </p>
      </div>
    </div>
  );
}
