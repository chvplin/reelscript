import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profiles";
import { HistoryClient } from "@/components/history-client";

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfileForUser(user.id);
  if (!profile) redirect("/login");

  return <HistoryClient tier={profile.subscription_tier} />;
}
