-- Enhanced renter profile fields: extended About You + optional details + references + cover letter

-- Enhanced "About You" fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_other TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pet_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_duration TEXT;        -- 'few_months' | 'a_year' | 'indefinite' | 'until_date'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_duration_date DATE;

-- Optional profile details (step 2)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_bracket TEXT;              -- '18_24' | '25_34' | '35_44' | '45_54' | '55_64' | '65_plus'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;           -- 'single' | 'married' | 'partner' | 'divorced' | 'widowed'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_kids BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kids_count INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kids_ages TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT;          -- 'high_school' | 'bachelors' | 'masters' | 'phd' | 'other'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- References (step 3)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS renter_references JSONB DEFAULT '[]';

-- Cover letter (step 4)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_cover_letter TEXT;

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
  employment_other text,
  monthly_income_range text,
  move_in_timeline text,
  household_size integer,
  has_pets boolean,
  pet_details text,
  is_smoker boolean,
  looking_duration text,
  looking_duration_date date,
  age_bracket text,
  marital_status text,
  has_kids boolean,
  kids_count integer,
  kids_ages text,
  nationality text,
  education_level text,
  occupation text,
  social_links jsonb,
  renter_references jsonb,
  default_cover_letter text,
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
    CASE
      WHEN auth.uid() = p.user_id THEN p.employment_other
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.employment_other
      ELSE NULL
    END as employment_other,
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
    CASE
      WHEN auth.uid() = p.user_id THEN p.pet_details
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.pet_details
      ELSE NULL
    END as pet_details,
    p.is_smoker,
    CASE
      WHEN auth.uid() = p.user_id THEN p.looking_duration
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.looking_duration
      ELSE NULL
    END as looking_duration,
    CASE
      WHEN auth.uid() = p.user_id THEN p.looking_duration_date
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.looking_duration_date
      ELSE NULL
    END as looking_duration_date,
    -- Optional details: visible to self, or to landlords in conversation
    CASE
      WHEN auth.uid() = p.user_id THEN p.age_bracket
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.age_bracket
      ELSE NULL
    END as age_bracket,
    CASE
      WHEN auth.uid() = p.user_id THEN p.marital_status
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.marital_status
      ELSE NULL
    END as marital_status,
    CASE
      WHEN auth.uid() = p.user_id THEN p.has_kids
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.has_kids
      ELSE false
    END as has_kids,
    CASE
      WHEN auth.uid() = p.user_id THEN p.kids_count
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.kids_count
      ELSE NULL
    END as kids_count,
    CASE
      WHEN auth.uid() = p.user_id THEN p.kids_ages
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.kids_ages
      ELSE NULL
    END as kids_ages,
    CASE
      WHEN auth.uid() = p.user_id THEN p.nationality
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.nationality
      ELSE NULL
    END as nationality,
    CASE
      WHEN auth.uid() = p.user_id THEN p.education_level
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.education_level
      ELSE NULL
    END as education_level,
    CASE
      WHEN auth.uid() = p.user_id THEN p.occupation
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.occupation
      ELSE NULL
    END as occupation,
    CASE
      WHEN auth.uid() = p.user_id THEN p.social_links
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.social_links
      ELSE NULL
    END as social_links,
    -- References: only visible to self and conversation partners
    CASE
      WHEN auth.uid() = p.user_id THEN p.renter_references
      WHEN public.are_in_conversation(auth.uid(), p.user_id) THEN p.renter_references
      ELSE NULL
    END as renter_references,
    -- Default cover letter: only visible to self
    CASE
      WHEN auth.uid() = p.user_id THEN p.default_cover_letter
      ELSE NULL
    END as default_cover_letter,
    p.num_properties,
    p.management_type,
    p.response_time
  FROM profiles p
  WHERE p.user_id = p_profile_user_id;
END;
$$;
