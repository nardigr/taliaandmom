import { isGeminiConfigured } from "@/lib/ai/gemini";
import { getSettings } from "@/lib/settings";

export type AiAssistantConfig = {
  enabled: boolean;
  name: string;
  avatarUrl: string | null;
  fabCaption: string | null;
};

export async function getAiAssistantConfig(): Promise<AiAssistantConfig> {
  const settings = await getSettings();
  const enabled = settings.aiAssistantEnabled === "true";

  return {
    enabled,
    name: settings.aiAssistantName?.trim() || "Talia",
    avatarUrl: settings.aiAssistantAvatarUrl?.trim() || null,
    fabCaption: settings.aiFabCaption?.trim() || null,
  };
}

export async function getAiSystemPromptOverride(): Promise<string | null> {
  const settings = await getSettings();
  const value = settings.aiSystemPrompt?.trim();
  return value || null;
}

export async function getAiKnowledgeBase(): Promise<string> {
  const settings = await getSettings();
  return settings.aiKnowledgeBase?.trim() || "";
}

export async function isAiAssistantEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.aiAssistantEnabled === "true" && isGeminiConfigured();
}
