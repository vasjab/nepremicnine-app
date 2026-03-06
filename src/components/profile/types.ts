export interface ProfileFormData {
  full_name: string;
  phone: string;
  bio: string;
  avatar_url: string;
  // Renter details
  employment_status: string;
  employment_other: string;
  move_in_timeline: string;
  household_size: number;
  has_pets: boolean;
  pet_details: string;
  is_smoker: boolean;
  looking_duration: string;
  looking_duration_date: string;
  // Optional details
  age_bracket: string;
  marital_status: string;
  has_kids: boolean;
  kids_count: number;
  kids_ages: string;
  nationality: string;
  education_level: string;
  occupation: string;
  social_links: { linkedin: string; facebook: string; instagram: string };
  // References
  renter_references: Array<{ name: string; contact: string; relationship: string }>;
  // Cover letter
  default_cover_letter: string;
  // Landlord details
  management_type: string;
  num_properties: number;
  response_time: string;
}
