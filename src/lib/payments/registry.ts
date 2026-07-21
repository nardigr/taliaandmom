import { PaymentMethod } from "@prisma/client";
import { isTestPaymentProviderEnabled } from "@/lib/env.schema";
import { bankTransferProvider } from "@/lib/payments/providers/bank-transfer";
import { codProvider } from "@/lib/payments/providers/cod";
import { testRedirectProvider } from "@/lib/payments/providers/test-redirect";
import type { PaymentProvider } from "@/lib/payments/types";

const providers: Record<PaymentMethod, PaymentProvider | undefined> = {
  [PaymentMethod.CASH_ON_DELIVERY]: codProvider,
  [PaymentMethod.BANK_TRANSFER]: bankTransferProvider,
  [PaymentMethod.CARD]: undefined,
};

export function getPaymentProvider(
  method: PaymentMethod,
): PaymentProvider | null {
  if (method === PaymentMethod.CARD && isTestPaymentProviderEnabled()) {
    return testRedirectProvider;
  }

  return providers[method] ?? null;
}

export function getWebhookProvider(providerId: string): PaymentProvider | null {
  if (providerId === codProvider.id) return codProvider;
  if (providerId === bankTransferProvider.id) return bankTransferProvider;
  if (isTestPaymentProviderEnabled() && providerId === testRedirectProvider.id) {
    return testRedirectProvider;
  }
  return null;
}
