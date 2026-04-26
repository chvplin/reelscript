import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResearchCollectSchema } from "@/lib/schemas";
import { collectViralCaptions, getResearchProvider } from "@/lib/researchProviders";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = ResearchCollectSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid research query" }, { status: 400 });

    const provider = getResearchProvider();
    const queryForProvider =
      parsed.data.sourceType === "hashtag" && !parsed.data.query.startsWith("#")
        ? `#${parsed.data.query}`
        : parsed.data.query;
    const results = await collectViralCaptions(queryForProvider);

    const insertPayload = results.map((item) => ({
      user_id: user.id,
      platform: item.platform,
      source_url: item.sourceUrl,
      creator_handle: item.creatorHandle,
      caption_text: item.captionText,
      hashtags: item.hashtags,
      like_count: item.likeCount ?? null,
      view_count: item.viewCount ?? null,
      comment_count: item.commentCount ?? null,
      posted_at: item.postedAt ?? null,
    }));

    const { data: saved, error: insertError } = await supabase
      .from("research_captions")
      .insert(insertPayload)
      .select("*");

    if (insertError) {
      console.error("Research insert failed:", insertError);
      return NextResponse.json({
        entries: results.map((item, idx) => ({
          id: `provider-${idx}-${Date.now()}`,
          creatorHandle: item.creatorHandle,
          captionPreview: item.captionText,
          hashtags: item.hashtags,
          likes: item.likeCount ?? null,
          views: item.viewCount ?? null,
          comments: item.commentCount ?? null,
          reelUrl: item.sourceUrl,
          platform: item.platform,
          collectedAt: new Date().toISOString(),
        })),
        provider: provider.name,
        warning: "Research collected but database save failed.",
      });
    }

    return NextResponse.json({
      entries: (saved || []).map((row) => ({
        id: row.id,
        creatorHandle: row.creator_handle,
        captionPreview: row.caption_text,
        hashtags: row.hashtags || [],
        likes: row.like_count,
        views: row.view_count,
        comments: row.comment_count,
        reelUrl: row.source_url,
        platform: row.platform,
        collectedAt: row.created_at,
      })),
      provider: provider.name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to collect research captions." }, { status: 500 });
  }
}
