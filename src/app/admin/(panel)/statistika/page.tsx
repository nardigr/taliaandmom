import { headers } from "next/headers";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { getAnalyticsStats, type AnalyticsPeriod } from "@/lib/analytics/queries";
import { getClientIp } from "@/lib/analytics/track";
import { getSetting } from "@/lib/settings";
import { getCurrency } from "@/lib/settings";

type PageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AdminStatistikaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const daysRaw = Number.parseInt(params.days ?? "7", 10);
  const days = ([1, 7, 14, 30, 90].includes(daysRaw) ? daysRaw : 7) as AnalyticsPeriod;

  const [stats, currency, excludedIps] = await Promise.all([
    getAnalyticsStats(days),
    getCurrency(),
    getSetting("analyticsExcludedIps"),
  ]);

  const headerStore = await headers();
  const currentIp = getClientIp(headerStore);

  return (
    <AnalyticsDashboard
      stats={stats}
      currency={currency}
      excludedIps={excludedIps ?? ""}
      currentIp={currentIp}
    />
  );
}
