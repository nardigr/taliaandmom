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
    pageSlug: "kushtet-e-perdorimit",
    fallbackTitle: t.kushtetPerdorimit,
    fallbackDescription: t.kushtetMeta,
    path: "/kushtet-e-perdorimit",
  });
}

export default async function KushtetPerdorimitPage() {
  const overrides = await getPageContentOverrides("kushtet-e-perdorimit");
  const keys = ["paragraph1", "paragraph2", "paragraph3"];
  const showPlaceholder = !hasContentOverrides(overrides, keys);

  return (
    <StaticPageLayout title={t.kushtetPerdorimit}>
      {showPlaceholder ? <PlaceholderNotice /> : null}
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph1", t.kushtetParagraf1)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph2", t.kushtetParagraf2)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph3", t.kushtetParagraf3)}
      />
    </StaticPageLayout>
  );
}
