import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/lib/env";

const localRequests = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(key: string) {
  const now = Date.now();
  const existing = localRequests.get(key);
  if (!existing || existing.resetAt < now) {
    localRequests.set(key, { count: 1, resetAt: now + 60_000 });
    return { success: true };
  }

  if (existing.count >= 10) {
    return { success: false };
  }

  existing.count += 1;
  localRequests.set(key, existing);
  return { success: true };
}

let upstashLimiter: Ratelimit | null = null;
function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;
  const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = getServerEnv();
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;

  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
  upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });
  return upstashLimiter;
}

export async function enforceGenerateRateLimit(userId: string) {
  const limiter = getUpstashLimiter();
  if (!limiter) return inMemoryRateLimit(userId);
  const result = await limiter.limit(`generate:${userId}`);
  return { success: result.success };
}
