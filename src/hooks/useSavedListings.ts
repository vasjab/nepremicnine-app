import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SavedListing, Listing } from '@/types/listing';

export function useSavedListings(userId: string | undefined) {
  return useQuery({
    queryKey: ['saved-listings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('saved_listings')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data as (SavedListing & { listing: Listing })[];
    },
    enabled: !!userId,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: string; listingId: string }) => {
      const { data, error } = await supabase
        .from('saved_listings')
        .insert({ user_id: userId, listing_id: listingId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ userId, listingId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['is-saved', userId, listingId] });
      
      // Snapshot the previous value
      const previousValue = queryClient.getQueryData(['is-saved', userId, listingId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['is-saved', userId, listingId], true);
      
      return { previousValue };
    },
    onError: (err, { userId, listingId }, context) => {
      // Rollback on error
      queryClient.setQueryData(['is-saved', userId, listingId], context?.previousValue);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['is-saved', variables.userId, variables.listingId] });
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: string; listingId: string }) => {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      if (error) throw error;
    },
    onMutate: async ({ userId, listingId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['is-saved', userId, listingId] });
      
      // Snapshot the previous value
      const previousValue = queryClient.getQueryData(['is-saved', userId, listingId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['is-saved', userId, listingId], false);
      
      return { previousValue };
    },
    onError: (err, { userId, listingId }, context) => {
      // Rollback on error
      queryClient.setQueryData(['is-saved', userId, listingId], context?.previousValue);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-listings', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['is-saved', variables.userId, variables.listingId] });
    },
  });
}

export function useIsListingSaved(userId: string | undefined, listingId: string | undefined) {
  return useQuery({
    queryKey: ['is-saved', userId, listingId],
    queryFn: async () => {
      if (!userId || !listingId) return false;
      const { data, error } = await supabase
        .from('saved_listings')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!listingId,
  });
}
