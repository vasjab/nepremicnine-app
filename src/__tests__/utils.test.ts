import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatPriceShort } from '@/lib/utils';

describe('cn (classname merge)', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});

describe('formatPrice', () => {
  it('formats with EUR by default', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1.500');
    expect(result).toContain('€');
  });

  it('formats large numbers with thousands separator', () => {
    const result = formatPrice(1500000, 'EUR');
    expect(result).toContain('1.500.000');
  });

  it('handles SEK currency', () => {
    const result = formatPrice(5000, 'SEK');
    expect(result).toContain('kr');
  });

  it('handles USD currency', () => {
    const result = formatPrice(1000, 'USD');
    expect(result).toContain('$');
  });

  it('falls back to currency code for unknown currencies', () => {
    const result = formatPrice(1000, 'JPY');
    expect(result).toContain('JPY');
  });
});

describe('formatPriceShort', () => {
  it('formats millions', () => {
    expect(formatPriceShort(1500000)).toBe('1,5M');
  });

  it('formats thousands', () => {
    expect(formatPriceShort(150000)).toBe('150k');
  });

  it('formats small numbers as-is', () => {
    expect(formatPriceShort(500)).toBe('500');
  });

  it('rounds thousands', () => {
    expect(formatPriceShort(1500)).toBe('2k');
  });

  it('handles exactly 1M', () => {
    expect(formatPriceShort(1000000)).toBe('1,0M');
  });

  it('handles exactly 1k', () => {
    expect(formatPriceShort(1000)).toBe('1k');
  });
});
