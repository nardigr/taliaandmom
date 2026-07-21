import { ChatWidget } from "@/components/chat/ChatWidget";
import { getAiAssistantConfig } from "@/lib/ai/assistant-config";

export async function ChatWidgetLoader() {
  const config = await getAiAssistantConfig();

  return (
    <ChatWidget
      enabled={config.enabled}
      assistantName={config.name}
      assistantAvatarUrl={config.avatarUrl}
      fabCaptionTemplate={config.fabCaption}
    />
  );
}
