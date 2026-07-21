"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    let referrer: string | null = null;
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.hostname !== window.location.hostname) {
          referrer = document.referrer;
        }
      } catch {
        referrer = null;
      }
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
