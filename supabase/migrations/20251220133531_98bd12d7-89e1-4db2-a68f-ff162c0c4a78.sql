-- Function to check if two users are in a conversation together
CREATE OR REPLACE FUNCTION public.are_in_conversation(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversations
    WHERE (renter_id = user_a AND landlord_id = user_b)
       OR (renter_id = user_b AND landlord_id = user_a)
  )
$$;

-- Function to get profile with conditional phone visibility
CREATE OR REPLACE FUNCTION public.get_profile_for_viewer(p_profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
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
    p.updated_at
  FROM profiles p
  WHERE p.user_id = p_profile_user_id;
END;
$$;