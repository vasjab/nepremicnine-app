-- Add heating distribution column (central, individual, or both)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS heating_distribution text;

-- Add individual heater types as a text array for multi-select
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS individual_heater_types text[];