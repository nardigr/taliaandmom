import { SettingsForm } from "@/components/admin/SettingsForm";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n/sq";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const geminiConfigured = isGeminiConfigured();

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <h1 className="font-display text-4xl text-choco">{t.cilesimet}</h1>
        <SettingsForm settings={settings} />
      </div>

      <div className="space-y-8 border-t border-beige pt-12">
        <h2 className="font-display text-3xl text-choco">{t.asistentiAi}</h2>
        <AiSettingsForm settings={settings} geminiConfigured={geminiConfigured} />
      </div>
    </div>
  );
}
