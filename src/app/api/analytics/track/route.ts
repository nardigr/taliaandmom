import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import {
  classifyDevice,
  detectBrowser,
  getClientIp,
  isExcludedIp,
  normalizeReferrer,
  shouldTrackPath,
} from "@/lib/analytics/track";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path : "/";
    if (!shouldTrackPath(path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const headers = request.headers;
    const userAgent = headers.get("user-agent");
    if (userAgent && classifyDevice(userAgent) === "Bot") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip = getClientIp(headers);
    const excludedIps = await getSetting("analyticsExcludedIps");
    if (isExcludedIp(ip, excludedIps)) {
      return NextResponse.json({ ok: true, excluded: true });
    }

    const referrer = normalizeReferrer(
      typeof body.referrer === "string" ? body.referrer : null,
      headers.get("host"),
    );

    await db.pageView.create({
      data: {
        path,
        referrer,
        userAgent,
        country:
          headers.get("cf-ipcountry") ??
          headers.get("x-vercel-ip-country") ??
          null,
        city: headers.get("x-vercel-ip-city") ?? null,
        deviceType: classifyDevice(userAgent),
        browser: detectBrowser(userAgent),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
