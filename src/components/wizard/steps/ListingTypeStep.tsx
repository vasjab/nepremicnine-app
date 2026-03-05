import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Key, Banknote, Check } from 'lucide-react';

type ListingType = 'rent' | 'sale' | null;

interface ListingTypeStepProps {
  listingType: ListingType;
  onListingTypeChange: (type: 'rent' | 'sale') => void;
}

const LISTING_TYPES = [
  {
    value: 'rent' as const,
    label: 'For Rent',
    icon: Key,
    description: 'List your property for monthly rental',
  },
  {
    value: 'sale' as const,
    label: 'For Sale',
    icon: Banknote,
    description: 'Sell your property to a buyer',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 max-w-xl mx-auto">
        {LISTING_TYPES.map(({ value, label, icon: Icon, description }) => {
          const isSelected = listingType === value;
          return (
            <button
              key={value}
              onClick={() => onListingTypeChange(value)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-7 md:p-9 rounded-2xl border transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
                "active:scale-[0.98]",
                isSelected
                  ? "border-gray-900 bg-gray-50 shadow-[0_1px_4px_hsl(0_0%_0%/0.08),0_0_0_1px_hsl(0_0%_0%/0.12)]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.06)]"
              )}
            >
              <div className={cn(
                "w-14 h-14 md:w-16 md:h-16 rounded-[14px] flex items-center justify-center mb-4 transition-all duration-200",
                isSelected
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-150 group-hover:text-gray-600"
              )}>
                <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} />
              </div>
              <span className={cn(
                "font-semibold text-[15px] tracking-tight transition-colors",
                isSelected ? "text-gray-900" : "text-gray-700"
              )}>
                {label}
              </span>
              <span className="text-[13px] text-gray-400 mt-1.5 text-center leading-snug">
                {description}
              </span>

              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </WizardStepWrapper>
  );
}
