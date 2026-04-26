export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card/80 p-6">
        <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">Generate Captions</h1>
        <p className="mt-2 text-sm text-muted">
          Phase 1 complete: auth + dashboard shell are live. Next step is wiring Anthropic generation and credit deduction.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-slate-900/60 p-5">
          <p className="text-sm text-muted">Content Type</p>
          <p className="mt-2 font-medium">Reel / TikTok</p>
        </div>
        <div className="rounded-2xl border bg-slate-900/60 p-5">
          <p className="text-sm text-muted">Visual Description</p>
          <p className="mt-2 font-medium">Form UI coming next pass</p>
        </div>
      </section>
    </div>
  );
}
