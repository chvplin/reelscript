import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing profile found yet." }, { status: 404 });
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getServerEnv().NEXT_PUBLIC_APP_URL}/settings`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
