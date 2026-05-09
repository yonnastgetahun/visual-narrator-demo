import { ApiKeyRecord, FREE_DAILY_LIMIT, hashApiKey, todayKey } from "./frameApi";

type UsageResult = {
  allowed: boolean;
  used: number;
  remaining: number | null;
  reset_at: string;
};

const memoryKeys = new Map<string, ApiKeyRecord>();
const memoryUsage = new Map<string, { count: number; resetAt: number }>();

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand<T>(command: string[]) {
  const response = await fetch(`${process.env.KV_REST_API_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV command failed with ${response.status}`);
  }

  return response.json() as Promise<{ result: T }>;
}

function envKeys() {
  const raw = process.env.VN_API_KEYS_JSON;
  if (!raw) {
    return new Map<string, ApiKeyRecord>();
  }

  const parsed = JSON.parse(raw) as Record<string, ApiKeyRecord>;
  return new Map(
    Object.entries(parsed).map(([keyOrHash, record]) => [
      keyOrHash.startsWith("vn_") ? hashApiKey(keyOrHash) : keyOrHash,
      record,
    ]),
  );
}

export async function storeApiKey(apiKey: string, record: ApiKeyRecord) {
  const keyHash = hashApiKey(apiKey);

  if (kvConfigured()) {
    await kvCommand(["SET", `vn:key:${keyHash}`, JSON.stringify(record)]);
    return;
  }

  memoryKeys.set(keyHash, record);
}

export async function getApiKeyRecord(apiKey: string) {
  const keyHash = hashApiKey(apiKey);
  const configuredRecord = envKeys().get(keyHash);
  if (configuredRecord) {
    return configuredRecord;
  }

  if (kvConfigured()) {
    const response = await kvCommand<string | null>(["GET", `vn:key:${keyHash}`]);
    return response.result ? (JSON.parse(response.result) as ApiKeyRecord) : null;
  }

  return memoryKeys.get(keyHash) ?? null;
}

export async function consumeFrame(apiKey: string, tier: ApiKeyRecord["tier"]): Promise<UsageResult> {
  const keyHash = hashApiKey(apiKey);
  const day = todayKey();
  const now = new Date();
  const resetAt = new Date(`${day}T00:00:00.000Z`);
  resetAt.setUTCDate(resetAt.getUTCDate() + 1);

  if (tier === "paid") {
    return {
      allowed: true,
      used: 0,
      remaining: null,
      reset_at: resetAt.toISOString(),
    };
  }

  if (kvConfigured()) {
    const usageKey = `vn:usage:${keyHash}:${day}`;
    const response = await kvCommand<number>(["INCR", usageKey]);
    if (response.result === 1) {
      await kvCommand(["EXPIRE", usageKey, "172800"]);
    }

    return {
      allowed: response.result <= FREE_DAILY_LIMIT,
      used: response.result,
      remaining: Math.max(0, FREE_DAILY_LIMIT - response.result),
      reset_at: resetAt.toISOString(),
    };
  }

  const usageKey = `${keyHash}:${day}`;
  const current = memoryUsage.get(usageKey);
  const bucket = current && now.getTime() < current.resetAt ? current : { count: 0, resetAt: resetAt.getTime() };
  bucket.count += 1;
  memoryUsage.set(usageKey, bucket);

  return {
    allowed: bucket.count <= FREE_DAILY_LIMIT,
    used: bucket.count,
    remaining: Math.max(0, FREE_DAILY_LIMIT - bucket.count),
    reset_at: resetAt.toISOString(),
  };
}
