import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL është e detyrueshme"),
    AUTH_SECRET: z
      .string()
      .min(1, "AUTH_SECRET është i detyrueshëm — gjeneroni me: openssl rand -base64 32"),
    NEXT_PUBLIC_SITE_URL: z
      .string()
      .url("NEXT_PUBLIC_SITE_URL duhet të jetë një URL e vlefshme")
      .default("http://localhost:3000"),
    UPLOADS_DIR: z.string().default("./uploads"),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SHOP_NOTIFICATION_EMAIL: z.string().optional(),
    ENABLE_TEST_PAYMENT_PROVIDER: z.enum(["true", "false"]).optional(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasSmtpHost = Boolean(data.SMTP_HOST?.trim());
    const hasSmtpPort = Boolean(data.SMTP_PORT?.trim());
    const hasShopEmail = Boolean(data.SHOP_NOTIFICATION_EMAIL?.trim());

    if (hasSmtpHost !== hasSmtpPort || hasSmtpHost !== hasShopEmail) {
      ctx.addIssue({
        code: "custom",
        message:
          "SMTP_HOST, SMTP_PORT dhe SHOP_NOTIFICATION_EMAIL duhen vendosur së bashku ose të tre bosh.",
        path: ["SMTP_HOST"],
      });
    }

    if (data.SHOP_NOTIFICATION_EMAIL?.trim()) {
      const emailResult = z.string().email().safeParse(data.SHOP_NOTIFICATION_EMAIL);
      if (!emailResult.success) {
        ctx.addIssue({
          code: "custom",
          message: "SHOP_NOTIFICATION_EMAIL nuk është një email i vlefshëm.",
          path: ["SHOP_NOTIFICATION_EMAIL"],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "env";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${formatEnvError(result.error)}`);
  }

  return result.data;
}

export function isTestPaymentProviderEnabled(source: NodeJS.ProcessEnv = process.env) {
  return (
    source.NODE_ENV === "test" || source.ENABLE_TEST_PAYMENT_PROVIDER === "true"
  );
}

export function isEmailConfigured(source: Env) {
  return Boolean(
    source.SMTP_HOST?.trim() &&
      source.SMTP_PORT?.trim() &&
      source.SHOP_NOTIFICATION_EMAIL?.trim(),
  );
}
