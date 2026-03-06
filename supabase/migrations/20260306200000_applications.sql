-- Rental application system

-- Application status enum
DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'applied', 'viewing_scheduled', 'under_review', 'accepted', 'declined'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  cover_letter TEXT,
  renter_snapshot JSONB,
  landlord_notes TEXT,
  viewing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id, renter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_listing_id ON public.applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_applications_renter_id ON public.applications(renter_id);
CREATE INDEX IF NOT EXISTS idx_applications_landlord_id ON public.applications(landlord_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Renters can view their own applications
CREATE POLICY "Renters can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (renter_id = auth.uid());

-- Landlords can view applications for their listings
CREATE POLICY "Landlords can view applications for their listings"
  ON public.applications FOR SELECT
  TO authenticated
  USING (landlord_id = auth.uid());

-- Renters can create applications
CREATE POLICY "Renters can create applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = auth.uid());

-- Landlords can update application status and notes
CREATE POLICY "Landlords can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (landlord_id = auth.uid())
  WITH CHECK (landlord_id = auth.uid());

-- Renters can delete their own applications (withdraw)
CREATE POLICY "Renters can withdraw applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (renter_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_applications_updated_at();
