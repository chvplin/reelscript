import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profiles";
import { GenerationStudio } from "@/components/generation-studio";

export default async function GeneratePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfileForUser(user.id);
  if (!profile) redirect("/login");

  return <GenerationStudio initialCredits={profile.credits_remaining} subscriptionTier={profile.subscription_tier} />;
}
