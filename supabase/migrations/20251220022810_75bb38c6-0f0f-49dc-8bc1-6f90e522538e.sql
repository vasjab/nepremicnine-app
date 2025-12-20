-- Add balcony and terrace size columns to listings table
ALTER TABLE public.listings 
ADD COLUMN balcony_sqm numeric NULL,
ADD COLUMN terrace_sqm numeric NULL;