
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can insert comments
CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
