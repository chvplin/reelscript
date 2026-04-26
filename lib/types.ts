export type SubscriptionTier = "free" | "starter" | "pro";

export type Profile = {
  id: string;
  artist_name: string;
  genre: string | null;
  personality_settings: Record<string, unknown>;
  credits_remaining: number;
  subscription_tier: SubscriptionTier;
  created_at?: string;
  updated_at?: string;
};
