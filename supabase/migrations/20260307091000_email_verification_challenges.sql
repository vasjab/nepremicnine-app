CREATE TABLE IF NOT EXISTS public.email_verification_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_challenges_email_created_at
  ON public.email_verification_challenges (lower(email), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_verification_challenges_pending
  ON public.email_verification_challenges (expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.email_verification_challenges ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_verification_challenges FROM anon, authenticated;
