export type ApplicationStatus = 'applied' | 'viewing_scheduled' | 'under_review' | 'accepted' | 'declined';

export interface Application {
  id: string;
  listing_id: string;
  renter_id: string;
  landlord_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  renter_snapshot: RenterSnapshot | null;
  landlord_notes: string | null;
  viewing_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  listing?: {
    id: string;
    title: string;
    images: string[] | null;
    address: string;
    city: string;
    price: number;
    currency: string;
  };
  renter?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface RenterSnapshot {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  employment_status: string | null;
  monthly_income_range: string | null;
  move_in_timeline: string | null;
  household_size: number | null;
  has_pets: boolean;
  is_smoker: boolean;
  bio: string | null;
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  applied: { label: 'Applied', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  viewing_scheduled: { label: 'Viewing Scheduled', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  under_review: { label: 'Under Review', color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-200' },
  accepted: { label: 'Accepted', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  declined: { label: 'Declined', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied', 'viewing_scheduled', 'under_review', 'accepted', 'declined',
];
