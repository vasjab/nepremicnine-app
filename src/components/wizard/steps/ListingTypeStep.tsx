import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Key, Banknote } from 'lucide-react';

type ListingType = 'rent' | 'sale';

interface ListingTypeStepProps {
  listingType: ListingType;
  onListingTypeChange: (type: ListingType) => void;
}

const LISTING_TYPES = [
  { 
    value: 'rent' as const, 
    label: 'For Rent', 
    icon: Key, 
    description: 'List your property for monthly rental',
    emoji: '🔑'
  },
  { 
    value: 'sale' as const, 
    label: 'For Sale', 
    icon: Banknote, 
    description: 'Sell your property to a buyer',
    emoji: '💰'
  },
];

export function ListingTypeStep({
  listingType,
  onListingTypeChange,
}: ListingTypeStepProps) {
  return (
    <WizardStepWrapper
      title="What do you want to do?"
      subtitle="Choose whether you want to rent or sell your property"
      emoji="🏷️"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
        {LISTING_TYPES.map(({ value, label, icon: Icon, description, emoji }) => (
          <button
            key={value}
            onClick={() => onListingTypeChange(value)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 transition-all duration-300",
              "hover:border-accent/50 hover:shadow-lg hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              listingType === value
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              listingType === value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground group-hover:bg-accent/10"
            )}>
              <span className="text-3xl md:text-4xl">{emoji}</span>
            </div>
            <span className="font-semibold text-lg text-foreground">{label}</span>
            <span className="text-sm text-muted-foreground mt-2 text-center">{description}</span>
            
            {listingType === value && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </WizardStepWrapper>
  );
}
