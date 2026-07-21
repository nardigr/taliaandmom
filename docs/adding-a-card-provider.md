# Adding a card payment provider

This shop ships with **COD** and **bank transfer** only. Card payments are added by implementing one provider file and registering it — no checkout refactor needed.

## 1. Create the provider

Add `src/lib/payments/providers/your-gateway.ts`:

```ts
import type { PaymentProvider } from "@/lib/payments/types";

export const yourGatewayProvider: PaymentProvider = {
  id: "your_gateway",

  async init(order) {
    // Hosted payment page → redirect customer
    return {
      status: "pending_redirect",
      redirectUrl: `https://gateway.example/pay?ref=${order.orderNumber}`,
    };

    // Or immediate confirmation (rare for cards)
    // return { status: "confirmed" };
  },

  async handleWebhook(request) {
    // Verify signature, parse payload, return orderNumber + paid flag
    const payload = await request.json();
    return {
      orderNumber: payload.orderNumber,
      paid: payload.status === "paid",
    };
  },
};
```

When `init` returns `pending_redirect`, the checkout action redirects to `redirectUrl` instead of the thank-you page.

When `handleWebhook` returns `{ paid: true }`, `/api/payments/[provider]/webhook` sets `paymentStatus = PAID` on the order.

## 2. Register it

In `src/lib/payments/registry.ts`:

- Map `PaymentMethod.CARD` to your provider in `getPaymentProvider`.
- Add your provider id to `getWebhookProvider`.

## 3. Enable in checkout

Add a **Pagesë me kartë** radio option on `/porosia` when a Setting such as `cardPaymentsEnabled` is `true` (admin → Cilësimet).

## 4. Environment variables

Add secrets to `.env` / `.env.example` and validate them in `src/lib/env.ts`:

```
PAYMENT_CARD_PROVIDER=your_gateway
CARD_MERCHANT_ID=
CARD_SECRET=
```

## 5. Test locally

Use `ENABLE_TEST_PAYMENT_PROVIDER=true` only in development to exercise the redirect + webhook flow with the built-in `test_redirect` fake provider:

```bash
npm test
curl -X POST http://localhost:3000/api/payments/test_redirect/webhook \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"TM-2026-0001","paid":true}'
```

## Fiscal note

Albanian fiscalization (*fiskalizimi*) of receipts is handled outside this website (accountant / fiscal device). Confirm obligations before enabling card payments.
