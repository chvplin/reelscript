import type { ViralCaptionResult } from "@/lib/types/research";

export interface ResearchProvider {
  name: string;
  collect(query: string): Promise<ViralCaptionResult[]>;
}

function hashtagsForQuery(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("hyperpop")) return ["#hyperpop", "#newmusic", "#musicpromo"];
  if (q.includes("indie")) return ["#indiemusic", "#altpop", "#newmusic"];
  if (q.includes("tiktok")) return ["#tiktokmusic", "#newtrack", "#indieartist"];
  return ["#newmusic", "#musicpromo", "#artist"];
}

function mockCaption(query: string, idx: number) {
  const lines = [
    `POV: your ${query} era starts now.`,
    "I made this at 2am and hit export before overthinking.",
    "If this hits, presave in bio.",
    "Not me dropping this when I said I was taking a break.",
    "Made for late drives and volume all the way up.",
    "You asked for chaos-pop. I heard you.",
    "Send this to the friend who always finds the hidden gems.",
    "One hook, one heartbreak, one replay button.",
  ];
  return lines[idx % lines.length];
}

function makeMockResult(query: string, idx: number): ViralCaptionResult {
  const platform: "instagram" | "tiktok" = idx % 3 === 0 ? "tiktok" : "instagram";
  return {
    platform,
    sourceUrl: `https://example.com/mock/${platform}/${encodeURIComponent(query)}/${idx + 1}`,
    creatorHandle: `@demo_artist_${idx + 1}`,
    captionText: mockCaption(query, idx),
    hashtags: hashtagsForQuery(query),
    likeCount: 1500 + idx * 640,
    viewCount: 18000 + idx * 5200,
    commentCount: 90 + idx * 28,
    postedAt: new Date(Date.now() - idx * 86_400_000).toISOString(),
  };
}

export const mockProvider: ResearchProvider = {
  name: "mockProvider",
  async collect(query: string) {
    const size = 6;
    return Array.from({ length: size }, (_, idx) => makeMockResult(query, idx));
  },
};

async function runApifyActor(input: Record<string, unknown>) {
  const token = process.env.APIFY_API_TOKEN;
  const actorId = process.env.APIFY_INSTAGRAM_ACTOR_ID;
  if (!token || !actorId) return null;

  const runRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
  const runData = (await runRes.json()) as { data?: { defaultDatasetId?: string } };
  const datasetId = runData?.data?.defaultDatasetId;
  if (!datasetId) return [];

  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&clean=true`,
  );
  if (!datasetRes.ok) throw new Error(`Apify dataset failed: ${datasetRes.status}`);
  return (await datasetRes.json()) as Array<Record<string, unknown>>;
}

function normalizeApifyItem(item: Record<string, unknown>): ViralCaptionResult | null {
  const captionText =
    String(item.caption ?? item.captionText ?? item.text ?? "").trim();
  if (!captionText) return null;

  const hashtagsRaw = Array.isArray(item.hashtags)
    ? (item.hashtags as unknown[])
    : captionText.match(/#[A-Za-z0-9_]+/g) || [];
  const hashtags = hashtagsRaw.map((tag) => String(tag));

  const creator = String(item.ownerUsername ?? item.username ?? item.author ?? "unknown_creator");
  const sourceUrl = String(item.url ?? item.postUrl ?? item.reelUrl ?? "https://example.com");
  const platform: "instagram" | "tiktok" =
    String(item.platform ?? "").toLowerCase().includes("tiktok") ? "tiktok" : "instagram";

  return {
    platform,
    sourceUrl,
    creatorHandle: creator.startsWith("@") ? creator : `@${creator}`,
    captionText,
    hashtags,
    likeCount: Number(item.likesCount ?? item.likeCount ?? item.likes ?? 0) || undefined,
    viewCount: Number(item.videoViewCount ?? item.playCount ?? item.views ?? 0) || undefined,
    commentCount: Number(item.commentsCount ?? item.commentCount ?? item.comments ?? 0) || undefined,
    postedAt: typeof item.timestamp === "string" ? item.timestamp : undefined,
  };
}

export const apifyProvider: ResearchProvider = {
  name: "apifyProvider",
  async collect(query: string) {
    try {
      const input: Record<string, unknown> = {};
      if (query.includes("instagram.com/reel/")) {
        input.directUrls = [query];
      } else if (query.startsWith("#")) {
        input.hashtags = [query.replace("#", "")];
      } else {
        const handle = query.replace("@", "").trim();
        input.usernames = [handle];
      }

      const items = (await runApifyActor(input)) ?? [];
      const normalized = items
        .map((item) => normalizeApifyItem(item))
        .filter((item): item is ViralCaptionResult => !!item);
      return normalized;
    } catch (error) {
      console.error("Apify provider failed:", error);
      return mockProvider.collect(query);
    }
  },
};

export function getResearchProvider(): ResearchProvider {
  if (process.env.APIFY_API_TOKEN && process.env.APIFY_INSTAGRAM_ACTOR_ID) {
    return apifyProvider;
  }
  return mockProvider;
}

export async function collectViralCaptions(query: string) {
  const provider = getResearchProvider();

  try {
    const results = await provider.collect(query);
    return results?.length ? results : mockProvider.collect(query);
  } catch (error) {
    console.error("Research provider failed, falling back to mockProvider:", error);
    return mockProvider.collect(query);
  }
}
