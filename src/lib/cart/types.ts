export const CART_STORAGE_KEY = "taljamom-cart";

export type CartItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string | null;
  color: string;
  image: string | null;
  quantity: number;
};

export type AddToCartInput = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string | null;
  color: string;
  image: string | null;
};

export function getCartLineId(
  productId: string,
  size: string | null,
  color: string,
): string {
  return `${productId}::${size ?? ""}::${color}`;
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotalCents(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
}
