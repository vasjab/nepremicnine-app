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
      if (filters?.property_types && filters.property_types.length > 0) {
        query = query.in('property_type', filters.property_types as ('apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other')[]);
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

export function useSimilarListings(listing: Listing | null | undefined, limit: number = 6) {
  return useQuery({
    queryKey: ['similar-listings', listing?.id],
    queryFn: async () => {
      if (!listing) return [];
      
      // Find listings in the same city with the same listing type, excluding current
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .eq('listing_type', listing.listing_type)
        .eq('city', listing.city)
        .neq('id', listing.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // If we don't have enough results, fetch more from same property type
      if (data.length < limit) {
        const remaining = limit - data.length;
        const existingIds = [listing.id, ...data.map(l => l.id)];
        
        const { data: moreData, error: moreError } = await supabase
          .from('listings')
          .select('*')
          .eq('is_active', true)
          .eq('listing_type', listing.listing_type)
          .eq('property_type', listing.property_type)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(remaining);

        if (!moreError && moreData) {
          return [...data, ...moreData] as Listing[];
        }
      }
      
      return data as Listing[];
    },
    enabled: !!listing,
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
