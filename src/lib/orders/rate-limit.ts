const MAX_ORDERS_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

const ordersByIp = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ordersByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  ordersByIp.set(ip, timestamps);
  return timestamps.length >= MAX_ORDERS_PER_HOUR;
}

export function recordOrderAttempt(ip: string): void {
  const now = Date.now();
  const timestamps = (ordersByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  timestamps.push(now);
  ordersByIp.set(ip, timestamps);
}
