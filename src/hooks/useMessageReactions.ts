import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Fetch reactions for messages in a conversation
export function useMessageReactions(messageIds: string[]) {
  return useQuery({
    queryKey: ['message-reactions', messageIds],
    queryFn: async () => {
      if (messageIds.length === 0) return [];

      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;
      return data as MessageReaction[];
    },
    enabled: messageIds.length > 0,
  });
}

// Toggle a reaction on a message
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, userId, emoji }: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({ message_id: messageId, user_id: userId, emoji });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
    },
  });
}
