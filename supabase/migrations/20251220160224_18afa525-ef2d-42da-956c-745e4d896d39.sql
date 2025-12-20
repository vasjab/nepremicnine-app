-- Add new columns for wizard improvements

-- 1. Add living rooms counter
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS living_rooms integer DEFAULT 1;

-- 2. Add waterfront distance in meters
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS waterfront_distance_m integer;

-- 3. Add AC type and unit count for climate control reorganization
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS ac_type text; -- 'central' or 'unit'
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS ac_unit_count integer;

-- 4. Add heat recovery ventilation
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_heat_recovery_ventilation boolean DEFAULT false;