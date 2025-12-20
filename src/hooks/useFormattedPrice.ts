import { useCallback } from 'react';
import { useInternationalization, RentPeriod } from '@/contexts/InternationalizationContext';
import { Currency, convertCurrency, formatCurrencyValue, CURRENCY_SYMBOLS } from '@/lib/exchangeRates';

const SQM_TO_SQFT = 10.764;

export function useFormattedPrice() {
  const { currency, exchangeRates, rentPeriod, areaUnit } = useInternationalization();
  
  // Convert and format price
  const formatPrice = useCallback(
    (
      price: number,
      fromCurrency: Currency | string,
      options?: { 
        isRental?: boolean; 
        showPeriod?: boolean; 
        compact?: boolean;
        roundedFull?: boolean;
        period?: RentPeriod;
      }
    ) => {
      const from = (fromCurrency as Currency) || 'EUR';
      const convertedPrice = convertCurrency(price, from, currency, exchangeRates);
      
      const periodToUse = options?.period || rentPeriod;
      
      // Adjust price based on rent period
      let displayPrice = convertedPrice;
      if (options?.isRental) {
        switch (periodToUse) {
          case 'week':
            displayPrice = convertedPrice / 4.33; // Monthly to weekly
            break;
          case 'year':
            displayPrice = convertedPrice * 12; // Monthly to yearly
            break;
        }
      }
      
      const formatted = formatCurrencyValue(displayPrice, currency, { 
        compact: options?.compact,
        roundedFull: options?.roundedFull 
      });
      
      if (options?.isRental && options?.showPeriod) {
        const periodSuffix = periodToUse === 'week' ? '/wk' : periodToUse === 'year' ? '/yr' : '/mo';
        return `${formatted}${periodSuffix}`;
      }
      
      return formatted;
    },
    [currency, exchangeRates, rentPeriod]
  );
  
  // Format price for labels (compact)
  const formatPriceLabel = useCallback(
    (price: number, fromCurrency: Currency | string = 'EUR') => {
      const from = (fromCurrency as Currency) || 'EUR';
      const convertedPrice = convertCurrency(price, from, currency, exchangeRates);
      return formatCurrencyValue(convertedPrice, currency, { compact: true });
    },
    [currency, exchangeRates]
  );
  
  // Get period suffix for translation keys
  const getPeriodSuffix = useCallback(() => {
    switch (rentPeriod) {
      case 'week': return '/wk';
      case 'year': return '/yr';
      default: return '/mo';
    }
  }, [rentPeriod]);
  
  // Convert and format area
  const formatArea = useCallback(
    (areaSqm: number | null | undefined) => {
      if (!areaSqm) return 'N/A';
      
      if (areaUnit === 'sqft') {
        const sqft = Math.round(areaSqm * SQM_TO_SQFT);
        return `${sqft} ft²`;
      }
      
      return `${areaSqm} m²`;
    },
    [areaUnit]
  );
  
  // Get the current currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[currency];
  
  return {
    formatPrice,
    formatPriceLabel,
    formatArea,
    getPeriodSuffix,
    currency,
    currencySymbol,
    areaUnit,
    rentPeriod,
  };
}
