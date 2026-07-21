import nodemailer from "nodemailer";
import { env, isEmailConfigured } from "@/lib/env";
import { formatPrice } from "@/lib/money";
import type { Currency } from "@/lib/money";

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  totalCents: number;
  currency: Currency;
  paymentMethodLabel: string;
};

export async function sendOrderNotifications(data: OrderEmailData) {
  if (!isEmailConfigured()) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number.parseInt(env.SMTP_PORT ?? "587", 10),
    secure: env.SMTP_PORT === "465",
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  const total = formatPrice(data.totalCents, data.currency);
  const shopEmail = env.SHOP_NOTIFICATION_EMAIL!;

  await transporter.sendMail({
    from: shopEmail,
    to: shopEmail,
    subject: `Porosi e re ${data.orderNumber}`,
    text: [
      `Porosi e re: ${data.orderNumber}`,
      `Klienti: ${data.customerName}`,
      `Totali: ${total}`,
      `Pagesa: ${data.paymentMethodLabel}`,
    ].join("\n"),
  });

  if (data.customerEmail) {
    await transporter.sendMail({
      from: shopEmail,
      to: data.customerEmail,
      subject: `Porosia juaj ${data.orderNumber} — Talja&mom`,
      text: [
        `Faleminderit ${data.customerName}!`,
        `Porosia juaj ${data.orderNumber} u pranua.`,
        `Totali: ${total}`,
        `Do t'ju kontaktojmë së shpejti për konfirmimin e porosisë.`,
      ].join("\n"),
    });
  }
}
