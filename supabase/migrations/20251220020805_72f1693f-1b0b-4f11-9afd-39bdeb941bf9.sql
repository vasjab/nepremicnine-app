-- Create listing_stats table for tracking view counts
CREATE TABLE public.listing_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_stats ENABLE ROW LEVEL SECURITY;

-- Everyone can read stats (public data for active listings)
CREATE POLICY "Anyone can view listing stats" ON public.listing_stats
  FOR SELECT USING (true);

-- Function to increment view count (SECURITY DEFINER allows anonymous increments)
CREATE OR REPLACE FUNCTION public.increment_listing_view(p_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.listing_stats (listing_id, view_count)
  VALUES (p_listing_id, 1)
  ON CONFLICT (listing_id) 
  DO UPDATE SET view_count = listing_stats.view_count + 1;
END;
$$;