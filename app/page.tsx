import Link from "next/link";

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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-5xl font-bold leading-tight [font-family:var(--font-space-grotesk)]">
          Stop staring at a <span className="gradient-text">blank caption box</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          AI-powered Instagram captions, hooks, and hashtags for musicians who need content that actually sounds like
          them.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="card-glow rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold transition hover:scale-[1.02]"
          >
            Start Free - 10 Credits
          </Link>
          <Link href="/login" className="rounded-xl border border-card-border px-6 py-3 font-semibold hover:border-blue-400/70">
            I already have an account
          </Link>
        </div>
      </main>
    </div>
  );
}
