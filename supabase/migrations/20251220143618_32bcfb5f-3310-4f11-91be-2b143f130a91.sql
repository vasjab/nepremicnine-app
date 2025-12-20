-- Add optional comment fields for furnished and pets allowed
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS furnished_details TEXT,
ADD COLUMN IF NOT EXISTS pets_details TEXT;