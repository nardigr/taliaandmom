export type ContentOverrides = Record<string, { value: string; imageUrl?: string | null }>;

export function resolveContentOverride(
  overrides: ContentOverrides,
  sectionKey: string,
  fallback: string,
): string {
  const entry = overrides[sectionKey];
  const value = entry?.value;
  return value != null && value.trim() !== "" ? value : fallback;
}

export function resolveImageOverride(
  overrides: ContentOverrides,
  sectionKey: string,
  fallback?: string | null,
): string | null {
  const entry = overrides[sectionKey];
  if (entry?.imageUrl?.trim()) return entry.imageUrl;
  if (entry?.value?.trim()) return entry.value;
  return fallback ?? null;
}

/** A homepage carousel slide stored in page-content JSON. */
export type CarouselSlideContent = {
  url: string;
  href: string;
};

function normalizeCarouselItem(item: unknown): CarouselSlideContent | null {
  if (typeof item === "string") {
    const url = item.trim();
    if (!url) return null;
    return { url, href: "/koleksioni" };
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url.trim() : "";
    if (!url) return null;
    const hrefRaw = typeof record.href === "string" ? record.href.trim() : "";
    const href = hrefRaw.startsWith("/") ? hrefRaw : "/koleksioni";
    return { url, href };
  }

  return null;
}

/** Parse carousel slides (supports legacy string[] and {url, href}[]). */
export function resolveCarouselSlides(
  overrides: ContentOverrides,
  sectionKey: string,
): CarouselSlideContent[] {
  const raw = overrides[sectionKey]?.value?.trim();
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeCarouselItem)
      .filter((item): item is CarouselSlideContent => item !== null);
  } catch {
    return [];
  }
}

/** @deprecated Prefer resolveCarouselSlides — kept for simple URL-only lists. */
export function resolveImageListOverride(
  overrides: ContentOverrides,
  sectionKey: string,
): string[] {
  return resolveCarouselSlides(overrides, sectionKey).map((slide) => slide.url);
}

export function hasContentOverrides(overrides: ContentOverrides, sectionKeys: string[]) {
  return sectionKeys.some((key) => {
    const entry = overrides[key];
    return Boolean(entry?.value?.trim() || entry?.imageUrl?.trim());
  });
}
