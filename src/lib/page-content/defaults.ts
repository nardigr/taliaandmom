import { t } from "@/lib/i18n/sq";
import { getEditablePage, type ContentSection } from "@/lib/page-content/schema";

export function getSectionDefault(section: ContentSection): string {
  if (!section.defaultKey) return "";
  const key = section.defaultKey as keyof typeof t;
  return t[key] ?? "";
}

export function getPageDefaults(pageSlug: string): Record<string, string> {
  const page = getEditablePage(pageSlug);
  if (!page) return {};

  return Object.fromEntries(
    page.sections.map((section) => [section.key, getSectionDefault(section)]),
  );
}
