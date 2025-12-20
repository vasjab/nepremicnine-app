import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Building2, Home, Bed, LayoutGrid, Castle, Package, TreePine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'summer_house' | 'other';
type ListingType = 'rent' | 'sale';

interface PropertyTypeStepProps {
  propertyType: PropertyType;
  listingType: ListingType;
  propertyTypeOther: string;
  onPropertyTypeChange: (type: PropertyType) => void;
  onListingTypeChange: (type: ListingType) => void;
  onPropertyTypeOtherChange: (value: string) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: typeof Building2; description: string }[] = [
  { value: 'apartment', label: 'Apartment', icon: Building2, description: 'Flat in a building' },
  { value: 'house', label: 'House', icon: Home, description: 'Standalone home' },
  { value: 'summer_house', label: 'Summer House', icon: TreePine, description: 'Vacation property' },
  { value: 'room', label: 'Room', icon: Bed, description: 'Single room rental' },
  { value: 'studio', label: 'Studio', icon: LayoutGrid, description: 'Open-plan space' },
  { value: 'villa', label: 'Villa', icon: Castle, description: 'Luxury property' },
  { value: 'other', label: 'Other', icon: Package, description: 'Something else' },
];

export function PropertyTypeStep({
  propertyType,
  listingType,
  propertyTypeOther,
  onPropertyTypeChange,
  onListingTypeChange,
  onPropertyTypeOtherChange,
}: PropertyTypeStepProps) {
  return (
    <WizardStepWrapper
      title="What are you listing?"
      subtitle="Choose the type of property you want to list"
      emoji="🏠"
    >
      {/* Property Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {PROPERTY_TYPES.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => onPropertyTypeChange(value)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-300",
              "hover:border-accent/50 hover:shadow-lg hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              propertyType === value
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors",
              propertyType === value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground group-hover:bg-accent/10"
            )}>
              <Icon className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <span className="font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground mt-1 hidden md:block">{description}</span>
            
            {propertyType === value && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Other property type input */}
      {propertyType === 'other' && (
        <div className="mb-8 max-w-md mx-auto">
          <Label htmlFor="property_type_other">Describe your property type</Label>
          <Input
            id="property_type_other"
            placeholder="e.g., Houseboat, Loft, Commercial space..."
            value={propertyTypeOther}
            onChange={(e) => onPropertyTypeOtherChange(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {/* Listing Type Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-secondary rounded-full p-1">
          <button
            onClick={() => onListingTypeChange('rent')}
            className={cn(
              "px-6 py-3 rounded-full font-medium transition-all duration-300",
              listingType === 'rent'
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🔑 For Rent
          </button>
          <button
            onClick={() => onListingTypeChange('sale')}
            className={cn(
              "px-6 py-3 rounded-full font-medium transition-all duration-300",
              listingType === 'sale'
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            💰 For Sale
          </button>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
