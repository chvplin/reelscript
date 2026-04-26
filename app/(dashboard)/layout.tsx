import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bootstrapProfile, getProfileForUser } from "@/lib/profiles";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await getProfileForUser(user.id);
  if (!profile) {
    await bootstrapProfile(user);
    profile = await getProfileForUser(user.id);
  }

  if (!profile) {
    redirect("/login?error=Profile%20setup%20failed");
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
