import { db } from "@/lib/db";

const SENSITIVE_TOOLS = new Set(["request_contact"]);

const CONFIRMATION_RE =
  /\b(po|ok|okej|në rregull|ne rregull|dakord|konfirmoj|vazhdoni|vazhdo|dërgo|dergo|dërgojeni|dergojeni|dua|yes|confirm|confirmed|proceed)\b/i;

const INJECTION_RE =
  /(ignore (all )?(previous|prior)|system prompt|you are now|act as|jailbreak|<script|javascript:|\{\{|\}\})/i;

export type ToolGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string; message: string };

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function emailMentionedByUser(email: string, userMessages: string[]): boolean {
  const norm = email.trim().toLowerCase();
  if (!norm) return false;
  return userMessages.some((m) => m.toLowerCase().includes(norm));
}

function phoneMentionedByUser(phone: string | undefined, userMessages: string[]): boolean {
  if (!phone?.trim()) return true;
  const digits = normalizeDigits(phone);
  if (digits.length < 6) return false;
  return userMessages.some((m) => normalizeDigits(m).includes(digits));
}

function nameMentionedByUser(fullName: string, userMessages: string[]): boolean {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length >= 3);
  if (parts.length === 0) return false;
  const haystack = userMessages.join(" ").toLowerCase();
  return parts.some((p) => haystack.includes(p.toLowerCase()));
}

function hasUserConfirmation(userMessages: string[]): boolean {
  const recent = userMessages.slice(-3);
  return recent.some((m) => CONFIRMATION_RE.test(m));
}

function hasInjectionSignals(args: Record<string, unknown>): boolean {
  const fields = ["fullName", "email", "phone", "subject", "message"];
  return fields.some((key) => {
    const val = args[key];
    return typeof val === "string" && INJECTION_RE.test(val);
  });
}

async function contactAlreadySubmittedForSession(sessionId: string): Promise<boolean> {
  const existing = await db.chatMessage.findFirst({
    where: { sessionId, role: "tool", toolName: "request_contact" },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function guardSensitiveTool(input: {
  toolName: string;
  args: Record<string, unknown>;
  sessionId: string;
  recentUserMessages: string[];
}): Promise<ToolGuardResult> {
  if (!SENSITIVE_TOOLS.has(input.toolName)) {
    return { allowed: true };
  }

  const userMessages = input.recentUserMessages.map((m) => m.trim()).filter(Boolean);
  const email = typeof input.args.email === "string" ? input.args.email : "";
  const phone = typeof input.args.phone === "string" ? input.args.phone : undefined;
  const fullName = typeof input.args.fullName === "string" ? input.args.fullName : "";

  if (hasInjectionSignals(input.args)) {
    return {
      allowed: false,
      reason: "injection_detected",
      message:
        "Nuk mund ta përpunoj këtë kërkesë. Ju lutem na kontaktoni përmes WhatsApp ose faqes së kontaktit.",
    };
  }

  if (!emailMentionedByUser(email, userMessages)) {
    return {
      allowed: false,
      reason: "email_not_from_user",
      message:
        "Para se të vazhdoj, më duhet të më shkruani email-in tuaj këtu në bisedë dhe të konfirmoni që dëshironi të vazhdojmë.",
    };
  }

  if (!phoneMentionedByUser(phone, userMessages)) {
    return {
      allowed: false,
      reason: "phone_not_from_user",
      message: "Ju lutem shkruani numrin tuaj të telefonit në bisedë para se të regjistroj kërkesën.",
    };
  }

  if (!nameMentionedByUser(fullName, userMessages)) {
    return {
      allowed: false,
      reason: "name_not_from_user",
      message: "Ju lutem shkruani emrin tuaj të plotë në bisedë para se të vazhdoj.",
    };
  }

  if (!hasUserConfirmation(userMessages)) {
    return {
      allowed: false,
      reason: "needs_confirmation",
      message:
        'Para se të regjistroj kërkesën, më duhet konfirmimi juaj (p.sh. "po", "dakord", "konfirmoj"). Ju lutem konfirmoni.',
    };
  }

  if (
    input.toolName === "request_contact" &&
    (await contactAlreadySubmittedForSession(input.sessionId))
  ) {
    return {
      allowed: false,
      reason: "contact_limit",
      message:
        "Keni regjistruar tashmë një kërkesë kontakti në këtë bisedë. Ekipi ynë do t'ju përgjigjet së shpejti.",
    };
  }

  return { allowed: true };
}
