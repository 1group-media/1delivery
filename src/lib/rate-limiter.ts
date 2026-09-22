interface RateLimitRecord {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __delivery_rate_limit_map: Map<string, RateLimitRecord> | undefined;
}

const rateLimitMap = globalThis.__delivery_rate_limit_map || new Map<string, RateLimitRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__delivery_rate_limit_map = rateLimitMap;
}

export function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetInSec: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetInSec: Math.ceil((record.resetAt - now) / 1000) };
}
