type Bucket = {
  count: number;
  resetAt: number;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const IP_LIMIT = 50;
const GLOBAL_LIMIT = 500;

const ipBuckets = new Map<string, Bucket>();
let globalBucket: Bucket = {
  count: 0,
  resetAt: Date.now() + DAY,
};

function consume(bucket: Bucket, limit: number, windowMs: number): Bucket {
  const now = Date.now();

  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  return bucket;
}

export function checkBenchmarkRateLimit(ip: string) {
  const now = Date.now();
  const currentIpBucket = ipBuckets.get(ip) ?? {
    count: 0,
    resetAt: now + HOUR,
  };

  const ipBucket = consume(currentIpBucket, IP_LIMIT, HOUR);
  globalBucket = consume(globalBucket, GLOBAL_LIMIT, DAY);
  ipBuckets.set(ip, ipBucket);

  const retryAfterMs = Math.max(
    ipBucket.count > IP_LIMIT ? ipBucket.resetAt - now : 0,
    globalBucket.count > GLOBAL_LIMIT ? globalBucket.resetAt - now : 0,
  );

  return {
    allowed: retryAfterMs === 0,
    ipRemaining: Math.max(0, IP_LIMIT - ipBucket.count),
    globalRemaining: Math.max(0, GLOBAL_LIMIT - globalBucket.count),
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}
