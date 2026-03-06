import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationsPage from '@/views/Applications';

// Mock useAuth
const mockUser = { id: 'user-1', email: 'test@example.com' };
let authUser: any = mockUser;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: authUser, loading: false, session: null, signOut: vi.fn(), sendOtp: vi.fn(), verifyOtp: vi.fn() }),
}));

// Mock useMyApplications & useWithdrawApplication
const mockApplications: any[] = [];
let applicationsLoading = false;

vi.mock('@/hooks/useApplications', () => ({
  useMyApplications: () => ({
    data: mockApplications,
    isLoading: applicationsLoading,
  }),
  useWithdrawApplication: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useApplicationCount: () => ({ data: 0 }),
}));

// Mock useUnreadCount for Header
vi.mock('@/hooks/useMessaging', () => ({
  useUnreadCount: () => ({ data: 0 }),
}));

// Mock useTranslation for Header
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

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

describe('ApplicationsPage', () => {
  beforeEach(() => {
    authUser = mockUser;
    mockApplications.length = 0;
    applicationsLoading = false;
  });

  it('shows sign-in prompt when not authenticated', () => {
    authUser = null;
    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Sign in to view your rental applications.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    applicationsLoading = true;
    const { container } = renderWithProviders(<ApplicationsPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('shows empty state when no applications', () => {
    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText('No applications yet.')).toBeInTheDocument();
  });

  it('renders applications when data exists', () => {
    mockApplications.push({
      id: 'app-1',
      listing_id: 'listing-1',
      renter_id: 'user-1',
      landlord_id: 'landlord-1',
      status: 'applied',
      cover_letter: null,
      renter_snapshot: null,
      landlord_notes: null,
      viewing_date: null,
      created_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
      listing: {
        id: 'listing-1',
        title: 'Nice Apartment in Ljubljana',
        images: ['https://example.com/img.jpg'],
        address: 'Main St 1',
        city: 'Ljubljana',
        price: 800,
        currency: 'EUR',
      },
    });

    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText('Nice Apartment in Ljubljana')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('shows withdraw button for applied status', () => {
    mockApplications.push({
      id: 'app-1',
      listing_id: 'listing-1',
      renter_id: 'user-1',
      landlord_id: 'landlord-1',
      status: 'applied',
      cover_letter: null,
      renter_snapshot: null,
      landlord_notes: null,
      viewing_date: null,
      created_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
      listing: {
        id: 'listing-1',
        title: 'Test Listing',
        images: null,
        address: 'Addr',
        city: 'City',
        price: 500,
        currency: 'EUR',
      },
    });

    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByTitle('Withdraw')).toBeInTheDocument();
  });

  it('does not show withdraw for accepted status', () => {
    mockApplications.push({
      id: 'app-2',
      listing_id: 'listing-2',
      renter_id: 'user-1',
      landlord_id: 'landlord-1',
      status: 'accepted',
      cover_letter: null,
      renter_snapshot: null,
      landlord_notes: null,
      viewing_date: null,
      created_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
      listing: {
        id: 'listing-2',
        title: 'Accepted Listing',
        images: null,
        address: 'Addr',
        city: 'City',
        price: 600,
        currency: 'EUR',
      },
    });

    renderWithProviders(<ApplicationsPage />);
    expect(screen.queryByTitle('Withdraw')).not.toBeInTheDocument();
  });

  it('shows viewing date for viewing_scheduled status', () => {
    mockApplications.push({
      id: 'app-3',
      listing_id: 'listing-3',
      renter_id: 'user-1',
      landlord_id: 'landlord-1',
      status: 'viewing_scheduled',
      cover_letter: null,
      renter_snapshot: null,
      landlord_notes: null,
      viewing_date: '2026-03-10T14:00:00Z',
      created_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
      listing: {
        id: 'listing-3',
        title: 'Viewing Listing',
        images: null,
        address: 'Addr',
        city: 'City',
        price: 700,
        currency: 'EUR',
      },
    });

    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText('Viewing Scheduled')).toBeInTheDocument();
    expect(screen.getByText(/Viewing:/)).toBeInTheDocument();
  });

  it('shows correct application count in header', () => {
    mockApplications.push(
      {
        id: 'a1', listing_id: 'l1', renter_id: 'u1', landlord_id: 'l1', status: 'applied',
        cover_letter: null, renter_snapshot: null, landlord_notes: null, viewing_date: null,
        created_at: '2026-03-06T10:00:00Z', updated_at: '2026-03-06T10:00:00Z',
        listing: { id: 'l1', title: 'L1', images: null, address: 'A', city: 'C', price: 100, currency: 'EUR' },
      },
      {
        id: 'a2', listing_id: 'l2', renter_id: 'u1', landlord_id: 'l1', status: 'declined',
        cover_letter: null, renter_snapshot: null, landlord_notes: null, viewing_date: null,
        created_at: '2026-03-06T10:00:00Z', updated_at: '2026-03-06T10:00:00Z',
        listing: { id: 'l2', title: 'L2', images: null, address: 'A', city: 'C', price: 200, currency: 'EUR' },
      },
    );

    renderWithProviders(<ApplicationsPage />);
    expect(screen.getByText('2 applications')).toBeInTheDocument();
  });
});
