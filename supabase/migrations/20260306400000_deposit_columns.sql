-- Enhanced deposit handling for rental listings

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS deposit_type TEXT;          -- 'fixed' | 'months'
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS deposit_months INTEGER;
