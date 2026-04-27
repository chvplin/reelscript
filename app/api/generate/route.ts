import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GenerationInputSchema } from "@/lib/schemas";
import { getProfileForUser } from "@/lib/profiles";
import { generateWithAnthropic } from "@/lib/anthropic";
import { enforceGenerateRateLimit } from "@/lib/rate-limit";
// TODO: trigger low-credit transactional email when user reaches exactly 5 credits.

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceGenerateRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many generations too quickly. Wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsedInput = GenerationInputSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json({ error: "Invalid input", details: parsedInput.error.flatten() }, { status: 400 });
    }

    const profile = await getProfileForUser(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const isPro = profile.subscription_tier === "pro";
    if (!isPro && profile.credits_remaining < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const result = await generateWithAnthropic(profile, parsedInput.data);

    let remaining = profile.credits_remaining;
    if (!isPro) {
      const { data: updated, error: creditError } = await supabase
        .from("profiles")
        .update({
          credits_remaining: Math.max(0, profile.credits_remaining - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .gte("credits_remaining", 1)
        .select("credits_remaining")
        .single();

      if (creditError || !updated) {
        return NextResponse.json({ error: "Credits changed. Please try again." }, { status: 409 });
      }
      remaining = updated.credits_remaining;
    }

    const { error: historyError } = await supabase.from("generations").insert({
      user_id: user.id,
      content_type: parsedInput.data.contentType,
      visual_description: parsedInput.data.visualDescription,
      song_context: parsedInput.data.songContext || "",
      results: result,
      inputs: parsedInput.data,
      credits_used: isPro ? 0 : 1,
    });

    if (historyError) {
      console.error("Generation save error:", historyError);
    }

    return NextResponse.json({ success: true, results: result, creditsRemaining: remaining });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    if (message.includes("timeout")) {
      return NextResponse.json({ error: "Generation timed out. Please try again." }, { status: 504 });
    }
    if (message.includes("rate")) {
      return NextResponse.json({ error: "Anthropic rate limit reached. Try again in a moment." }, { status: 429 });
    }
    if (message.includes("JSON")) {
      return NextResponse.json({ error: "AI response format error. Please regenerate." }, { status: 502 });
    }
    if (message.includes("Missing API key")) {
      console.error("Caption generation misconfigured:", message);
      return NextResponse.json(
        { error: "AI service is not configured on the server. Please contact support." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Failed to generate captions." }, { status: 500 });
  }
}
