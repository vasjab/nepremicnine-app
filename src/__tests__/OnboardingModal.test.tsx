import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, loading: false }),
}));

vi.mock('@/hooks/useOnboarding', () => ({
  useSaveOnboarding: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
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

describe('OnboardingModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome step initially', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    expect(screen.getByText('Welcome to hemma')).toBeInTheDocument();
    expect(screen.getByText('What brings you here? Select all that apply.')).toBeInTheDocument();
  });

  it('shows all 4 intent options', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    expect(screen.getByText('I want to rent')).toBeInTheDocument();
    expect(screen.getByText('I want to buy')).toBeInTheDocument();
    expect(screen.getByText("I'm renting out")).toBeInTheDocument();
    expect(screen.getByText("I'm selling")).toBeInTheDocument();
  });

  it('continue button is disabled until an intent is selected', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn.closest('button')).toHaveClass('opacity-50');
  });

  it('enables continue after selecting an intent', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn.closest('button')).not.toHaveClass('opacity-50');
  });

  it('navigates to renter step when rent is selected', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('About you')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
  });

  it('navigates to landlord step when renting out is selected', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText("I'm renting out"));
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Property management')).toBeInTheDocument();
    expect(screen.getByText('I manage as')).toBeInTheDocument();
  });

  it('shows both renter and landlord steps when both selected', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText("I'm renting out"));
    // Step to renter
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('About you')).toBeInTheDocument();
    // Step to landlord
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Property management')).toBeInTheDocument();
  });

  it('shows done step and save button', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to buy'));
    fireEvent.click(screen.getByText('Continue')); // renter step
    fireEvent.click(screen.getByText('Continue')); // done step
    expect(screen.getByText("You're all set!")).toBeInTheDocument();
    expect(screen.getByText('Save & Continue')).toBeInTheDocument();
  });

  it('saves onboarding data on finish', async () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText('Continue')); // renter
    fireEvent.click(screen.getByText('Employed'));
    fireEvent.click(screen.getByText('ASAP'));
    fireEvent.click(screen.getByText('I have pets'));
    fireEvent.click(screen.getByText('Continue')); // done
    fireEvent.click(screen.getByText('Save & Continue'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          user_intents: ['rent'],
          employment_status: 'employed',
          move_in_timeline: 'asap',
          has_pets: true,
          is_smoker: false,
        })
      );
    });
  });

  it('skip button calls onClose', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Skip for now'));
    expect(onClose).toHaveBeenCalled();
  });

  it('back button navigates to previous step', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText('Continue')); // renter
    expect(screen.getByText('About you')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Welcome to hemma')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderWithProviders(<OnboardingModal open={false} onClose={onClose} />);
    expect(screen.queryByText('Welcome to hemma')).not.toBeInTheDocument();
  });

  it('renter step shows household size controls', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Household size')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // default
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('increments household size', () => {
    renderWithProviders(<OnboardingModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('I want to rent'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
