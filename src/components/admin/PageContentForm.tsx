"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  resetPageContentAction,
  savePageContentAction,
  type AdminActionState,
} from "@/lib/admin/cms-actions";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { ContentOverrides } from "@/lib/page-content/resolve";
import { getPageDefaults } from "@/lib/page-content/defaults";
import type { EditablePage } from "@/lib/page-content/schema";
import { CATEGORIES } from "@/lib/config";
import { t } from "@/lib/i18n/sq";

type PageContentFormProps = {
  page: EditablePage;
  overrides: ContentOverrides;
  collections?: { slug: string; label: string }[];
};

type SectionState = {
  sectionKey: string;
  value: string;
  imageUrl: string;
};

type CarouselSlideDraft = {
  url: string;
  href: string;
};

function buildCarouselLinkOptions(collections: { slug: string; label: string }[]) {
  return [
    { value: "/koleksioni", label: "Koleksioni (të gjitha)" },
    ...collections.map((season) => ({
      value: `/koleksioni/${season.slug}`,
      label: `Koleksioni — ${season.label}`,
    })),
    ...CATEGORIES.map((category) => ({
      value: `/koleksioni?kategoria=${category.slug}`,
      label: `Kategoria — ${category.label}`,
    })),
  ];
}

function parseCarouselSlides(value: string): CarouselSlideDraft[] {
  if (!value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): CarouselSlideDraft | null => {
        if (typeof item === "string") {
          const url = item.trim();
          return url ? { url, href: "/koleksioni" } : null;
        }
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const url = typeof record.url === "string" ? record.url.trim() : "";
          if (!url) return null;
          const href =
            typeof record.href === "string" && record.href.startsWith("/")
              ? record.href.trim()
              : "/koleksioni";
          return { url, href };
        }
        return null;
      })
      .filter((item): item is CarouselSlideDraft => item !== null);
  } catch {
    return [];
  }
}

