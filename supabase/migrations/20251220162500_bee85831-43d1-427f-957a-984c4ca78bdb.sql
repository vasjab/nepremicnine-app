-- Add expense breakdown columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS expense_breakdown_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS expense_hoa_fees numeric,
ADD COLUMN IF NOT EXISTS expense_maintenance numeric,
ADD COLUMN IF NOT EXISTS expense_property_tax numeric,
ADD COLUMN IF NOT EXISTS expense_utilities numeric,
ADD COLUMN IF NOT EXISTS expense_insurance numeric,
ADD COLUMN IF NOT EXISTS expense_other numeric;