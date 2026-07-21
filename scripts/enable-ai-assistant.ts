import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const AI_SETTINGS: Record<string, string> = {
  aiAssistantEnabled: "true",
  aiAssistantName: "Talia",
  aiAssistantAvatarUrl: "",
  aiFabCaption: "Përshëndetje! Unë jam {name} — si mund t'ju ndihmoj?",
};

async function main() {
  for (const [key, value] of Object.entries(AI_SETTINGS)) {
    await db.setting.upsert({
      where: { key },
      update: key === "aiAssistantEnabled" ? { value } : {},
      create: { key, value },
    });
  }
  console.log("AI assistant enabled in settings.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
