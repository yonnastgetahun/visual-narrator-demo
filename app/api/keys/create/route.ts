import { NextRequest, NextResponse } from "next/server";
import { storeApiKey } from "@/app/lib/apiKeyStore";
import { apiError, generateApiKey } from "@/app/lib/frameApi";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: string; tier?: string; stripe_customer_id?: string; stripe_subscription_item_id?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return apiError("Request body must be valid JSON", "bad_request", 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return apiError("A valid email is required", "bad_request", 400);
  }

  const tier = body.tier === "paid" ? "paid" : "free";
  const apiKey = generateApiKey();

  await storeApiKey(apiKey, {
    email,
    tier,
    created_at: new Date().toISOString(),
    stripe_customer_id: body.stripe_customer_id,
    stripe_subscription_item_id: body.stripe_subscription_item_id,
  });

  return NextResponse.json(
    {
      api_key: apiKey,
      tier,
      email,
      free_daily_limit: tier === "free" ? 100 : null,
      docs_url: "/docs",
    },
    { status: 201 },
  );
}
