import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

interface ListingStats {
  viewCount: number;
  daysListed: number;
  contactCount: number;
  isHotListing: boolean;
}

export function useListingStats(listingId: string | undefined, createdAt: string | undefined) {
  const hasTrackedView = useRef(false);

  // Increment view count on mount (only once per session)
  useEffect(() => {
    const incrementView = async () => {
      if (listingId && !hasTrackedView.current) {
        hasTrackedView.current = true;
        try {
          await supabase.rpc('increment_listing_view', { p_listing_id: listingId });
        } catch (error) {
          console.error('Failed to increment view count:', error);
        }
      }
    };
    incrementView();
  }, [listingId]);

  return useQuery({
    queryKey: ['listing-stats', listingId],
    queryFn: async (): Promise<ListingStats> => {
      if (!listingId) {
        return { viewCount: 0, daysListed: 0, contactCount: 0, isHotListing: false };
      }

      // Fetch view count from listing_stats
      const { data: statsData } = await supabase
        .from('listing_stats')
        .select('view_count')
        .eq('listing_id', listingId)
        .single();

      // Fetch contact count from conversations
      const { count: contactCount } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId);

      // Calculate days listed
      const daysListed = createdAt
        ? Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      const viewCount = statsData?.view_count ?? 0;
      const contacts = contactCount ?? 0;

      // "Hot" listing logic: high engagement rate
      // Formula: (views + contacts * 5) / days_listed > 10
      // Or: more than 5 contacts OR more than 50 views in first 7 days
      const engagementScore = daysListed > 0 ? (viewCount + contacts * 5) / daysListed : 0;
      const isNewAndPopular = daysListed <= 7 && (contacts > 5 || viewCount > 50);
      const isHotListing = engagementScore > 10 || isNewAndPopular;

      return {
        viewCount,
        daysListed,
        contactCount: contacts,
        isHotListing,
      };
    },
    enabled: !!listingId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
