import { z } from "zod";

export const GenerationInputSchema = z.object({
  contentType: z.enum(["reel", "static", "announcement", "performance", "personal"]),
  visualDescription: z.string().min(10).max(200),
  songContext: z.string().max(300).optional().default(""),
  toneOverride: z.number().min(1).max(10).optional(),
  emojiLevel: z.enum(["none", "minimal", "moderate", "chaotic"]).optional(),
  lengthPreference: z.enum(["short", "medium", "long"]).optional(),
  callToAction: z.string().max(50).optional(),
});

export const GenerationResultSchema = z.object({
  captions: z
    .array(
      z.object({
        text: z.string().min(1),
        tone: z.string().min(1),
        hook: z.string().min(1),
      }),
    )
    .min(1),
  hooks: z.array(z.string().min(1)).min(1),
  hashtags: z.object({
    genre: z.array(z.string()),
    small: z.array(z.string()),
    medium: z.array(z.string()),
    large: z.array(z.string()),
  }),
});

export const FavoriteSchema = z.object({
  captionText: z.string().min(1).max(2200),
  contentType: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).optional().default([]),
});
