import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingData {
  user_intents: string[];
  // Renter fields — About You
  employment_status?: string;
  employment_other?: string;
  monthly_income_range?: string;
  move_in_timeline?: string;
  household_size?: number;
  has_pets?: boolean;
  pet_details?: string;
  is_smoker?: boolean;
  looking_duration?: string;
  looking_duration_date?: string;
  // Optional details
  age_bracket?: string;
  marital_status?: string;
  has_kids?: boolean;
  kids_count?: number;
  kids_ages?: string;
  nationality?: string;
  education_level?: string;
  occupation?: string;
  social_links?: Record<string, string>;
  // References
  renter_references?: Array<{ name: string; contact: string; relationship: string }>;
  // Cover letter
  default_cover_letter?: string;
  // Landlord fields
  num_properties?: number;
  management_type?: string;
  response_time?: string;
}

export function useOnboardingStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, user_intents')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
