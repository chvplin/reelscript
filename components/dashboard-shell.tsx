import Link from "next/link";
import { Home, History, Heart, Settings } from "lucide-react";
import type { Profile } from "@/lib/types";
import { signoutAction } from "@/app/(auth)/actions";

type DashboardShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

const navItems = [
  { href: "/generate", label: "Generate", icon: Home },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ profile, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="hidden w-72 border-r border-card-border/70 bg-slate-950/60 p-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-purple-300">ReelScript AI</p>
          <h2 className="mt-2 text-2xl font-bold [font-family:var(--font-space-grotesk)]">Dashboard</h2>
        </div>

        <div className="rounded-2xl border bg-card/80 p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Credits Remaining</p>
          <p className="mt-2 text-4xl font-bold [font-family:var(--font-geist-mono)]">{profile.credits_remaining}</p>
          <p className="mt-1 text-sm text-muted">Tier: {profile.subscription_tier.toUpperCase()}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-200 transition hover:border-purple-400/40 hover:bg-slate-900/70"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signoutAction} className="mt-auto">
          <button type="submit" className="w-full rounded-xl border border-card-border px-4 py-2 text-sm transition hover:border-pink-400/70 hover:text-pink-200">
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-card-border/50 bg-slate-950/60 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <p className="font-semibold">{profile.artist_name}</p>
          </div>
          <div className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-3 py-1 font-mono text-sm text-purple-200">
            {profile.credits_remaining} credits
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
