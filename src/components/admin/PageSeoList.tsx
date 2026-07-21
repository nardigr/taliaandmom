"use client";

import { useActionState, useState } from "react";
import {
  deletePageSeoAction,
  savePageSeoAction,
  type AdminActionState,
} from "@/lib/admin/seo-actions";
import { PAGE_SEO_PRESETS } from "@/lib/page-content/schema";
import { t } from "@/lib/i18n/sq";

type PageSeoRow = {
  id: string;
  pageSlug: string;
  pageTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  isActive: boolean;
};

type PageSeoListProps = {
  rows: PageSeoRow[];
};

export function PageSeoList({ rows }: PageSeoListProps) {
  const [editing, setEditing] = useState<PageSeoRow | null>(
    rows[0] ?? {
      id: "",
      pageSlug: PAGE_SEO_PRESETS[0].slug,
      pageTitle: null,
      metaDescription: null,
      metaKeywords: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      isActive: true,
    },
  );
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    savePageSeoAction,
    {},
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PAGE_SEO_PRESETS.map((preset) => {
          const row = rows.find((item) => item.pageSlug === preset.slug);
          return (
            <button
              key={preset.slug}
              type="button"
              onClick={() =>
                setEditing(
                  row ?? {
                    id: "",
                    pageSlug: preset.slug,
                    pageTitle: null,
                    metaDescription: null,
                    metaKeywords: null,
                    ogTitle: null,
                    ogDescription: null,
                    ogImage: null,
                    isActive: true,
                  },
                )
              }
              className={`rounded-full px-4 py-2 text-sm ${
                editing?.pageSlug === preset.slug
                  ? "bg-choco text-ivory"
                  : "border border-beige bg-cream text-choco"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {editing ? (
        <form action={formAction} className="rounded-xl border border-beige bg-ivory p-6">
          <input type="hidden" name="pageSlug" value={editing.pageSlug} />
          <h3 className="font-display text-xl text-choco">{editing.pageSlug}</h3>

          {state.error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {state.success}
            </p>
          ) : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={t.titulliSeo} name="pageTitle" defaultValue={editing.pageTitle ?? ""} />
            <Field
              label={t.fjaleKycSeo}
              name="metaKeywords"
              defaultValue={editing.metaKeywords ?? ""}
            />
            <TextArea
              label={t.pershkrimiSeo}
              name="metaDescription"
              defaultValue={editing.metaDescription ?? ""}
            />
            <Field label="OG title" name="ogTitle" defaultValue={editing.ogTitle ?? ""} />
            <TextArea
              label="OG description"
              name="ogDescription"
              defaultValue={editing.ogDescription ?? ""}
            />
            <Field label={t.imazhiOg} name="ogImage" defaultValue={editing.ogImage ?? ""} />
            <label className="block">
              <span className="text-sm text-choco">{t.statusi}</span>
              <select
                name="isActive"
                defaultValue={editing.isActive ? "true" : "false"}
                className="mt-2 w-full rounded-lg border border-beige bg-cream px-4 py-3 text-sm"
              >
                <option value="true">{t.aktiv}</option>
                <option value="false">{t.joaktiv}</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-choco px-6 py-2 text-sm uppercase tracking-widest text-ivory"
            >
              {pending ? t.dukeUDerguar : t.ruaj}
            </button>
            {rows.some((row) => row.pageSlug === editing.pageSlug) ? (
              <button
                type="button"
                onClick={() => void deletePageSeoAction(editing.pageSlug).then(() => window.location.reload())}
                className="rounded-full border border-beige px-6 py-2 text-sm text-choco"
              >
                {t.fshi}
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
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
