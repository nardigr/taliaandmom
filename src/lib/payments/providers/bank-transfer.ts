import type { PaymentProvider } from "@/lib/payments/types";

export const bankTransferProvider: PaymentProvider = {
  id: "bank_transfer",
  async init() {
    return { status: "confirmed" };
  },
};
