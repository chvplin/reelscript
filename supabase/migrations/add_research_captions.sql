CREATE TABLE IF NOT EXISTS public.research_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'instagram',
  source_url TEXT NOT NULL,
  creator_handle TEXT,
  caption_text TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  like_count INTEGER,
  view_count INTEGER,
  comment_count INTEGER,
  posted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.research_captions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own research captions" ON public.research_captions;
DROP POLICY IF EXISTS "Users can insert own research captions" ON public.research_captions;
DROP POLICY IF EXISTS "Users can delete own research captions" ON public.research_captions;

CREATE POLICY "Users can view own research captions"
ON public.research_captions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research captions"
ON public.research_captions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own research captions"
ON public.research_captions
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_research_captions_user_created
ON public.research_captions(user_id, created_at DESC);
