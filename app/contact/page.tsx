export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <article className="rounded-2xl border bg-card/80 p-6">
        <h1 className="text-3xl font-bold [font-family:var(--font-space-grotesk)]">Contact</h1>
        <p className="mt-2 text-sm text-slate-300">Support email: support@reelscript.ai (placeholder)</p>
        <form className="mt-6 space-y-3">
          <input className="h-11 w-full rounded-xl border bg-slate-900/60 px-3" placeholder="Your email" />
          <input className="h-11 w-full rounded-xl border bg-slate-900/60 px-3" placeholder="Subject" />
          <textarea className="min-h-32 w-full rounded-xl border bg-slate-900/60 p-3" placeholder="Message" />
          <button type="button" className="min-h-11 rounded-xl border px-4">
            Send (UI only)
          </button>
        </form>
      </article>
    </main>
  );
}
