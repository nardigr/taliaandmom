import { CustomersTable } from "@/components/admin/AdminTables";
import { t } from "@/lib/i18n/sq";

type PageProps = {
  searchParams: Promise<{ q?: string; city?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-choco">{t.klientet}</h1>
        <a
          href="/api/admin/export/customers"
          className="rounded-lg border border-beige bg-cream px-4 py-2 text-sm text-choco hover:bg-ivory"
        >
          {t.eksportoKlientet}
        </a>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder={t.kerkoKliente}
          className="min-w-[220px] flex-1 rounded-lg border border-beige bg-ivory px-4 py-2 text-sm"
        />
        <input
          name="city"
          defaultValue={params.city}
          placeholder={t.qyteti}
          className="rounded-lg border border-beige bg-ivory px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-choco px-4 py-2 text-sm text-ivory hover:bg-choco-soft"
        >
          {t.kerko}
        </button>
      </form>

      <CustomersTable query={params.q} city={params.city} />
    </div>
  );
}
