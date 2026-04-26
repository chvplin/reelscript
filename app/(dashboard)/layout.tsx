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
    try {
      await bootstrapProfile(user);
    } catch (error) {
      console.error("Profile bootstrap failed in dashboard:", error);
      redirect("/login?error=We%20could%20not%20finish%20setting%20up%20your%20profile.%20Please%20log%20in%20again.");
    }
    profile = await getProfileForUser(user.id);
  }

  if (!profile) {
    redirect("/login?error=Profile%20is%20missing.%20Please%20log%20in%20again.");
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
