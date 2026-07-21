import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWebhookProvider } from "@/lib/payments/registry";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { provider: providerId } = await context.params;
  const provider = getWebhookProvider(providerId);

  if (!provider?.handleWebhook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await provider.handleWebhook(request);

  if (!result) {
    return NextResponse.json({ error: "Unhandled webhook" }, { status: 400 });
  }

  if (result.paid) {
    await db.order.updateMany({
      where: { orderNumber: result.orderNumber },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }

  return NextResponse.json({ ok: true, ...result });
}
