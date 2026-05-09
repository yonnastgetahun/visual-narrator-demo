import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const DOCS_URL = "/docs";
export const FRAME_PRICE_USD = 0.001;
export const FREE_DAILY_LIMIT = 100;
export const MODEL_VERSION = "visual-narrator-blip2-rekognition-v1";
export const MAX_BASE64_BYTES = 8 * 1024 * 1024;

export type ApiTier = "free" | "paid";

export type ApiKeyRecord = {
  email: string;
  tier: ApiTier;
  created_at: string;
  stripe_customer_id?: string;
  stripe_subscription_item_id?: string;
};

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "rate_limited"
  | "upstream_error"
  | "billing_error"
  | "configuration_error";

export function apiError(error: string, code: ApiErrorCode, status: number) {
  return NextResponse.json(
    {
      error,
      code,
      docs_url: DOCS_URL,
    },
    { status },
  );
}

export function hashApiKey(apiKey: string) {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function generateApiKey() {
  return `vn_live_${randomBytes(24).toString("base64url")}`;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function normalizeBase64(frameBase64: string) {
  const match = frameBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  return {
    mimeType: match?.[1] ?? "image/jpeg",
    base64: (match?.[2] ?? frameBase64).replace(/\s/g, ""),
  };
}

export function validateFrameBase64(frameBase64: unknown) {
  if (typeof frameBase64 !== "string" || frameBase64.trim().length === 0) {
    throw new Error("frame_base64 is required");
  }

  const normalized = normalizeBase64(frameBase64);
  if (normalized.base64.length > MAX_BASE64_BYTES) {
    throw new Error("Frame is too large. Upload an image under 6MB.");
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized.base64)) {
    throw new Error("frame_base64 must be valid base64 image data");
  }

  return normalized;
}

export async function timed<T>(work: () => Promise<T>) {
  const started = performance.now();
  const value = await work();
  return {
    value,
    latency_ms: Math.max(1, Math.round(performance.now() - started)),
  };
}

export function extractObjectCount(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const data = value as Record<string, unknown>;
  const analysis = data.analysis && typeof data.analysis === "object" ? (data.analysis as Record<string, unknown>) : {};
  const candidates = [
    data.object_count,
    data.objects_detected,
    analysis.object_count,
    analysis.objects_detected,
    analysis.objects,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      return candidate;
    }
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  return 0;
}

export function extractDescription(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const data = value as Record<string, unknown>;
  const analysis = data.analysis && typeof data.analysis === "object" ? (data.analysis as Record<string, unknown>) : {};
  const candidates = [
    data.description,
    data.text,
    data.narrative,
    data.caption,
    analysis.description,
    analysis.narrative,
    analysis.scene_description,
  ];

  return candidates.find((candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0)?.trim() ?? "";
}

export function hasMockDescriptionPath(value: unknown, description: string) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  const sourceFields = [
    data.model_source,
    data.source,
    data.description_source,
    data.benchmark_source,
    data.fallback_used,
    data.fallback_mode,
  ];

  return (
    /\b(mock|template|fallback)\b/i.test(description) ||
    sourceFields.some((field) =>
      typeof field === "boolean"
        ? field
        : typeof field === "string" && /\b(mock|template|fallback)\b/i.test(field),
    )
  );
}
