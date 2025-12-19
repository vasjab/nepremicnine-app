import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_on_new_message: boolean;
  email_daily_digest: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!userId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      preferences 
    }: { 
      userId: string; 
      preferences: Partial<Pick<NotificationPreferences, 'email_on_new_message' | 'email_daily_digest'>>
    }) => {
      // Try to update first
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(preferences)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            ...preferences,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', variables.userId] });
    },
  });
}
