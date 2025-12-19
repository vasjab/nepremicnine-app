// Dynamic exchange rates from Frankfurter API (European Central Bank data)
const FRANKFURTER_API = 'https://api.frankfurter.dev/v1/latest';
const CACHE_KEY = 'exchange_rates_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type Currency = 'EUR' | 'SEK' | 'DKK' | 'NOK' | 'ISK' | 'USD' | 'CAD' | 'GBP' | 'CHF';

export const CURRENCIES: Currency[] = ['EUR', 'SEK', 'DKK', 'NOK', 'ISK', 'USD', 'CAD', 'GBP', 'CHF'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  SEK: 'kr',
  DKK: 'kr',
  NOK: 'kr',
  ISK: 'kr',
  USD: '$',
  CAD: 'C$',
  GBP: '£',
  CHF: 'CHF',
};

// Fallback static rates (in case API fails) - EUR as base
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1,
  SEK: 11.5,
  DKK: 7.45,
  NOK: 11.8,
  ISK: 153,
  USD: 1.08,
  CAD: 1.47,
  GBP: 0.86,
  CHF: 0.95,
};

interface CachedRates {
  rates: Record<Currency, number>;
  timestamp: number;
  date: string;
}

export async function fetchExchangeRates(): Promise<{ rates: Record<Currency, number>; date: string; fromCache: boolean }> {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { rates, timestamp, date }: CachedRates = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return { rates, date, fromCache: true };
      }
    } catch {
      // Invalid cache, continue to fetch
    }
  }

  try {
    const symbols = CURRENCIES.filter(c => c !== 'EUR').join(',');
    const response = await fetch(`${FRANKFURTER_API}?base=EUR&symbols=${symbols}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    const rates: Record<Currency, number> = { EUR: 1, ...data.rates };
    const date = data.date;
    
    // Cache the rates
    const cacheData: CachedRates = {
      rates,
      timestamp: Date.now(),
      date,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    return { rates, date, fromCache: false };
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback:', error);
    return { rates: FALLBACK_RATES, date: 'fallback', fromCache: false };
  }
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>
): number {
  if (from === to) return amount;
  
  // Convert to EUR first, then to target currency
  const inEur = amount / rates[from];
  return inEur * rates[to];
}

export function formatCurrencyValue(
  amount: number,
  currency: Currency,
  options?: { compact?: boolean }
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  if (options?.compact) {
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${Math.round(amount / 1000)}k`;
    }
    return `${symbol}${Math.round(amount)}`;
  }
  
  // Use European number formatting (space as thousand separator)
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  
  return `${formatted} ${symbol}`;
}
