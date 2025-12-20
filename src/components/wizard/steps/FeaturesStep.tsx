import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { 
  ArrowUp, 
  Trees, 
  Sun, 
  Flower2, 
  Car, 
  Warehouse, 
  Wind, 
  UtensilsCrossed, 
  Shirt, 
  Package 
} from 'lucide-react';

interface FeaturesStepProps {
  hasElevator: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  hasGarage: boolean;
  hasAirConditioning: boolean;
  hasDishwasher: boolean;
  hasWashingMachine: boolean;
  hasStorage: boolean;
  propertyType: string;
  onFeatureToggle: (feature: string, value: boolean) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof ArrowUp;
  description: string;
}

const ALL_FEATURES: FeatureCard[] = [
  { id: 'has_elevator', label: 'Elevator', icon: ArrowUp, description: 'Building has an elevator' },
  { id: 'has_balcony', label: 'Balcony', icon: Sun, description: 'Private outdoor balcony' },
  { id: 'has_terrace', label: 'Terrace', icon: Trees, description: 'Outdoor terrace area' },
  { id: 'has_garden', label: 'Garden', icon: Flower2, description: 'Private garden space' },
  { id: 'has_parking', label: 'Parking', icon: Car, description: 'Parking available' },
  { id: 'has_garage', label: 'Garage', icon: Warehouse, description: 'Private garage' },
  { id: 'has_air_conditioning', label: 'A/C', icon: Wind, description: 'Air conditioning' },
  { id: 'has_dishwasher', label: 'Dishwasher', icon: UtensilsCrossed, description: 'Dishwasher included' },
  { id: 'has_washing_machine', label: 'Washer', icon: Shirt, description: 'Washing machine' },
  { id: 'has_storage', label: 'Storage', icon: Package, description: 'Storage/cellar space' },
];

export function FeaturesStep({
  hasElevator,
  hasBalcony,
  hasTerrace,
  hasGarden,
  hasParking,
  hasGarage,
  hasAirConditioning,
  hasDishwasher,
  hasWashingMachine,
  hasStorage,
  propertyType,
  onFeatureToggle,
}: FeaturesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_elevator: hasElevator,
    has_balcony: hasBalcony,
    has_terrace: hasTerrace,
    has_garden: hasGarden,
    has_parking: hasParking,
    has_garage: hasGarage,
    has_air_conditioning: hasAirConditioning,
    has_dishwasher: hasDishwasher,
    has_washing_machine: hasWashingMachine,
    has_storage: hasStorage,
  };

  // Filter features based on property type
  const isApartmentType = ['apartment', 'room', 'studio'].includes(propertyType);
  const relevantFeatures = ALL_FEATURES.filter(f => {
    // Hide elevator for houses/villas
    if (f.id === 'has_elevator' && !isApartmentType) return false;
    return true;
  });

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="What features does it have?"
      subtitle="Select all that apply to your property"
      emoji="✨"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {relevantFeatures.map(({ id, label, icon: Icon, description }) => {
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
          {selectedCount} feature{selectedCount !== 1 ? 's' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}
