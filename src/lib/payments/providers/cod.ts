import type { PaymentProvider } from "@/lib/payments/types";

export const codProvider: PaymentProvider = {
  id: "cod",
  async init() {
    return { status: "confirmed" };
  },
};
