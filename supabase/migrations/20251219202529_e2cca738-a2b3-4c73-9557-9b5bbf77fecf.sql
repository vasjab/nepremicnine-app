-- Create a table to track rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- can be user_id, IP, or fingerprint
  action TEXT NOT NULL, -- 'signup', 'login', 'create_listing'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, action, created_at DESC);

-- Enable RLS (allow service role only to manage this table)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - this table is managed by the application internally via service role
-- Users cannot directly access this table

-- Create cleanup function to remove old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - INTERVAL '1 hour';
END;
$$;

-- Create function to check rate limit (returns true if allowed, false if rate limited)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- If under limit, record this attempt and return true
  IF attempt_count < p_max_attempts THEN
    INSERT INTO public.rate_limits (identifier, action)
    VALUES (p_identifier, p_action);
    RETURN TRUE;
  END IF;
  
  -- Rate limited
  RETURN FALSE;
END;
$$;