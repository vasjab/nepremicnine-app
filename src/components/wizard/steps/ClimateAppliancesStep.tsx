import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Flame, 
  ThermometerSun, 
  Wind, 
  Fan, 
  Sun,
  UtensilsCrossed,
  Shirt,
  RefreshCcw,
  Snowflake,
  Battery,
  ThermometerSnowflake
} from 'lucide-react';

interface ClimateAppliancesStepProps {
  // Comfort Features
  hasFireplace: boolean;
  hasFloorHeating: boolean;
  hasFloorCooling: boolean;
  // Cooling & Ventilation
  hasAirConditioning: boolean;
  acType: string;
  acUnitCount: string;
  hasVentilation: boolean;
  hasHeatRecoveryVentilation: boolean;
  // Energy Systems
  hasSolarPanels: boolean;
  hasHomeBattery: boolean;
  // Appliances (only shown when furnished)
  hasDishwasher: boolean;
  hasWashingMachine: boolean;
  hasDryer: boolean;
  // Furnished status - controls visibility of appliances section
  isFurnished: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Flame;
  info: string;
}

const COOLING_FEATURES: FeatureCard[] = [
  { id: 'has_air_conditioning', label: 'Air Conditioning', icon: Snowflake, info: 'Active cooling system for hot weather' },
  { id: 'has_ventilation', label: 'Ventilation', icon: Fan, info: 'Mechanical exhaust ventilation system for continuous fresh air circulation' },
  { id: 'has_heat_recovery_ventilation', label: 'Heat Recovery (HRV)', icon: RefreshCcw, info: 'Energy-efficient system that recovers heat from exhaust air to warm incoming fresh air, reducing heating costs by up to 90%' },
];

const COMFORT_FEATURES: FeatureCard[] = [
  { id: 'has_floor_heating', label: 'Floor Heating', icon: ThermometerSun, info: 'Radiant heating system under the floor for even warmth' },
  { id: 'has_floor_cooling', label: 'Floor Cooling', icon: ThermometerSnowflake, info: 'Radiant cooling system under the floor for comfortable summer temperatures' },
  { id: 'has_fireplace', label: 'Fireplace', icon: Flame, info: 'Wood-burning or gas fireplace for ambiance and additional heat' },
];

const ENERGY_FEATURES: FeatureCard[] = [
  { id: 'has_solar_panels', label: 'Solar Panels', icon: Sun, info: 'Photovoltaic panels that generate electricity from sunlight' },
  { id: 'has_home_battery', label: 'Home Battery', icon: Battery, info: 'Battery storage system to store excess solar energy or off-peak electricity' },
];

const APPLIANCE_FEATURES: FeatureCard[] = [
  { id: 'has_dishwasher', label: 'Dishwasher', icon: UtensilsCrossed, info: 'Built-in dishwasher included' },
  { id: 'has_washing_machine', label: 'Washing Machine', icon: Shirt, info: 'In-unit washing machine included' },
  { id: 'has_dryer', label: 'Dryer', icon: Wind, info: 'Tumble dryer or heat pump dryer included' },
];

const AC_TYPES = [
  { value: 'central', label: 'Central AC' },
  { value: 'unit', label: 'Unit/Split AC' },
];

export function ClimateAppliancesStep({
  hasFireplace,
  hasFloorHeating,
  hasFloorCooling,
  hasAirConditioning,
  acType,
  acUnitCount,
  hasVentilation,
  hasHeatRecoveryVentilation,
  hasSolarPanels,
  hasHomeBattery,
  hasDishwasher,
  hasWashingMachine,
  hasDryer,
  isFurnished,
  onFeatureToggle,
  onChange,
}: ClimateAppliancesStepProps) {
  // Only include appliance values in count when furnished
  const applianceValues = isFurnished ? {
    has_dishwasher: hasDishwasher,
    has_washing_machine: hasWashingMachine,
    has_dryer: hasDryer,
  } : {};

  const featureValues: Record<string, boolean> = {
    has_fireplace: hasFireplace,
    has_floor_heating: hasFloorHeating,
    has_floor_cooling: hasFloorCooling,
    has_air_conditioning: hasAirConditioning,
    has_ventilation: hasVentilation,
    has_heat_recovery_ventilation: hasHeatRecoveryVentilation,
    has_solar_panels: hasSolarPanels,
    has_home_battery: hasHomeBattery,
    ...applianceValues,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  const renderFeatureGrid = (features: FeatureCard[], columns: number = 3) => (
    <div className={cn(
      "grid gap-3",
      columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
    )}>
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
      title="Climate & Appliances"
      subtitle={isFurnished 
        ? "Cooling, ventilation, comfort features, and included appliances" 
        : "Cooling, ventilation, and comfort features"}
      emoji="🌡️"
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Cooling & Ventilation Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Cooling & Ventilation
          </h3>
          {renderFeatureGrid(COOLING_FEATURES)}
          
          {/* AC Type selector - show when AC is selected */}
          {hasAirConditioning && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
              <div className="space-y-2">
                <Label>AC Type</Label>
                <Select value={acType} onValueChange={(v) => onChange('ac_type', v)}>
                  <SelectTrigger className="max-w-48">
                    <SelectValue placeholder="Select AC type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AC_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Unit count - only for unit/split AC */}
              {acType === 'unit' && (
                <div className="space-y-2">
                  <Label htmlFor="ac_unit_count">Number of AC units</Label>
                  <Input
                    id="ac_unit_count"
                    type="number"
                    min="1"
                    max="20"
                    value={acUnitCount}
                    onChange={(e) => onChange('ac_unit_count', e.target.value)}
                    placeholder="e.g. 2"
                    className="max-w-24"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comfort Features Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Comfort Features
          </h3>
          {renderFeatureGrid(COMFORT_FEATURES)}
        </div>

        {/* Energy Systems Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Energy Systems
          </h3>
          {renderFeatureGrid(ENERGY_FEATURES, 2)}
        </div>

        {/* Appliances Section - only show if furnished */}
        {isFurnished && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Kitchen & Laundry
            </h3>
            {renderFeatureGrid(APPLIANCE_FEATURES)}
          </div>
        )}

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
