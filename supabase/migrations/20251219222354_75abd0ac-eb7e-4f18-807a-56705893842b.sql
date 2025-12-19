-- Add comprehensive filter columns to listings table

-- Building/Floor info
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS floor_number INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS total_floors_building INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS property_floors INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_elevator BOOLEAN DEFAULT false;

-- Outdoor features
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_balcony BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_terrace BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_garden BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS garden_sqm NUMERIC DEFAULT NULL;

-- Parking
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS parking_type TEXT DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_garage BOOLEAN DEFAULT false;

-- Amenities
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_storage BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_air_conditioning BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_dishwasher BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_washing_machine BOOLEAN DEFAULT false;

-- Building info
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS heating_type TEXT DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS energy_rating TEXT DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS year_built INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS property_condition TEXT DEFAULT NULL;

-- Rental-specific
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS min_lease_months INTEGER DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS internet_included TEXT DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS utilities_included TEXT DEFAULT NULL;

-- Add indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_listings_floor_number ON public.listings(floor_number);
CREATE INDEX IF NOT EXISTS idx_listings_has_elevator ON public.listings(has_elevator);
CREATE INDEX IF NOT EXISTS idx_listings_has_parking ON public.listings(has_parking);
CREATE INDEX IF NOT EXISTS idx_listings_has_balcony ON public.listings(has_balcony);
CREATE INDEX IF NOT EXISTS idx_listings_energy_rating ON public.listings(energy_rating);
CREATE INDEX IF NOT EXISTS idx_listings_year_built ON public.listings(year_built);
CREATE INDEX IF NOT EXISTS idx_listings_is_furnished ON public.listings(is_furnished);
CREATE INDEX IF NOT EXISTS idx_listings_allows_pets ON public.listings(allows_pets);