import Link from "next/link";
import { Category } from "@prisma/client";
import {
  getProductCountsBySeasonCategory,
  ProductsCategorySection,
  ProductsTable,
} from "@/components/admin/AdminTables";
import { Button } from "@/components/ui/Button";
import { getCategoriesForSeason } from "@/lib/catalog/filters";
import { getAllCollections } from "@/lib/collections";
import type { SeasonKey } from "@/lib/config";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    season?: string;
    category?: string;
    outOfStock?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const collections = await getAllCollections();
  const season = collections.some((c) => c.slug === params.season)
    ? params.season
    : undefined;
  const outOfStock = params.outOfStock === "1";
  const counts = await getProductCountsBySeasonCategory();
  const outOfStockCount = await db.product.count({ where: { inStock: false } });

  if (outOfStock && !season) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Link
            href="/admin/produktet"
            className="text-sm text-choco-soft hover:text-choco"
          >
            {t.kthehuTeKoleksionet}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-4xl text-choco">
              {t.jashteStokutFilter}
            </h1>
          </div>
        </div>
        <ProductsTable outOfStock query={params.q} />
      </div>
    );
  }

  if (season) {
    const seasonMeta = collections.find((c) => c.slug === season)!;
    const categories = getCategoriesForSeason(season as SeasonKey);
    const addHref = `/admin/produktet/i-ri?season=${season}`;

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-choco-soft">
            <Link href="/admin/produktet" className="hover:text-choco">
              {t.produktet}
            </Link>
            <span>/</span>
            <span className="text-choco">{seasonMeta.label}</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-4xl text-choco">{seasonMeta.label}</h1>
            <Button href={addHref}>{t.shtoProdukt}</Button>
          </div>
          <p className="text-sm text-choco-soft">
            {counts.bySeason[season] ?? 0} {t.produkteNeKoleksion}
          </p>
        </div>

        <form method="get" className="max-w-md">
          <input type="hidden" name="season" value={season} />
          <input
            name="q"
            defaultValue={params.q}
            placeholder={t.kerkoProdukte}
            className="w-full rounded-lg border border-beige bg-ivory px-4 py-3"
          />
        </form>

        {params.q ? (
          <ProductsTable season={season} query={params.q} />
        ) : (
          <div className="space-y-6">
            {categories.map((c) => (
              <ProductsCategorySection
                key={c.key}
                season={season}
                category={c.key as Category}
                categoryLabel={c.label}
                count={counts.byCategory[`${season}:${c.key}`] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-choco">{t.produktet}</h1>
          <p className="mt-2 text-sm text-choco-soft">{t.zgjidhKoleksionin}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/koleksionet" variant="secondary">
            {t.koleksionet}
          </Button>
          <Button href="/admin/produktet/i-ri">{t.shtoProdukt}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((s) => {
          const count = counts.bySeason[s.slug] ?? 0;
          return (
            <Link
              key={s.slug}
              href={`/admin/produktet?season=${s.slug}`}
              className={cn(
                "group rounded-xl border border-beige bg-cream p-6 transition-colors",
                "hover:border-choco hover:bg-ivory",
                !s.active && "opacity-60",
              )}
            >
              <h2 className="font-display text-3xl text-choco">{s.label}</h2>
              <p className="mt-2 text-sm text-choco-soft">
                {count} {t.produkteNeKoleksion}
                {!s.active ? ` · ${t.jo}` : ""}
              </p>
              <p className="mt-6 text-sm text-choco group-hover:underline">
                {t.menaxhoKoleksionin} →
              </p>
            </Link>
          );
        })}
      </div>

      <Link
        href="/admin/produktet?outOfStock=1"
        className={cn(
          "block rounded-xl border border-beige bg-cream p-5 transition-colors",
          outOfStockCount > 0
            ? "border-rose-deep/40 hover:bg-rose-soft"
            : "hover:bg-ivory",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-choco">{t.jashteStokutFilter}</h2>
          <span
            className={cn(
              "text-sm",
              outOfStockCount > 0 ? "text-rose-deep" : "text-choco-soft",
            )}
          >
            {outOfStockCount} {t.produkteNeKoleksion}
          </span>
        </div>
      </Link>
    </div>
  );
}
