import type { Prisma } from "@prisma/client";

export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TM-${year}-`;

  const lastOrder = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const lastSequence = lastOrder
    ? Number.parseInt(lastOrder.orderNumber.slice(prefix.length), 10)
    : 0;

  const nextSequence = (Number.isNaN(lastSequence) ? 0 : lastSequence) + 1;
  return `${prefix}${nextSequence.toString().padStart(4, "0")}`;
}
