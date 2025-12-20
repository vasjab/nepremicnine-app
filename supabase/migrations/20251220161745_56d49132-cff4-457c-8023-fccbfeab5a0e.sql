-- Add new columns for enhanced wizard step features
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS ev_charger_power text,
ADD COLUMN IF NOT EXISTS has_stroller_storage boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS elevator_condition text,
ADD COLUMN IF NOT EXISTS has_alarm_system boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_cctv boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_floor_cooling boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_home_battery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_window_shades boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_electric_shades boolean DEFAULT false;