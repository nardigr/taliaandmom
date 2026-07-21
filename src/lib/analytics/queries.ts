import { db } from "@/lib/db";

export type AnalyticsPeriod = 1 | 7 | 14 | 30 | 90;

export type AnalyticsStats = {
  totalViews: number;
  chartData: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topReferrers: { name: string; count: number }[];
  deviceStats: { name: string; count: number }[];
  browserStats: { name: string; count: number }[];
  countryStats: { name: string; count: number }[];
  ordersInPeriod: number;
  revenueCentsInPeriod: number;
  conversionRate: number;
  topProductsByViews: { slug: string; count: number }[];
  topProductsByOrders: { name: string; count: number }[];
  days: number;
};

function startDate(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));
  return date;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getAnalyticsStats(days: AnalyticsPeriod): Promise<AnalyticsStats> {
  const since = startDate(days);

  const views = await db.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: {
      path: true,
      referrer: true,
      deviceType: true,
      browser: true,
      country: true,
      createdAt: true,
    },
  });

  const orders = await db.order.findMany({
    where: { createdAt: { gte: since }, status: { not: "ANULUAR" } },
    select: {
      totalCents: true,
      items: { select: { nameSnapshot: true, quantity: true } },
    },
  });

  const chartMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    chartMap.set(formatDateKey(d), 0);
  }

  const pageMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const productViewMap = new Map<string, number>();

  for (const view of views) {
    const dayKey = formatDateKey(view.createdAt);
    chartMap.set(dayKey, (chartMap.get(dayKey) ?? 0) + 1);
    pageMap.set(view.path, (pageMap.get(view.path) ?? 0) + 1);

    const refLabel = view.referrer
      ? (() => {
          try {
            return new URL(view.referrer).hostname.replace(/^www\./, "");
          } catch {
            return "Tjetër";
          }
        })()
      : "Direkt";
    referrerMap.set(refLabel, (referrerMap.get(refLabel) ?? 0) + 1);

    if (view.deviceType) {
      deviceMap.set(view.deviceType, (deviceMap.get(view.deviceType) ?? 0) + 1);
    }
    if (view.browser) {
      browserMap.set(view.browser, (browserMap.get(view.browser) ?? 0) + 1);
    }
    if (view.country) {
      countryMap.set(view.country, (countryMap.get(view.country) ?? 0) + 1);
    }

    const productMatch = view.path.match(/^\/produkt\/([^/?]+)/);
    if (productMatch?.[1]) {
      productViewMap.set(productMatch[1], (productViewMap.get(productMatch[1]) ?? 0) + 1);
    }
  }

  const productOrderMap = new Map<string, number>();
  let revenueCentsInPeriod = 0;
  for (const order of orders) {
    revenueCentsInPeriod += order.totalCents;
    for (const item of order.items) {
      productOrderMap.set(
        item.nameSnapshot,
        (productOrderMap.get(item.nameSnapshot) ?? 0) + item.quantity,
      );
    }
  }

  const toSorted = (map: Map<string, number>, limit = 10) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

  const totalViews = views.length;
  const ordersInPeriod = orders.length;

  return {
    totalViews,
    chartData: [...chartMap.entries()].map(([date, count]) => ({ date, count })),
    topPages: [...pageMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count })),
    topReferrers: toSorted(referrerMap),
    deviceStats: toSorted(deviceMap),
    browserStats: toSorted(browserMap),
    countryStats: toSorted(countryMap),
    ordersInPeriod,
    revenueCentsInPeriod,
    conversionRate: totalViews > 0 ? (ordersInPeriod / totalViews) * 100 : 0,
    topProductsByViews: [...productViewMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([slug, count]) => ({ slug, count })),
    topProductsByOrders: [...productOrderMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    days,
  };
}
