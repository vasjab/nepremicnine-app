import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing, ListingFilters } from '@/types/listing';

export function useListings(filters?: ListingFilters, userId?: string) {
  return useQuery({
    queryKey: ['listings', filters, userId],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Owner filter
      if (filters?.owner_filter === 'mine' && userId) {
        query = query.eq('user_id', userId);
      } else if (filters?.owner_filter === 'others' && userId) {
        query = query.neq('user_id', userId);
      }

      // Basic filters
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
      if (filters?.min_bathrooms) {
        query = query.gte('bathrooms', filters.min_bathrooms);
      }
      if (filters?.min_area) {
        query = query.gte('area_sqm', filters.min_area);
      }
      if (filters?.max_area) {
        query = query.lte('area_sqm', filters.max_area);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      // Multi-field search (title, description, city, address)
      if (filters?.search) {
        const searchTerm = filters.search.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      // Feature filters
      if (filters?.is_furnished === true) {
        query = query.eq('is_furnished', true);
      }
      if (filters?.allows_pets === true) {
        query = query.eq('allows_pets', true);
      }
      if (filters?.available_from) {
        query = query.lte('available_from', filters.available_from);
      }

      // Building/Floor filters
      if (filters?.min_floor) {
        query = query.gte('floor_number', filters.min_floor);
      }
      if (filters?.max_floor) {
        query = query.lte('floor_number', filters.max_floor);
      }
      if (filters?.has_elevator === true) {
        query = query.eq('has_elevator', true);
      }
      if (filters?.min_property_floors) {
        query = query.gte('property_floors', filters.min_property_floors);
      }

      // Outdoor filters
      if (filters?.has_balcony === true) {
        query = query.eq('has_balcony', true);
      }
      if (filters?.has_terrace === true) {
        query = query.eq('has_terrace', true);
      }
      if (filters?.has_garden === true) {
        query = query.eq('has_garden', true);
      }

      // Parking filters
      if (filters?.has_parking === true) {
        query = query.eq('has_parking', true);
      }
      if (filters?.parking_type) {
        query = query.eq('parking_type', filters.parking_type);
      }
      if (filters?.has_garage === true) {
        query = query.eq('has_garage', true);
      }
      if (filters?.has_ev_charging === true) {
        query = query.eq('has_ev_charging', true);
      }
      if (filters?.has_bicycle_storage === true) {
        query = query.eq('has_bicycle_storage', true);
      }
      if (filters?.has_basement === true) {
        query = query.eq('has_basement', true);
      }

      // Outdoor filters (extended)
      if (filters?.has_rooftop_terrace === true) {
        query = query.eq('has_rooftop_terrace', true);
      }
      if (filters?.has_waterfront === true) {
        query = query.eq('has_waterfront', true);
      }
      if (filters?.has_view === true) {
        query = query.eq('has_view', true);
      }
      if (filters?.view_type) {
        query = query.eq('view_type', filters.view_type);
      }

      // Building Amenities filters
      if (filters?.has_gym === true) {
        query = query.eq('has_gym', true);
      }
      if (filters?.has_pool === true) {
        query = query.eq('has_pool', true);
      }
      if (filters?.has_sauna === true) {
        query = query.eq('has_sauna', true);
      }
      if (filters?.has_concierge === true) {
        query = query.eq('has_concierge', true);
      }
      if (filters?.has_security === true) {
        query = query.eq('has_security', true);
      }
      if (filters?.has_shared_laundry === true) {
        query = query.eq('has_shared_laundry', true);
      }

      // Equipment filters
      if (filters?.has_dryer === true) {
        query = query.eq('has_dryer', true);
      }

      // Energy & Comfort filters
      if (filters?.has_fireplace === true) {
        query = query.eq('has_fireplace', true);
      }
      if (filters?.has_floor_heating === true) {
        query = query.eq('has_floor_heating', true);
      }
      if (filters?.has_solar_panels === true) {
        query = query.eq('has_solar_panels', true);
      }
      if (filters?.has_smart_home === true) {
        query = query.eq('has_smart_home', true);
      }

      // Accessibility filters
      if (filters?.has_step_free_access === true) {
        query = query.eq('has_step_free_access', true);
      }
      if (filters?.has_wheelchair_accessible === true) {
        query = query.eq('has_wheelchair_accessible', true);
      }

      // Safety filters
      if (filters?.has_secure_entrance === true) {
        query = query.eq('has_secure_entrance', true);
      }
      if (filters?.has_gated_community === true) {
        query = query.eq('has_gated_community', true);
      }

      // Floor plan filter (check floor_plan_url is not null)
      if (filters?.has_floor_plan === true) {
        query = query.not('floor_plan_url', 'is', null);
      }

      // Amenities filters
      if (filters?.has_storage === true) {
        query = query.eq('has_storage', true);
      }
      if (filters?.has_air_conditioning === true) {
        query = query.eq('has_air_conditioning', true);
      }
      if (filters?.has_dishwasher === true) {
        query = query.eq('has_dishwasher', true);
      }
      if (filters?.has_washing_machine === true) {
        query = query.eq('has_washing_machine', true);
      }

      // Building info filters
      if (filters?.heating_type) {
        query = query.eq('heating_type', filters.heating_type);
      }
      if (filters?.energy_rating && filters.energy_rating.length > 0) {
        query = query.in('energy_rating', filters.energy_rating);
      }
      if (filters?.min_year_built) {
        query = query.gte('year_built', filters.min_year_built);
      }
      if (filters?.max_year_built) {
        query = query.lte('year_built', filters.max_year_built);
      }
      if (filters?.property_condition && filters.property_condition.length > 0) {
        query = query.in('property_condition', filters.property_condition);
      }

      // Rental/Availability filters
      if (filters?.move_in_immediately === true) {
        query = query.eq('move_in_immediately', true);
      }
      if (filters?.max_deposit) {
        query = query.lte('deposit_amount', filters.max_deposit);
      }
      if (filters?.max_lease_months) {
        query = query.lte('min_lease_months', filters.max_lease_months);
      }
      if (filters?.internet_included) {
        query = query.eq('internet_included', filters.internet_included);
      }
      if (filters?.utilities_included) {
        query = query.eq('utilities_included', filters.utilities_included);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let listings = data as Listing[];
      
      // Client-side filter: price per sqm (computed field)
      if (filters?.min_price_per_sqm || filters?.max_price_per_sqm) {
        const minPerSqm = filters.min_price_per_sqm || 0;
        const maxPerSqm = filters.max_price_per_sqm || Infinity;
        
        listings = listings.filter(listing => {
          if (!listing.area_sqm || listing.area_sqm <= 0) return true; // Include if no area
          const pricePerSqm = listing.price / listing.area_sqm;
          return pricePerSqm >= minPerSqm && pricePerSqm <= maxPerSqm;
        });
      }
      
      return listings;
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
  if (reference.price <= 0) return score;
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

// Type for creating a listing - new fields are optional with defaults in DB
type CreateListingInput = Omit<Listing, 'id' | 'created_at' | 'updated_at' | 
  'floor_number' | 'total_floors_building' | 'property_floors' | 'has_elevator' |
  'has_balcony' | 'balcony_sqm' | 'has_terrace' | 'terrace_sqm' | 'has_garden' | 'garden_sqm' |
  'has_rooftop_terrace' | 'has_bbq_area' | 'has_playground' | 'has_waterfront' | 'has_view' | 'view_type' |
  'has_parking' | 'parking_type' | 'parking_spaces' | 'has_garage' |
  'has_carport' | 'has_ev_charging' | 'has_bicycle_storage' | 'has_basement' |
  'has_shared_laundry' | 'has_gym' | 'has_sauna' | 'has_pool' | 'has_common_room' | 'has_concierge' | 'has_security' |
  'has_storage' | 'has_air_conditioning' | 'has_dishwasher' | 'has_washing_machine' | 'has_dryer' |
  'has_fireplace' | 'has_floor_heating' | 'has_district_heating' | 'has_heat_pump' | 'has_ventilation' | 'has_solar_panels' |
  'has_high_ceilings' | 'has_large_windows' | 'has_smart_home' | 'has_built_in_wardrobes' | 'orientation' |
  'has_step_free_access' | 'has_wheelchair_accessible' | 'has_wide_doorways' | 'has_ground_floor_access' | 'has_elevator_from_garage' |
  'has_secure_entrance' | 'has_intercom' | 'has_gated_community' | 'has_fire_safety' | 'has_soundproofing' |
  'heating_type' | 'energy_rating' | 'year_built' | 'property_condition' |
  'deposit_amount' | 'min_lease_months' | 'internet_included' | 'utilities_included' | 'utility_cost_estimate' | 'monthly_expenses' |
  'floor_plan_url' | 'floor_plan_urls' | 'house_type' | 'furnished_details' | 'pets_details' | 'move_in_immediately' |
  'is_draft' | 'current_step'
> & Partial<Pick<Listing,
  'floor_number' | 'total_floors_building' | 'property_floors' | 'has_elevator' |
  'has_balcony' | 'balcony_sqm' | 'has_terrace' | 'terrace_sqm' | 'has_garden' | 'garden_sqm' |
  'has_rooftop_terrace' | 'has_bbq_area' | 'has_playground' | 'has_waterfront' | 'has_view' | 'view_type' |
  'has_parking' | 'parking_type' | 'parking_spaces' | 'has_garage' |
  'has_carport' | 'has_ev_charging' | 'has_bicycle_storage' | 'has_basement' |
  'has_shared_laundry' | 'has_gym' | 'has_sauna' | 'has_pool' | 'has_common_room' | 'has_concierge' | 'has_security' |
  'has_storage' | 'has_air_conditioning' | 'has_dishwasher' | 'has_washing_machine' | 'has_dryer' |
  'has_fireplace' | 'has_floor_heating' | 'has_district_heating' | 'has_heat_pump' | 'has_ventilation' | 'has_solar_panels' |
  'has_high_ceilings' | 'has_large_windows' | 'has_smart_home' | 'has_built_in_wardrobes' | 'orientation' |
  'has_step_free_access' | 'has_wheelchair_accessible' | 'has_wide_doorways' | 'has_ground_floor_access' | 'has_elevator_from_garage' |
  'has_secure_entrance' | 'has_intercom' | 'has_gated_community' | 'has_fire_safety' | 'has_soundproofing' |
  'heating_type' | 'energy_rating' | 'year_built' | 'property_condition' |
  'deposit_amount' | 'min_lease_months' | 'internet_included' | 'utilities_included' | 'utility_cost_estimate' | 'monthly_expenses' |
  'floor_plan_url' | 'floor_plan_urls' | 'house_type' | 'furnished_details' | 'pets_details' | 'move_in_immediately' |
  'is_draft' | 'current_step'
>>;

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: CreateListingInput) => {
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
