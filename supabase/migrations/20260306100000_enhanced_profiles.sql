-- Enhanced profiles: user intents, renter fields, landlord fields, onboarding flag

-- User intents (multi-select)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_intents TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Renter fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS move_in_timeline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_size INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_smoker BOOLEAN DEFAULT false;

-- Landlord fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS num_properties INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS management_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS response_time TEXT;

-- Update get_profile_for_viewer to return new columns
DROP FUNCTION IF EXISTS public.get_profile_for_viewer(uuid);
CREATE OR REPLACE FUNCTION public.get_profile_for_viewer(p_profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz,
  user_intents text[],
  onboarding_completed boolean,
  employment_status text,
  monthly_income_range text,
  move_in_timeline text,
  household_size integer,
  has_pets boolean,
  is_smoker boolean,
  num_properties integer,
  management_type text,
  response_time text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    CASE
      WHEN auth.uid() = p.user_id THEN p.phone
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.phone
      ELSE NULL
    END as phone,
    p.created_at,
    p.updated_at,
    p.user_intents,
    p.onboarding_completed,
    -- Renter fields: visible to self, or to landlords in conversation
    CASE
      WHEN auth.uid() = p.user_id THEN p.employment_status
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.employment_status
      ELSE NULL
    END as employment_status,
    -- Income: only visible to self
    CASE
      WHEN auth.uid() = p.user_id THEN p.monthly_income_range
      ELSE NULL
    END as monthly_income_range,
    CASE
      WHEN auth.uid() = p.user_id THEN p.move_in_timeline
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.move_in_timeline
      ELSE NULL
    END as move_in_timeline,
    CASE
      WHEN auth.uid() = p.user_id THEN p.household_size
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.household_size
      ELSE NULL
    END as household_size,
    p.has_pets,
    p.is_smoker,
    p.num_properties,
    p.management_type,
    p.response_time
  FROM profiles p
  WHERE p.user_id = p_profile_user_id;
END;
$$;
