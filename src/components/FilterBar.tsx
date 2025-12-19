import { Search, SlidersHorizontal, X, ArrowUpDown, Building2, Home, DoorOpen, Square, Castle, Key, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ListingFilters, SortOption, AreaUnit } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount?: number;
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

const SQM_TO_SQFT = 10.764;

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
        <span className="flex items-center gap-2">
          {title}
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-accent" />
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2 pb-4">
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
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function FilterBar({ filters, onFiltersChange, sortBy, onSortChange, totalCount }: FilterBarProps) {
  const { t } = useTranslation();
  const { formatPriceLabel, currencySymbol } = useFormattedPrice();
  const [searchValue, setSearchValue] = useState(filters.city || '');
  const [isOpen, setIsOpen] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqm');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
  ) ?? true; // Show by default if no filter
  
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

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const newCity = searchValue.trim() || null;
      if (newCity !== filters.city) {
        onFiltersChange({ ...filters, city: newCity });
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFiltersChange({ ...filters, city: searchValue.trim() || null });
  };

  const clearSearch = () => {
    setSearchValue('');
    onFiltersChange({ ...filters, city: null });
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
    } else {
      onFiltersChange({
        ...filters,
        listing_type: newListingType,
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

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true));

  // Check which sections have active filters
  const hasFeaturesActive = !!(filters.is_furnished || filters.allows_pets);
  const hasBuildingActive = !!(filters.has_elevator || filters.min_floor != null || filters.min_property_floors != null);
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

  // Build active filter chips
  const getActiveFilterChips = () => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.listing_type) {
      chips.push({
        label: filters.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale'),
        onRemove: () => handleListingTypeChange('all'),
      });
    }

    if (filters.property_types && filters.property_types.length > 0) {
      filters.property_types.forEach((type) => {
        chips.push({
          label: t(`propertyTypes.${type}`),
          onRemove: () => handlePropertyTypeToggle(type),
        });
      });
    }

    if (filters.min_bedrooms) {
      chips.push({
        label: `${filters.min_bedrooms}+ ${filters.min_bedrooms === 1 ? t('filters.room') : t('filters.rooms')}`,
        onRemove: () => handleBedroomChange('all'),
      });
    }

    if (filters.min_price || filters.max_price) {
      let priceLabel = '';
      if (filters.min_price && filters.max_price) {
        priceLabel = `${formatPriceLabelLocal(filters.min_price)} - ${formatPriceLabelLocal(filters.max_price)}`;
      } else if (filters.min_price) {
        priceLabel = `Min ${formatPriceLabelLocal(filters.min_price)}`;
      } else if (filters.max_price) {
        priceLabel = `Max ${formatPriceLabelLocal(filters.max_price)}`;
      }
      chips.push({
        label: priceLabel,
        onRemove: () => onFiltersChange({ ...filters, min_price: null, max_price: null }),
      });
    }

    // Feature chips
    if (filters.is_furnished) chips.push({ label: t('filters.furnished'), onRemove: () => handleBooleanFilter('is_furnished', false) });
    if (filters.allows_pets) chips.push({ label: t('filters.petsAllowed'), onRemove: () => handleBooleanFilter('allows_pets', false) });
    if (filters.has_elevator) chips.push({ label: t('filters.hasElevator'), onRemove: () => handleBooleanFilter('has_elevator', false) });
    if (filters.has_balcony) chips.push({ label: t('filters.hasBalcony'), onRemove: () => handleBooleanFilter('has_balcony', false) });
    if (filters.has_terrace) chips.push({ label: t('filters.hasTerrace'), onRemove: () => handleBooleanFilter('has_terrace', false) });
    if (filters.has_garden) chips.push({ label: t('filters.hasGarden'), onRemove: () => handleBooleanFilter('has_garden', false) });
    if (filters.has_parking) chips.push({ label: t('filters.hasParking'), onRemove: () => handleBooleanFilter('has_parking', false) });
    if (filters.has_garage) chips.push({ label: t('filters.hasGarage'), onRemove: () => handleBooleanFilter('has_garage', false) });
    if (filters.has_air_conditioning) chips.push({ label: t('filters.hasAirConditioning'), onRemove: () => handleBooleanFilter('has_air_conditioning', false) });
    if (filters.has_dishwasher) chips.push({ label: t('filters.hasDishwasher'), onRemove: () => handleBooleanFilter('has_dishwasher', false) });
    if (filters.has_washing_machine) chips.push({ label: t('filters.hasWashingMachine'), onRemove: () => handleBooleanFilter('has_washing_machine', false) });
    if (filters.has_storage) chips.push({ label: t('filters.hasStorage'), onRemove: () => handleBooleanFilter('has_storage', false) });

    return chips;
  };

  const activeChips = getActiveFilterChips();
  const priceRangeValues = getPriceRangeValues();
  const sizeRangeValues = getDisplayedSizeRange();

  return (
    <div className="bg-background border-b border-border">
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
          {t('common.findHome')}
        </h1>

        {/* Search input + Filter button inline */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder={t('filters.searchCity')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-10 text-sm bg-secondary border-0 rounded-full focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Filter button - opens centered Dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0 rounded-full">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[85vh] p-0">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>{t('filters.filters')}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(85vh-80px)] px-4 pb-4">
                <div className="space-y-4">
                  {/* Listing Type */}
                  <div className="space-y-3 pt-2">
                    <Label>{t('filters.listingType')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {LISTING_TYPES.map((type) => {
                        const isSelected = filters.listing_type === type.value;
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleListingTypeChange(isSelected ? 'all' : type.value)}
                            className={`
                              flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                              border-2 cursor-pointer
                              ${isSelected 
                                ? 'bg-foreground text-background border-foreground' 
                                : 'bg-background text-foreground border-border hover:border-foreground/50'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-3">
                    <Label>{t('filters.propertyType')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((type) => {
                        const isSelected = filters.property_types?.includes(type.value) || false;
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handlePropertyTypeToggle(type.value)}
                            className={`
                              flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                              border-2 cursor-pointer
                              ${isSelected 
                                ? 'bg-foreground text-background border-foreground' 
                                : 'bg-background text-foreground border-border hover:border-foreground/50'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <Label>{t('filters.minimumRooms')}</Label>
                    <Select
                      value={filters.min_bedrooms?.toString() || 'all'}
                      onValueChange={handleBedroomChange}
                    >
                      <SelectTrigger className="bg-background">
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
                  <div className="space-y-3">
                    <Label>{filters.listing_type === 'rent' ? t('filters.monthlyCost') : filters.listing_type === 'sale' ? t('filters.totalPrice') : t('filters.price')}</Label>
                    <div className="pt-2 px-1">
                      <Slider
                        value={priceRangeValues}
                        min={priceConfig.min}
                        max={priceConfig.max}
                        step={priceConfig.step}
                        thumbCount={2}
                        onValueChange={handlePriceRangeChange}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatPriceLabelLocal(priceRangeValues[0])}</span>
                      <span>{priceRangeValues[1] >= priceConfig.max ? `${formatPriceLabelLocal(priceConfig.max)}+` : formatPriceLabelLocal(priceRangeValues[1])}</span>
                    </div>
                  </div>

                  {/* Size Range Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('filters.size')}</Label>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${areaUnit === 'sqm' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>m²</span>
                        <Switch
                          checked={areaUnit === 'sqft'}
                          onCheckedChange={handleUnitToggle}
                        />
                        <span className={`text-xs ${areaUnit === 'sqft' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>ft²</span>
                      </div>
                    </div>
                    <div className="pt-2 px-1">
                      <Slider
                        value={sizeRangeValues}
                        min={sizeConfig.min}
                        max={sizeConfig.max}
                        step={sizeConfig.step}
                        thumbCount={2}
                        onValueChange={handleSizeRangeChange}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{sizeRangeValues[0]} {sizeConfig.label}</span>
                      <span>{sizeRangeValues[1] >= sizeConfig.max ? `${sizeConfig.max}+ ${sizeConfig.label}` : `${sizeRangeValues[1]} ${sizeConfig.label}`}</span>
                    </div>
                  </div>

                  {/* Collapsible Sections */}
                  <div className="border-t border-border pt-4 space-y-1">
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
                            <SelectTrigger className="bg-background">
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
                            <SelectTrigger className="bg-background">
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

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        clearFilters();
                        setIsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('filters.clearAllFilters')}
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {activeChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="secondary"
                className="pl-2.5 pr-1.5 py-1 gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={chip.onRemove}
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        {/* Results count and sort */}
        {totalCount !== undefined && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalCount === 1 ? t('listing.listingCount', { count: totalCount }) : t('listing.listingsCount', { count: totalCount.toLocaleString() })}
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
                <SelectTrigger className="w-[130px] sm:w-[150px] h-7 sm:h-8 text-xs sm:text-sm bg-secondary border-0">
                  <SelectValue placeholder={t('filters.sortBy')} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="newest">{t('filters.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('filters.oldest')}</SelectItem>
                  <SelectItem value="price_asc">{t('filters.priceAsc')}</SelectItem>
                  <SelectItem value="price_desc">{t('filters.priceDesc')}</SelectItem>
                  <SelectItem value="size_asc">{t('filters.sizeAsc')}</SelectItem>
                  <SelectItem value="size_desc">{t('filters.sizeDesc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
