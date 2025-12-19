-- Create a table to track recently viewed listings
CREATE TABLE public.recently_viewed_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE public.recently_viewed_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own recently viewed listings" 
ON public.recently_viewed_listings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently viewed listings" 
ON public.recently_viewed_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently viewed listings" 
ON public.recently_viewed_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recently viewed listings" 
ON public.recently_viewed_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_recently_viewed_user_viewed_at ON public.recently_viewed_listings(user_id, viewed_at DESC);