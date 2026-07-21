import type { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface PaymentInitResult {
  status: "confirmed" | "pending_redirect";
  redirectUrl?: string;
}

export interface OrderForPayment {
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalCents: number;
  firstName: string;
  lastName: string;
  email: string | null;
}

export interface PaymentProvider {
  id: "cod" | "bank_transfer" | string;
  init(order: OrderForPayment): Promise<PaymentInitResult>;
  handleWebhook?(req: Request): Promise<{ orderNumber: string; paid: boolean } | null>;
}
