-- Add Outdoor & Views columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_rooftop_terrace BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_bbq_area BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_playground BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_waterfront BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_view BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS view_type TEXT;

-- Add Parking & Storage columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_carport BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_ev_charging BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_bicycle_storage BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_basement BOOLEAN DEFAULT false;

-- Add Building Amenities columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_shared_laundry BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_gym BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_sauna BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_common_room BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_concierge BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_security BOOLEAN DEFAULT false;

-- Add Energy & Comfort columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_floor_heating BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_district_heating BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_heat_pump BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_ventilation BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_solar_panels BOOLEAN DEFAULT false;

-- Add Accessibility columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_step_free_access BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_wheelchair_accessible BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_wide_doorways BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_ground_floor_access BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_elevator_from_garage BOOLEAN DEFAULT false;

-- Add Safety & Privacy columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_secure_entrance BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_intercom BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_gated_community BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_fire_safety BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_soundproofing BOOLEAN DEFAULT false;

-- Add Interior Highlights columns
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_high_ceilings BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_large_windows BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_smart_home BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS has_built_in_wardrobes BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS orientation TEXT;