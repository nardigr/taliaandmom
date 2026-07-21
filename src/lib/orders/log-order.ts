import type { PaymentMethod } from "@prisma/client";

type OrderLogPayload = {
  orderNumber: string;
  clientIp: string;
  totalCents: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
};

export function logOrderCreated(payload: OrderLogPayload) {
  console.info(
    "[order:created]",
    JSON.stringify({
      ...payload,
      at: new Date().toISOString(),
    }),
  );
}
