import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in European/continental style
 * Uses space as thousand separator and currency symbol after the number
 * Example: 1 500 € or 1 500 000 €
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  // Use de-DE locale for European number formatting (space as thousand separator)
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price);
  
  // Map currency codes to symbols
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    SEK: 'kr',
    USD: '$',
    GBP: '£',
    NOK: 'kr',
    DKK: 'kr',
    CHF: 'CHF',
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  // European style: number followed by currency symbol
  return `${formatted} ${symbol}`;
}

/**
 * Format price in short form for map markers
 * Example: 1.5M, 150k, 500
 */
export function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1).replace('.', ',')}M`;
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}k`;
  }
  return price.toString();
}
