import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApplicationKanban } from '@/components/applications/ApplicationKanban';
import type { Application } from '@/types/application';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'landlord-1' }, loading: false }),
}));

vi.mock('@/hooks/useApplications', () => ({
  useUpdateApplicationStatus: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateApplicationNotes: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-' + Math.random().toString(36).slice(2),
    listing_id: 'listing-1',
    renter_id: 'renter-1',
    landlord_id: 'landlord-1',
    status: 'applied',
    cover_letter: null,
    renter_snapshot: {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: null,
      employment_status: 'employed',
      monthly_income_range: '2000-3000',
      move_in_timeline: 'asap',
      household_size: 2,
      has_pets: false,
      is_smoker: false,
      bio: null,
    },
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
      price: 800,
      currency: 'EUR',
    },
    renter: {
      full_name: 'Test User',
      avatar_url: null,
    },
    ...overrides,
  };
}

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

describe('ApplicationKanban', () => {
  it('renders all 5 column headers on desktop', () => {
    renderWithProviders(<ApplicationKanban applications={[]} />);
    // Desktop grid has all 5 columns; mobile only shows non-empty
    expect(screen.getAllByText('Applied').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Viewing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Accepted').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Declined').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state for columns with no applications', () => {
    renderWithProviders(<ApplicationKanban applications={[]} />);
    const emptyTexts = screen.getAllByText('No applications');
    // Desktop shows 5 empty columns
    expect(emptyTexts.length).toBe(5);
  });

  it('renders application cards in correct columns', () => {
    const apps = [
      makeApplication({ id: 'a1', status: 'applied', renter_snapshot: { full_name: 'Alice', email: null, phone: null, employment_status: null, monthly_income_range: null, move_in_timeline: null, household_size: null, has_pets: false, is_smoker: false, bio: null } }),
      makeApplication({ id: 'a2', status: 'accepted', renter_snapshot: { full_name: 'Bob', email: null, phone: null, employment_status: null, monthly_income_range: null, move_in_timeline: null, household_size: null, has_pets: false, is_smoker: false, bio: null } }),
    ];
    apps[0].renter = { full_name: 'Alice', avatar_url: null };
    apps[1].renter = { full_name: 'Bob', avatar_url: null };

    renderWithProviders(<ApplicationKanban applications={apps} />);
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(1);
  });

  it('shows pet and smoker badges when present', () => {
    const app = makeApplication({
      renter_snapshot: {
        full_name: 'Pet Owner',
        email: null,
        phone: null,
        employment_status: 'employed',
        monthly_income_range: null,
        move_in_timeline: null,
        household_size: 3,
        has_pets: true,
        is_smoker: true,
        bio: null,
      },
    });

    renderWithProviders(<ApplicationKanban applications={[app]} />);
    expect(screen.getAllByText('pets').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('smoker').length).toBeGreaterThanOrEqual(1);
  });

  it('shows employment status chip', () => {
    const app = makeApplication({
      renter_snapshot: {
        full_name: 'Worker',
        email: null,
        phone: null,
        employment_status: 'self_employed',
        monthly_income_range: null,
        move_in_timeline: null,
        household_size: null,
        has_pets: false,
        is_smoker: false,
        bio: null,
      },
    });

    renderWithProviders(<ApplicationKanban applications={[app]} />);
    expect(screen.getAllByText('self-employed').length).toBeGreaterThanOrEqual(1);
  });

  it('displays viewing date for viewing_scheduled apps', () => {
    const app = makeApplication({
      status: 'viewing_scheduled',
      viewing_date: '2026-03-10T14:00:00Z',
    });

    renderWithProviders(<ApplicationKanban applications={[app]} />);
    // Should show formatted date containing 2026
    const dateElements = screen.getAllByText(/2026/);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });
});
