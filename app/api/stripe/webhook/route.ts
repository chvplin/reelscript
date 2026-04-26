import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
// TODO: trigger subscription confirmation and payment failed emails from webhook events.

export async function POST(request: Request) {
  const env = getServerEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) return NextResponse.json({ error: "Service role missing" }, { status: 500 });

  try {
    const stripe = getStripe();
    const signature = (await headers()).get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

    const existing = await supabaseAdmin.from("subscription_events").select("id").eq("stripe_event_id", event.id).single();
    if (existing.data) return NextResponse.json({ received: true });

    const sessionToUser = async (session: { metadata?: Record<string, string> | null; customer?: unknown }) => {
      if (session.metadata?.userId) return session.metadata.userId;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      if (!customerId) return null;
      const profile = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      return profile.data?.id ?? null;
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = await sessionToUser(session);
      if (userId) {
        const plan = session.metadata?.plan;
        if (plan === "starter") {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "starter",
              credits_remaining: 50,
              stripe_customer_id: String(session.customer || ""),
              stripe_subscription_id: String(session.subscription || ""),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        } else if (plan === "pro") {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "pro",
              stripe_customer_id: String(session.customer || ""),
              stripe_subscription_id: String(session.subscription || ""),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        } else if (plan === "credits") {
          const { data: profile } = await supabaseAdmin.from("profiles").select("credits_remaining").eq("id", userId).single();
          await supabaseAdmin
            .from("profiles")
            .update({ credits_remaining: (profile?.credits_remaining ?? 0) + 20, updated_at: new Date().toISOString() })
            .eq("id", userId);
        }
      }
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = String(invoice.customer || "");
      const profileQuery = await supabaseAdmin.from("profiles").select("id, subscription_tier, credits_remaining").eq("stripe_customer_id", customerId).single();
      if (profileQuery.data) {
        const tier = profileQuery.data.subscription_tier;
        if (tier === "starter") {
          await supabaseAdmin
            .from("profiles")
            .update({ credits_remaining: (profileQuery.data.credits_remaining ?? 0) + 50, updated_at: new Date().toISOString() })
            .eq("id", profileQuery.data.id);
        }
      }
    } else if (event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted") {
      const customerId =
        event.type === "invoice.payment_failed"
          ? String(event.data.object.customer || "")
          : String(event.data.object.customer || "");
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_tier: "free", stripe_subscription_id: null, updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);
      // TODO: trigger payment failed / cancellation transactional email.
    }

    await supabaseAdmin.from("subscription_events").insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
