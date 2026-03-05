import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/listing';
import { useCallback, useEffect, useState } from 'react';

const LOCALSTORAGE_KEY = 'recently_viewed_listings';
const MAX_LOCALSTORAGE_ITEMS = 20;

interface RecentlyViewedListing {
  id: string;
  user_id: string;
  listing_id: string;
  viewed_at: string;
  listing: Listing;
}

interface LocalStorageViewedItem {
  listing_id: string;
  viewed_at: string;
}

// Get viewed listing IDs from localStorage
function getLocalStorageViewed(): LocalStorageViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save viewed listing IDs to localStorage
function setLocalStorageViewed(items: LocalStorageViewedItem[]) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(items.slice(0, MAX_LOCALSTORAGE_ITEMS)));
  } catch {
    // Ignore storage errors
  }
}

// Hook for authenticated users (database-backed)
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

// Hook for non-authenticated users (localStorage-backed)
export function useLocalRecentlyViewedListings(limit: number = 10) {
  const [viewedIds, setViewedIds] = useState<LocalStorageViewedItem[]>([]);

  useEffect(() => {
    setViewedIds(getLocalStorageViewed());
  }, []);

  return useQuery({
    queryKey: ['recently-viewed-local', viewedIds.map(v => v.listing_id).join(',')],
    queryFn: async () => {
      if (viewedIds.length === 0) return [];
      
      const ids = viewedIds.slice(0, limit).map(v => v.listing_id);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

      if (error) throw error;
      
      // Sort by viewed_at order from localStorage
      const idOrder = new Map(viewedIds.map((v, i) => [v.listing_id, i]));
      return (data as Listing[]).sort((a, b) => 
        (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999)
      );
    },
    enabled: viewedIds.length > 0,
  });
}

// Track listing view for authenticated users
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

// Track listing view for non-authenticated users (localStorage)
export function useTrackLocalListingView() {
  const queryClient = useQueryClient();

  const trackView = useCallback((listingId: string) => {
    const viewed = getLocalStorageViewed();
    // Remove if already exists
    const filtered = viewed.filter(v => v.listing_id !== listingId);
    // Add to front
    const updated = [{ listing_id: listingId, viewed_at: new Date().toISOString() }, ...filtered];
    setLocalStorageViewed(updated);
    queryClient.invalidateQueries({ queryKey: ['recently-viewed-local'] });
  }, [queryClient]);

  return { trackView };
}
