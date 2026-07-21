"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { aiSettingsFormSchema } from "@/lib/admin/schemas";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { t } from "@/lib/i18n/sq";
import type { AdminActionState } from "@/lib/admin/actions";

export async function saveAiSettingsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = aiSettingsFormSchema.safeParse({
    aiAssistantEnabled: formData.get("aiAssistantEnabled") === "true",
    aiAssistantName: formData.get("aiAssistantName"),
    aiAssistantAvatarUrl: formData.get("aiAssistantAvatarUrl"),
    aiFabCaption: formData.get("aiFabCaption"),
    aiKnowledgeBase: formData.get("aiKnowledgeBase"),
    aiSystemPrompt: formData.get("aiSystemPrompt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t.gabimRuajtjes };
  }

  const data = parsed.data;
  const entries: Record<string, string> = {
    aiAssistantEnabled: data.aiAssistantEnabled ? "true" : "false",
    aiAssistantName: data.aiAssistantName,
    aiAssistantAvatarUrl: data.aiAssistantAvatarUrl ?? "",
    aiFabCaption: data.aiFabCaption ?? "",
    aiKnowledgeBase: data.aiKnowledgeBase ?? "",
    aiSystemPrompt: data.aiSystemPrompt ?? "",
  };

  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  revalidateTag(CACHE_TAGS.settings, "max");
  revalidatePath("/admin/cilesimet");
  revalidatePath("/");
  return { success: t.uRuajt };
}

export async function deleteChatSessionAction(sessionId: string): Promise<void> {
  await requireAdmin();
  await db.chatSession.delete({ where: { id: sessionId } });
  revalidatePath("/admin/bisedat");
  const { redirect } = await import("next/navigation");
  redirect("/admin/bisedat");
}
