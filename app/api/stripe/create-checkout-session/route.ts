import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

const BodySchema = z.object({
  mode: z.enum(["subscription", "payment"]),
  plan: z.enum(["starter", "pro", "credits"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = BodySchema.parse(await request.json());
    const stripe = getStripe();
    const env = getServerEnv();
    const priceId =
      body.plan === "starter"
        ? env.STRIPE_PRICE_STARTER
        : body.plan === "pro"
          ? env.STRIPE_PRICE_PRO
          : env.STRIPE_PRICE_CREDITS;
    if (!priceId) return NextResponse.json({ error: "Price not configured" }, { status: 500 });

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

    const session = await stripe.checkout.sessions.create({
      mode: body.mode,
      customer: profile?.stripe_customer_id || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=cancelled`,
      metadata: { userId: user.id, plan: body.plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Checkout session failed" }, { status: 500 });
  }
}
