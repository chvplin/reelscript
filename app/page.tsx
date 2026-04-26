import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { VideoMarquee } from "@/components/landing/video-marquee";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ReelScript AI | Instagram Caption Generator for Musicians",
  description: "Generate captions, hooks, and hashtags that match your artist voice in seconds.",
  keywords: ["instagram caption generator", "caption generator for musicians", "music marketing AI", "reels captions"],
  openGraph: {
    title: "ReelScript AI",
    description: "AI captions for musicians.",
    images: [{ url: "/og-image.svg" }],
  },
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-card-border/50 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-mono uppercase tracking-[0.2em] text-purple-200">
            ReelScript AI
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#examples" className="hover:text-white">Examples</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <a href="/blog" className="hover:text-white">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={user ? "/generate" : "/login"} className="rounded-full border border-card-border px-4 py-2 text-sm hover:border-purple-400/70">
              Go to App
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-slate-900/70 text-xs">
              {user?.email?.slice(0, 2).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <section className="hero-background rounded-3xl border border-card-border/70 px-6 py-16 text-center sm:px-10">
          <p className="mx-auto inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-1 text-sm text-purple-100">
            ✨ 100M+ captions generated →
          </p>
          <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-extrabold leading-tight [font-family:var(--font-space-grotesk)] sm:text-6xl lg:text-7xl">
            The easiest way to write <span className="gradient-text">captions that make your music move</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-slate-300 sm:text-lg">
            AI-powered captions, hooks, hashtags, and lyric-style text previews for musicians posting Reels, TikToks, and music promos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="card-glow rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-3 text-sm font-semibold sm:text-base">
              Try Free — 10 Credits
            </Link>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="rounded-full border border-card-border bg-slate-900/60 px-6 py-3 text-sm font-semibold hover:border-blue-400/70 sm:text-base">
              Join Discord
            </a>
          </div>
          <div className="mt-8">
            <p className="text-sm text-slate-300">25K+ captions created for 10K+ independent artists</p>
            {/* Placeholder/demo logos below. Replace with real partner/creator logos before launch. */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-slate-400">
              <span>broke</span>
              <span>A4O</span>
              <span>boom.</span>
              <span>neon club</span>
            </div>
          </div>
          <div id="examples">
            <VideoMarquee />
          </div>
        </section>

        <section id="features" className="mt-10 grid gap-4 md:grid-cols-3">
          <FeatureVisual
            title="Hooks That Stop Scroll"
            desc="Built for music internet culture, not generic corp-speak."
          />
          <FeatureVisual
            title="Caption Variants Fast"
            desc="Generate multiple tones so you always have options."
          />
          <FeatureVisual
            title="Hashtags With Range"
            desc="Genre-specific plus mixed-size hashtags in one click."
          />
        </section>

        <section id="pricing" className="mt-10 grid gap-4 md:grid-cols-3">
          <PricingCard title="Free" price="$0" features={["10 one-time credits", "Core generation", "7-day history"]} />
          <PricingCard title="Starter" price="$9/mo" highlight features={["50 credits / month", "Unlimited favorites", "Full history"]} />
          <PricingCard title="Pro" price="$19/mo" features={["Unlimited generations", "Advanced controls", "Export tools"]} />
        </section>

        <section id="faq" className="mt-10 rounded-2xl border bg-card/60 p-6">
          <h2 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">FAQ</h2>
          <div className="mt-4 space-y-3">
            <Faq q="How many captions per generation?" a="You get 10 captions, 5 hooks, and hashtag sets each run." />
            <Faq q="Can I use this for TikTok too?" a="Yes. The copy style works well across Instagram and TikTok captions." />
            <Faq q="Can I cancel any time?" a="Yes. Subscriptions are managed via Stripe Customer Portal." />
          </div>
        </section>
      </main>

      <footer className="border-t border-card-border/60 px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>Made with purple energy for musicians.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-5 ${highlight ? "border-purple-400 card-glow bg-card/80" : "bg-card/60"}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-2xl font-bold">{price}</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl border bg-slate-900/40 p-3">
      <summary className="cursor-pointer font-semibold">{q}</summary>
      <p className="mt-2 text-sm text-slate-300">{a}</p>
    </details>
  );
}

function FeatureVisual({ title, desc }: { title: string; desc: string }) {
  return (
    <article className="feature-texture rounded-2xl border p-5">
      <Image src="/assets/icons/spark-icon.svg" alt="" width={48} height={48} className="h-12 w-12" />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{desc}</p>
    </article>
  );
}
