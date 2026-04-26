import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-card-border/60 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <span className="text-sm font-mono uppercase tracking-[0.25em] text-purple-200">ReelScript AI</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg border border-card-border px-4 py-2 text-sm hover:border-purple-400/60">
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold"
          >
            Start Free
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <section className="hero-background rounded-3xl border bg-card/50 p-8 sm:p-10">
          <h1 className="text-5xl font-bold leading-tight [font-family:var(--font-space-grotesk)]">
          Stop staring at a <span className="gradient-text">blank caption box</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            AI-powered Instagram captions, hooks, and hashtags for musicians who need content that actually sounds like them.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup" className="card-glow rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02]">
              Start Free - 10 Credits
            </Link>
            <a href="#pricing" className="rounded-xl border border-card-border px-6 py-3 font-semibold hover:border-blue-400/70">
              See Pricing
            </a>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-card-border/80">
            <Image
              src="/assets/mockups/dashboard-empty-state.svg"
              alt="ReelScript dashboard mockup"
              width={1200}
              height={760}
              className="h-auto w-full"
              priority
            />
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
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

        <section className="mt-10 rounded-2xl border bg-card/60 p-6">
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
