-- Add is_draft column for saving incomplete listings
ALTER TABLE public.listings ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT false;

-- Add current_step column to track wizard progress for resuming
ALTER TABLE public.listings ADD COLUMN current_step INTEGER DEFAULT 0;

-- Update RLS: Users can view their own listings (including drafts) 
-- Active listings policy already exists for public viewing
-- Need to ensure drafts don't appear in public search

-- Drop and recreate the active listings policy to exclude drafts
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;

CREATE POLICY "Active non-draft listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING (is_active = true AND is_draft = false);

-- Users can still see their own listings (including drafts) via existing policy