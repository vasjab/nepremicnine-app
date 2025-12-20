-- Re-enable RLS on rate_limits with proper restrictive policy
-- This table is only accessed by edge functions using service_role (which bypasses RLS)
-- Regular users should never access this table directly
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create a restrictive policy that blocks all direct user access
-- Service role will bypass this, so edge functions still work
CREATE POLICY "No direct user access to rate_limits"
ON public.rate_limits
FOR ALL
USING (false)
WITH CHECK (false);