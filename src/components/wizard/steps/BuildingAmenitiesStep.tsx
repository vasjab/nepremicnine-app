import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { 
  ArrowUp, 
  Shirt, 
  Dumbbell, 
  Thermometer, 
  Waves, 
  Sofa, 
  Bell, 
  Shield
} from 'lucide-react';

interface BuildingAmenitiesStepProps {
  hasElevator: boolean;
  hasSharedLaundry: boolean;
  hasGym: boolean;
  hasSauna: boolean;
  hasPool: boolean;
  hasCommonRoom: boolean;
  hasConcierge: boolean;
  hasSecurity: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof ArrowUp;
  description: string;
}

const BUILDING_AMENITIES: FeatureCard[] = [
  { id: 'has_elevator', label: 'Elevator', icon: ArrowUp, description: 'Building has elevator' },
  { id: 'has_shared_laundry', label: 'Shared Laundry', icon: Shirt, description: 'Common laundry room' },
  { id: 'has_gym', label: 'Gym', icon: Dumbbell, description: 'Fitness room' },
  { id: 'has_sauna', label: 'Sauna', icon: Thermometer, description: 'Sauna or spa' },
  { id: 'has_pool', label: 'Pool', icon: Waves, description: 'Swimming pool' },
  { id: 'has_common_room', label: 'Common Room', icon: Sofa, description: 'Shared lounge area' },
  { id: 'has_concierge', label: 'Concierge', icon: Bell, description: 'Reception service' },
  { id: 'has_security', label: 'Security', icon: Shield, description: 'CCTV or guards' },
];

export function BuildingAmenitiesStep({
  hasElevator,
  hasSharedLaundry,
  hasGym,
  hasSauna,
  hasPool,
  hasCommonRoom,
  hasConcierge,
  hasSecurity,
  onFeatureToggle,
}: BuildingAmenitiesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_elevator: hasElevator,
    has_shared_laundry: hasSharedLaundry,
    has_gym: hasGym,
    has_sauna: hasSauna,
    has_pool: hasPool,
    has_common_room: hasCommonRoom,
    has_concierge: hasConcierge,
    has_security: hasSecurity,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Building Amenities"
      subtitle="Shared facilities that add value to apartment living"
      emoji="🏢"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BUILDING_AMENITIES.map(({ id, label, icon: Icon, description }) => {
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
          {selectedCount} amenity{selectedCount !== 1 ? 'ies' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}
