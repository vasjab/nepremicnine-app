import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  Warehouse, 
  SquareParking, 
  Zap, 
  Bike, 
  Package, 
  ArrowDown
} from 'lucide-react';

interface ParkingStorageStepProps {
  hasParking: boolean;
  parkingType: string;
  parkingSpaces: string;
  hasGarage: boolean;
  hasCarport: boolean;
  hasEvCharging: boolean;
  hasBicycleStorage: boolean;
  hasStorage: boolean;
  hasBasement: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Car;
  description: string;
}

const PARKING_FEATURES: FeatureCard[] = [
  { id: 'has_parking', label: 'Parking', icon: Car, description: 'Designated parking spot' },
  { id: 'has_garage', label: 'Garage', icon: Warehouse, description: 'Private garage' },
  { id: 'has_carport', label: 'Carport', icon: SquareParking, description: 'Covered parking' },
  { id: 'has_ev_charging', label: 'EV Charging', icon: Zap, description: 'Electric vehicle charging' },
  { id: 'has_bicycle_storage', label: 'Bicycle Storage', icon: Bike, description: 'Secure bike storage' },
  { id: 'has_storage', label: 'Storage Room', icon: Package, description: 'Extra storage space' },
  { id: 'has_basement', label: 'Basement', icon: ArrowDown, description: 'Cellar or basement' },
];

const PARKING_TYPES = [
  { value: 'street', label: 'Street Parking' },
  { value: 'designated', label: 'Designated Spot' },
  { value: 'underground', label: 'Underground' },
  { value: 'private', label: 'Private Driveway' },
];

export function ParkingStorageStep({
  hasParking,
  parkingType,
  parkingSpaces,
  hasGarage,
  hasCarport,
  hasEvCharging,
  hasBicycleStorage,
  hasStorage,
  hasBasement,
  onFeatureToggle,
  onChange,
}: ParkingStorageStepProps) {
  const featureValues: Record<string, boolean> = {
    has_parking: hasParking,
    has_garage: hasGarage,
    has_carport: hasCarport,
    has_ev_charging: hasEvCharging,
    has_bicycle_storage: hasBicycleStorage,
    has_storage: hasStorage,
    has_basement: hasBasement,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Parking & Storage"
      subtitle="Practical features that can be deal-breakers"
      emoji="🚗"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PARKING_FEATURES.map(({ id, label, icon: Icon, description }) => {
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

        {/* Conditional Inputs */}
        {hasParking && (
          <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parking type</Label>
                <Select value={parkingType} onValueChange={(v) => onChange('parking_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARKING_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_spaces">Number of spaces</Label>
                <Input
                  id="parking_spaces"
                  type="number"
                  value={parkingSpaces}
                  onChange={(e) => onChange('parking_spaces', e.target.value)}
                  placeholder="e.g. 1"
                  min="1"
                />
              </div>
            </div>
          </div>
        )}

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
