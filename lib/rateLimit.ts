import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback — works locally and within a single serverless instance.
// In production on Vercel, configure KV_REST_API_URL so limits are shared across instances.
const rateLimitStore = new Map<string, RateLimitEntry>();

if (!process.env.KV_REST_API_URL && process.env.NODE_ENV === 'production') {
  console.warn('[RateLimit] KV_REST_API_URL is not set — rate limiting falls back to in-memory, which is not shared across serverless instances.');
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 10 * 60 * 1000);

const kvEnabled = Boolean(process.env.KV_REST_API_URL);

export interface RateLimitConfig {
  name: string;       // Used as part of the KV key — must be unique per limiter
  windowMs: number;
  maxRequests: number;
}

async function incrementKvCounter(key: string, windowMs: number) {
  if (!kvEnabled) return null;
  try {
    const ttlSeconds = Math.ceil(windowMs / 1000);
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, ttlSeconds);
    const remainingTtlSeconds = await kv.ttl(key);
    const resetAt = Date.now() + ((remainingTtlSeconds && remainingTtlSeconds > 0) ? remainingTtlSeconds * 1000 : windowMs);
    return { count, resetAt } satisfies RateLimitEntry;
  } catch (error) {
    console.error('[RateLimit] KV error, falling back to memory:', error);
    return null;
  }
}

function incrementMemoryCounter(key: string, windowMs: number): RateLimitEntry {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt < now) {
    const next: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, next);
    return next;
  }
  existing.count += 1;
  rateLimitStore.set(key, existing);
  return existing;
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    // Include limiter name in the key so different limiters don't share counters
    const key = `rl:${config.name}:${ip}`;

    const kvResult = await incrementKvCounter(key, config.windowMs);
    const entry = kvResult ?? incrementMemoryCounter(key, config.windowMs);

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
          },
        }
      );
    }
    return null;
  };
}

export const downloadRateLimit = rateLimit({
  name: 'download',
  windowMs: 60 * 1000,
  maxRequests: 10,
});

export const apiRateLimit = rateLimit({
  name: 'api',
  windowMs: 60 * 1000,
  maxRequests: 60,
});

export const uploadRateLimit = rateLimit({
  name: 'upload',
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
});

// Brute force protection for the admin login
export const loginRateLimit = rateLimit({
  name: 'login',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

