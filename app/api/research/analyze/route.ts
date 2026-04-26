import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { ViralCaptionAnalysisInputSchema } from "@/lib/schemas";
import type { ViralCaptionAnalysisResult } from "@/lib/types/research";

const fallbackAnalysis: ViralCaptionAnalysisResult = {
  hookStyle: "Short emotional hook in first 3-7 words, usually POV or confession-led.",
  structure: "Hook line, emotional context line, then low-pressure CTA.",
  tone: "Direct, intimate, and slightly dramatic with artist identity cues.",
  ctaStyle: "Soft CTA like stream now, presave, or send to a friend.",
  hashtagStrategy: "Blend one niche genre tag with medium and broad discovery tags.",
  whyItWorks: "Fast attention capture plus emotional specificity and clear next action.",
  originalCaptionDirections: [
    "Write an original POV hook tied to your song's emotional core.",
    "Use a short confession-style opener, then transition to your release context.",
    "End with a subtle CTA that invites replay, presave, or sharing.",
  ],
};

const responseShapeGuard = [
  "hookStyle",
  "structure",
  "tone",
  "ctaStyle",
  "hashtagStrategy",
  "whyItWorks",
  "originalCaptionDirections",
] as const;

function parseMaybeJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
  return JSON.parse(text);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ViralCaptionAnalysisInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid research row" }, { status: 400 });

  const { ANTHROPIC_API_KEY } = getServerEnv();
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(fallbackAnalysis);
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY, timeout: 25_000 });
  const prompt = `Analyze this public music promotion caption and extract reusable strategy only.
Never reproduce, rewrite, or paraphrase the source caption.

Data:
${JSON.stringify(parsed.data, null, 2)}

Return JSON with:
{
  "hookStyle": "string",
  "structure": "string",
  "tone": "string",
  "ctaStyle": "string",
  "hashtagStrategy": "string",
  "whyItWorks": "string",
  "originalCaptionDirections": ["string", "string", "string"]
}`;

  const system = `You analyze viral music promotion captions for strategy only.

Never recommend copying, closely paraphrasing, or reusing the original caption.
Never output a rewritten version of the original caption.
Only identify high-level reusable patterns, such as hook structure, emotional tone, CTA strategy, formatting, pacing, and hashtag strategy.

Return JSON only.

The response must exactly match:
{
  hookStyle: string;
  structure: string;
  tone: string;
  ctaStyle: string;
  hashtagStrategy: string;
  whyItWorks: string;
  originalCaptionDirections: string[];
}`;

  const callAndParse = async (retry: boolean): Promise<ViralCaptionAnalysisResult> => {
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      messages: [{ role: "user", content: retry ? `${prompt}\nSTRICT MODE: JSON only.` : prompt }],
      system,
    });
    const textPart = res.content.find((part) => part.type === "text");
    if (!textPart || textPart.type !== "text") throw new Error("No text output");
    const parsedJson = parseMaybeJson(textPart.text) as Record<string, unknown>;
    for (const key of responseShapeGuard) {
      if (!(key in parsedJson)) throw new Error("Malformed analysis JSON");
    }
    if (!Array.isArray(parsedJson.originalCaptionDirections)) throw new Error("Malformed directions");
    return {
      hookStyle: String(parsedJson.hookStyle),
      structure: String(parsedJson.structure),
      tone: String(parsedJson.tone),
      ctaStyle: String(parsedJson.ctaStyle),
      hashtagStrategy: String(parsedJson.hashtagStrategy),
      whyItWorks: String(parsedJson.whyItWorks),
      originalCaptionDirections: parsedJson.originalCaptionDirections.map((item) => String(item)).slice(0, 6),
    };
  };

  try {
    try {
      const analysis = await callAndParse(false);
      return NextResponse.json(analysis);
    } catch {
      const analysis = await callAndParse(true);
      return NextResponse.json(analysis);
    }
  } catch {
    return NextResponse.json(fallbackAnalysis);
  }
}
