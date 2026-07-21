import type { Metadata } from "next";
import {
  PlaceholderNotice,
  StaticPageLayout,
} from "@/components/content/StaticPageLayout";
import { RichHtml } from "@/components/content/RichHtml";
import { getPageContentOverrides } from "@/lib/page-content/get-overrides";
import { hasContentOverrides, resolveContentOverride } from "@/lib/page-content/resolve";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { t } from "@/lib/i18n/sq";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    pageSlug: "rreth-nesh",
    fallbackTitle: t.rrethNesh,
    fallbackDescription: t.rrethNeshMeta,
    path: "/rreth-nesh",
  });
}

export default async function RrethNeshPage() {
  const overrides = await getPageContentOverrides("rreth-nesh");
  const keys = ["paragraph1", "paragraph2", "paragraph3"];
  const showPlaceholder = !hasContentOverrides(overrides, keys);

  return (
    <StaticPageLayout title={t.rrethNesh}>
      {showPlaceholder ? <PlaceholderNotice /> : null}
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph1", t.rrethNeshParagraf1)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph2", t.rrethNeshParagraf2)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph3", t.rrethNeshParagraf3)}
      />
    </StaticPageLayout>
  );
}
