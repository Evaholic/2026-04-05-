import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";

/**
 * Stripe Webhook：在 Dashboard → Developers → Webhooks 添加端点，
 * 例如 https://你的域名/api/billing/webhook，并复制 signing secret 到 STRIPE_WEBHOOK_SECRET。
 *
 * 在此处根据 checkout.session.completed / customer.subscription.* 等事件更新数据库里的会员状态。
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[billing/webhook] signature", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // TODO: 根据 session.customer / subscription 写入用户会员状态
      break;
    case "customer.subscription.deleted":
      // TODO: 取消会员
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
