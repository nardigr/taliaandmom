import { PageSeoList } from "@/components/admin/PageSeoList";
import { SeoSettingsForm } from "@/components/admin/SeoSettingsForm";
import { getAllPageSeo } from "@/lib/seo/page-seo";
import { getSeoSettings } from "@/lib/seo/settings";
import { t } from "@/lib/i18n/sq";

export default async function AdminSeoPage() {
  const [settings, pageSeoRows] = await Promise.all([getSeoSettings(), getAllPageSeo()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-choco">{t.seo}</h1>
        <p className="mt-2 text-sm text-choco-soft">{t.seoGlobale}</p>
      </div>

      <SeoSettingsForm settings={settings} />

      <div>
        <h2 className="font-display text-2xl text-choco">{t.seoPerFaqe}</h2>
        <div className="mt-6">
          <PageSeoList rows={pageSeoRows} />
        </div>
      </div>
    </div>
  );
}
