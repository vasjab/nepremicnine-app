import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchResult {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  listing_title?: string;
}

export function useSearchMessages(query: string, userId: string | undefined) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['message-search', debouncedQuery, userId],
    queryFn: async () => {
      if (!userId || !debouncedQuery || debouncedQuery.length < 2) return [];

      // Get user's conversations first
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, listing:listings(title)')
        .or(`renter_id.eq.${userId},landlord_id.eq.${userId}`);

      if (!conversations || conversations.length === 0) return [];

      const conversationIds = conversations.map(c => c.id);
      const listingTitleMap = new Map(
        conversations.map(c => [c.id, (c.listing as { title: string } | null)?.title])
      );

      // Search messages in those conversations
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .eq('is_deleted', false)
        .ilike('content', `%${debouncedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (messages || []).map(msg => ({
        ...msg,
        listing_title: listingTitleMap.get(msg.conversation_id),
      })) as SearchResult[];
    },
    enabled: !!userId && !!debouncedQuery && debouncedQuery.length >= 2,
  });
}
