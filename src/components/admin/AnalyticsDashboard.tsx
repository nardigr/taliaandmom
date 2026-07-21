"use client";

import Link from "next/link";
import { AnalyticsExcludedIpsForm } from "@/components/admin/AnalyticsExcludedIpsForm";
import type { AnalyticsStats } from "@/lib/analytics/queries";
import { formatPrice } from "@/lib/money";
import { t } from "@/lib/i18n/sq";

type AnalyticsDashboardProps = {
  stats: AnalyticsStats;
  currency: "EUR" | "LEK";
  excludedIps: string;
  currentIp: string;
};

const PERIODS = [1, 7, 30, 90] as const;

export function AnalyticsDashboard({
  stats,
  currency,
  excludedIps,
  currentIp,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-choco">{t.statistika}</h1>
          <p className="mt-2 text-sm text-choco-soft">
            {stats.days} {t.ditë}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((days) => (
            <Link
              key={days}
              href={`/admin/statistika?days=${days}`}
              className={`rounded-full px-4 py-2 text-sm ${
                stats.days === days
                  ? "bg-choco text-ivory"
                  : "border border-beige bg-cream text-choco"
              }`}
            >
              {days} {t.ditë}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t.vizitatTotale} value={String(stats.totalViews)} />
        <StatCard label={t.porosi} value={String(stats.ordersInPeriod)} />
        <StatCard
          label={t.teArdhura}
          value={formatPrice(stats.revenueCentsInPeriod, currency)}
        />
        <StatCard
          label={t.konvertimi}
          value={`${stats.conversionRate.toFixed(2)}%`}
        />
      </div>

      <section className="rounded-xl border border-beige bg-ivory p-6">
        <h2 className="text-lg font-medium text-choco">{t.faqetMeTeVizituara}</h2>
        <StatRows
          items={stats.topPages.map((item) => ({ name: item.path, count: item.count }))}
          suffix={t.vizita}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.referuesit}</h2>
          <StatRows items={stats.topReferrers} suffix={t.vizita} />
        </section>
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.pajisjet}</h2>
          <StatRows items={stats.deviceStats} suffix={t.vizita} />
        </section>
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.shfletuesit}</h2>
          <StatRows items={stats.browserStats} suffix={t.vizita} />
        </section>
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.vendet}</h2>
          <StatRows items={stats.countryStats} suffix={t.vizita} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.produktetMeTeVizituara}</h2>
          <StatRows
            items={stats.topProductsByViews.map((item) => ({
              name: item.slug,
              count: item.count,
            }))}
            suffix={t.vizita}
          />
        </section>
        <section className="rounded-xl border border-beige bg-ivory p-6">
          <h2 className="text-lg font-medium text-choco">{t.produktetMeTeShitura}</h2>
          <StatRows items={stats.topProductsByOrders} suffix={t.porosi} />
        </section>
      </div>

      <section className="rounded-xl border border-beige bg-ivory p-6">
        <h2 className="text-lg font-medium text-choco">{t.ipTePerjashtuara}</h2>
        <div className="mt-4">
          <AnalyticsExcludedIpsForm defaultValue={excludedIps} currentIp={currentIp} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-beige bg-cream p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-choco-soft">{label}</p>
      <p className="mt-3 font-display text-3xl text-choco">{value}</p>
    </div>
  );
}

function StatRows({
  items,
  suffix,
}: {
  items: { name: string; count: number }[];
  suffix: string;
}) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-choco-soft">—</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between rounded-lg border border-beige bg-cream px-4 py-3 text-sm"
        >
          <span className="text-ink">{item.name}</span>
          <span className="font-medium text-choco">
            {item.count} {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}
