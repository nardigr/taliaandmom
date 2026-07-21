export function classifyDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (/bot|spider|crawler|slurp|facebookexternalhit|whatsapp|telegrambot/.test(ua)) {
    return "Bot";
  }
  if (/ipad|tablet|kindle|playbook|silk/.test(ua)) return "Tablet";
  if (/mobile|android|iphone|ipod/.test(ua)) return "Mobile";
  return "Desktop";
}

export function detectBrowser(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("samsungbrowser/")) return "Samsung Internet";
  if (ua.includes("chrome/") && !ua.includes("edg/") && !ua.includes("opr/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  return "Other";
}

export function normalizeReferrer(referrer: string | null, host: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const refHost = url.hostname.replace(/^www\./, "");
    const ownHost = (host ?? "").replace(/^www\./, "").split(":")[0];
    if (ownHost && refHost === ownHost) return null;
    return referrer;
  } catch {
    return null;
  }
}

export function isExcludedIp(ip: string, excludedRaw: string | null | undefined): boolean {
  if (!excludedRaw?.trim() || !ip) return false;
  const list = excludedRaw.split(/[\n,]+/).map((entry) => entry.trim()).filter(Boolean);
  return list.includes(ip);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}

export function shouldTrackPath(path: string): boolean {
  if (path.startsWith("/admin") || path.startsWith("/api")) return false;
  return true;
}
