"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkoutFormSchema } from "@/lib/orders/checkout-schema";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { isRateLimited, recordOrderAttempt } from "@/lib/orders/rate-limit";
import { computeOrderTotals } from "@/lib/orders/shipping";
import { db } from "@/lib/db";
import { sendOrderNotifications } from "@/lib/email/send-order-notification";
import { findOrCreateCustomer } from "@/lib/customers/find-or-create";
import { logOrderEvent } from "@/lib/orders/order-events";
import { t } from "@/lib/i18n/sq";
import { logOrderCreated } from "@/lib/orders/log-order";
import type { Currency } from "@/lib/money";
import { getPaymentProvider } from "@/lib/payments/registry";
import { getCurrency, getShippingSettings } from "@/lib/settings";

export type CreateOrderState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headerStore.get("x-real-ip") ?? "unknown";
}

function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CASH_ON_DELIVERY:
      return t.pagesaNeDorezim;
    case PaymentMethod.BANK_TRANSFER:
      return t.transfertaBankare;
    default:
      return method;
  }
}

export async function createOrder(
  _prevState: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);

  if (isRateLimited(clientIp)) {
    return { error: t.shumePorosi };
  }

  let itemsRaw: unknown = [];
  try {
    itemsRaw = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: t.gabimNePorosi };
  }

  const parsed = checkoutFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    city: formData.get("city"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    paymentMethod: formData.get("paymentMethod"),
    website: formData.get("website"),
    items: itemsRaw,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >;
    return {
      error: t.gabimNePorosi,
      fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { error: t.gabimNePorosi };
  }

  const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  let subtotalCents = 0;
  const orderItems: Array<{
    productId: string;
    nameSnapshot: string;
    priceCentsSnap: number;
    imageSnapshot: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
  }> = [];

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return { error: t.produktJoValid };
    }

    if (!product.inStock) {
      return { error: t.produktJashteStokutNeShporte };
    }

    if (product.sizes.length > 0) {
      if (!item.size || !product.sizes.includes(item.size)) {
        return { error: t.zgjidhniMadhesine };
      }
    }

    subtotalCents += product.priceCents * item.quantity;
    orderItems.push({
      productId: product.id,
      nameSnapshot: product.name,
      priceCentsSnap: product.priceCents,
      imageSnapshot: product.images[0]?.path ?? null,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    });
  }

  const shippingSettings = await getShippingSettings();
  const totals = computeOrderTotals(subtotalCents, shippingSettings);
  const provider = getPaymentProvider(parsed.data.paymentMethod);

  if (!provider) {
    return { error: t.gabimNePorosi };
  }

  const order = await db.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);

    const customerId = await findOrCreateCustomer(tx, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      city: parsed.data.city,
      address: parsed.data.address,
    });

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        paymentMethod: parsed.data.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        email: parsed.data.email?.trim() || null,
        city: parsed.data.city,
        address: parsed.data.address,
        notes: parsed.data.notes?.trim() || null,
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        items: { create: orderItems },
      },
    });

    await logOrderEvent(tx, {
      orderId: created.id,
      eventType: "created",
      toValue: created.status,
      note: orderNumber,
    });

    return created;
  });

  logOrderCreated({
    orderNumber: order.orderNumber,
    clientIp,
    totalCents: order.totalCents,
    itemCount: orderItems.length,
    paymentMethod: order.paymentMethod,
  });

  const paymentResult = await provider.init({
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalCents: order.totalCents,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
  });

  recordOrderAttempt(clientIp);

  const currency: Currency = await getCurrency();

  try {
    await sendOrderNotifications({
      orderNumber: order.orderNumber,
      customerName: `${order.firstName} ${order.lastName}`,
      customerEmail: order.email ?? undefined,
      totalCents: order.totalCents,
      currency,
      paymentMethodLabel: paymentMethodLabel(order.paymentMethod),
    });
  } catch {
    // Email is optional — orders are always stored in the database.
  }

  if (paymentResult.status === "pending_redirect" && paymentResult.redirectUrl) {
    redirect(paymentResult.redirectUrl);
  }

  redirect(`/porosia/faleminderit/${order.orderNumber}`);
}
