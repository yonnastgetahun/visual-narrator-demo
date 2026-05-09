import { NextRequest, NextResponse } from "next/server";
import { getApiKeyRecord, consumeFrame } from "@/app/lib/apiKeyStore";
import {
  MODEL_VERSION,
  apiError,
  extractDescription,
  extractObjectCount,
  hasMockDescriptionPath,
  timed,
  validateFrameBase64,
} from "@/app/lib/frameApi";
import { reportStripeUsage } from "@/app/lib/stripeMetering";

export const runtime = "nodejs";

type DescribeFrameBody = {
  frame_base64?: string;
  api_key?: string;
};

async function callVisualNarrator(frameBase64: string) {
  const endpoint = process.env.VISUAL_NARRATOR_API_URL;
  if (!endpoint) {
    throw new Error("VISUAL_NARRATOR_API_URL is not configured");
  }

  const { value, latency_ms } = await timed(async () => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frame_base64: frameBase64,
        frame_data: frameBase64,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Visual Narrator Lambda returned ${response.status}`);
    }

    return response.json() as Promise<unknown>;
  });

  const description = extractDescription(value);
  if (!description) {
    throw new Error("Visual Narrator Lambda returned an empty description");
  }

  if (hasMockDescriptionPath(value, description)) {
    throw new Error("Visual Narrator Lambda returned a mock/template/fallback description path");
  }

  return {
    raw: value,
    description,
    objects_detected: extractObjectCount(value),
    latency_ms,
  };
}

export async function POST(request: NextRequest) {
  let body: DescribeFrameBody;

  try {
    body = (await request.json()) as DescribeFrameBody;
  } catch {
    return apiError("Request body must be valid JSON", "bad_request", 400);
  }

  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const apiKey = body.api_key || bearer;
  if (!apiKey) {
    return apiError("api_key is required", "unauthorized", 401);
  }

  const keyRecord = await getApiKeyRecord(apiKey);
  if (!keyRecord) {
    return apiError("Invalid API key", "unauthorized", 401);
  }

  let frame;
  try {
    frame = validateFrameBase64(body.frame_base64);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Invalid frame payload", "bad_request", 400);
  }

  const rateLimit = await consumeFrame(apiKey, keyRecord.tier);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Free tier daily frame limit exceeded",
        code: "rate_limited",
        docs_url: "/docs",
        reset_at: rateLimit.reset_at,
      },
      { status: 429 },
    );
  }

  let result: Awaited<ReturnType<typeof callVisualNarrator>>;
  try {
    result = await callVisualNarrator(frame.base64);
  } catch (error) {
    console.error("Frame description upstream failure", error);
    return apiError(
      error instanceof Error ? error.message : "Visual Narrator Lambda failed",
      process.env.VISUAL_NARRATOR_API_URL ? "upstream_error" : "configuration_error",
      502,
    );
  }

  const billing =
    keyRecord.tier === "paid"
      ? await reportStripeUsage(keyRecord.stripe_subscription_item_id)
      : { reported: false, cost_estimate: 0 };

  return NextResponse.json(
    {
      description: result.description,
      objects_detected: result.objects_detected,
      latency_ms: result.latency_ms,
      cost_estimate: billing.cost_estimate,
      model_version: MODEL_VERSION,
      rate_limit: {
        tier: keyRecord.tier,
        used_today: rateLimit.used,
        remaining_today: rateLimit.remaining,
        reset_at: rateLimit.reset_at,
      },
      billing: {
        metered: keyRecord.tier === "paid",
        reported: billing.reported,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
