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

function calculateSimilarityScore(candidate: Listing, reference: Listing): number {
  let score = 0;
  
  // City match (25 points)
  if (candidate.city.toLowerCase() === reference.city.toLowerCase()) {
    score += 25;
  }
  
  // Property type match (15 points)
  if (candidate.property_type === reference.property_type) {
    score += 15;
  }
  
  // Price similarity (up to 20 points)
  const priceDiff = Math.abs(candidate.price - reference.price) / reference.price;
  if (priceDiff <= 0.1) score += 20;
  else if (priceDiff <= 0.25) score += 15;
  else if (priceDiff <= 0.5) score += 10;
  else if (priceDiff <= 0.75) score += 5;
  
  // Bedroom match (up to 10 points)
  const bedroomDiff = Math.abs(candidate.bedrooms - reference.bedrooms);
  if (bedroomDiff === 0) score += 10;
  else if (bedroomDiff === 1) score += 5;
  else if (bedroomDiff === 2) score += 2;
  
  // Size similarity (up to 10 points) - only if both have area_sqm
  if (candidate.area_sqm && reference.area_sqm) {
    const sizeDiff = Math.abs(candidate.area_sqm - reference.area_sqm) / reference.area_sqm;
    if (sizeDiff <= 0.1) score += 10;
    else if (sizeDiff <= 0.25) score += 7;
    else if (sizeDiff <= 0.5) score += 4;
  }
  
  return score;
}

export function useSimilarListings(listing: Listing | null | undefined, limit: number = 6) {
  return useQuery({
    queryKey: ['similar-listings', listing?.id],
    queryFn: async () => {
      if (!listing) return [];
      
      // Fetch a broader pool of candidates with same listing type
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .eq('listing_type', listing.listing_type)
        .neq('id', listing.id)
        .limit(50);

      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Score each candidate and sort by similarity
      const scoredListings = data.map(candidate => ({
        listing: candidate as Listing,
        score: calculateSimilarityScore(candidate as Listing, listing)
      }));
      
      scoredListings.sort((a, b) => b.score - a.score);
      
      return scoredListings.slice(0, limit).map(item => item.listing);
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
