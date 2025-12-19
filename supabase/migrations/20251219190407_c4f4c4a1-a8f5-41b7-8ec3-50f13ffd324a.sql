-- Add floor_plan_url column to listings table
ALTER TABLE public.listings 
ADD COLUMN floor_plan_url TEXT;