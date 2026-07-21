export type ShippingSettings = {
  shippingFeeCents: number;
  freeShippingOverCents: number | null;
};

export function computeShippingCents(
  subtotalCents: number,
  settings: ShippingSettings,
): number {
  if (
    settings.freeShippingOverCents != null &&
    settings.freeShippingOverCents > 0 &&
    subtotalCents >= settings.freeShippingOverCents
  ) {
    return 0;
  }

  return settings.shippingFeeCents;
}

export function computeOrderTotals(
  subtotalCents: number,
  settings: ShippingSettings,
) {
  const shippingCents = computeShippingCents(subtotalCents, settings);
  const totalCents = subtotalCents + shippingCents;

  return { subtotalCents, shippingCents, totalCents };
}
