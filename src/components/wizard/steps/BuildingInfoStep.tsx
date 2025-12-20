import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  Building2, 
  Zap, 
  Fuel, 
  TreePine, 
  Settings,
  RefreshCw,
  Heater,
  Factory,
  type LucideIcon
} from 'lucide-react';

interface BuildingInfoStepProps {
  floorNumber: string;
  totalFloorsBuilding: string;
  propertyFloors: string;
  heatingDistribution: string;
  heatingSource: string;
  heatPumpType: string;
  heatingTypeOther: string;
  individualHeaterTypes: string[];
  energyRating: string;
  yearBuilt: string;
  propertyCondition: string;
  propertyType: string;
  onChange: (field: string, value: string | string[]) => void;
}

interface HeatingOption {
  value: string;
  label: string;
  icon: LucideIcon;
  info: string;
}

// Updated: Central or Individual (removed District from here - moved to heat source)
const HEATING_DISTRIBUTION: HeatingOption[] = [
  { value: 'central', label: 'Central Heating', icon: Building2, info: 'One heating source distributes heat throughout the property via radiators, underfloor pipes, or vents' },
  { value: 'individual', label: 'Individual Heaters', icon: Heater, info: 'Each room has its own heating unit (wall heaters, portable heaters, etc)' },
  { value: 'both', label: 'Both', icon: Flame, info: 'Combination of central heating and individual heaters in some rooms' },
];

// Updated: Added District Heating as a heat source option
const HEATING_SOURCES: HeatingOption[] = [
  { value: 'district', label: 'District Heating', icon: Factory, info: 'Heat supplied from a central municipal facility shared by multiple buildings' },
  { value: 'gas', label: 'Gas', icon: Fuel, info: 'Natural gas powered boiler or heaters' },
  { value: 'electric', label: 'Electric', icon: Zap, info: 'Electric boiler, radiators, or baseboard heaters' },
  { value: 'heat_pump', label: 'Heat Pump', icon: RefreshCw, info: 'Efficient system that extracts heat from air, water, or ground' },
  { value: 'wood_pellet', label: 'Wood/Pellet', icon: TreePine, info: 'Wood burning stove or automated pellet boiler' },
  { value: 'oil', label: 'Oil', icon: Fuel, info: 'Oil-fired boiler system' },
  { value: 'other', label: 'Other', icon: Settings, info: 'Other heating source not listed' },
];

const HEAT_PUMP_TYPES = [
  { value: 'air_to_air', label: 'Air-to-Air', info: 'Most common and affordable. Extracts heat from outdoor air, delivers warm air directly into rooms' },
  { value: 'air_to_water', label: 'Air-to-Water', info: 'Extracts heat from outdoor air, heats water for radiators or underfloor heating' },
  { value: 'ground_source', label: 'Ground Source (Geothermal)', info: 'Extracts heat from underground via buried pipes. Very efficient but higher install cost' },
  { value: 'water_source', label: 'Water Source', info: 'Extracts heat from a lake, well, or groundwater' },
];

// Individual heater types for multi-select when individual/both is selected
const INDIVIDUAL_HEATER_TYPES = [
  { value: 'electric_radiator', label: 'Electric Radiator' },
  { value: 'wall_mounted_heater', label: 'Wall-mounted Heater' },
  { value: 'air_to_air_heat_pump', label: 'Air-to-Air Heat Pump' },
  { value: 'portable_heater', label: 'Portable Heater' },
  { value: 'wood_stove', label: 'Wood Stove' },
  { value: 'pellet_stove', label: 'Pellet Stove' },
  { value: 'infrared_heater', label: 'Infrared Heater' },
  { value: 'other', label: 'Other' },
];

const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const PROPERTY_CONDITIONS = [
  { value: 'new', label: 'New / Never lived in' },
  { value: 'renovated', label: 'Recently renovated' },
  { value: 'good', label: 'Good condition' },
  { value: 'needs_work', label: 'Needs some work' },
];

