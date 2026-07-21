import assert from "node:assert/strict";
import { test } from "node:test";
import { PaymentMethod } from "@prisma/client";
import { getPaymentProvider, getWebhookProvider } from "@/lib/payments/registry";

test("getWebhookProvider returns null for unknown provider", () => {
  assert.equal(getWebhookProvider("unknown_gateway"), null);
});

test("getWebhookProvider resolves test_redirect when test provider is enabled", () => {
  const previousFlag = process.env.ENABLE_TEST_PAYMENT_PROVIDER;
  process.env.ENABLE_TEST_PAYMENT_PROVIDER = "true";

  try {
    const provider = getWebhookProvider("test_redirect");
    assert.ok(provider);
    assert.equal(provider?.id, "test_redirect");
    assert.equal(typeof provider?.handleWebhook, "function");
  } finally {
    if (previousFlag === undefined) {
      delete process.env.ENABLE_TEST_PAYMENT_PROVIDER;
    } else {
      process.env.ENABLE_TEST_PAYMENT_PROVIDER = previousFlag;
    }
  }
});

test("getPaymentProvider returns test_redirect for CARD when enabled", () => {
  const previousFlag = process.env.ENABLE_TEST_PAYMENT_PROVIDER;
  process.env.ENABLE_TEST_PAYMENT_PROVIDER = "true";

  try {
    const provider = getPaymentProvider(PaymentMethod.CARD);
    assert.ok(provider);
    assert.equal(provider?.id, "test_redirect");
  } finally {
    if (previousFlag === undefined) {
      delete process.env.ENABLE_TEST_PAYMENT_PROVIDER;
    } else {
      process.env.ENABLE_TEST_PAYMENT_PROVIDER = previousFlag;
    }
  }
});
