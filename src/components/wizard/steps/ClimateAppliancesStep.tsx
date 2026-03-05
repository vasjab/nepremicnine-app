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
  ThermometerSnowflake,
  CookingPot,
  Zap
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
  batteryCapacityKwh: string;
  // Appliances (only shown when furnished)
  hasOven: boolean;
  hasMicrowave: boolean;
  hobType: string;
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

const KITCHEN_FEATURES: FeatureCard[] = [
  { id: 'has_oven', label: 'Oven', icon: CookingPot, info: 'Built-in or standalone oven for cooking and baking' },
  { id: 'has_microwave', label: 'Microwave', icon: Zap, info: 'Microwave oven for quick heating and cooking' },
  { id: 'has_dishwasher', label: 'Dishwasher', icon: UtensilsCrossed, info: 'Built-in dishwasher included' },
];

const LAUNDRY_FEATURES: FeatureCard[] = [
  { id: 'has_washing_machine', label: 'Washing Machine', icon: Shirt, info: 'In-unit washing machine included' },
  { id: 'has_dryer', label: 'Dryer', icon: Wind, info: 'Tumble dryer or heat pump dryer included' },
];

const AC_TYPES = [
  { value: 'central', label: 'Central AC' },
  { value: 'unit', label: 'Unit/Split AC' },
];

const HOB_TYPES = [
  { value: 'gas', label: 'Gas Hob' },
  { value: 'electric', label: 'Electric Hob' },
  { value: 'induction', label: 'Induction Hob' },
  { value: 'ceramic', label: 'Ceramic Hob' },
  { value: 'none', label: 'No Hob' },
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
  batteryCapacityKwh,
  hasOven,
  hasMicrowave,
  hobType,
  hasDishwasher,
  hasWashingMachine,
  hasDryer,
  isFurnished,
  onFeatureToggle,
  onChange,
}: ClimateAppliancesStepProps) {
  // Only include appliance values in count when furnished
  const applianceValues = isFurnished ? {
    has_oven: hasOven,
    has_microwave: hasMicrowave,
    has_dishwasher: hasDishwasher,
    has_washing_machine: hasWashingMachine,
    has_dryer: hasDryer,
  } : {};

  const featureValues: Record<string, boolean | string> = {
    has_fireplace: hasFireplace,
    has_floor_heating: hasFloorHeating,
    has_floor_cooling: hasFloorCooling,
    has_air_conditioning: hasAirConditioning,
    has_ventilation: hasVentilation,
    has_heat_recovery_ventilation: hasHeatRecoveryVentilation,
    has_solar_panels: hasSolarPanels,
    has_home_battery: hasHomeBattery,
    battery_capacity_kwh: batteryCapacityKwh,
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
              "relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              isSelected
                ? "border-blue-500 bg-blue-50/50 shadow-[0_1px_4px_hsl(217_91%_60%/0.12),0_0_0_1px_hsl(217_91%_60%/0.2)]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.06)]"
            )}
          >
            {/* Info tooltip in top-left */}
            <div className="absolute top-1.5 left-1.5">
              <InfoTooltip content={info} />
            </div>

            <div className={cn(
              "w-11 h-11 rounded-[12px] flex items-center justify-center mb-2.5 transition-all duration-200",
              isSelected
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500"
            )}>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className={cn(
              "text-sm font-semibold text-center tracking-tight transition-colors",
              isSelected ? "text-gray-900" : "text-gray-600"
            )}>{label}</span>

            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          
          {/* Battery Capacity input - show when Home Battery is selected */}
          {hasHomeBattery && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="battery_capacity">Battery Capacity</Label>
                <InfoTooltip content="Total storage capacity of the home battery system in kilowatt-hours" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="battery_capacity"
                  type="number"
                  min="1"
                  max="500"
                  value={(featureValues as any).battery_capacity_kwh || ''}
                  onChange={(e) => onChange('battery_capacity_kwh', e.target.value)}
                  placeholder="e.g. 13.5"
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">kWh</span>
              </div>
            </div>
          )}
        </div>

        {/* Kitchen Appliances Section - only show if furnished */}
        {isFurnished && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Kitchen
            </h3>
            {renderFeatureGrid(KITCHEN_FEATURES)}
            
            {/* Hob Type selector */}
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center gap-2">
                <Label>Hob / Stovetop Type</Label>
                <InfoTooltip content="The type of cooking hob or stovetop in the kitchen" />
              </div>
              <Select value={hobType} onValueChange={(v) => onChange('hob_type', v)}>
                <SelectTrigger className="max-w-48">
                  <SelectValue placeholder="Select hob type" />
                </SelectTrigger>
                <SelectContent>
                  {HOB_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Laundry Section - only show if furnished */}
        {isFurnished && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Laundry
            </h3>
            {renderFeatureGrid(LAUNDRY_FEATURES, 2)}
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
