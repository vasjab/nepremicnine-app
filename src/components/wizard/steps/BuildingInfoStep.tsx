import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  Building2, 
  RefreshCw, 
  Zap, 
  Fuel, 
  TreePine, 
  Thermometer, 
  Settings,
  type LucideIcon
} from 'lucide-react';

interface BuildingInfoStepProps {
  floorNumber: string;
  totalFloorsBuilding: string;
  propertyFloors: string;
  heatingType: string;
  heatingTypeOther: string;
  energyRating: string;
  yearBuilt: string;
  propertyCondition: string;
  propertyType: string;
  onChange: (field: string, value: string) => void;
}

interface HeatingType {
  value: string;
  label: string;
  icon: LucideIcon;
  info: string;
}

const HEATING_TYPES: HeatingType[] = [
  { value: 'central', label: 'Central', icon: Flame, info: 'Central boiler distributes hot water through radiators or underfloor pipes throughout the building' },
  { value: 'district', label: 'District', icon: Building2, info: 'Heat supplied from a central municipal facility through an insulated pipe network to multiple buildings' },
  { value: 'heat_pump', label: 'Heat Pump', icon: RefreshCw, info: 'Efficient system that extracts heat from air, water, or ground — can also provide cooling' },
  { value: 'electric', label: 'Electric', icon: Zap, info: 'Electric baseboard heaters, radiators, or infrared panels — simple but can be costly to run' },
  { value: 'gas', label: 'Gas', icon: Fuel, info: 'Natural gas powered boiler or furnace system — common and efficient for heating' },
  { value: 'wood', label: 'Wood/Pellet', icon: TreePine, info: 'Wood burning stove or automated pellet boiler — eco-friendly with proper sourcing' },
  { value: 'geothermal', label: 'Geothermal', icon: Thermometer, info: 'Uses stable underground temperature for highly efficient heating and cooling' },
  { value: 'other', label: 'Other', icon: Settings, info: 'Other heating system not listed above' },
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
  heatingType,
  heatingTypeOther,
  energyRating,
  yearBuilt,
  propertyCondition,
  propertyType,
  onChange,
}: BuildingInfoStepProps) {
  const isApartmentType = ['apartment', 'room', 'studio'].includes(propertyType);
  const isHouseType = ['house', 'villa'].includes(propertyType);
  
  const currentYear = new Date().getFullYear();

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

        {/* Heating type - Button cards */}
        <div className="space-y-3">
          <Label>Heating type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HEATING_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = heatingType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onChange('heating_type', type.value)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center min-h-[90px]",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className="absolute top-2 right-2">
                    <InfoTooltip content={type.info} />
                  </div>
                  <Icon className={cn(
                    "h-6 w-6 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-[10px]">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {heatingType === 'other' && (
            <Input
              placeholder="Describe heating type..."
              value={heatingTypeOther}
              onChange={(e) => onChange('heating_type_other', e.target.value)}
              className="mt-2"
            />
          )}
        </div>

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
