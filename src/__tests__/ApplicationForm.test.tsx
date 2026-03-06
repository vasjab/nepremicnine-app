import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import type { Listing } from '@/types/listing';

const mockCreateMutateAsync = vi.fn().mockResolvedValue({});
let mockProfile: any = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@test.com' } }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: mockProfile }),
}));

vi.mock('@/hooks/useApplications', () => ({
  useCreateApplication: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const baseListing: Listing = {
  id: 'listing-1',
  user_id: 'landlord-1',
  title: 'Nice Apartment',
  description: 'A nice place',
  listing_type: 'rent',
  property_type: 'apartment',
  price: 800,
  currency: 'EUR',
  address: 'Main St 1',
  city: 'Ljubljana',
  postal_code: '1000',
  country: 'Slovenia',
  latitude: 46.05,
  longitude: 14.5,
  images: ['https://example.com/img.jpg'],
  is_active: true,
  created_at: '2026-03-06T10:00:00Z',
  bedrooms: 2,
  bathrooms: 1,
  area_m2: 60,
  floor_number: null,
  total_floors: null,
  year_built: null,
  energy_rating: null,
  features: [],
  costs_breakdown: null,
  available_from: null,
  furnished: null,
  parking: null,
  garden_size_m2: null,
  balcony: null,
  elevator: null,
  heating_type: null,
  construction_type: null,
  condition: null,
  additional_info: null,
} as any;

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('ApplicationForm', () => {
  const onClose = vi.fn();
  const onNeedOnboarding = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockProfile = {
      full_name: 'John Doe',
      phone: '+386 40 123456',
      employment_status: 'employed',
      monthly_income_range: '2000-3000',
      move_in_timeline: 'asap',
      household_size: 2,
      has_pets: false,
      is_smoker: false,
      bio: 'I am a great tenant.',
      onboarding_completed: true,
    };
  });

  it('renders listing info', () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.getByText('Nice Apartment')).toBeInTheDocument();
    expect(screen.getByText('Apply for this rental')).toBeInTheDocument();
  });

  it('shows profile summary when onboarded', () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/employed/i)).toBeInTheDocument();
  });

  it('shows onboarding warning when not onboarded', () => {
    mockProfile.onboarding_completed = false;
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.getByText('Complete your profile first')).toBeInTheDocument();
  });

  it('disables submit when not onboarded', () => {
    mockProfile.onboarding_completed = false;
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.getByText('Submit Application').closest('button')).toBeDisabled();
  });

  it('calls onNeedOnboarding when complete profile clicked', () => {
    mockProfile.onboarding_completed = false;
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    fireEvent.click(screen.getByText('Complete profile'));
    expect(onNeedOnboarding).toHaveBeenCalled();
  });

  it('submits application with cover letter', async () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );

    const textarea = screen.getByPlaceholderText("Tell the landlord why you'd be a great tenant...");
    fireEvent.change(textarea, { target: { value: 'I love this place!' } });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          listingId: 'listing-1',
          landlordId: 'landlord-1',
          coverLetter: 'I love this place!',
          renterSnapshot: expect.objectContaining({
            full_name: 'John Doe',
            employment_status: 'employed',
          }),
        })
      );
    });
  });

  it('shows character count for cover letter', () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.getByText('0/2000')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Tell the landlord why you'd be a great tenant...");
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText('5/2000')).toBeInTheDocument();
  });

  it('has cancel button that calls onClose', () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={true} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <ApplicationForm listing={baseListing} isOpen={false} onClose={onClose} onNeedOnboarding={onNeedOnboarding} />
    );
    expect(screen.queryByText('Apply for this rental')).not.toBeInTheDocument();
  });
});
