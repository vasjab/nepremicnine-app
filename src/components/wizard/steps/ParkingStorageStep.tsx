import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Car, 
  Warehouse, 
  SquareParking, 
  Zap, 
  Bike, 
  Package, 
  ArrowDown,
  Baby
} from 'lucide-react';

interface ParkingStorageStepProps {
  hasParking: boolean;
  parkingType: string;
  parkingSpaces: string;
  hasGarage: boolean;
  hasCarport: boolean;
  hasEvCharging: boolean;
  evChargerPower: string;
  hasBicycleStorage: boolean;
  hasStrollerStorage: boolean;
  hasStorage: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Car;
  info: string;
}

const PARKING_FEATURES: FeatureCard[] = [
  { id: 'has_parking', label: 'Parking', icon: Car, info: 'Designated outdoor parking spot assigned to the property' },
  { id: 'has_garage', label: 'Garage', icon: Warehouse, info: 'Fully enclosed private parking space with walls and a door for maximum protection' },
  { id: 'has_carport', label: 'Carport', icon: SquareParking, info: 'Covered structure with a roof but open sides, protecting your car from rain and sun' },
  { id: 'has_ev_charging', label: 'EV Charging', icon: Zap, info: 'Electric vehicle charging station available at the property or building' },
];

const STORAGE_FEATURES: FeatureCard[] = [
  { id: 'has_bicycle_storage', label: 'Bicycle Storage', icon: Bike, info: 'Secure common area for storing bicycles' },
  { id: 'has_stroller_storage', label: 'Stroller Storage', icon: Baby, info: 'Common storage room for baby strollers and prams' },
  { id: 'has_storage', label: 'Storage Room', icon: Package, info: 'Private storage space — can be a basement, attic, locker, or dedicated room in common area' },
];

const PARKING_TYPES = [
  { value: 'street', label: 'Street Parking' },
  { value: 'designated', label: 'Designated Spot' },
  { value: 'underground', label: 'Underground' },
  { value: 'private', label: 'Private Driveway' },
];

const EV_CHARGER_POWER = [
  { value: '3.7', label: '3.7 kW (Slow - ~25 km/h)' },
  { value: '7.4', label: '7.4 kW (Standard - ~50 km/h)' },
  { value: '11', label: '11 kW (Fast - ~75 km/h)' },
  { value: '22', label: '22 kW (Rapid - ~150 km/h)' },
];

export function ParkingStorageStep({
  hasParking,
  parkingType,
  parkingSpaces,
  hasGarage,
  hasCarport,
  hasEvCharging,
  evChargerPower,
  hasBicycleStorage,
  hasStrollerStorage,
  hasStorage,
  onFeatureToggle,
  onChange,
}: ParkingStorageStepProps) {
  const parkingFeatureValues: Record<string, boolean> = {
    has_parking: hasParking,
    has_garage: hasGarage,
    has_carport: hasCarport,
    has_ev_charging: hasEvCharging,
  };

  const storageFeatureValues: Record<string, boolean> = {
    has_bicycle_storage: hasBicycleStorage,
    has_stroller_storage: hasStrollerStorage,
    has_storage: hasStorage,
  };

  const allFeatureValues = { ...parkingFeatureValues, ...storageFeatureValues };
  const selectedCount = Object.values(allFeatureValues).filter(Boolean).length;

  const renderFeatureGrid = (features: FeatureCard[], featureValues: Record<string, boolean>) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {features.map(({ id, label, icon: Icon, info }) => {
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
            {/* Info tooltip in top-right */}
            <div className="absolute top-1 right-1">
              <InfoTooltip content={info} />
            </div>
            
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
              isSelected ? "bg-accent text-accent-foreground" : "bg-secondary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
            
            {isSelected && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <WizardStepWrapper
      title="Parking & Storage"
      subtitle="Practical features that can be deal-breakers"
      emoji="🚗"
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Parking Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Parking Options
          </h3>
          {renderFeatureGrid(PARKING_FEATURES, parkingFeatureValues)}
          
          {/* Conditional Inputs for Parking */}
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

          {/* EV Charger Power selector */}
          {hasEvCharging && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center gap-2">
                <Label>Charger Power</Label>
                <InfoTooltip content="Higher power means faster charging. km/h refers to approximate range added per hour of charging." />
              </div>
              <Select value={evChargerPower} onValueChange={(v) => onChange('ev_charger_power', v)}>
                <SelectTrigger className="max-w-64">
                  <SelectValue placeholder="Select charger power" />
                </SelectTrigger>
                <SelectContent>
                  {EV_CHARGER_POWER.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Storage Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Storage Options
          </h3>
          {renderFeatureGrid(STORAGE_FEATURES, storageFeatureValues)}
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
