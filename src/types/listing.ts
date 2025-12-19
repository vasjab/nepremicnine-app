export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  listing_type: 'rent' | 'sale';
  property_type: 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other';
  price: number;
  currency: string;
  address: string;
  city: string;
  postal_code: string | null;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  available_from: string | null;
  available_until: string | null;
  is_furnished: boolean;
  allows_pets: boolean;
  images: string[];
  floor_plan_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface ListingFilters {
  listing_type?: 'rent' | 'sale' | null;
  property_types?: string[] | null;
  min_price?: number | null;
  max_price?: number | null;
  min_bedrooms?: number | null;
  max_bedrooms?: number | null;
  city?: string | null;
}

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'size_asc' | 'size_desc';
