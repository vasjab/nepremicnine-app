import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, X, Building2, Home, DoorOpen, Square, Castle, Key, Banknote, ChevronDown } from 'lucide-react';
import { ListingFilters, AreaUnit } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface MobileMapFilterButtonProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}

// Price ranges by listing type
const PRICE_CONFIG = {
  rent: { min: 0, max: 5000, step: 100 },
  sale: { min: 0, max: 2000000, step: 10000 },
  default: { min: 0, max: 100000, step: 1000 },
} as const;

// Size range config
const SIZE_CONFIG = {
  sqm: { min: 5, max: 200, step: 5, label: 'm²' },
  sqft: { min: 50, max: 2150, step: 50, label: 'ft²' },
} as const;

// Price per sqm range config (based on listing type)
const PRICE_PER_SQM_CONFIG = {
  rent: { min: 0, max: 100, step: 5 }, // 0-100€/m² for rentals
  sale: { min: 0, max: 15000, step: 250 }, // 0-15k€/m² for sales
  default: { min: 0, max: 5000, step: 100 },
} as const;

const SQM_TO_SQFT = 10.764;

// Count active filters
export function getActiveFilterCount(filters: ListingFilters): number {
  let count = 0;
  
  if (filters.listing_type) count++;
  if (filters.property_types && filters.property_types.length > 0) count += filters.property_types.length;
  if (filters.min_bedrooms) count++;
  if (filters.min_price || filters.max_price) count++;
  if (filters.min_area || filters.max_area) count++;
  if (filters.min_price_per_sqm || filters.max_price_per_sqm) count++;
  if (filters.city) count++;
  if (filters.is_furnished) count++;
  if (filters.allows_pets) count++;
  if (filters.has_elevator) count++;
  if (filters.has_balcony) count++;
  if (filters.has_terrace) count++;
  if (filters.has_garden) count++;
  if (filters.has_parking) count++;
  if (filters.has_garage) count++;
  if (filters.has_air_conditioning) count++;
  if (filters.has_dishwasher) count++;
  if (filters.has_washing_machine) count++;
  if (filters.has_storage) count++;
  if (filters.internet_included) count++;
  if (filters.utilities_included) count++;
  
  return count;
}

// Collapsible filter section component
function FilterSection({ 
  title, 
  children, 
  defaultOpen = false,
  hasActiveFilters = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  hasActiveFilters?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border/50">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-5 text-sm font-medium transition-colors hover:text-foreground will-change-transform">
        <span className="flex items-center gap-3">
          {title}
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse-ring" />
          )}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-150 ease-out",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2 pb-6">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Toggle filter button component
