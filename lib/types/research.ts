export interface ViralCaptionResult {
  platform: "instagram" | "tiktok";
  sourceUrl: string;
  creatorHandle: string;
  captionText: string;
  hashtags: string[];
  likeCount?: number;
  viewCount?: number;
  commentCount?: number;
  postedAt?: string;
}

export interface ViralCaptionAnalysisInput {
  captionText: string;
  hashtags: string[];
  metrics?: {
    likes?: number;
    views?: number;
    comments?: number;
  };
}

export interface ViralCaptionAnalysisResult {
  hookStyle: string;
  structure: string;
  tone: string;
  ctaStyle: string;
  hashtagStrategy: string;
  whyItWorks: string;
  originalCaptionDirections: string[];
}
