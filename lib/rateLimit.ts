import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback store if KV is not configured or temporarily unavailable
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup oude entries elke 10 minuten
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

const kvEnabled = Boolean(process.env.KV_REST_API_URL);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuut
  maxRequests: 60, // 60 requests per minuut
};

async function incrementKvCounter(key: string, windowMs: number) {
  if (!kvEnabled) return null;

  try {
    const ttlSeconds = Math.ceil(windowMs / 1000);
    const count = await kv.incr(key);

    if (count === 1) {
      await kv.expire(key, ttlSeconds);
    }

    const remainingTtlSeconds = await kv.ttl(key);
    const resetAt = Date.now() + ((remainingTtlSeconds && remainingTtlSeconds > 0) ? remainingTtlSeconds * 1000 : windowMs);

    return { count, resetAt } satisfies RateLimitEntry;
  } catch (error) {
    console.error('[RateLimit] KV fallback to memory:', error);
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

export function rateLimit(config: RateLimitConfig = defaultConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `rl:${ip}`;

    const kvResult = await incrementKvCounter(key, config.windowMs);
    const entry = kvResult ?? incrementMemoryCounter(key, config.windowMs);

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);

      return NextResponse.json(
        {
          error: 'Te veel requests. Probeer het later opnieuw.',
          retryAfter,
        },
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

    return null; // Allow request
  };
}

// Verschillende rate limit configs voor verschillende endpoints
export const downloadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuut
  maxRequests: 10, // 10 downloads per minuut
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuut  
  maxRequests: 60, // 60 API calls per minuut
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 uur
  maxRequests: 5, // 5 uploads per uur (voor anonymous users)
});
