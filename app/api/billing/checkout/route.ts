import { NextResponse } from "next/server";
import { getAppBaseUrl, getStripe } from "@/lib/stripe-server";

/**
 * 创建 Stripe Checkout 会话，返回 { url } 供前端跳转。
 *
 * 环境变量：
 * - STRIPE_SECRET_KEY（必填）
 * - STRIPE_PRICE_ID（必填，Dashboard 里创建的 Price ID）
 * - STRIPE_CHECKOUT_MODE：subscription（默认）| payment（一次性）
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!secretKey || !priceId) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message: "请配置 STRIPE_SECRET_KEY 与 STRIPE_PRICE_ID",
      },
      { status: 503 }
    );
  }

  const mode = process.env.STRIPE_CHECKOUT_MODE === "payment" ? "payment" : "subscription";

  try {
    const stripe = getStripe();
    const baseUrl = getAppBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "no_checkout_url" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
