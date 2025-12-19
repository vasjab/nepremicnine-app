import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/listing';

interface RecentlyViewedListing {
  id: string;
  user_id: string;
  listing_id: string;
  viewed_at: string;
  listing: Listing;
}

export function useRecentlyViewedListings(userId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ['recently-viewed', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('recently_viewed_listings')
        .select(`
          id,
          user_id,
          listing_id,
          viewed_at,
          listing:listings(*)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Filter out any entries where the listing was deleted
      return (data as unknown as RecentlyViewedListing[]).filter(item => item.listing !== null);
    },
    enabled: !!userId,
  });
}

export function useTrackListingView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: string; listingId: string }) => {
      // Upsert: insert or update the viewed_at timestamp
      const { error } = await supabase
        .from('recently_viewed_listings')
        .upsert(
          { user_id: userId, listing_id: listingId, viewed_at: new Date().toISOString() },
          { onConflict: 'user_id,listing_id' }
        );

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed', userId] });
    },
  });
}
