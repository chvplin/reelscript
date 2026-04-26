import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type BootstrapInput = {
  artistName?: string;
  genre?: string;
};

const DEFAULT_PERSONALITY = {
  vibe: "energetic",
  persona: "confident",
  emojiLevel: "minimal",
  lengthPreference: "medium",
  tone: "playful",
};

export async function bootstrapProfile(user: User, input?: BootstrapInput) {
  const serverClient = await createSupabaseServerClient();
  const payload = {
    id: user.id,
    artist_name: input?.artistName?.trim() || user.user_metadata?.artist_name || "Unnamed Artist",
    genre: input?.genre || user.user_metadata?.genre || "Other",
    personality_settings: DEFAULT_PERSONALITY,
    credits_remaining: 10,
    subscription_tier: "free",
    updated_at: new Date().toISOString(),
  };

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { error } = await admin.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return;
  }

  const { error } = await serverClient.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, artist_name, genre, personality_settings, credits_remaining, subscription_tier")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}
