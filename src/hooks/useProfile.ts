import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_intents: string[];
  onboarding_completed: boolean;
  // Renter fields
  employment_status: string | null;
  employment_other: string | null;
  monthly_income_range: string | null;
  move_in_timeline: string | null;
  household_size: number | null;
  has_pets: boolean;
  pet_details: string | null;
  is_smoker: boolean;
  looking_duration: string | null;
  looking_duration_date: string | null;
  // Optional profile details
  age_bracket: string | null;
  marital_status: string | null;
  has_kids: boolean;
  kids_count: number | null;
  kids_ages: string | null;
  nationality: string | null;
  education_level: string | null;
  occupation: string | null;
  social_links: Record<string, string> | null;
  // References & cover letter
  renter_references: Array<{ name: string; contact: string; relationship: string }> | null;
  default_cover_letter: string | null;
  // Landlord fields
  num_properties: number | null;
  management_type: string | null;
  response_time: string | null;
}

/**
 * Securely fetch a user's profile using the get_profile_for_viewer RPC.
 * This function respects privacy settings - phone is only visible to
 * the profile owner or users in a conversation with them.
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as ProfileData;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch multiple profiles at once using the secure RPC.
 * Useful for batch operations like loading conversation participants.
 */
export async function fetchProfilesBatch(userIds: string[]): Promise<Map<string, ProfileData>> {
  const profileMap = new Map<string, ProfileData>();
  
  if (userIds.length === 0) return profileMap;

  // Deduplicate user IDs
  const uniqueIds = [...new Set(userIds)];

  // Fetch profiles in parallel using the secure RPC
  const results = await Promise.all(
    uniqueIds.map(async (userId) => {
      const { data } = await supabase
        .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
        .single();
      return { userId, profile: data as ProfileData | null };
    })
  );

  results.forEach(({ userId, profile }) => {
    if (profile) {
      profileMap.set(userId, profile);
    }
  });

  return profileMap;
}

/**
 * Simple profile name fetch for cases where we only need the display name.
 * Uses the secure RPC to respect privacy settings.
 */
export async function fetchProfileName(userId: string): Promise<string> {
  const { data } = await supabase
    .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
    .single();
  
  return data?.full_name || 'Unknown';
}
