export type SubscriptionTier = "free" | "starter" | "pro";

export type Profile = {
  id: string;
  artist_name: string;
  email?: string;
  genre: string | null;
  personality_settings: Record<string, unknown>;
  credits_remaining: number;
  subscription_tier: SubscriptionTier;
  monthly_reset_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GenerationResult = {
  captions: Array<{
    text: string;
    tone: string;
    hook: string;
  }>;
  hooks: string[];
  hashtags: {
    genre: string[];
    small: string[];
    medium: string[];
    large: string[];
  };
};