export function BuildingInfoStep({
  floorNumber,
  totalFloorsBuilding,
  propertyFloors,
  heatingDistribution,
  heatingSource,
  heatPumpType,
  heatingTypeOther,
  individualHeaterTypes = [],
  energyRating,
  yearBuilt,
  propertyCondition,
  propertyType,
  onChange,
}: BuildingInfoStepProps) {
  const isApartmentType = ['apartment', 'room', 'studio'].includes(propertyType);
  const isHouseType = ['house', 'villa'].includes(propertyType);
  
  const currentYear = new Date().getFullYear();
  
  // Show heating source options for central heating
  const showHeatingSource = heatingDistribution === 'central' || heatingDistribution === 'both';
  
  // Show individual heater types when individual or both is selected
  const showIndividualHeaterTypes = heatingDistribution === 'individual' || heatingDistribution === 'both';
  
  // Show heat pump type when heat pump is selected as source
  const showHeatPumpType = heatingSource === 'heat_pump';

  const handleIndividualHeaterTypeToggle = (type: string) => {
    const current = Array.isArray(individualHeaterTypes) ? individualHeaterTypes : [];
    const newTypes = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange('individual_heater_types', newTypes);
  };

  return (
    <WizardStepWrapper
      title="Building details"
      subtitle="Help renters understand the property better"
      emoji="🏗️"
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Floor information - for apartments */}
        {isApartmentType && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Floor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor_number">Floor number</Label>
                <Input
                  id="floor_number"
                  type="number"
                  min="0"
                  placeholder="e.g., 3"
                  value={floorNumber}
                  onChange={(e) => onChange('floor_number', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="total_floors">Total floors in building</Label>
                <Input
                  id="total_floors"
                  type="number"
                  min="1"
                  placeholder="e.g., 6"
                  value={totalFloorsBuilding}
                  onChange={(e) => onChange('total_floors_building', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Property floors - for houses */}
        {isHouseType && (
          <div>
            <Label htmlFor="property_floors">Number of floors</Label>
            <Input
              id="property_floors"
              type="number"
              min="1"
              placeholder="e.g., 2"
              value={propertyFloors}
              onChange={(e) => onChange('property_floors', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">How many floors does the property have?</p>
          </div>
        )}

        {/* Heating System - Step 1: Distribution */}
        <div className="space-y-3">
          <Label>Heating distribution</Label>
          <p className="text-xs text-muted-foreground -mt-1">How is heat distributed throughout the property?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {HEATING_DISTRIBUTION.map((type) => {
              const Icon = type.icon;
              const isSelected = heatingDistribution === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    onChange('heating_distribution', type.value);
                    // Reset dependent fields when changing distribution
                    if (type.value === 'individual') {
                      onChange('heating_source', '');
                      onChange('heat_pump_type', '');
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center min-h-[100px]",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <Icon className={cn(
                    "h-6 w-6 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {type.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{type.info}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Heating System - Step 2: Heat Source (for central or both) */}
        {showHeatingSource && (
          <div className="space-y-3">
            <Label>Heat source</Label>
            <p className="text-xs text-muted-foreground -mt-1">What type of heating system powers the central heating?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HEATING_SOURCES.map((type) => {
                const Icon = type.icon;
                const isSelected = heatingSource === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      onChange('heating_source', type.value);
                      // Reset heat pump type if not heat pump
                      if (type.value !== 'heat_pump') {
                        onChange('heat_pump_type', '');
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-center min-h-[80px]",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {heatingSource === 'other' && (
              <Input
                placeholder="Describe heating source..."
                value={heatingTypeOther}
                onChange={(e) => onChange('heating_type_other', e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        )}

        {/* Heating System - Step 3: Heat Pump Type */}
        {showHeatPumpType && (
          <div className="space-y-3">
            <Label>Heat pump type</Label>
            <p className="text-xs text-muted-foreground -mt-1">What type of heat pump is installed?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HEAT_PUMP_TYPES.map((type) => {
                const isSelected = heatPumpType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => onChange('heat_pump_type', type.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {type.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{type.info}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Heater Types - Multi-select when individual or both is selected */}
        {showIndividualHeaterTypes && (
          <div className="space-y-3">
            <Label>Individual heater types</Label>
            <p className="text-xs text-muted-foreground -mt-1">Select all types of individual heaters present</p>
            <div className="grid grid-cols-2 gap-3">
              {INDIVIDUAL_HEATER_TYPES.map((type) => {
                const isChecked = Array.isArray(individualHeaterTypes) && individualHeaterTypes.includes(type.value);
                return (
                  <label
                    key={type.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleIndividualHeaterTypeToggle(type.value)}
                    />
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isChecked ? "text-primary" : "text-foreground"
                    )}>
                      {type.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Energy rating */}
        <div className="space-y-2">
          <Label>Energy rating</Label>
          <Select value={energyRating} onValueChange={(v) => onChange('energy_rating', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select energy rating" />
            </SelectTrigger>
            <SelectContent>
              {ENERGY_RATINGS.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  Class {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year built */}
        <div>
          <Label htmlFor="year_built">Year built</Label>
          <Input
            id="year_built"
            type="number"
            min="1800"
            max={currentYear}
            placeholder={`e.g., ${currentYear - 20}`}
            value={yearBuilt}
            onChange={(e) => onChange('year_built', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Property condition */}
        <div className="space-y-2">
          <Label>Property condition</Label>
          <Select value={propertyCondition} onValueChange={(v) => onChange('property_condition', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          This step is optional — you can skip if you don't have this information
        </p>
      </div>
    </WizardStepWrapper>
  );
}
