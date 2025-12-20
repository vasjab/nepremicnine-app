import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const HEATING_TYPES = [
  { value: 'central', label: 'Central heating' },
  { value: 'district', label: 'District heating' },
  { value: 'heat_pump', label: 'Heat pump' },
  { value: 'electric', label: 'Electric' },
  { value: 'gas', label: 'Gas' },
  { value: 'wood', label: 'Wood/Pellet' },
  { value: 'geothermal', label: 'Geothermal' },
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

        {/* Heating type */}
        <div className="space-y-2">
          <Label>Heating type</Label>
          <Select value={heatingType} onValueChange={(v) => onChange('heating_type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select heating type" />
            </SelectTrigger>
            <SelectContent>
              {HEATING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
