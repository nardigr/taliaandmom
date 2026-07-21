"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { saveAiSettingsAction } from "@/lib/admin/ai-actions";
import { type AdminActionState } from "@/lib/admin/actions";
import { t, chat } from "@/lib/i18n/sq";

type AiSettingsFormProps = {
  settings: Record<string, string>;
  geminiConfigured: boolean;
};

const initialState: AdminActionState = {};

export function AiSettingsForm({ settings, geminiConfigured }: AiSettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveAiSettingsAction, initialState);
  const enabled = settings.aiAssistantEnabled === "true";

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state.error && (
        <div className="rounded-lg border border-beige bg-rose-soft px-4 py-3 text-sm">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco">
          {state.success}
        </div>
      )}

      {!geminiConfigured && (
        <p className="rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-choco-soft">
          {t.geminiPaKonfiguruar}
        </p>
      )}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="aiAssistantEnabled"
          value="true"
          defaultChecked={enabled}
          disabled={!geminiConfigured}
          className="h-4 w-4 rounded border-beige text-choco"
        />
        <span className="text-sm text-ink">{t.aktivizoAsistentin}</span>
      </label>

      <Field label={t.emriAsistentit}>
        <input
          name="aiAssistantName"
          defaultValue={settings.aiAssistantName ?? chat.assistantName}
          className={inputClass}
        />
      </Field>

      <Field label={t.avatariAsistentit}>
        <input
          name="aiAssistantAvatarUrl"
          defaultValue={settings.aiAssistantAvatarUrl ?? ""}
          placeholder="/images/ai-assistant.svg"
          className={inputClass}
        />
      </Field>

      <Field label={t.fabCaptionAi}>
        <input
          name="aiFabCaption"
          defaultValue={settings.aiFabCaption ?? chat.fabCaption}
          className={inputClass}
        />
      </Field>

      <Field label={t.bazaNjohuriveAi}>
        <textarea
          name="aiKnowledgeBase"
          rows={8}
          defaultValue={settings.aiKnowledgeBase ?? ""}
          placeholder="Politika kthimi, orare, madhësi, stile, etj."
          className={inputClass}
        />
      </Field>

      <Field label={t.promptAi}>
        <textarea
          name="aiSystemPrompt"
          rows={6}
          defaultValue={settings.aiSystemPrompt ?? ""}
          placeholder="Lini bosh për prompt-in default në shqip"
          className={inputClass}
        />
      </Field>

      <Button type="submit" disabled={pending || !geminiConfigured}>
        {pending ? t.dukeUDerguar : t.ruaj}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";
