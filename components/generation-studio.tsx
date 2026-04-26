"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { GenerationResult } from "@/lib/types";
import Image from "next/image";
import { MotionPage } from "@/components/ui/MotionPage";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

type Props = {
  initialCredits: number;
  subscriptionTier: "free" | "starter" | "pro";
};

type GenerationInput = {
  contentType: "reel" | "static" | "announcement" | "performance" | "personal";
  visualDescription: string;
  songContext?: string;
  toneOverride?: number;
  emojiLevel?: "none" | "minimal" | "moderate" | "chaotic";
  lengthPreference?: "short" | "medium" | "long";
  callToAction?: string;
};

const emptyInput: GenerationInput = {
  contentType: "reel",
  visualDescription: "",
  songContext: "",
  emojiLevel: "minimal",
  lengthPreference: "medium",
};

export function GenerationStudio({ initialCredits, subscriptionTier }: Props) {
  const [inputs, setInputs] = useState<GenerationInput>(emptyInput);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"captions" | "hooks" | "hashtags">("captions");
  const [credits, setCredits] = useState(initialCredits);
  const [lastInputs, setLastInputs] = useState<GenerationInput | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const canGenerate = subscriptionTier === "pro" || credits > 0;

  async function callGenerate(payload: GenerationInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResults(data.results);
      setLastInputs(payload);
      if (typeof data.creditsRemaining === "number") setCredits(data.creditsRemaining);
      toast.success("Captions ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedItem(key);
    toast.success("Copied!");
    setTimeout(() => setCopiedItem(null), 1200);
  }

  const hashtagsAll = useMemo(() => {
    if (!results) return "";
    return [...results.hashtags.genre, ...results.hashtags.small, ...results.hashtags.medium, ...results.hashtags.large].join(" ");
  }, [results]);

  async function saveFavorite(captionText: string) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        captionText,
        contentType: inputs.contentType,
      }),
    });
    if (!res.ok) {
      toast.error("Failed to save favorite");
      return;
    }
    toast.success("Saved to favorites");
  }

  async function saveGeneration() {
    toast.info("Generation is already saved to history automatically.");
  }

  return (
    <MotionPage className="space-y-6">
      <GlassCard className="p-5 sm:p-6" hover={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">Generate</h1>
          <span className="glass-panel rounded-full px-3 py-1 text-sm">
            {subscriptionTier === "pro" ? "Unlimited" : `${credits} credits`}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-muted">Content Type</span>
            <select
              className="glass-panel h-11 w-full rounded-xl px-3"
              value={inputs.contentType}
              onChange={(e) => setInputs((prev) => ({ ...prev, contentType: e.target.value as GenerationInput["contentType"] }))}
            >
              <option value="reel">Reel / TikTok</option>
              <option value="static">Static Post</option>
              <option value="announcement">Song Announcement</option>
              <option value="performance">Performance / Show</option>
              <option value="personal">Personal / Story</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-muted">Caption Length</span>
            <select
              className="glass-panel h-11 w-full rounded-xl px-3"
              value={inputs.lengthPreference}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, lengthPreference: e.target.value as GenerationInput["lengthPreference"] }))
              }
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm text-muted">Visual Description</span>
          <textarea
            className="glass-panel min-h-24 w-full rounded-xl p-3"
            maxLength={200}
            value={inputs.visualDescription}
            onChange={(e) => setInputs((prev) => ({ ...prev, visualDescription: e.target.value }))}
          />
        </label>

        <label className="mt-4 block space-y-2">
          <span className="text-sm text-muted">Song Context (optional)</span>
          <textarea
            className="glass-panel min-h-20 w-full rounded-xl p-3"
            maxLength={300}
            value={inputs.songContext}
            onChange={(e) => setInputs((prev) => ({ ...prev, songContext: e.target.value }))}
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <GlassButton
            disabled={loading || !canGenerate}
            onClick={() => callGenerate(inputs)}
            className="px-5 disabled:opacity-60"
          >
            {loading ? "Cooking up captions..." : canGenerate ? "Generate Captions ✨" : "Buy Credits"}
          </GlassButton>
          <button
            disabled={loading || !lastInputs}
            onClick={() => lastInputs && callGenerate(lastInputs)}
            className="glass-panel min-h-11 rounded-xl px-4"
          >
            Regenerate
          </button>
          <button disabled={!results} onClick={saveGeneration} className="glass-panel min-h-11 rounded-xl px-4">
            Save Entire Generation
          </button>
        </div>
      </GlassCard>

      {!results ? (
        <GlassCard className="border-dashed p-8 text-center text-muted" hover={false}>
          <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-xl border border-card-border/70">
            <Image
              src="/assets/mockups/dashboard-empty-state.svg"
              alt="Dashboard placeholder visual"
              width={1200}
              height={760}
              className="h-auto w-full"
            />
          </div>
          Run your first generation to see captions, hooks, and hashtags.
        </GlassCard>
      ) : (
        <GlassCard className="p-4 sm:p-6" hover={false}>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["captions", "hooks", "hashtags"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-11 rounded-lg px-4 capitalize ${activeTab === tab ? "glass-panel border-purple-400/50" : "glass-panel"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "captions" && (
            <div className="space-y-3">
              {results.captions.map((caption, index) => (
                <article key={`${caption.text}-${index}`} className="glass-card shimmer-border rounded-xl p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-blue-400/50 px-2 py-1 text-xs">{caption.tone}</span>
                    <span className={`text-xs ${caption.text.length > 2000 ? "text-rose-300" : "text-muted"}`}>
                      {caption.text.length} chars
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{caption.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => copy(caption.text, `c-${index}`)}>
                      {copiedItem === `c-${index}` ? "Copied!" : "Copy"}
                    </button>
                    <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => saveFavorite(caption.text)}>
                      Favorite
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === "hooks" && (
            <div className="grid gap-3 md:grid-cols-2">
              {results.hooks.map((hook, index) => (
                <article key={hook} className="glass-card rounded-xl p-4">
                  <p>{hook}</p>
                  <button className="glass-panel mt-3 min-h-11 rounded-lg px-3 text-sm" onClick={() => copy(hook, `h-${index}`)}>
                    {copiedItem === `h-${index}` ? "Copied!" : "Copy"}
                  </button>
                </article>
              ))}
            </div>
          )}

          {activeTab === "hashtags" && (
            <div className="space-y-4">
              {Object.entries(results.hashtags).map(([category, tags]) => (
                <article key={category} className="glass-card rounded-xl p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold capitalize">{category}</p>
                    <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => copy(tags.join(" "), `t-${category}`)}>
                      {copiedItem === `t-${category}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-slate-300">{tags.join(" ")}</p>
                </article>
              ))}
              <button className="glass-panel min-h-11 rounded-xl px-4" onClick={() => copy(hashtagsAll, "all-tags")}>
                {copiedItem === "all-tags" ? "Copied!" : "Copy All Hashtags"}
              </button>
            </div>
          )}
        </GlassCard>
      )}
    </MotionPage>
  );
}
