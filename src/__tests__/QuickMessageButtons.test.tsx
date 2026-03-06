import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickMessageButtons } from '@/components/QuickMessageButtons';

describe('QuickMessageButtons', () => {
  it('renders three template buttons', () => {
    render(<QuickMessageButtons onSelect={vi.fn()} />);
    expect(screen.getByText('Is this still available?')).toBeInTheDocument();
    expect(screen.getByText('Can I schedule a viewing?')).toBeInTheDocument();
    expect(screen.getByText("I'm interested, tell me more")).toBeInTheDocument();
  });

  it('calls onSelect with the message text when clicked', () => {
    const onSelect = vi.fn();
    render(<QuickMessageButtons onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Is this still available?'));
    expect(onSelect).toHaveBeenCalledWith('Is this still available?');

    fireEvent.click(screen.getByText('Can I schedule a viewing?'));
    expect(onSelect).toHaveBeenCalledWith('Can I schedule a viewing?');
  });

  it('disables buttons when disabled prop is true', () => {
    render(<QuickMessageButtons onSelect={vi.fn()} disabled />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('does not call onSelect when disabled', () => {
    const onSelect = vi.fn();
    render(<QuickMessageButtons onSelect={onSelect} disabled />);
    fireEvent.click(screen.getByText('Is this still available?'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuickMessageButtons onSelect={vi.fn()} className="mt-4" />
    );
    expect(container.firstChild).toHaveClass('mt-4');
  });
});
