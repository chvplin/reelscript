import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

let stripe: Stripe | null = null;
export function getStripe() {
  if (stripe) return stripe;
  const { STRIPE_SECRET_KEY } = getServerEnv();
  if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
  stripe = new Stripe(STRIPE_SECRET_KEY);
  return stripe;
}
