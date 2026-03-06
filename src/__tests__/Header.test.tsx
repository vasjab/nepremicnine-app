import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/Header';

let authUser: any = { id: 'user-1' };
let mockUnreadCount = 0;
let mockAppCount = 0;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: authUser, signOut: vi.fn() }),
}));

vi.mock('@/hooks/useMessaging', () => ({
  useUnreadCount: () => ({ data: mockUnreadCount }),
}));

vi.mock('@/hooks/useApplications', () => ({
  useApplicationCount: () => ({ data: mockAppCount }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.findHome': 'Find Home',
        'common.savedListings': 'Saved',
        'common.profile': 'Profile',
        'common.myListings': 'My Listings',
        'nav.dashboard': 'Dashboard',
        'common.createListing': 'Create Listing',
        'common.signOut': 'Sign Out',
        'common.logIn': 'Log In',
        'common.signUp': 'Sign Up',
        'common.signIn': 'Sign In',
        'nav.myListings': 'My Listings',
        'soldRented.recentlySold': 'Recently Sold',
      };
      return map[key] || key;
    },
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

function openMobileMenu() {
  // The mobile menu hamburger button is the md:hidden button
  const buttons = screen.getAllByRole('button');
  const menuButton = buttons.find(b => b.className.includes('md:hidden'));
  if (menuButton) fireEvent.click(menuButton);
}

describe('Header', () => {
  beforeEach(() => {
    authUser = { id: 'user-1' };
    mockUnreadCount = 0;
    mockAppCount = 0;
  });

  it('renders logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('hemma')).toBeInTheDocument();
  });

  it('shows Applications link in mobile menu when logged in', () => {
    renderWithProviders(<Header />);
    openMobileMenu();
    const appLinks = screen.getAllByText('Applications');
    expect(appLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('has applications link with correct href', () => {
    const { container } = renderWithProviders(<Header />);
    openMobileMenu();
    const appLink = container.querySelector('a[href="/applications"]');
    expect(appLink).toBeInTheDocument();
  });

  it('shows application badge in mobile menu when count > 0', () => {
    mockAppCount = 3;
    renderWithProviders(<Header />);
    openMobileMenu();
    const badges = screen.getAllByText('3');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows 9+ badge when count exceeds 9', () => {
    mockAppCount = 15;
    renderWithProviders(<Header />);
    openMobileMenu();
    const badges = screen.getAllByText('9+');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show application badge when count is 0', () => {
    mockAppCount = 0;
    renderWithProviders(<Header />);
    openMobileMenu();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('does not show Applications link when not logged in', () => {
    authUser = null;
    renderWithProviders(<Header />);
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();
  });

  it('shows messages link for logged-in users', () => {
    const { container } = renderWithProviders(<Header />);
    const msgLink = container.querySelector('a[href="/messages"]');
    expect(msgLink).toBeInTheDocument();
  });

  it('shows unread message badge', () => {
    mockUnreadCount = 5;
    renderWithProviders(<Header />);
    const badges = screen.getAllByText('5');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