function ToggleFilter({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between min-h-[56px] px-4 py-3 rounded-xl transition-all cursor-pointer",
        checked ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/50"
      )}
      onClick={() => onChange(!checked)}
    >
      <Label className={cn("text-sm font-normal cursor-pointer flex-1", checked && "text-foreground")}>
        {label}
      </Label>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-accent"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function MobileMapFilterButton({ filters, onFiltersChange }: MobileMapFilterButtonProps) {
  const { t } = useTranslation();
  const { currencySymbol } = useFormattedPrice();
  const [isOpen, setIsOpen] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqm');

  const LISTING_TYPES = [
    { value: 'rent', label: t('listingTypes.rent'), icon: Key },
    { value: 'sale', label: t('listingTypes.sale'), icon: Banknote },
  ] as const;

  const PROPERTY_TYPES = [
    { value: 'apartment', label: t('propertyTypes.apartment'), icon: Building2 },
    { value: 'house', label: t('propertyTypes.house'), icon: Home },
    { value: 'room', label: t('propertyTypes.room'), icon: DoorOpen },
    { value: 'studio', label: t('propertyTypes.studio'), icon: Square },
    { value: 'villa', label: t('propertyTypes.villa'), icon: Castle },
  ] as const;

  // Check if apartment-type properties are selected
  const isApartmentTypeSelected = filters.property_types?.some(t => 
    ['apartment', 'room', 'studio'].includes(t)
  ) ?? true;
  
  const isHouseTypeSelected = filters.property_types?.some(t => 
    ['house', 'villa'].includes(t)
  ) ?? true;

  const isRentalSelected = filters.listing_type === 'rent' || filters.listing_type === null;

  // Get price config based on listing type
  const getPriceConfig = () => {
    if (filters.listing_type === 'rent') return PRICE_CONFIG.rent;
    if (filters.listing_type === 'sale') return PRICE_CONFIG.sale;
    return PRICE_CONFIG.default;
  };

  const priceConfig = getPriceConfig();
  const sizeConfig = SIZE_CONFIG[areaUnit];

  // Convert size value between units
  const convertSize = (value: number, from: AreaUnit, to: AreaUnit): number => {
    if (from === to) return value;
    if (from === 'sqm' && to === 'sqft') return Math.round(value * SQM_TO_SQFT);
    return Math.round(value / SQM_TO_SQFT);
  };

  // Get displayed size range values (in current unit)
  const getDisplayedSizeRange = (): [number, number] => {
    const minSqm = filters.min_area ?? SIZE_CONFIG.sqm.min;
    const maxSqm = filters.max_area ?? SIZE_CONFIG.sqm.max;
    
    if (areaUnit === 'sqm') {
      return [minSqm, maxSqm];
    }
    return [convertSize(minSqm, 'sqm', 'sqft'), convertSize(maxSqm, 'sqm', 'sqft')];
  };

  const handleListingTypeChange = (value: string) => {
    const newListingType = value === 'all' ? null : (value as 'rent' | 'sale');
    if (newListingType !== filters.listing_type) {
      onFiltersChange({
        ...filters,
        listing_type: newListingType,
        min_price: null,
        max_price: null,
      });
    }
  };

  const handlePropertyTypeToggle = (value: string) => {
    const current = filters.property_types || [];
    const updated = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    onFiltersChange({
      ...filters,
      property_types: updated.length > 0 ? updated : null,
    });
  };

  const handleBedroomChange = (value: string) => {
    onFiltersChange({
      ...filters,
      min_bedrooms: value === 'all' ? null : parseInt(value),
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    const config = getPriceConfig();
    onFiltersChange({
      ...filters,
      min_price: min === config.min ? null : min,
      max_price: max === config.max ? null : max,
    });
  };

  const handleSizeRangeChange = (values: number[]) => {
    const [min, max] = values;
    const minSqm = areaUnit === 'sqm' ? min : convertSize(min, 'sqft', 'sqm');
    const maxSqm = areaUnit === 'sqm' ? max : convertSize(max, 'sqft', 'sqm');
    
    onFiltersChange({
      ...filters,
      min_area: minSqm === SIZE_CONFIG.sqm.min ? null : minSqm,
      max_area: maxSqm >= SIZE_CONFIG.sqm.max ? null : maxSqm,
    });
  };

  const handleUnitToggle = (checked: boolean) => {
    setAreaUnit(checked ? 'sqft' : 'sqm');
  };

  const handleBooleanFilter = (key: keyof ListingFilters, value: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value ? true : null,
    });
  };

  const handlePricePerSqmRangeChange = (values: number[]) => {
    const [min, max] = values;
    const config = getPricePerSqmConfig();
    onFiltersChange({
      ...filters,
      min_price_per_sqm: min === config.min ? null : min,
      max_price_per_sqm: max === config.max ? null : max,
    });
  };

  const getPricePerSqmConfig = () => {
    if (filters.listing_type === 'rent') return PRICE_PER_SQM_CONFIG.rent;
    if (filters.listing_type === 'sale') return PRICE_PER_SQM_CONFIG.sale;
    return PRICE_PER_SQM_CONFIG.default;
  };

  const getPricePerSqmRangeValues = (): [number, number] => {
    const config = getPricePerSqmConfig();
    return [
      filters.min_price_per_sqm ?? config.min,
      filters.max_price_per_sqm ?? config.max,
    ];
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = getActiveFilterCount(filters);
  const hasActiveFilters = activeFilterCount > 0;

  // Check which sections have active filters
  const hasFeaturesActive = !!(filters.is_furnished || filters.allows_pets);
  const hasBuildingActive = !!(filters.has_elevator);
  const hasOutdoorActive = !!(filters.has_balcony || filters.has_terrace || filters.has_garden);
  const hasParkingActive = !!(filters.has_parking || filters.has_garage);
  const hasAmenitiesActive = !!(filters.has_air_conditioning || filters.has_dishwasher || filters.has_washing_machine || filters.has_storage);
  const hasRentalActive = !!(filters.internet_included || filters.utilities_included);

  // Format price for display
  const formatPriceLabelLocal = (value: number): string => {
    if (value >= 1000000) {
      return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
    }
    return `${currencySymbol}${value}`;
  };

  // Get current price range values for slider
  const getPriceRangeValues = (): [number, number] => {
    const config = getPriceConfig();
    return [
      filters.min_price ?? config.min,
      filters.max_price ?? config.max,
    ];
  };

  const priceRangeValues = getPriceRangeValues();
  const sizeRangeValues = getDisplayedSizeRange();
  const pricePerSqmConfig = getPricePerSqmConfig();
  const pricePerSqmRangeValues = getPricePerSqmRangeValues();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          size="icon" 
          className="relative h-12 w-12 rounded-full shadow-lg bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              {activeFilterCount > 9 ? '9+' : activeFilterCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
        <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="pb-4 border-b border-border">
          <DrawerTitle className="font-display text-xl">{t('filters.filters')}</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-6 px-1 pb-4">
            {/* Listing Type */}
            <div className="space-y-4 pt-4 pb-2 border-b border-border/50">
              <Label className="text-base font-medium">{t('filters.listingType')}</Label>
              <div className="flex flex-wrap gap-3">
                {LISTING_TYPES.map((type) => {
                  const isSelected = filters.listing_type === type.value;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleListingTypeChange(isSelected ? 'all' : type.value)}
                      className={cn(
                        "flex items-center gap-2.5 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer min-h-[56px] press-effect",
                        isSelected 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-background text-foreground border-border hover:border-foreground/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-4 pb-2 border-b border-border/50">
              <Label className="text-base font-medium">{t('filters.propertyType')}</Label>
              <div className="flex flex-wrap gap-3">
                {PROPERTY_TYPES.map((type) => {
                  const isSelected = filters.property_types?.includes(type.value) || false;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handlePropertyTypeToggle(type.value)}
                      className={cn(
                        "flex items-center gap-2.5 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer min-h-[56px] press-effect",
                        isSelected 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-background text-foreground border-border hover:border-foreground/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-3 py-2 border-b border-border/50">
              <Label className="text-base font-medium">{t('filters.minimumRooms')}</Label>
              <Select
                value={filters.min_bedrooms?.toString() || 'all'}
                onValueChange={handleBedroomChange}
              >
                <SelectTrigger className="bg-background h-14 rounded-xl text-base">
                  <SelectValue placeholder={t('filters.any')} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">{t('filters.any')}</SelectItem>
                  <SelectItem value="1">1+ {t('filters.room')}</SelectItem>
                  <SelectItem value="2">2+ {t('filters.rooms')}</SelectItem>
                  <SelectItem value="3">3+ {t('filters.rooms')}</SelectItem>
                  <SelectItem value="4">4+ {t('filters.rooms')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-4 py-4 border-b border-border/50">
              <Label className="text-base font-medium">
                {filters.listing_type === 'rent' ? t('filters.monthlyCost') : filters.listing_type === 'sale' ? t('filters.totalPrice') : t('filters.price')}
              </Label>
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>{formatPriceLabelLocal(priceRangeValues[0])}</span>
                <span>{priceRangeValues[1] >= priceConfig.max ? `${formatPriceLabelLocal(priceConfig.max)}+` : formatPriceLabelLocal(priceRangeValues[1])}</span>
              </div>
              <div className="px-3 py-2">
                <Slider
                  value={priceRangeValues}
                  min={priceConfig.min}
                  max={priceConfig.max}
                  step={priceConfig.step}
                  thumbCount={2}
                  onValueChange={handlePriceRangeChange}
                  className="touch-none"
                />
              </div>
            </div>

            {/* Size Range Slider */}
            <div className="space-y-4 py-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t('filters.size')}</Label>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm transition-colors", areaUnit === 'sqm' ? 'text-foreground font-medium' : 'text-muted-foreground')}>m²</span>
                  <Switch
                    checked={areaUnit === 'sqft'}
                    onCheckedChange={handleUnitToggle}
                  />
                  <span className={cn("text-sm transition-colors", areaUnit === 'sqft' ? 'text-foreground font-medium' : 'text-muted-foreground')}>ft²</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>{sizeRangeValues[0]} {sizeConfig.label}</span>
                <span>{sizeRangeValues[1] >= sizeConfig.max ? `${sizeConfig.max}+ ${sizeConfig.label}` : `${sizeRangeValues[1]} ${sizeConfig.label}`}</span>
              </div>
              <div className="px-3 py-2">
                <Slider
                  value={sizeRangeValues}
                  min={sizeConfig.min}
                  max={sizeConfig.max}
                  step={sizeConfig.step}
                  thumbCount={2}
                  onValueChange={handleSizeRangeChange}
                  className="touch-none"
                />
              </div>
            </div>

            {/* Price per sqm/sqft Slider */}
            <div className="space-y-4 py-4 border-b border-border/50">
              <Label className="text-base font-medium">
                {t('filters.pricePerArea') || 'Price per'} {areaUnit === 'sqft' ? 'ft²' : 'm²'}
              </Label>
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>{formatPriceLabelLocal(pricePerSqmRangeValues[0])}</span>
                <span>{pricePerSqmRangeValues[1] >= pricePerSqmConfig.max ? `${formatPriceLabelLocal(pricePerSqmConfig.max)}+` : formatPriceLabelLocal(pricePerSqmRangeValues[1])}</span>
              </div>
              <div className="px-3 py-2">
                <Slider
                  value={pricePerSqmRangeValues}
                  min={pricePerSqmConfig.min}
                  max={pricePerSqmConfig.max}
                  step={pricePerSqmConfig.step}
                  thumbCount={2}
                  onValueChange={handlePricePerSqmRangeChange}
                  className="touch-none"
                />
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-0 pt-2">
              {/* Features Section */}
              <FilterSection title={t('filters.features')} hasActiveFilters={hasFeaturesActive}>
                <ToggleFilter 
                  label={t('filters.furnished')} 
                  checked={filters.is_furnished || false} 
                  onChange={(v) => handleBooleanFilter('is_furnished', v)} 
                />
                <ToggleFilter 
                  label={t('filters.petsAllowed')} 
                  checked={filters.allows_pets || false} 
                  onChange={(v) => handleBooleanFilter('allows_pets', v)} 
                />
              </FilterSection>

              {/* Building & Floor Section - conditional */}
              {(isApartmentTypeSelected || isHouseTypeSelected) && (
                <FilterSection title={t('filters.buildingFloor')} hasActiveFilters={hasBuildingActive}>
                  {isApartmentTypeSelected && (
                    <ToggleFilter 
                      label={t('filters.hasElevator')} 
                      checked={filters.has_elevator || false} 
                      onChange={(v) => handleBooleanFilter('has_elevator', v)} 
                    />
                  )}
                </FilterSection>
              )}

              {/* Outdoor Section */}
              <FilterSection title={t('filters.outdoor')} hasActiveFilters={hasOutdoorActive}>
                <ToggleFilter 
                  label={t('filters.hasBalcony')} 
                  checked={filters.has_balcony || false} 
                  onChange={(v) => handleBooleanFilter('has_balcony', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasTerrace')} 
                  checked={filters.has_terrace || false} 
                  onChange={(v) => handleBooleanFilter('has_terrace', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasGarden')} 
                  checked={filters.has_garden || false} 
                  onChange={(v) => handleBooleanFilter('has_garden', v)} 
                />
              </FilterSection>

              {/* Parking Section */}
              <FilterSection title={t('filters.parking')} hasActiveFilters={hasParkingActive}>
                <ToggleFilter 
                  label={t('filters.hasParking')} 
                  checked={filters.has_parking || false} 
                  onChange={(v) => handleBooleanFilter('has_parking', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasGarage')} 
                  checked={filters.has_garage || false} 
                  onChange={(v) => handleBooleanFilter('has_garage', v)} 
                />
              </FilterSection>

              {/* Amenities Section */}
              <FilterSection title={t('filters.amenities')} hasActiveFilters={hasAmenitiesActive}>
                <ToggleFilter 
                  label={t('filters.hasAirConditioning')} 
                  checked={filters.has_air_conditioning || false} 
                  onChange={(v) => handleBooleanFilter('has_air_conditioning', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasDishwasher')} 
                  checked={filters.has_dishwasher || false} 
                  onChange={(v) => handleBooleanFilter('has_dishwasher', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasWashingMachine')} 
                  checked={filters.has_washing_machine || false} 
                  onChange={(v) => handleBooleanFilter('has_washing_machine', v)} 
                />
                <ToggleFilter 
                  label={t('filters.hasStorage')} 
                  checked={filters.has_storage || false} 
                  onChange={(v) => handleBooleanFilter('has_storage', v)} 
                />
              </FilterSection>

              {/* Rental Terms Section - only for rentals */}
              {isRentalSelected && (
                <FilterSection title={t('filters.rentalTerms')} hasActiveFilters={hasRentalActive}>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">{t('filters.internetIncluded')}</Label>
                    <Select
                      value={filters.internet_included || 'any'}
                      onValueChange={(v) => onFiltersChange({ ...filters, internet_included: v === 'any' ? null : v })}
                    >
                      <SelectTrigger className="bg-background h-12 rounded-xl">
                        <SelectValue placeholder={t('filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="any">{t('filters.any')}</SelectItem>
                        <SelectItem value="yes">{t('filters.internetOptions.yes')}</SelectItem>
                        <SelectItem value="available">{t('filters.internetOptions.available')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">{t('filters.utilitiesIncluded')}</Label>
                    <Select
                      value={filters.utilities_included || 'any'}
                      onValueChange={(v) => onFiltersChange({ ...filters, utilities_included: v === 'any' ? null : v })}
                    >
                      <SelectTrigger className="bg-background h-12 rounded-xl">
                        <SelectValue placeholder={t('filters.any')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="any">{t('filters.any')}</SelectItem>
                        <SelectItem value="yes">{t('filters.utilitiesOptions.yes')}</SelectItem>
                        <SelectItem value="partial">{t('filters.utilitiesOptions.partial')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FilterSection>
              )}
            </div>
          </div>
        </ScrollArea>
        
        {/* Airbnb-style footer */}
        <div className="sticky bottom-0 left-0 right-0 px-6 py-4 bg-background border-t border-border flex items-center justify-between gap-4">
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {t('filters.clearAll') || 'Clear all'}
            </button>
          ) : (
            <div />
          )}
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 h-12 text-sm font-semibold min-w-[140px]"
          >
            {t('filters.applyFilters')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
