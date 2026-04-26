import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env";

function isAdmin(email?: string | null) {
  const allowed = getServerEnv()
    .ADMIN_EMAILS.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdmin(user?.email)) {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-2xl border bg-card/80 p-8 text-center">
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="mt-2 text-muted">Your account does not have admin access.</p>
      </div>
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-2xl border bg-card/80 p-8 text-center">
        <h1 className="text-2xl font-bold">Admin unavailable</h1>
        <p className="mt-2 text-muted">Missing service role key.</p>
      </div>
    );
  }

  const [profiles, generations, favorites] = await Promise.all([
    admin.from("profiles").select("id, subscription_tier, credits_remaining, created_at"),
    admin.from("generations").select("id, content_type, created_at, visual_description").order("created_at", { ascending: false }).limit(10),
    admin.from("favorites").select("id"),
  ]);

  const allProfiles = profiles.data || [];
  const freeCount = allProfiles.filter((p) => p.subscription_tier === "free").length;
  const starterCount = allProfiles.filter((p) => p.subscription_tier === "starter").length;
  const proCount = allProfiles.filter((p) => p.subscription_tier === "pro").length;
  const totalCredits = allProfiles.reduce((sum, p) => sum + (p.credits_remaining || 0), 0);
  const conversion = allProfiles.length ? Math.round(((starterCount + proCount) / allProfiles.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-space-grotesk)]">Admin Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={String(allProfiles.length)} />
        <Stat label="Total generations" value={String(generations.data?.length || 0)} />
        <Stat label="Total favorites" value={String(favorites.data?.length || 0)} />
        <Stat label="Credits in circulation" value={String(totalCredits)} />
        <Stat label="Free users" value={String(freeCount)} />
        <Stat label="Starter users" value={String(starterCount)} />
        <Stat label="Pro users" value={String(proCount)} />
        <Stat label="Rough conversion" value={`${conversion}%`} />
      </div>

      <section className="rounded-2xl border bg-card/80 p-5">
        <h2 className="text-xl font-semibold">Recent Generations</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(generations.data || []).map((item) => (
            <div key={item.id} className="rounded-lg border bg-slate-900/40 p-3">
              <p className="font-medium capitalize">{item.content_type}</p>
              <p className="text-muted">{item.visual_description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border bg-card/80 p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  );
}
