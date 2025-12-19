import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Currency, fetchExchangeRates, CURRENCIES } from '@/lib/exchangeRates';
import { Language, LANGUAGES } from '@/lib/translations';

export type AreaUnit = 'sqm' | 'sqft';
export type RentPeriod = 'month' | 'week' | 'year';

interface InternationalizationContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Currency
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<Currency, number>;
  ratesDate: string | null;
  refreshRates: () => Promise<void>;
  isLoadingRates: boolean;
  
  // Area unit
  areaUnit: AreaUnit;
  setAreaUnit: (unit: AreaUnit) => void;
  
  // Rent period display
  rentPeriod: RentPeriod;
  setRentPeriod: (period: RentPeriod) => void;
}

const STORAGE_KEY = 'hemma_i18n_preferences';

interface StoredPreferences {
  language: Language;
  currency: Currency;
  areaUnit: AreaUnit;
  rentPeriod: RentPeriod;
}

const defaultPreferences: StoredPreferences = {
  language: 'en',
  currency: 'EUR',
  areaUnit: 'sqm',
  rentPeriod: 'month',
};

const InternationalizationContext = createContext<InternationalizationContextType | undefined>(undefined);

export function InternationalizationProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<StoredPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch {
      // Invalid stored data
    }
    
    // Detect browser language
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'sl') {
      return { ...defaultPreferences, language: 'sl' as Language };
    }
    
    return defaultPreferences;
  });
  
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(() => {
    const fallback: Record<Currency, number> = {} as Record<Currency, number>;
    CURRENCIES.forEach(c => fallback[c] = c === 'EUR' ? 1 : 0);
    return fallback;
  });
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  
  // Persist preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);
  
  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates().then(({ rates, date }) => {
      setExchangeRates(rates);
      setRatesDate(date);
      setIsLoadingRates(false);
    });
  }, []);
  
  const refreshRates = useCallback(async () => {
    setIsLoadingRates(true);
    // Clear cache to force refresh
    localStorage.removeItem('exchange_rates_cache');
    const { rates, date } = await fetchExchangeRates();
    setExchangeRates(rates);
    setRatesDate(date);
    setIsLoadingRates(false);
  }, []);
  
  const setLanguage = useCallback((language: Language) => {
    setPreferences(prev => ({ ...prev, language }));
  }, []);
  
  const setCurrency = useCallback((currency: Currency) => {
    setPreferences(prev => ({ ...prev, currency }));
  }, []);
  
  const setAreaUnit = useCallback((areaUnit: AreaUnit) => {
    setPreferences(prev => ({ ...prev, areaUnit }));
  }, []);
  
  const setRentPeriod = useCallback((rentPeriod: RentPeriod) => {
    setPreferences(prev => ({ ...prev, rentPeriod }));
  }, []);
  
  return (
    <InternationalizationContext.Provider
      value={{
        language: preferences.language,
        setLanguage,
        currency: preferences.currency,
        setCurrency,
        exchangeRates,
        ratesDate,
        refreshRates,
        isLoadingRates,
        areaUnit: preferences.areaUnit,
        setAreaUnit,
        rentPeriod: preferences.rentPeriod,
        setRentPeriod,
      }}
    >
      {children}
    </InternationalizationContext.Provider>
  );
}

export function useInternationalization() {
  const context = useContext(InternationalizationContext);
  if (!context) {
    throw new Error('useInternationalization must be used within InternationalizationProvider');
  }
  return context;
}
