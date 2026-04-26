"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { GenerationResult } from "@/lib/types";
import { useRouter } from "next/navigation";

type SourceType = "reel_url" | "profile" | "hashtag";
type Entry = {
  id: string;
  creatorHandle: string;
  captionPreview: string;
  hashtags: string[];
  likes: number | null;
  views: number | null;
  comments: number | null;
  reelUrl: string;
  platform: "instagram" | "tiktok";
  collectedAt: string;
};

type Pattern = {
  hookStyle: string;
  structure: string;
  tone: string;
  ctaStyle: string;
  hashtagStrategy: string;
  whyItWorks: string;
  originalCaptionDirections: string[];
};

export function ResearchClient() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<SourceType>("hashtag");
  const [query, setQuery] = useState("#newmusic");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function collect() {
    setLoading(true);
    setPattern(null);
    setResult(null);
    setWarning(null);
    const res = await fetch("/api/research/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType, query }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error || "Collection failed");
    setEntries(data.entries || []);
    setProviderName(data.provider || null);
    setWarning(data.warning || null);
    toast.success("Research rows loaded");
  }

  async function analyze(entry: Entry) {
    setSelected(entry);
    setAnalyzing(true);
    const res = await fetch("/api/research/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        captionText: entry.captionPreview,
        hashtags: entry.hashtags,
        metrics: { likes: entry.likes ?? undefined, views: entry.views ?? undefined, comments: entry.comments ?? undefined },
      }),
    });
    const data = await res.json();
    setAnalyzing(false);
    if (!res.ok) return toast.error(data.error || "Pattern analysis failed");
    setPattern(data);
  }

  async function generateFromPattern() {
    if (!selected || !pattern) return;
    setGenerating(true);
    const trendNotes = `Pattern summary:
hook style: ${pattern.hookStyle}
structure: ${pattern.structure}
tone: ${pattern.tone}
cta: ${pattern.ctaStyle}
hashtags: ${pattern.hashtagStrategy}
why: ${pattern.whyItWorks}
source caption sample: ${selected.captionPreview}`;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: "reel",
        visualDescription: `Trend-inspired music promo based on research query ${query}`,
        songContext: "Create originals inspired by trends, never copied.",
        trendNotes,
      }),
    });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) return toast.error(data.error || "Generation failed");
    setResult(data.results);
    toast.success("Original captions generated from pattern");
  }

  function usePatternInGenerator() {
    if (!pattern) return;
    const payload = encodeURIComponent(JSON.stringify(pattern));
    router.push(`/generate?trendPattern=${payload}`);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-card/80 p-5">
        <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">Viral Caption Research</h1>
        <p className="mt-2 text-sm text-muted">
          Study what&apos;s working in public music promo captions, then generate original captions from the pattern.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Research results are from public posts only. Always respect creator rights and platform terms.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="h-11 rounded-xl border bg-slate-900/60 px-3"
          >
            <option value="reel_url">Instagram Reel URL</option>
            <option value="profile">Artist Handle</option>
            <option value="hashtag">Hashtag</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-xl border bg-slate-900/60 px-3 md:col-span-2"
            placeholder="Paste URL, @artist, or #newmusic"
          />
          <button onClick={collect} disabled={loading} className="min-h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 font-semibold">
            {loading ? "Collecting..." : "Collect"}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {providerName === "mockProvider" ? (
            <span className="rounded-full border border-blue-400/50 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
              Demo data
            </span>
          ) : null}
          {warning ? <span className="text-xs text-amber-300">{warning}</span> : null}
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border bg-card/80 p-4">
        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Creator</th>
              <th className="p-2">Caption preview</th>
              <th className="p-2">Hashtags</th>
              <th className="p-2">Likes/Views/Comments</th>
              <th className="p-2">Date collected</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-card-border/60 align-top">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span>{entry.creatorHandle}</span>
                    <span className="rounded-full border border-card-border/80 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                      {entry.platform}
                    </span>
                  </div>
                </td>
                <td className="p-2 max-w-72">{entry.captionPreview}</td>
                <td className="p-2">{entry.hashtags.join(" ")}</td>
                <td className="p-2">
                  {entry.likes ?? "-"} / {entry.views ?? "-"} / {entry.comments ?? "-"}
                </td>
                <td className="p-2">{new Date(entry.collectedAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => analyze(entry)} className="rounded-lg border px-3 py-2">
                    Analyze Pattern
                  </button>
                  <a href={entry.reelUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 inline-block">
                    Open Reel
                  </a>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="p-4 text-muted" colSpan={6}>
                  No research rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border bg-card/80 p-5">
        <h2 className="text-xl font-semibold">Pattern Summary</h2>
        {analyzing ? (
          <p className="mt-3 text-muted">Analyzing pattern...</p>
        ) : pattern ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <PatternItem label="Hook style" value={pattern.hookStyle} />
            <PatternItem label="Structure" value={pattern.structure} />
            <PatternItem label="Tone" value={pattern.tone} />
            <PatternItem label="CTA style" value={pattern.ctaStyle} />
            <PatternItem label="Hashtag strategy" value={pattern.hashtagStrategy} />
            <PatternItem label="Why it works" value={pattern.whyItWorks} />
            <PatternItem label="Original directions" value={pattern.originalCaptionDirections.join(" | ")} />
          </div>
        ) : (
          <p className="mt-3 text-muted">Pick a row and click Analyze Pattern.</p>
        )}

        <button
          onClick={generateFromPattern}
          disabled={!pattern || generating}
          className="mt-4 min-h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 font-semibold disabled:opacity-60"
        >
          {generating ? "Generating..." : "Generate original captions from this pattern"}
        </button>
        <button
          onClick={usePatternInGenerator}
          disabled={!pattern}
          className="mt-3 ml-3 min-h-11 rounded-xl border px-4 font-semibold disabled:opacity-60"
        >
          Use This Pattern in Generator
        </button>

        {result ? (
          <div className="mt-5 space-y-2">
            <p className="text-sm text-muted">Generated sample:</p>
            {result.captions.slice(0, 3).map((caption, idx) => (
              <div key={idx} className="rounded-xl border bg-slate-900/40 p-3 text-sm">
                {caption.text}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PatternItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-slate-900/50 p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </article>
  );
}
