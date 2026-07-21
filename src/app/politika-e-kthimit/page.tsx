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
    pageSlug: "politika-e-kthimit",
    fallbackTitle: t.politikaKthimit,
    fallbackDescription: t.politikaKthimitMeta,
    path: "/politika-e-kthimit",
  });
}

export default async function PolitikaKthimitPage() {
  const overrides = await getPageContentOverrides("politika-e-kthimit");
  const keys = ["paragraph1", "paragraph2", "paragraph3"];
  const showPlaceholder = !hasContentOverrides(overrides, keys);

  return (
    <StaticPageLayout title={t.politikaKthimit}>
      {showPlaceholder ? <PlaceholderNotice /> : null}
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph1", t.politikaKthimitParagraf1)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph2", t.politikaKthimitParagraf2)}
      />
      <RichHtml
        html={resolveContentOverride(overrides, "paragraph3", t.politikaKthimitParagraf3)}
      />
    </StaticPageLayout>
  );
}
