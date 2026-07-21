import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient | typeof import("@/lib/db").db;

export async function logOrderEvent(
  tx: Tx,
  data: {
    orderId: string;
    eventType: string;
    fromValue?: string | null;
    toValue?: string | null;
    note?: string | null;
  },
) {
  await tx.orderEvent.create({
    data: {
      orderId: data.orderId,
      eventType: data.eventType,
      fromValue: data.fromValue ?? null,
      toValue: data.toValue ?? null,
      note: data.note ?? null,
    },
  });
}
