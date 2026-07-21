"use client";

import { useActionState, useState } from "react";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { Button } from "@/components/ui/Button";
import { saveSettingsAction, type AdminActionState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";

type SettingsFormProps = {
  settings: Record<string, string>;
};

const initialState: AdminActionState = {};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
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

      <Section title={t.identitetiMarkes}>
        <Field label={t.logoFaqes}>
          <LogoUrlField defaultValue={settings.logoUrl ?? ""} />
        </Field>
      </Section>

      <Section title={t.monedha}>
        <Field label={t.monedha}>
          <select
            name="currency"
            defaultValue={settings.currency ?? "EUR"}
            className={inputClass}
          >
            <option value="EUR">EUR</option>
            <option value="LEK">LEK</option>
          </select>
        </Field>
      </Section>

      <Section title={t.dergesa}>
        <Field label={`${t.transporti} (cent)`}>
          <input
            name="shippingFeeCents"
            type="number"
            min="0"
            defaultValue={settings.shippingFeeCents ?? "500"}
            className={inputClass}
          />
        </Field>
        <Field label={`${t.transportFalasNga} (cent, bosh = çaktivizuar)`}>
          <input
            name="freeShippingOverCents"
            type="number"
            min="0"
            defaultValue={settings.freeShippingOverCents ?? "10000"}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title={t.pagesa}>
        <Field label={t.banka}>
          <input name="bankName" defaultValue={settings.bankName} className={inputClass} />
        </Field>
        <Field label={t.llogaria}>
          <input name="bankIban" defaultValue={settings.bankIban} className={inputClass} />
        </Field>
        <Field label={t.perfituesi}>
          <input name="bankHolder" defaultValue={settings.bankHolder} className={inputClass} />
        </Field>
      </Section>

      <Section title={t.kontakt}>
        <Field label={t.numriTelefonit}>
          <input
            name="contactPhone"
            defaultValue={settings.contactPhone}
            className={inputClass}
          />
        </Field>
        <Field label={t.emailAdmin}>
          <input
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
            className={inputClass}
          />
        </Field>
        <Field label={t.adresa}>
          <input
            name="contactAddress"
            defaultValue={settings.contactAddress}
            className={inputClass}
          />
        </Field>
        <Field label="WhatsApp">
          <input
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            className={inputClass}
          />
        </Field>
        <Field label="Instagram URL">
          <input
            name="instagramUrl"
            defaultValue={settings.instagramUrl}
            className={inputClass}
          />
        </Field>
        <Field label="Facebook URL">
          <input
            name="facebookUrl"
            defaultValue={settings.facebookUrl}
            className={inputClass}
          />
        </Field>
      </Section>

      <Button type="submit" disabled={pending}>
        {pending ? t.dukeUDerguar : t.ruaj}
      </Button>
    </form>
  );
}

function LogoUrlField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-3 rounded-xl border border-beige bg-cream p-5">
      <input type="hidden" name="logoUrl" value={value} />
      <ContentImageUpload value={value} onChange={setValue} variant="logo" />
      <p className="text-xs text-choco-soft">{t.logoFaqesNdihme}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl text-choco">{title}</h2>
      {children}
    </section>
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
      <span className="text-xs uppercase tracking-[0.25em] text-choco-soft">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-beige bg-ivory px-4 py-3 text-ink outline-none focus:border-choco";
