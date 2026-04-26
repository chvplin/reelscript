"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Heart, Search, Settings } from "lucide-react";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/types";
import { signoutAction } from "@/app/(auth)/actions";

type DashboardShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

const navItems = [
  { href: "/generate", label: "Generate", icon: Home },
  { href: "/research", label: "Viral Research", icon: Search },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="glass-panel m-3 hidden w-72 rounded-3xl p-6 lg:flex lg:flex-col">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-purple-300">ReelScript AI</p>
          <h2 className="mt-2 text-2xl font-bold [font-family:var(--font-space-grotesk)]">Dashboard</h2>
        </div>

        <motion.div
          key={profile.credits_remaining}
          initial={{ scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-2xl p-4"
        >
          <p className="text-xs uppercase tracking-wide text-muted">Credits Remaining</p>
          <p className="mt-2 text-4xl font-bold [font-family:var(--font-geist-mono)]">{profile.credits_remaining}</p>
          <p className="mt-1 text-sm text-muted">Tier: {profile.subscription_tier.toUpperCase()}</p>
        </motion.div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm text-slate-200 transition hover:translate-x-1 hover:border-purple-400/40 hover:bg-slate-900/70 ${
                  pathname === item.href ? "glass-panel border-purple-400/50 bg-purple-500/10" : "border-transparent"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signoutAction} className="mt-auto">
          <button type="submit" className="w-full rounded-xl border border-card-border px-4 py-2 text-sm transition hover:scale-[1.01] hover:border-pink-400/70 hover:text-pink-200">
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-10 m-3 flex items-center justify-between rounded-2xl px-5 py-4 lg:px-8">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <p className="font-semibold">{profile.artist_name}</p>
          </div>
          <motion.div
            key={profile.credits_remaining}
            initial={{ y: -6, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card rounded-xl px-3 py-1 font-mono text-sm text-purple-200"
          >
            {profile.credits_remaining} credits
          </motion.div>
        </header>
        <main className="flex-1 px-5 pb-5 lg:px-8 lg:pb-8">{children}</main>
        <nav
          className="glass-panel sticky bottom-0 z-10 m-2 grid rounded-2xl p-2 lg:hidden"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex min-h-11 flex-col items-center justify-center rounded-lg text-xs ${pathname === item.href ? "text-purple-300" : "text-slate-300"}`}>
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
