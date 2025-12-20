import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Home, Columns2, LayoutGrid, SquareArrowOutUpRight, Warehouse } from 'lucide-react';

type HouseType = 'detached' | 'semi_detached' | 'terraced' | 'end_terrace' | 'bungalow' | '';

interface HouseTypeStepProps {
  houseType: HouseType;
  propertyType: 'house' | 'summer_house';
  onHouseTypeChange: (type: HouseType) => void;
}

const HOUSE_TYPES: { value: Exclude<HouseType, ''>; label: string; icon: typeof Home; description: string }[] = [
  { value: 'detached', label: 'Detached', icon: Home, description: 'Standalone, no shared walls' },
  { value: 'semi_detached', label: 'Semi-detached', icon: Columns2, description: 'Shares one wall with neighbor' },
  { value: 'terraced', label: 'Terraced', icon: LayoutGrid, description: 'Row house, shares two walls' },
  { value: 'end_terrace', label: 'End-of-terrace', icon: SquareArrowOutUpRight, description: 'End unit, shares one wall' },
  { value: 'bungalow', label: 'Bungalow', icon: Warehouse, description: 'Single-story house' },
];

export function HouseTypeStep({
  houseType,
  propertyType,
  onHouseTypeChange,
}: HouseTypeStepProps) {
  const propertyLabel = propertyType === 'summer_house' ? 'summer house' : 'house';

  return (
    <WizardStepWrapper
      title={`What type of ${propertyLabel}?`}
      subtitle="Select the style that best describes your property"
      emoji="🏡"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 max-w-4xl mx-auto">
        {HOUSE_TYPES.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => onHouseTypeChange(value)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-300",
              "hover:border-accent/50 hover:shadow-lg hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              houseType === value
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors",
              houseType === value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground group-hover:bg-accent/10"
            )}>
              <Icon className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <span className="font-semibold text-foreground text-center">{label}</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">{description}</span>
            
            {houseType === value && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
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
