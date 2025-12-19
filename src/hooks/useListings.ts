import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing, ListingFilters } from '@/types/listing';

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.listing_type) {
        query = query.eq('listing_type', filters.listing_type);
      }
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type as 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other');
      }
      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters?.min_bedrooms) {
        query = query.gte('bedrooms', filters.min_bedrooms);
      }
      if (filters?.max_bedrooms) {
        query = query.lte('bedrooms', filters.max_bedrooms);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useMyListings(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-listings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Listing[];
    },
    enabled: !!userId,
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('listings')
        .insert(listing)
        .select()
        .single();

      if (error) throw error;
      return data as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Listing> & { id: string }) => {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Listing;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}
