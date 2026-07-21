import type { Metadata } from "next";
import {
  PlaceholderNotice,
  StaticPageLayout,
} from "@/components/content/StaticPageLayout";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { getPageContentOverrides } from "@/lib/page-content/get-overrides";
import { resolveContentOverride } from "@/lib/page-content/resolve";
import { t } from "@/lib/i18n/sq";
import { getContactSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    pageSlug: "kontakt",
    fallbackTitle: t.kontakt,
    fallbackDescription: t.kontaktMeta,
    path: "/kontakt",
  });
}

export default async function KontaktPage() {
  const [contact, overrides] = await Promise.all([
    getContactSettings(),
    getPageContentOverrides("kontakt"),
  ]);
  const intro = resolveContentOverride(overrides, "intro", t.kontaktIntro);
  const whatsappHref = `https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <StaticPageLayout title={t.kontakt}>
      {intro.includes("PLACEHOLDER") ? <PlaceholderNotice /> : null}
      <p>{intro}</p>

      <dl className="mt-6 space-y-4 rounded-lg border border-beige bg-cream p-6">
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-choco-soft">
            {t.kontaktAdresa}
          </dt>
          <dd className="mt-1 text-ink">{contact.contactAddress}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-choco-soft">
            {t.kontaktTelefon}
          </dt>
          <dd className="mt-1">
            <a
              href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
              className="text-ink transition-colors hover:text-choco"
            >
              {contact.contactPhone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-choco-soft">
            {t.kontaktEmail}
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${contact.contactEmail}`}
              className="text-ink transition-colors hover:text-choco"
            >
              {contact.contactEmail}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-choco-soft">
            {t.kontaktWhatsApp}
          </dt>
          <dd className="mt-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink transition-colors hover:text-choco"
            >
              {t.naShkruaniWhatsApp}
            </a>
          </dd>
        </div>
      </dl>
    </StaticPageLayout>
  );
}
