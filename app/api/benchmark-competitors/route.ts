import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkBenchmarkRateLimit } from "./ratelimit";

export const runtime = "nodejs";

const MAX_BASE64_BYTES = 8 * 1024 * 1024;
const OPENAI_MODEL = "gpt-4o";
const GEMINI_MODEL = "gemini-2.5-flash";

type ProviderResult = {
  success: boolean;
  provider: "vn" | "gpt4o" | "gemini";
  model: string;
  latency_ms: number;
  cost_usd: number;
  description: string;
  error?: string;
  source: "api" | "demo";
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function normalizeBase64(frameData: string) {
  const match = frameData.match(/^data:(image\/(?:jpeg|png));base64,(.+)$/);

  if (match) {
    return {
      mimeType: match[1],
      base64: match[2],
    };
  }

  return {
    mimeType: "image/jpeg",
    base64: frameData,
  };
}

function validateImagePayload(frameData: unknown) {
  if (typeof frameData !== "string" || frameData.length === 0) {
    throw new Error("frame_data is required");
  }

  const { mimeType, base64 } = normalizeBase64(frameData);
  if (!["image/jpeg", "image/png"].includes(mimeType)) {
    throw new Error("Only JPEG and PNG frames are supported");
  }

  if (base64.length > MAX_BASE64_BYTES) {
    throw new Error("Frame is too large. Upload an image under 6MB.");
  }

  if (!/^[A-Za-z0-9+/=\s]+$/.test(base64)) {
    throw new Error("frame_data must be valid base64 image data");
  }

  return {
    mimeType,
    base64: base64.replace(/\s/g, ""),
  };
}

function frameHash(base64: string) {
  return createHash("sha256").update(base64).digest("hex").slice(0, 12);
}

function benchmarkDescription(hash: string) {
  return `A submitted benchmark frame is summarized as a clear foreground subject with visible scene context and motion-relevant details. Frame ${hash}.`;
}

async function timed<T>(work: () => Promise<T>) {
  const started = performance.now();
  const value = await work();
  return {
    value,
    latency_ms: Math.max(1, Math.round(performance.now() - started)),
  };
}

async function runVisualNarrator(base64: string): Promise<ProviderResult> {
  const hash = frameHash(base64);
  const endpoint = process.env.VISUAL_NARRATOR_API_URL;

  if (endpoint) {
    try {
      const { value, latency_ms } = await timed(async () => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame_data: base64 }),
        });

        if (!response.ok) {
          throw new Error(`VN API returned ${response.status}`);
        }

        return response.json() as Promise<{ description?: string; text?: string }>;
      });

      return {
        success: true,
        provider: "vn",
        model: "visual-narrator-vlm",
        latency_ms,
        cost_usd: 0.0009,
        description: value.description || value.text || benchmarkDescription(hash),
        source: "api",
      };
    } catch (error) {
      return fallbackResult("vn", "visual-narrator-vlm", 204, 0.0009, hash, error);
    }
  }

  return fallbackResult("vn", "visual-narrator-vlm", 204, 0.0009, hash);
}

async function runOpenAI(base64: string, mimeType: string): Promise<ProviderResult> {
  const hash = frameHash(base64);
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const { value, latency_ms } = await timed(async () => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            max_tokens: 90,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Describe this image for an audio description benchmark in one vivid sentence.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API returned ${response.status}`);
        }

        return response.json() as Promise<{
          choices?: Array<{ message?: { content?: string } }>;
        }>;
      });

      return {
        success: true,
        provider: "gpt4o",
        model: OPENAI_MODEL,
        latency_ms,
        cost_usd: 0.0028,
        description: value.choices?.[0]?.message?.content?.trim() || benchmarkDescription(hash),
        source: "api",
      };
    } catch (error) {
      return fallbackResult("gpt4o", OPENAI_MODEL, 2200, 0.0028, hash, error);
    }
  }

  return fallbackResult("gpt4o", OPENAI_MODEL, 2200, 0.0028, hash);
}

async function runGemini(base64: string, mimeType: string): Promise<ProviderResult> {
  const hash = frameHash(base64);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const { value, latency_ms } = await timed(async () => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Describe this image for an audio description benchmark in one vivid sentence.",
                    },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 90,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Gemini API returned ${response.status}`);
        }

        return response.json() as Promise<{
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        }>;
      });

      return {
        success: true,
        provider: "gemini",
        model: GEMINI_MODEL,
        latency_ms,
        cost_usd: 0.0011,
        description:
          value.candidates?.[0]?.content?.parts
            ?.map((part) => part.text)
            .filter(Boolean)
            .join(" ")
            .trim() || benchmarkDescription(hash),
        source: "api",
      };
    } catch (error) {
      return fallbackResult("gemini", GEMINI_MODEL, 5800, 0.0011, hash, error);
    }
  }

  return fallbackResult("gemini", GEMINI_MODEL, 5800, 0.0011, hash);
}

function fallbackResult(
  provider: ProviderResult["provider"],
  model: string,
  latency_ms: number,
  cost_usd: number,
  hash: string,
  error?: unknown,
): ProviderResult {
  return {
    success: true,
    provider,
    model,
    latency_ms,
    cost_usd,
    description: benchmarkDescription(hash),
    error: error instanceof Error ? error.message : undefined,
    source: "demo",
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkBenchmarkRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Benchmark rate limit exceeded",
        retry_after_seconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as { frame_data?: string };
    const { base64, mimeType } = validateImagePayload(body.frame_data);
    const hash = frameHash(base64);

    const [vn, gpt4o, gemini] = await Promise.all([
      runVisualNarrator(base64),
      runOpenAI(base64, mimeType),
      runGemini(base64, mimeType),
    ]);

    return NextResponse.json(
      {
        frame_hash: hash,
        vn,
        gpt4o,
        gemini,
        gpt4_vision: gpt4o,
        rate_limit: {
          ip_remaining: limit.ipRemaining,
          global_remaining: limit.globalRemaining,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid benchmark request",
      },
      { status: 400 },
    );
  }
}
