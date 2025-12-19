-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can view profiles of active listing owners (for contacting about listings)
CREATE POLICY "Authenticated users can view listing owner profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_id IN (
    SELECT DISTINCT user_id FROM public.listings WHERE is_active = true AND user_id IS NOT NULL
  )
);