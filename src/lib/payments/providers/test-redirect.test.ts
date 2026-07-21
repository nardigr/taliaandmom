import assert from "node:assert/strict";
import { test } from "node:test";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import type { OrderForPayment } from "@/lib/payments/types";
import { testRedirectProvider } from "@/lib/payments/providers/test-redirect";

const sampleOrder: OrderForPayment = {
  orderNumber: "TM-2026-0001",
  paymentMethod: PaymentMethod.CARD,
  paymentStatus: PaymentStatus.UNPAID,
  totalCents: 5000,
  firstName: "Test",
  lastName: "User",
  email: null,
};

test("testRedirectProvider returns pending_redirect with redirectUrl", async () => {
  const result = await testRedirectProvider.init(sampleOrder);

  assert.equal(result.status, "pending_redirect");
  assert.ok(result.redirectUrl);
  assert.match(result.redirectUrl!, /TM-2026-0001/);
});

test("testRedirectProvider handleWebhook parses paid order", async () => {
  const request = new Request("https://example.com/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber: "TM-2026-0001", paid: true }),
  });

  const result = await testRedirectProvider.handleWebhook!(request);
  assert.deepEqual(result, { orderNumber: "TM-2026-0001", paid: true });
});

test("testRedirectProvider handleWebhook returns null for invalid payload", async () => {
  const request = new Request("https://example.com/webhook", {
    method: "POST",
    body: "not-json",
  });

  const result = await testRedirectProvider.handleWebhook!(request);
  assert.equal(result, null);
});
