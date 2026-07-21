import type { PaymentProvider } from "@/lib/payments/types";

/** Fake provider for tests — simulates a card gateway with redirect + webhook. */
export const testRedirectProvider: PaymentProvider = {
  id: "test_redirect",

  async init(order) {
    return {
      status: "pending_redirect",
      redirectUrl: `https://pay.test/checkout?order=${encodeURIComponent(order.orderNumber)}`,
    };
  },

  async handleWebhook(request) {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return null;
    }

    if (!body || typeof body !== "object") return null;

    const orderNumber = "orderNumber" in body ? String(body.orderNumber) : "";
    if (!orderNumber) return null;

    const paid = "paid" in body ? Boolean(body.paid) : false;
    return { orderNumber, paid };
  },
};
