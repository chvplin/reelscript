export type ResearchEntry = {
  id: string;
  creatorHandle: string;
  captionPreview: string;
  hashtags: string[];
  likes: number | null;
  views: number | null;
  comments: number | null;
  reelUrl: string;
  collectedAt: string;
};

function inferHashtags(query: string) {
  const seed = query.toLowerCase();
  if (seed.includes("hyperpop")) return ["#hyperpop", "#newmusic", "#musicpromo"];
  if (seed.includes("indie")) return ["#indiemusic", "#newmusic", "#artist"];
  return ["#newmusic", "#musicpromo", "#reels"];
}

function makeEntry(base: Partial<ResearchEntry>, idx: number, query: string): ResearchEntry {
  return {
    id: `entry-${Date.now()}-${idx}`,
    creatorHandle: base.creatorHandle || `artist_${idx + 1}`,
    captionPreview: base.captionPreview || `New drop energy. ${query} vibe in motion.`,
    hashtags: base.hashtags || inferHashtags(query),
    likes: base.likes ?? 1000 + idx * 350,
    views: base.views ?? 10000 + idx * 4000,
    comments: base.comments ?? 80 + idx * 20,
    reelUrl: base.reelUrl || "https://instagram.com/",
    collectedAt: new Date().toISOString(),
  };
}

export async function collectResearchEntries(sourceType: "reel_url" | "profile" | "hashtag", query: string): Promise<ResearchEntry[]> {
  if (sourceType === "reel_url") {
    const url = query.startsWith("http") ? query : `https://instagram.com/reel/${query}`;
    const handleMatch = url.match(/instagram\.com\/([^/]+)/i);
    const handle = handleMatch?.[1] && handleMatch[1] !== "reel" ? `@${handleMatch[1]}` : "@music_creator";
    return [
      makeEntry(
        {
          creatorHandle: handle,
          reelUrl: url,
          captionPreview: "Late-night drop with emotional hook. Link in bio.",
          hashtags: inferHashtags(query),
        },
        0,
        query,
      ),
    ];
  }

  if (sourceType === "profile") {
    const profileHandle = query.startsWith("@") ? query : `@${query.replace(/\s+/g, "")}`;
    return [0, 1, 2].map((idx) =>
      makeEntry(
        {
          creatorHandle: profileHandle,
          reelUrl: `https://instagram.com/${profileHandle.replace("@", "")}`,
          captionPreview: idx === 0 ? "POV: you found your new favorite chorus." : idx === 1 ? "I made this at 3am and it hurts." : "If this hits, presave is live.",
        },
        idx,
        query,
      ),
    );
  }

  const tag = query.startsWith("#") ? query : `#${query.replace(/\s+/g, "")}`;
  return [0, 1, 2, 3].map((idx) =>
    makeEntry(
      {
        creatorHandle: `@trend_artist_${idx + 1}`,
        reelUrl: "https://instagram.com/explore/",
        captionPreview: idx % 2 === 0 ? `This ${tag} drop is all chaos and glitter.` : `If ${tag} had a soundtrack, this is it.`,
        hashtags: [tag, ...inferHashtags(query)],
      },
      idx,
      query,
    ),
  );
}
