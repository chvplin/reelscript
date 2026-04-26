import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";

const AnalyzeSchema = z.object({
  creatorHandle: z.string(),
  captionPreview: z.string(),
  hashtags: z.array(z.string()).default([]),
  likes: z.number().nullable().optional(),
  views: z.number().nullable().optional(),
  comments: z.number().nullable().optional(),
  reelUrl: z.string().url(),
});

const PatternSchema = z.object({
  hookStyle: z.string(),
  captionStructure: z.string(),
  emotionalTone: z.string(),
  ctaStyle: z.string(),
  hashtagStrategy: z.string(),
  whyItMayWork: z.string(),
});

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

  const parsed = AnalyzeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid research row" }, { status: 400 });

  const { ANTHROPIC_API_KEY } = getServerEnv();
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({
      pattern: {
        hookStyle: "Short, punchy openers and POV framing.",
        captionStructure: "Hook line -> mood line -> CTA line.",
        emotionalTone: "Melancholic but confident.",
        ctaStyle: "Low-pressure CTA like presave/link in bio.",
        hashtagStrategy: "1 niche + 2 medium + 1 broad tag blend.",
        whyItMayWork: "Quick attention hook plus clear identity and action.",
      },
    });
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY, timeout: 25_000 });
  const prompt = `Analyze this public music promo reel metadata and extract only high-level writing patterns.
Never reproduce source text verbatim.

Data:
${JSON.stringify(parsed.data, null, 2)}

Return JSON with:
{
  "hookStyle": "",
  "captionStructure": "",
  "emotionalTone": "",
  "ctaStyle": "",
  "hashtagStrategy": "",
  "whyItMayWork": ""
}`;

  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
      system: "Return raw JSON only.",
    });
    const textPart = res.content.find((part) => part.type === "text");
    if (!textPart || textPart.type !== "text") throw new Error("No text output");
    const pattern = PatternSchema.parse(parseMaybeJson(textPart.text));
    return NextResponse.json({ pattern });
  } catch {
    return NextResponse.json({ error: "Pattern analysis failed" }, { status: 502 });
  }
}
