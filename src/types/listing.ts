export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  listing_type: 'rent' | 'sale';
  property_type: 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other' | 'summer_house';
  house_type: string | null;
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
  furnished_details: string | null;
  allows_pets: boolean;
  pets_details: string | null;
  move_in_immediately: boolean;
  images: string[];
  floor_plan_url: string | null;
  floor_plan_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Building/Floor info
  floor_number: number | null;
  total_floors_building: number | null;
  property_floors: number | null;
  has_elevator: boolean;
  
  // Outdoor features
  has_balcony: boolean;
  balcony_sqm: number | null;
  has_terrace: boolean;
  terrace_sqm: number | null;
  has_garden: boolean;
  garden_sqm: number | null;
  has_rooftop_terrace: boolean;
  has_bbq_area: boolean;
  has_playground: boolean;
  has_waterfront: boolean;
  has_view: boolean;
  view_type: string | null;
  
  // Parking
  has_parking: boolean;
  parking_type: 'street' | 'designated' | 'underground' | 'private' | null;
  parking_spaces: number | null;
  has_garage: boolean;
  has_carport: boolean;
  has_ev_charging: boolean;
  has_bicycle_storage: boolean;
  has_basement: boolean;
  
  // Building Amenities (for apartments)
  has_shared_laundry: boolean;
  has_gym: boolean;
  has_sauna: boolean;
  has_pool: boolean;
  has_common_room: boolean;
  has_concierge: boolean;
  has_security: boolean;
  
  // Equipment & Appliances
  has_storage: boolean;
  has_air_conditioning: boolean;
  has_dishwasher: boolean;
  has_washing_machine: boolean;
  has_dryer: boolean;
  
  // Energy & Comfort
  has_fireplace: boolean;
  has_floor_heating: boolean;
  has_district_heating: boolean;
  has_heat_pump: boolean;
  has_ventilation: boolean;
  has_solar_panels: boolean;
  
  // Interior Highlights
  has_high_ceilings: boolean;
  has_large_windows: boolean;
  has_smart_home: boolean;
  has_built_in_wardrobes: boolean;
  orientation: string | null;
  
  // Accessibility
  has_step_free_access: boolean;
  has_wheelchair_accessible: boolean;
  has_wide_doorways: boolean;
  has_ground_floor_access: boolean;
  has_elevator_from_garage: boolean;
  
  // Safety & Privacy
  has_secure_entrance: boolean;
  has_intercom: boolean;
  has_gated_community: boolean;
  has_fire_safety: boolean;
  has_soundproofing: boolean;
  
  // Building info
  heating_type: 'central' | 'electric' | 'gas' | 'heat_pump' | 'other' | null;
  energy_rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null;
  year_built: number | null;
  property_condition: 'new' | 'renovated' | 'good' | 'needs_work' | null;
  
  // Rental-specific
  deposit_amount: number | null;
  min_lease_months: number | null;
  internet_included: 'yes' | 'no' | 'available' | null;
  utilities_included: 'yes' | 'no' | 'partial' | null;
  utility_cost_estimate: number | null;
  monthly_expenses: number | null;
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

export type OwnerFilter = 'all' | 'mine' | 'others';

export interface ListingFilters {
  listing_type?: 'rent' | 'sale' | null;
  property_types?: string[] | null;
  owner_filter?: OwnerFilter;
  min_price?: number | null;
  max_price?: number | null;
  min_bedrooms?: number | null;
  max_bedrooms?: number | null;
  min_bathrooms?: number | null;
  min_area?: number | null;
  max_area?: number | null;
  city?: string | null;
  
  // Feature filters
  is_furnished?: boolean | null;
  allows_pets?: boolean | null;
  available_from?: string | null;
  available_until?: string | null;
  move_in_immediately?: boolean | null;
  
  // Building/Floor filters
  min_floor?: number | null;
  max_floor?: number | null;
  has_elevator?: boolean | null;
  min_property_floors?: number | null;
  max_property_floors?: number | null;
  
  // Outdoor filters
  has_balcony?: boolean | null;
  has_terrace?: boolean | null;
  has_garden?: boolean | null;
  has_rooftop_terrace?: boolean | null;
  has_waterfront?: boolean | null;
  has_view?: boolean | null;
  view_type?: string | null;
  
  // Parking filters
  has_parking?: boolean | null;
  parking_type?: string | null;
  has_garage?: boolean | null;
  has_ev_charging?: boolean | null;
  has_bicycle_storage?: boolean | null;
  has_basement?: boolean | null;
  
  // Building Amenities filters
  has_gym?: boolean | null;
  has_pool?: boolean | null;
  has_sauna?: boolean | null;
  has_concierge?: boolean | null;
  has_security?: boolean | null;
  has_shared_laundry?: boolean | null;
  
  // Equipment filters
  has_storage?: boolean | null;
  has_air_conditioning?: boolean | null;
  has_dishwasher?: boolean | null;
  has_washing_machine?: boolean | null;
  has_dryer?: boolean | null;
  
  // Energy & Comfort filters
  has_fireplace?: boolean | null;
  has_floor_heating?: boolean | null;
  has_solar_panels?: boolean | null;
  has_smart_home?: boolean | null;
  
  // Accessibility filters
  has_step_free_access?: boolean | null;
  has_wheelchair_accessible?: boolean | null;
  
  // Safety filters
  has_secure_entrance?: boolean | null;
  has_gated_community?: boolean | null;
  
  // Building info filters
  heating_type?: string | null;
  energy_rating?: string[] | null;
  min_year_built?: number | null;
  max_year_built?: number | null;
  property_condition?: string[] | null;
  
  // Rental filters
  max_deposit?: number | null;
  max_lease_months?: number | null;
  internet_included?: string | null;
  utilities_included?: string | null;
}

export type AreaUnit = 'sqm' | 'sqft';

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'size_asc' | 'size_desc';

export type ParkingType = 'street' | 'designated' | 'underground' | 'private';
export type HeatingType = 'central' | 'electric' | 'gas' | 'heat_pump' | 'other';
export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type PropertyCondition = 'new' | 'renovated' | 'good' | 'needs_work';
export type InternetIncluded = 'yes' | 'no' | 'available';
export type UtilitiesIncluded = 'yes' | 'no' | 'partial';