export function PageContentForm({
  page,
  overrides,
  collections = [],
}: PageContentFormProps) {
  const defaults = useMemo(() => getPageDefaults(page.slug), [page.slug]);
  const carouselLinkOptions = useMemo(
    () => buildCarouselLinkOptions(collections),
    [collections],
  );
  const initialSections = useMemo<SectionState[]>(
    () =>
      page.sections.map((section) => ({
        sectionKey: section.key,
        value: overrides[section.key]?.value ?? defaults[section.key] ?? "",
        imageUrl: overrides[section.key]?.imageUrl ?? "",
      })),
    [page.sections, overrides, defaults],
  );

  const [sections, setSections] = useState(initialSections);
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    savePageContentAction,
    {},
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof page.sections>();
    for (const section of page.sections) {
      const group = section.group ?? "";
      const list = map.get(group) ?? [];
      list.push(section);
      map.set(group, list);
    }
    return [...map.entries()];
  }, [page.sections]);

  function updateSection(key: string, patch: Partial<SectionState>) {
    setSections((current) =>
      current.map((section) =>
        section.sectionKey === key ? { ...section, ...patch } : section,
      ),
    );
  }

  async function handleReset() {
    if (!confirm(t.konfirmoFshirjen)) return;
    await resetPageContentAction(page.slug);
    window.location.reload();
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="pageSlug" value={page.slug} />
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/faqet" className="text-sm text-choco-soft hover:text-choco">
            ← {t.kthehuTeFaqet}
          </Link>
          <h1 className="mt-2 font-display text-3xl text-choco">{page.label}</h1>
          <p className="mt-1 text-sm text-choco-soft">{page.path}</p>
          {page.slug === "home" ? (
            <p className="mt-3 max-w-2xl text-sm text-choco-soft">
              {t.kryefaqjaAdminNdihme}{" "}
              <Link href="/admin/cilesimet" className="text-choco underline">
                {t.cilesimet}
              </Link>
              .
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void handleReset()}
            className="rounded-full border border-beige px-5 py-2 text-sm text-choco hover:bg-cream"
          >
            {t.rivendosDefault}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-choco px-6 py-2 text-sm uppercase tracking-widest text-ivory hover:bg-choco-soft disabled:opacity-50"
          >
            {pending ? t.dukeUDerguar : t.ruaj}
          </button>
        </div>
      </div>

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

      <div className="space-y-10">
        {groups.map(([groupName, groupSections]) => (
          <div key={groupName || "default"} className="space-y-6">
            {groupName ? (
              <h2 className="font-display text-2xl text-choco">{groupName}</h2>
            ) : null}
            {groupSections.map((section) => {
              const current = sections.find((item) => item.sectionKey === section.key)!;
              return (
                <div key={section.key} className="rounded-xl border border-beige bg-ivory p-6">
                  <label className="block text-sm font-medium text-choco">
                    {section.label}
                  </label>
                  {section.help ? (
                    <p className="mt-1 text-xs text-choco-soft">{section.help}</p>
                  ) : null}
                  <div className="mt-3">
                    {section.type === "text" ? (
                      <textarea
                        rows={3}
                        value={current.value}
                        onChange={(event) =>
                          updateSection(section.key, { value: event.target.value })
                        }
                        className="w-full rounded-lg border border-beige bg-cream px-4 py-3 text-sm text-ink"
                      />
                    ) : null}
                    {section.type === "richText" ? (
                      <RichTextEditor
                        value={current.value}
                        onChange={(value) => updateSection(section.key, { value })}
                      />
                    ) : null}
                    {section.type === "image" ? (
                      <ContentImageUpload
                        value={current.imageUrl || current.value}
                        onChange={(url) =>
                          updateSection(section.key, { imageUrl: url, value: url })
                        }
                      />
                    ) : null}
                    {section.type === "images" ? (
                      <CarouselImagesField
                        slides={parseCarouselSlides(current.value)}
                        linkOptions={carouselLinkOptions}
                        onChange={(slides) =>
                          updateSection(section.key, {
                            value: JSON.stringify(slides),
                          })
                        }
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </form>
  );
}

function CarouselImagesField({
  slides,
  linkOptions,
  onChange,
}: {
  slides: CarouselSlideDraft[];
  linkOptions: { value: string; label: string }[];
  onChange: (slides: CarouselSlideDraft[]) => void;
}) {
  function updateSlide(index: number, patch: Partial<CarouselSlideDraft>) {
    onChange(
      slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
  }

  return (
    <div className="space-y-4">
      {slides.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {slides.map((slide, index) => {
            const displayUrl =
              slide.url.startsWith("http") || slide.url.startsWith("/")
                ? slide.url
                : `/api/uploads/${slide.url}`;
            const knownHref = linkOptions.some(
              (option) => option.value === slide.href,
            );

            return (
              <li
                key={`${slide.url}-${index}`}
                className="space-y-3 rounded-lg border border-beige bg-cream p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt=""
                  className="aspect-video w-full rounded object-cover"
                />

                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-choco-soft">
                    {t.carouselLidhja}
                  </span>
                  <select
                    value={knownHref ? slide.href : "__custom__"}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "__custom__") {
                        updateSlide(index, { href: "/koleksioni/" });
                        return;
                      }
                      updateSlide(index, { href: value });
                    }}
                    className="mt-2 w-full rounded-lg border border-beige bg-ivory px-3 py-2 text-sm text-ink"
                  >
                    {linkOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="__custom__">{t.carouselLidhjePersonalizuar}</option>
                  </select>
                </label>

                {!knownHref ? (
                  <input
                    value={slide.href}
                    onChange={(event) =>
                      updateSlide(index, { href: event.target.value || "/koleksioni" })
                    }
                    placeholder="/koleksioni/vere"
                    className="w-full rounded-lg border border-beige bg-ivory px-3 py-2 text-sm text-ink"
                  />
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...slides];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                    className="rounded-full border border-beige px-3 py-1 text-xs disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => {
                      const next = [...slides];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      onChange(next);
                    }}
                    className="rounded-full border border-beige px-3 py-1 text-xs disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(slides.filter((_, i) => i !== index))}
                    className="rounded-full border border-beige px-3 py-1 text-xs text-choco hover:bg-rose-soft"
                  >
                    {t.hiq}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ContentImageUpload
        value=""
        onChange={(url) => {
          if (url) onChange([...slides, { url, href: "/koleksioni" }]);
        }}
      />
    </div>
  );
}
