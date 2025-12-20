import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUp, 
  Trees, 
  Sun, 
  Flower2, 
  Car, 
  Warehouse, 
  Package,
  Flame,
  Bath,
  Waves
} from 'lucide-react';

interface BuildingFeaturesStepProps {
  hasElevator: boolean;
  hasBalcony: boolean;
  balconySqm: string;
  hasTerrace: boolean;
  terraceSqm: string;
  hasGarden: boolean;
  gardenSqm: string;
  hasParking: boolean;
  parkingType: string;
  parkingSpaces: string;
  hasGarage: boolean;
  hasStorage: boolean;
  hasFireplace: boolean;
  propertyType: string;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof ArrowUp;
  description: string;
}

const BUILDING_FEATURES: FeatureCard[] = [
  { id: 'has_elevator', label: 'Elevator', icon: ArrowUp, description: 'Building has an elevator' },
  { id: 'has_balcony', label: 'Balcony', icon: Sun, description: 'Private outdoor balcony' },
  { id: 'has_terrace', label: 'Terrace', icon: Trees, description: 'Outdoor terrace area' },
  { id: 'has_garden', label: 'Garden', icon: Flower2, description: 'Private garden space' },
  { id: 'has_parking', label: 'Parking', icon: Car, description: 'Parking available' },
  { id: 'has_garage', label: 'Garage', icon: Warehouse, description: 'Private garage' },
  { id: 'has_storage', label: 'Storage', icon: Package, description: 'Storage/cellar space' },
  { id: 'has_fireplace', label: 'Fireplace', icon: Flame, description: 'Indoor fireplace' },
];

const PARKING_TYPES = [
  { value: 'street', label: 'Street parking' },
  { value: 'designated', label: 'Designated spot' },
  { value: 'underground', label: 'Underground parking' },
  { value: 'private', label: 'Private driveway' },
];

export function BuildingFeaturesStep({
  hasElevator,
  hasBalcony,
  balconySqm,
  hasTerrace,
  terraceSqm,
  hasGarden,
  gardenSqm,
  hasParking,
  parkingType,
  parkingSpaces,
  hasGarage,
  hasStorage,
  hasFireplace,
  propertyType,
  onFeatureToggle,
  onChange,
}: BuildingFeaturesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_elevator: hasElevator,
    has_balcony: hasBalcony,
    has_terrace: hasTerrace,
    has_garden: hasGarden,
    has_parking: hasParking,
    has_garage: hasGarage,
    has_storage: hasStorage,
    has_fireplace: hasFireplace,
  };

  // Filter features based on property type
  const isApartmentType = ['apartment', 'room', 'studio'].includes(propertyType);
  const relevantFeatures = BUILDING_FEATURES.filter(f => {
    // Hide elevator for houses/villas
    if (f.id === 'has_elevator' && !isApartmentType) return false;
    return true;
  });

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Building features"
      subtitle="Select structural and outdoor features"
      emoji="🏗️"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {relevantFeatures.map(({ id, label, icon: Icon }) => {
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

        {/* Conditional inputs for selected features */}
        <div className="space-y-4">
          {/* Balcony size */}
          {hasBalcony && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <Label htmlFor="balcony_sqm">Balcony size (m²)</Label>
              <Input
                id="balcony_sqm"
                type="number"
                min="1"
                placeholder="e.g., 8"
                value={balconySqm}
                onChange={(e) => onChange('balcony_sqm', e.target.value)}
                className="mt-1 max-w-[200px]"
              />
            </div>
          )}

          {/* Terrace size */}
          {hasTerrace && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <Label htmlFor="terrace_sqm">Terrace size (m²)</Label>
              <Input
                id="terrace_sqm"
                type="number"
                min="1"
                placeholder="e.g., 15"
                value={terraceSqm}
                onChange={(e) => onChange('terrace_sqm', e.target.value)}
                className="mt-1 max-w-[200px]"
              />
            </div>
          )}

          {/* Garden size */}
          {hasGarden && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <Label htmlFor="garden_sqm">Garden size (m²)</Label>
              <Input
                id="garden_sqm"
                type="number"
                min="1"
                placeholder="e.g., 50"
                value={gardenSqm}
                onChange={(e) => onChange('garden_sqm', e.target.value)}
                className="mt-1 max-w-[200px]"
              />
            </div>
          )}

          {/* Parking details */}
          {hasParking && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div>
                <Label>Parking type</Label>
                <Select value={parkingType} onValueChange={(v) => onChange('parking_type', v)}>
                  <SelectTrigger className="mt-1 max-w-[250px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARKING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parking_spaces">Number of spaces</Label>
                <Input
                  id="parking_spaces"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={parkingSpaces}
                  onChange={(e) => onChange('parking_spaces', e.target.value)}
                  className="mt-1 max-w-[120px]"
                />
              </div>
            </div>
          )}
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