import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from '@/lib/exchangeRates';

interface PriceStepProps {
  price: string;
  currency: Currency;
  listingType: 'rent' | 'sale';
  onPriceChange: (price: string) => void;
  onCurrencyChange: (currency: Currency) => void;
  error?: string;
}

export function PriceStep({
  price,
  currency,
  listingType,
  onPriceChange,
  onCurrencyChange,
  error,
}: PriceStepProps) {
  const isRental = listingType === 'rent';
  
  // Format the price for display
  const formatDisplayPrice = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('sv-SE').format(num);
  };

  return (
    <WizardStepWrapper
      title="Set your price"
      subtitle={isRental ? "Monthly rent for your property" : "Asking price for your property"}
      emoji="💰"
    >
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Large Price Input */}
        <div className="relative bg-card rounded-3xl border-2 border-border p-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl md:text-5xl font-bold text-foreground">
              {CURRENCY_SYMBOLS[currency]}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '');
                onPriceChange(value);
              }}
              placeholder="0"
              className={cn(
                "text-4xl md:text-5xl font-bold bg-transparent border-none outline-none text-center w-full max-w-[200px]",
                "placeholder:text-muted-foreground/30"
              )}
            />
          </div>
          
          {price && (
            <div className="text-lg text-muted-foreground mb-2">
              {formatDisplayPrice(price)} {currency}
              {isRental && <span className="text-sm"> / month</span>}
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Currency Selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={cn(
                "px-4 py-2 rounded-full font-medium transition-all duration-200",
                currency === curr
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {CURRENCY_SYMBOLS[curr]} {curr}
            </button>
          ))}
        </div>

        {/* Price Suggestion */}
        <div className="text-center text-sm text-muted-foreground">
          {isRental ? (
            <p>Tip: Check similar listings in your area to price competitively</p>
          ) : (
            <p>Tip: Include closing costs estimates if applicable</p>
          )}
        </div>
      </div>
    </WizardStepWrapper>
  );
}
