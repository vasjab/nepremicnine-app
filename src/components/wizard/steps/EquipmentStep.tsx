import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { 
  Wind, 
  UtensilsCrossed, 
  Shirt, 
  Tv,
  Wifi,
  Microwave,
  Refrigerator,
  Fan
} from 'lucide-react';

interface EquipmentStepProps {
  hasAirConditioning: boolean;
  hasDishwasher: boolean;
  hasWashingMachine: boolean;
  hasDryer: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
}

interface EquipmentCard {
  id: string;
  label: string;
  icon: typeof Wind;
  description: string;
}

const EQUIPMENT_ITEMS: EquipmentCard[] = [
  { id: 'has_air_conditioning', label: 'Air Conditioning', icon: Wind, description: 'Cooling system' },
  { id: 'has_dishwasher', label: 'Dishwasher', icon: UtensilsCrossed, description: 'Built-in dishwasher' },
  { id: 'has_washing_machine', label: 'Washing Machine', icon: Shirt, description: 'In-unit washer' },
  { id: 'has_dryer', label: 'Dryer', icon: Fan, description: 'Tumble dryer' },
];

export function EquipmentStep({
  hasAirConditioning,
  hasDishwasher,
  hasWashingMachine,
  hasDryer,
  onFeatureToggle,
}: EquipmentStepProps) {
  const featureValues: Record<string, boolean> = {
    has_air_conditioning: hasAirConditioning,
    has_dishwasher: hasDishwasher,
    has_washing_machine: hasWashingMachine,
    has_dryer: hasDryer,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Equipment & appliances"
      subtitle="What's included in the property?"
      emoji="🔌"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Equipment Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EQUIPMENT_ITEMS.map(({ id, label, icon: Icon, description }) => {
            const isSelected = featureValues[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFeatureToggle(id, !isSelected)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                  "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                  isSelected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                  isSelected ? "bg-accent text-accent-foreground" : "bg-secondary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-center">{label}</span>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}