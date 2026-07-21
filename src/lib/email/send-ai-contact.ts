import nodemailer from "nodemailer";
import { env, isEmailConfigured } from "@/lib/env";

type ContactEmailData = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  sessionId: string;
};

export async function sendAiContactNotification(data: ContactEmailData) {
  if (!isEmailConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number.parseInt(env.SMTP_PORT ?? "587", 10),
    secure: env.SMTP_PORT === "465",
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  const shopEmail = env.SHOP_NOTIFICATION_EMAIL!;

  await transporter.sendMail({
    from: shopEmail,
    to: shopEmail,
    replyTo: data.email,
    subject: `[AI] ${data.subject}`,
    text: [
      `Kërkesë kontakti nga AI Assistant`,
      `Emri: ${data.fullName}`,
      `Email: ${data.email}`,
      data.phone ? `Telefon: ${data.phone}` : null,
      `Tema: ${data.subject}`,
      "",
      data.message,
      "",
      `Session: ${data.sessionId}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return true;
}
