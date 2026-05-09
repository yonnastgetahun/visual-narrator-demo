import { FRAME_PRICE_USD } from "./frameApi";

export type BillingResult = {
  reported: boolean;
  cost_estimate: number;
  error?: string;
};

export async function reportStripeUsage(subscriptionItemId?: string): Promise<BillingResult> {
  if (!subscriptionItemId || !process.env.STRIPE_SECRET_KEY) {
    return {
      reported: false,
      cost_estimate: FRAME_PRICE_USD,
    };
  }

  const body = new URLSearchParams({
    quantity: "1",
    timestamp: Math.floor(Date.now() / 1000).toString(),
    action: "increment",
  });

  const response = await fetch(`https://api.stripe.com/v1/subscription_items/${subscriptionItemId}/usage_records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Stripe usage reporting failed", {
      status: response.status,
      subscriptionItemId,
      error,
    });

    return {
      reported: false,
      cost_estimate: FRAME_PRICE_USD,
      error: `Stripe returned ${response.status}`,
    };
  }

  return {
    reported: true,
    cost_estimate: FRAME_PRICE_USD,
  };
}
