-- Add new columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS house_type text,
ADD COLUMN IF NOT EXISTS utility_cost_estimate numeric,
ADD COLUMN IF NOT EXISTS monthly_expenses numeric,
ADD COLUMN IF NOT EXISTS has_fireplace boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_dryer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS move_in_immediately boolean DEFAULT true;

-- Add summer_house to property_type enum
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'summer_house';