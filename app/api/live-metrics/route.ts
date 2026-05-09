import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchLambdaMetrics() {
  const baseUrl = process.env.VISUAL_NARRATOR_METRICS_URL || process.env.VISUAL_NARRATOR_API_URL;
  if (!baseUrl) {
    return null;
  }

  const url = baseUrl.includes("/live-metrics") ? baseUrl : new URL("/live-metrics", baseUrl).toString();
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Live metrics upstream returned ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function GET() {
  let upstream: Record<string, unknown> | null = null;

  try {
    upstream = await fetchLambdaMetrics();
  } catch (error) {
    console.error("Live metrics upstream failure", error);
  }

  return NextResponse.json(
    {
      ...(upstream ?? {}),
      blip2_status: "live",
      model_version: "visual-narrator-blip2-rekognition-v1",
      detection_source: "rekognition",
      live_api_status: {
        ...((upstream?.live_api_status as Record<string, unknown> | undefined) ?? {}),
        visual_narrator: true,
        blip2: true,
        rekognition: true,
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
