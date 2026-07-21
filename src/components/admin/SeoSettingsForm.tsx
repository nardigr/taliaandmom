"use client";

import { useActionState } from "react";
import { saveSeoSettingsAction, type AdminActionState } from "@/lib/admin/seo-actions";
import { OgImageField } from "@/components/admin/OgImageField";
import { t } from "@/lib/i18n/sq";

type SeoSettingsFormProps = {
  settings: {
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string | null;
    businessName: string | null;
    businessType: string | null;
    businessDescription: string | null;
    businessPhone: string | null;
    businessEmail: string | null;
    businessAddress: string | null;
    businessCity: string | null;
    businessCountry: string | null;
    ogImage: string | null;
    ga4MeasurementId: string | null;
    googleSiteVerification: string | null;
  };
};

export function SeoSettingsForm({ settings }: SeoSettingsFormProps) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    saveSeoSettingsAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.success}
        </p>
      ) : null}

      <section className="rounded-xl border border-beige bg-ivory p-6">
        <h2 className="text-lg font-medium text-choco">{t.seoGlobale}</h2>
        <div className="mt-4 grid gap-4">
          <Field label={t.titulliSeo} name="siteTitle" defaultValue={settings.siteTitle} />
          <TextArea
            label={t.pershkrimiSeo}
            name="siteDescription"
            defaultValue={settings.siteDescription}
          />
          <Field
            label={t.fjaleKycSeo}
            name="siteKeywords"
            defaultValue={settings.siteKeywords ?? ""}
          />
          <div>
            <p className="mb-2 text-sm text-choco">{t.imazhiOg}</p>
            <OgImageField defaultValue={settings.ogImage ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-beige bg-ivory p-6">
        <h2 className="text-lg font-medium text-choco">{t.biznesi}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t.emriBiznesit} name="businessName" defaultValue={settings.businessName ?? ""} />
          <Field label={t.llojiBiznesit} name="businessType" defaultValue={settings.businessType ?? ""} />
          <TextArea
            label={t.pershkrimiBiznesit}
            name="businessDescription"
            defaultValue={settings.businessDescription ?? ""}
          />
          <Field label={t.kontaktTelefon} name="businessPhone" defaultValue={settings.businessPhone ?? ""} />
          <Field label={t.kontaktEmail} name="businessEmail" defaultValue={settings.businessEmail ?? ""} />
          <Field label={t.kontaktAdresa} name="businessAddress" defaultValue={settings.businessAddress ?? ""} />
          <Field label={t.qytetiBiznesit} name="businessCity" defaultValue={settings.businessCity ?? ""} />
          <Field label={t.shtetiBiznesit} name="businessCountry" defaultValue={settings.businessCountry ?? ""} />
        </div>
      </section>

      <section className="rounded-xl border border-beige bg-ivory p-6">
        <h2 className="text-lg font-medium text-choco">{t.googleAnalytics}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="GA4 Measurement ID"
            name="ga4MeasurementId"
            defaultValue={settings.ga4MeasurementId ?? ""}
          />
          <Field
            label={t.verifikimiGoogle}
            name="googleSiteVerification"
            defaultValue={settings.googleSiteVerification ?? ""}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-choco px-8 py-3 text-sm uppercase tracking-widest text-ivory hover:bg-choco-soft disabled:opacity-50"
      >
        {pending ? t.dukeUDerguar : t.ruaj}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-choco">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-beige bg-cream px-4 py-3 text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-sm text-choco">{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-beige bg-cream px-4 py-3 text-sm"
      />
    </label>
  );
}
