type Bucket = {
  count: number;
  windowStart: number;
};

const IP_BUCKETS = new Map<string, Bucket>();
const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_MAX = 25;
const SESSION_MAX_MESSAGES = 50;

export interface RateLimitResult {
  blocked: boolean;
  retryAfterSec: number;
  reason?: "ip" | "session";
}

export function checkIpRateLimit(ipKey: string): RateLimitResult {
  if (!ipKey) return { blocked: false, retryAfterSec: 0 };
  const now = Date.now();
  const bucket = IP_BUCKETS.get(ipKey);

  if (!bucket || now - bucket.windowStart > IP_WINDOW_MS) {
    IP_BUCKETS.set(ipKey, { count: 1, windowStart: now });
    return { blocked: false, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > IP_MAX) {
    return {
      blocked: true,
      retryAfterSec: Math.ceil((bucket.windowStart + IP_WINDOW_MS - now) / 1000),
      reason: "ip",
    };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function checkSessionMessageLimit(currentCount: number): RateLimitResult {
  if (currentCount >= SESSION_MAX_MESSAGES) {
    return { blocked: true, retryAfterSec: 0, reason: "session" };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function getMaxSessionMessages(): number {
  return SESSION_MAX_MESSAGES;
}
