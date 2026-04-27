import Anthropic from "@anthropic-ai/sdk";
import { GenerationInputSchema, GenerationResultSchema } from "@/lib/schemas";
import { getServerEnv } from "@/lib/env";
import type { GenerationResult, Profile } from "@/lib/types";

function buildPrompt(profile: Profile, input: ReturnType<typeof GenerationInputSchema.parse>) {
  const personality = JSON.stringify(profile.personality_settings || {});
  return `You are ReelScript AI, a specialized Instagram caption writer for musicians.

ARTIST PROFILE:
- Genre: ${profile.genre || "Other"}
- Tier: ${profile.subscription_tier}
- Personality settings: ${personality}
- Tone override: ${input.toneOverride ?? "default"}
- Emoji level: ${input.emojiLevel ?? "default"}
- Caption length: ${input.lengthPreference ?? "default"}

TASK:
Generate 10 Instagram caption variations for a ${input.contentType} post.

VISUAL CONTEXT:
${input.visualDescription}

SONG CONTEXT:
${input.songContext || "None provided"}

TREND PATTERN NOTES (optional):
${input.trendNotes || "None provided"}

RULES:
1) Keep every caption under Instagram limit.
2) Keep style Gen-Z/music-culture aware but authentic.
3) Vary format: POV, statement, question, punchline.
4) Do not copy or closely paraphrase any source caption. Use only high-level patterns.
5) Output JSON only.

OUTPUT JSON SHAPE:
{
  "captions": [{ "text": "string", "tone": "string", "hook": "string" }],
  "hooks": ["string"],
  "hashtags": {
    "genre": ["#tag"],
    "small": ["#tag"],
    "medium": ["#tag"],
    "large": ["#tag"]
  }
}`;
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Malformed JSON from model");
  }
}

export async function generateWithAnthropic(profile: Profile, input: ReturnType<typeof GenerationInputSchema.parse>): Promise<GenerationResult> {
  const { ANTHROPIC_API_KEY } = getServerEnv();
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing API key: ANTHROPIC_API_KEY (or CLAUDE_API_KEY/ANTHROPIC_KEY)");
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY, timeout: 30_000 });
  const prompt = buildPrompt(profile, input);

  const callModel = async (strictRetry: boolean) => {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: strictRetry ? `${prompt}\n\nSTRICT MODE: Respond with raw JSON only. No markdown.` : prompt,
      messages: [{ role: "user", content: "Generate now." }],
    });
    const text = response.content.find((part) => part.type === "text");
    if (!text || text.type !== "text") throw new Error("Model returned empty content");
    const parsed = safeJsonParse(text.text);
    return GenerationResultSchema.parse(parsed);
  };

  try {
    return await callModel(false);
  } catch {
    return await callModel(true);
  }
}
