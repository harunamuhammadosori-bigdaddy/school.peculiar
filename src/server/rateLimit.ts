import { RequestHandler } from 'express';

interface RateBucket {
  count: number;
  resetAt: number;
}

export function createIpRateLimiter(windowMs: number, limit: number, message: string): RequestHandler {
  const buckets = new Map<string, RateBucket>();
  let requestsSinceCleanup = 0;

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      if (++requestsSinceCleanup >= 128 || buckets.size >= 10000) {
        requestsSinceCleanup = 0;
        for (const [bucketKey, value] of buckets) {
          if (value.resetAt <= now) buckets.delete(bucketKey);
        }
      }
      if (buckets.size >= 10000) {
        return res.status(503).json({ error: 'Rate limiting is temporarily unavailable' });
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, limit - bucket.count));
    res.setHeader('RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
    if (bucket.count > limit) {
      res.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}