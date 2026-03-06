import {
  Search, SlidersHorizontal, X, ArrowUpDown, Building2, Home, DoorOpen, Square, Castle,
  Key, Banknote, ChevronDown, User, Users, LayoutGrid,
  // Outdoor icons
  Flower2, Waves, Eye, Mountain,
  // Parking icons
  Car, Zap, Bike, Package,
  // Building amenities icons
  ArrowUp, Dumbbell, Droplets, Shield,
  // Energy icons
  Flame, ThermometerSun, Sun, Smartphone,
  // Equipment icons
  Wind, UtensilsCrossed,
  // Accessibility icons
  Accessibility,
  // Safety icons
  Lock, Users2,
  // Availability icons
  Calendar
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ListingFilters, SortOption, AreaUnit, OwnerFilter } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TabOption {
  value: string;
  label: string;
  emoji?: string;
  count?: number;
}

interface FilterBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount?: number;
  userId?: string;
  listingType?: 'rent' | 'sale';
  onListingTypeChange?: (type: 'rent' | 'sale') => void;
  tabs?: TabOption[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

// Price ranges by listing type
const PRICE_CONFIG = {
  rent: { min: 0, max: 5000, step: 100 },
  sale: { min: 0, max: 2000000, step: 10000 },
  default: { min: 0, max: 2000000, step: 10000 },
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

// Collapsible filter section component
function FilterSection({ 
  title, 
  icon: Icon,
  children, 
  defaultOpen = false,
  hasActiveFilters = false,
  activeCount = 0
}: { 
  title: string; 
  icon?: React.ElementType;
  children: React.ReactNode; 
  defaultOpen?: boolean;
  hasActiveFilters?: boolean;
  activeCount?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && sectionRef.current) {
      // Small delay to allow the content to expand first
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 50);
    }
  };
  
  return (
    <div ref={sectionRef}>
      <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="border-b border-gray-100">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-sm font-medium transition-colors hover:text-gray-900 group">
          <span className="flex items-center gap-2.5">
            {Icon && <Icon className="h-[17px] w-[17px] text-gray-400 group-hover:text-gray-500 transition-colors" />}
            <span className="text-[13px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{title}</span>
            {activeCount > 0 && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white leading-none">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1.5 pt-1 pb-5 animate-accordion-down">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Toggle filter button component with icon
function ToggleFilter({ 
  label, 
  icon: Icon,
  checked, 
  onChange,
  onHaptic,
}: { 
  label: string; 
  icon?: React.ElementType;
  checked: boolean; 
  onChange: (checked: boolean) => void;
  onHaptic?: () => void;
}) {
  const handleChange = (value: boolean) => {
    onHaptic?.();
    onChange(value);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer",
        checked ? "bg-emerald-50/60 ring-1 ring-emerald-200/60" : "hover:bg-gray-50/60"
      )}
      onClick={() => handleChange(!checked)}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className={cn("h-[16px] w-[16px]", checked ? "text-gray-700" : "text-gray-400")} />}
        <Label className={cn("text-[13px] font-normal cursor-pointer text-gray-500", checked && "text-gray-900 font-medium")}>
          {label}
        </Label>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// Filter content shared between Dialog and Drawer
function FilterContent({
  filters,
  onFiltersChange,
  t,
  clearFilters,
  hasActiveFilters,
  setIsOpen,
  LISTING_TYPES,
  PROPERTY_TYPES,
  handleListingTypeChange,
  handlePropertyTypeToggle,
  handleBedroomChange,
  handlePriceRangeChange,
  handleSizeRangeChange,
  handlePricePerSqmRangeChange,
  handleUnitToggle,
  handleBooleanFilter,
  priceConfig,
  sizeConfig,
  pricePerSqmConfig,
  priceRangeValues,
  sizeRangeValues,
  pricePerSqmRangeValues,
  formatPriceLabelLocal,
  areaUnit,
  isApartmentTypeSelected,
  isRentalSelected,
  // Active filter counts
  activeOutdoorCount,
  activeParkingCount,
  activeBuildingAmenitiesCount,
  activeEnergyCount,
  activeEquipmentCount,
  activeAccessibilityCount,
  activeSafetyCount,
  activeAvailabilityCount,
  activeFeaturesCount,
}: any) {
  return (
    <div className="space-y-0 px-1 pb-4">
      {/* Listing Type */}
      <div className="space-y-3.5 pt-4 pb-5 border-b border-gray-100">
        <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">{t('filters.listingType')}</Label>
        <div className="flex flex-wrap gap-2.5">
          {LISTING_TYPES.map((type: any) => {
            const isSelected = filters.listing_type === type.value;
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleListingTypeChange(isSelected ? 'all' : type.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 border cursor-pointer",
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : `${type.bg} ${type.text} ${type.border} ${type.hoverBorder} ${type.hoverBg}`
                )}
              >
                <Icon className={cn("h-4 w-4", isSelected ? "text-white" : type.iconColor)} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-3.5 py-5 border-b border-gray-100">
        <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">{t('filters.propertyType')}</Label>
        <div className="flex flex-wrap gap-2.5">
          {PROPERTY_TYPES.map((type: any) => {
            const isSelected = filters.property_types?.includes(type.value) || false;
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handlePropertyTypeToggle(type.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 border cursor-pointer",
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : `${type.bg} ${type.text} ${type.border} ${type.hoverBorder} ${type.hoverBg}`
                )}
              >
                <Icon className={cn("h-4 w-4", isSelected ? "text-white" : type.iconColor)} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-3 py-5 border-b border-gray-100">
        <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">{t('filters.minimumRooms')}</Label>
        <Select
          value={filters.min_bedrooms?.toString() || 'all'}
          onValueChange={handleBedroomChange}
        >
          <SelectTrigger className="bg-white h-11 rounded-xl text-[13px] border-gray-200 hover:border-gray-300 focus:ring-gray-400">
            <SelectValue placeholder={t('filters.any')} />
          </SelectTrigger>
          <SelectContent className="bg-popover rounded-xl">
            <SelectItem value="all">{t('filters.any')}</SelectItem>
            <SelectItem value="1">1+ {t('filters.room')}</SelectItem>
            <SelectItem value="2">2+ {t('filters.rooms')}</SelectItem>
            <SelectItem value="3">3+ {t('filters.rooms')}</SelectItem>
            <SelectItem value="4">4+ {t('filters.rooms')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-4 py-5 border-b border-gray-100">
        <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">
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
      <div className="space-y-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">{t('filters.size')}</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-[12px] transition-colors", areaUnit === 'sqm' ? 'text-gray-900 font-medium' : 'text-gray-400')}>m²</span>
            <Switch
              checked={areaUnit === 'sqft'}
              onCheckedChange={handleUnitToggle}
            />
            <span className={cn("text-[12px] transition-colors", areaUnit === 'sqft' ? 'text-gray-900 font-medium' : 'text-gray-400')}>ft²</span>
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
      <div className="space-y-4 py-5 border-b border-gray-100">
        <Label className="text-[13px] font-semibold text-gray-900 tracking-tight">
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
      <div className="space-y-0 pt-1">
        {/* Features Section */}
        <FilterSection title={t('filters.features')} icon={Home} activeCount={activeFeaturesCount}>
          <ToggleFilter 
            label={t('filters.furnished')} 
            icon={Home}
            checked={filters.is_furnished || false} 
            onChange={(v) => handleBooleanFilter('is_furnished', v)} 
          />
          <ToggleFilter
            label={t('filters.petsAllowed')}
            checked={filters.allows_pets || false}
            onChange={(v) => handleBooleanFilter('allows_pets', v)}
          />
          <ToggleFilter
            label={t('listing.floorPlan')}
            icon={LayoutGrid}
            checked={filters.has_floor_plan || false}
            onChange={(v) => handleBooleanFilter('has_floor_plan', v)}
          />
        </FilterSection>

        {/* Outdoor & Views Section */}
        <FilterSection title="Outdoor & Views" icon={Flower2} activeCount={activeOutdoorCount}>
          <ToggleFilter 
            label={t('filters.hasBalcony')} 
            icon={Square}
            checked={filters.has_balcony || false} 
            onChange={(v) => handleBooleanFilter('has_balcony', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasTerrace')} 
            icon={Square}
            checked={filters.has_terrace || false} 
            onChange={(v) => handleBooleanFilter('has_terrace', v)} 
          />
          <ToggleFilter 
            label="Rooftop Terrace" 
            icon={Building2}
            checked={filters.has_rooftop_terrace || false} 
            onChange={(v) => handleBooleanFilter('has_rooftop_terrace', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasGarden')} 
            icon={Flower2}
            checked={filters.has_garden || false} 
            onChange={(v) => handleBooleanFilter('has_garden', v)} 
          />
          <ToggleFilter 
            label="Waterfront" 
            icon={Waves}
            checked={filters.has_waterfront || false} 
            onChange={(v) => handleBooleanFilter('has_waterfront', v)} 
          />
          <ToggleFilter 
            label="Has View" 
            icon={Eye}
            checked={filters.has_view || false} 
            onChange={(v) => handleBooleanFilter('has_view', v)} 
          />
          {filters.has_view && (
            <div className="pl-3 space-y-2">
              <Label className="text-[12px] font-medium text-gray-500">View Type</Label>
              <Select
                value={filters.view_type || 'any'}
                onValueChange={(v) => onFiltersChange({ ...filters, view_type: v === 'any' ? null : v })}
              >
                <SelectTrigger className="bg-white h-10 rounded-xl text-[13px] border-gray-200 hover:border-gray-300">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent className="bg-popover rounded-xl">
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="city">City View</SelectItem>
                  <SelectItem value="sea">Sea View</SelectItem>
                  <SelectItem value="mountain">Mountain View</SelectItem>
                  <SelectItem value="park">Park View</SelectItem>
                  <SelectItem value="garden">Garden View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </FilterSection>

        {/* Parking & Storage Section */}
        <FilterSection title="Parking & Storage" icon={Car} activeCount={activeParkingCount}>
          <ToggleFilter 
            label={t('filters.hasParking')} 
            icon={Car}
            checked={filters.has_parking || false} 
            onChange={(v) => handleBooleanFilter('has_parking', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasGarage')} 
            icon={Car}
            checked={filters.has_garage || false} 
            onChange={(v) => handleBooleanFilter('has_garage', v)} 
          />
          <ToggleFilter 
            label="EV Charging" 
            icon={Zap}
            checked={filters.has_ev_charging || false} 
            onChange={(v) => handleBooleanFilter('has_ev_charging', v)} 
          />
          <ToggleFilter 
            label="Bicycle Storage" 
            icon={Bike}
            checked={filters.has_bicycle_storage || false} 
            onChange={(v) => handleBooleanFilter('has_bicycle_storage', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasStorage')} 
            icon={Package}
            checked={filters.has_storage || false} 
            onChange={(v) => handleBooleanFilter('has_storage', v)} 
          />
          <ToggleFilter 
            label="Basement" 
            icon={ArrowUp}
            checked={filters.has_basement || false} 
            onChange={(v) => handleBooleanFilter('has_basement', v)} 
          />
        </FilterSection>

        {/* Building Amenities Section - for apartments */}
        {isApartmentTypeSelected && (
          <FilterSection title="Building Amenities" icon={Building2} activeCount={activeBuildingAmenitiesCount}>
            <ToggleFilter 
              label={t('filters.hasElevator')} 
              icon={ArrowUp}
              checked={filters.has_elevator || false} 
              onChange={(v) => handleBooleanFilter('has_elevator', v)} 
            />
            <ToggleFilter 
              label="Pool" 
              icon={Droplets}
              checked={filters.has_pool || false} 
              onChange={(v) => handleBooleanFilter('has_pool', v)} 
            />
            <ToggleFilter 
              label="Gym" 
              icon={Dumbbell}
              checked={filters.has_gym || false} 
              onChange={(v) => handleBooleanFilter('has_gym', v)} 
            />
            <ToggleFilter 
              label="Sauna" 
              icon={ThermometerSun}
              checked={filters.has_sauna || false} 
              onChange={(v) => handleBooleanFilter('has_sauna', v)} 
            />
            <ToggleFilter 
              label="Concierge" 
              icon={Users2}
              checked={filters.has_concierge || false} 
              onChange={(v) => handleBooleanFilter('has_concierge', v)} 
            />
            <ToggleFilter 
              label="Security" 
              icon={Shield}
              checked={filters.has_security || false} 
              onChange={(v) => handleBooleanFilter('has_security', v)} 
            />
            <ToggleFilter 
              label="Shared Laundry" 
              checked={filters.has_shared_laundry || false} 
              onChange={(v) => handleBooleanFilter('has_shared_laundry', v)} 
            />
          </FilterSection>
        )}

        {/* Energy & Comfort Section */}
        <FilterSection title="Energy & Comfort" icon={Flame} activeCount={activeEnergyCount}>
          <ToggleFilter 
            label="Fireplace" 
            icon={Flame}
            checked={filters.has_fireplace || false} 
            onChange={(v) => handleBooleanFilter('has_fireplace', v)} 
          />
          <ToggleFilter 
            label="Floor Heating" 
            icon={ThermometerSun}
            checked={filters.has_floor_heating || false} 
            onChange={(v) => handleBooleanFilter('has_floor_heating', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasAirConditioning')} 
            icon={Wind}
            checked={filters.has_air_conditioning || false} 
            onChange={(v) => handleBooleanFilter('has_air_conditioning', v)} 
          />
          <ToggleFilter 
            label="Solar Panels" 
            icon={Sun}
            checked={filters.has_solar_panels || false} 
            onChange={(v) => handleBooleanFilter('has_solar_panels', v)} 
          />
          <ToggleFilter 
            label="Smart Home" 
            icon={Smartphone}
            checked={filters.has_smart_home || false} 
            onChange={(v) => handleBooleanFilter('has_smart_home', v)} 
          />
        </FilterSection>

        {/* Equipment Section */}
        <FilterSection title="Equipment" icon={UtensilsCrossed} activeCount={activeEquipmentCount}>
          <ToggleFilter 
            label={t('filters.hasDishwasher')} 
            icon={UtensilsCrossed}
            checked={filters.has_dishwasher || false} 
            onChange={(v) => handleBooleanFilter('has_dishwasher', v)} 
          />
          <ToggleFilter 
            label={t('filters.hasWashingMachine')} 
            checked={filters.has_washing_machine || false} 
            onChange={(v) => handleBooleanFilter('has_washing_machine', v)} 
          />
          <ToggleFilter 
            label="Dryer" 
            checked={filters.has_dryer || false} 
            onChange={(v) => handleBooleanFilter('has_dryer', v)} 
          />
        </FilterSection>

        {/* Accessibility Section */}
        <FilterSection title="Accessibility" icon={Accessibility} activeCount={activeAccessibilityCount}>
          <ToggleFilter 
            label="Step-free Access" 
            icon={Accessibility}
            checked={filters.has_step_free_access || false} 
            onChange={(v) => handleBooleanFilter('has_step_free_access', v)} 
          />
          <ToggleFilter 
            label="Wheelchair Accessible" 
            icon={Accessibility}
            checked={filters.has_wheelchair_accessible || false} 
            onChange={(v) => handleBooleanFilter('has_wheelchair_accessible', v)} 
          />
        </FilterSection>

        {/* Safety & Privacy Section */}
        <FilterSection title="Safety & Privacy" icon={Lock} activeCount={activeSafetyCount}>
          <ToggleFilter 
            label="Secure Entrance" 
            icon={Lock}
            checked={filters.has_secure_entrance || false} 
            onChange={(v) => handleBooleanFilter('has_secure_entrance', v)} 
          />
          <ToggleFilter 
            label="Gated Community" 
            icon={Shield}
            checked={filters.has_gated_community || false} 
            onChange={(v) => handleBooleanFilter('has_gated_community', v)} 
          />
        </FilterSection>

        {/* Availability Section - only for rentals */}
        {isRentalSelected && (
          <FilterSection title="Availability & Terms" icon={Calendar} activeCount={activeAvailabilityCount}>
            <ToggleFilter
              label="Move-in Immediately"
              icon={Calendar}
              checked={filters.move_in_immediately || false}
              onChange={(v) => handleBooleanFilter('move_in_immediately', v)}
            />
            <ToggleFilter
              label="Rent Indefinitely"
              icon={Calendar}
              checked={filters.rent_indefinitely || false}
              onChange={(v) => handleBooleanFilter('rent_indefinitely', v)}
            />
            <div className="space-y-2 px-3 py-2">
              <Label className="text-[12px] font-medium text-gray-500">{t('filters.internetIncluded')}</Label>
              <Select
                value={filters.internet_included || 'any'}
                onValueChange={(v) => onFiltersChange({ ...filters, internet_included: v === 'any' ? null : v })}
              >
                <SelectTrigger className="bg-white h-10 rounded-xl text-[13px] border-gray-200 hover:border-gray-300">
                  <SelectValue placeholder={t('filters.any')} />
                </SelectTrigger>
                <SelectContent className="bg-popover rounded-xl">
                  <SelectItem value="any">{t('filters.any')}</SelectItem>
                  <SelectItem value="yes">{t('filters.internetOptions.yes')}</SelectItem>
                  <SelectItem value="available">{t('filters.internetOptions.available')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 px-3 py-2">
              <Label className="text-[12px] font-medium text-gray-500">{t('filters.utilitiesIncluded')}</Label>
              <Select
                value={filters.utilities_included || 'any'}
                onValueChange={(v) => onFiltersChange({ ...filters, utilities_included: v === 'any' ? null : v })}
              >
                <SelectTrigger className="bg-white h-10 rounded-xl text-[13px] border-gray-200 hover:border-gray-300">
                  <SelectValue placeholder={t('filters.any')} />
                </SelectTrigger>
                <SelectContent className="bg-popover rounded-xl">
                  <SelectItem value="any">{t('filters.any')}</SelectItem>
                  <SelectItem value="yes">{t('filters.utilitiesOptions.yes')}</SelectItem>
                  <SelectItem value="partial">{t('filters.utilitiesOptions.partial')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 px-3 py-2">
              <Label className="text-[12px] font-medium text-gray-500">Utility Costs (€/mo)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.min_utility_cost ?? ''}
                  onChange={(e) => onFiltersChange({ ...filters, min_utility_cost: e.target.value ? Number(e.target.value) : null })}
                  className="bg-white h-10 rounded-xl text-[13px] border-gray-200 hover:border-gray-300"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.max_utility_cost ?? ''}
                  onChange={(e) => onFiltersChange({ ...filters, max_utility_cost: e.target.value ? Number(e.target.value) : null })}
                  className="bg-white h-10 rounded-xl text-[13px] border-gray-200 hover:border-gray-300"
                />
              </div>
            </div>
          </FilterSection>
        )}
    </div>

    </div>
  );
}

export function FilterBar({ filters, onFiltersChange, sortBy, onSortChange, totalCount, userId, listingType, onListingTypeChange, tabs, activeTab, onTabChange }: FilterBarProps) {
  const { trigger: haptic } = useHapticFeedback();
  const { t } = useTranslation();
  const { formatPriceLabel, currencySymbol } = useFormattedPrice();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [isOpen, setIsOpen] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqm');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const OWNER_FILTERS: { value: OwnerFilter; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: t('filters.allListings'), icon: Users },
    { value: 'mine', label: t('filters.myListings'), icon: User },
    { value: 'others', label: t('filters.othersListings'), icon: Users },
  ];

  const LISTING_TYPES = [
    { value: 'rent', label: t('listingTypes.rent'), icon: Key, bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500', border: 'border-amber-200', hoverBorder: 'hover:border-amber-300', hoverBg: 'hover:bg-amber-50/80' },
    { value: 'sale', label: t('listingTypes.sale'), icon: Banknote, bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-300', hoverBg: 'hover:bg-emerald-50/80' },
  ] as const;

  const PROPERTY_TYPES = [
    { value: 'apartment', label: t('propertyTypes.apartment'), icon: Building2, bg: 'bg-sky-50', text: 'text-sky-700', iconColor: 'text-sky-500', border: 'border-sky-200', hoverBorder: 'hover:border-sky-300', hoverBg: 'hover:bg-sky-50/80' },
    { value: 'house', label: t('propertyTypes.house'), icon: Home, bg: 'bg-orange-50', text: 'text-orange-700', iconColor: 'text-orange-500', border: 'border-orange-200', hoverBorder: 'hover:border-orange-300', hoverBg: 'hover:bg-orange-50/80' },
    { value: 'room', label: t('propertyTypes.room'), icon: DoorOpen, bg: 'bg-violet-50', text: 'text-violet-700', iconColor: 'text-violet-500', border: 'border-violet-200', hoverBorder: 'hover:border-violet-300', hoverBg: 'hover:bg-violet-50/80' },
    { value: 'studio', label: t('propertyTypes.studio'), icon: Square, bg: 'bg-pink-50', text: 'text-pink-700', iconColor: 'text-pink-500', border: 'border-pink-200', hoverBorder: 'hover:border-pink-300', hoverBg: 'hover:bg-pink-50/80' },
    { value: 'villa', label: t('propertyTypes.villa'), icon: Castle, bg: 'bg-indigo-50', text: 'text-indigo-700', iconColor: 'text-indigo-500', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-300', hoverBg: 'hover:bg-indigo-50/80' },
  ] as const;

  // Check if apartment-type properties are selected
  const isApartmentTypeSelected = filters.property_types?.some(t => 
    ['apartment', 'room', 'studio'].includes(t)
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
      const newSearch = searchValue.trim() || null;
      if (newSearch !== filters.search) {
        onFiltersChange({ ...filters, search: newSearch });
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
    onFiltersChange({ ...filters, search: searchValue.trim() || null });
  };

  const clearSearch = () => {
    setSearchValue('');
    onFiltersChange({ ...filters, search: null });
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
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true));

  // Count active filters per section
  const activeFeaturesCount = [filters.is_furnished, filters.allows_pets, filters.has_floor_plan].filter(Boolean).length;
  const activeOutdoorCount = [filters.has_balcony, filters.has_terrace, filters.has_garden, filters.has_rooftop_terrace, filters.has_waterfront, filters.has_view].filter(Boolean).length;
  const activeParkingCount = [filters.has_parking, filters.has_garage, filters.has_ev_charging, filters.has_bicycle_storage, filters.has_storage, filters.has_basement].filter(Boolean).length;
  const activeBuildingAmenitiesCount = [filters.has_elevator, filters.has_pool, filters.has_gym, filters.has_sauna, filters.has_concierge, filters.has_security, filters.has_shared_laundry].filter(Boolean).length;
  const activeEnergyCount = [filters.has_fireplace, filters.has_floor_heating, filters.has_air_conditioning, filters.has_solar_panels, filters.has_smart_home].filter(Boolean).length;
  const activeEquipmentCount = [filters.has_dishwasher, filters.has_washing_machine, filters.has_dryer].filter(Boolean).length;
  const activeAccessibilityCount = [filters.has_step_free_access, filters.has_wheelchair_accessible].filter(Boolean).length;
  const activeSafetyCount = [filters.has_secure_entrance, filters.has_gated_community].filter(Boolean).length;
  const activeAvailabilityCount = [filters.move_in_immediately, filters.rent_indefinitely, filters.internet_included, filters.utilities_included, filters.min_utility_cost, filters.max_utility_cost].filter(v => v != null && v !== false).length;

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

    if (filters.min_area || filters.max_area) {
      let sizeLabel = '';
      const unit = areaUnit === 'sqft' ? 'ft²' : 'm²';
      if (filters.min_area && filters.max_area) {
        sizeLabel = `${filters.min_area} - ${filters.max_area} ${unit}`;
      } else if (filters.min_area) {
        sizeLabel = `Min ${filters.min_area} ${unit}`;
      } else if (filters.max_area) {
        sizeLabel = `Max ${filters.max_area} ${unit}`;
      }
      chips.push({
        label: sizeLabel,
        onRemove: () => onFiltersChange({ ...filters, min_area: null, max_area: null }),
      });
    }

    // Feature chips
    if (filters.is_furnished) chips.push({ label: t('filters.furnished'), onRemove: () => handleBooleanFilter('is_furnished', false) });
    if (filters.allows_pets) chips.push({ label: t('filters.petsAllowed'), onRemove: () => handleBooleanFilter('allows_pets', false) });
    if (filters.has_floor_plan) chips.push({ label: t('listing.floorPlan'), onRemove: () => handleBooleanFilter('has_floor_plan', false) });
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
    // New filter chips
    if (filters.has_ev_charging) chips.push({ label: 'EV Charging', onRemove: () => handleBooleanFilter('has_ev_charging', false) });
    if (filters.has_pool) chips.push({ label: 'Pool', onRemove: () => handleBooleanFilter('has_pool', false) });
    if (filters.has_gym) chips.push({ label: 'Gym', onRemove: () => handleBooleanFilter('has_gym', false) });
    if (filters.has_sauna) chips.push({ label: 'Sauna', onRemove: () => handleBooleanFilter('has_sauna', false) });
    if (filters.has_waterfront) chips.push({ label: 'Waterfront', onRemove: () => handleBooleanFilter('has_waterfront', false) });
    if (filters.has_view) chips.push({ label: 'Has View', onRemove: () => handleBooleanFilter('has_view', false) });
    if (filters.has_floor_heating) chips.push({ label: 'Floor Heating', onRemove: () => handleBooleanFilter('has_floor_heating', false) });
    if (filters.has_smart_home) chips.push({ label: 'Smart Home', onRemove: () => handleBooleanFilter('has_smart_home', false) });
    if (filters.has_step_free_access) chips.push({ label: 'Step-free Access', onRemove: () => handleBooleanFilter('has_step_free_access', false) });
    if (filters.has_secure_entrance) chips.push({ label: 'Secure Entrance', onRemove: () => handleBooleanFilter('has_secure_entrance', false) });
    if (filters.move_in_immediately) chips.push({ label: 'Move-in Immediately', onRemove: () => handleBooleanFilter('move_in_immediately', false) });
    if (filters.rent_indefinitely) chips.push({ label: 'Rent Indefinitely', onRemove: () => handleBooleanFilter('rent_indefinitely', false) });
    if (filters.internet_included) chips.push({ label: `Internet: ${filters.internet_included}`, onRemove: () => onFiltersChange({ ...filters, internet_included: null }) });
    if (filters.utilities_included) chips.push({ label: `Utilities: ${filters.utilities_included}`, onRemove: () => onFiltersChange({ ...filters, utilities_included: null }) });
    if (filters.min_utility_cost || filters.max_utility_cost) {
      let costLabel = 'Utility Cost: ';
      if (filters.min_utility_cost && filters.max_utility_cost) {
        costLabel += `€${filters.min_utility_cost} - €${filters.max_utility_cost}`;
      } else if (filters.min_utility_cost) {
        costLabel += `Min €${filters.min_utility_cost}`;
      } else if (filters.max_utility_cost) {
        costLabel += `Max €${filters.max_utility_cost}`;
      }
      chips.push({ label: costLabel, onRemove: () => onFiltersChange({ ...filters, min_utility_cost: null, max_utility_cost: null }) });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();
  const priceRangeValues = getPriceRangeValues();
  const sizeRangeValues = getDisplayedSizeRange();
  const pricePerSqmConfig = getPricePerSqmConfig();
  const pricePerSqmRangeValues = getPricePerSqmRangeValues();

  const filterContentProps = {
    filters,
    onFiltersChange,
    t,
    clearFilters,
    hasActiveFilters,
    setIsOpen,
    LISTING_TYPES,
    PROPERTY_TYPES,
    handleListingTypeChange,
    handlePropertyTypeToggle,
    handleBedroomChange,
    handlePriceRangeChange,
    handleSizeRangeChange,
    handlePricePerSqmRangeChange,
    handleUnitToggle,
    handleBooleanFilter,
    priceConfig,
    sizeConfig,
    pricePerSqmConfig,
    priceRangeValues,
    sizeRangeValues,
    pricePerSqmRangeValues,
    formatPriceLabelLocal,
    areaUnit,
    isApartmentTypeSelected,
    isRentalSelected,
    activeOutdoorCount,
    activeParkingCount,
    activeBuildingAmenitiesCount,
    activeEnergyCount,
    activeEquipmentCount,
    activeAccessibilityCount,
    activeSafetyCount,
    activeAvailabilityCount,
    activeFeaturesCount,
  };

  const coreActiveFiltersCount =
    (filters.listing_type ? 1 : 0) +
    (filters.property_types?.length ?? 0) +
    (filters.min_bedrooms ? 1 : 0) +
    (filters.min_price != null || filters.max_price != null ? 1 : 0) +
    (filters.min_area != null || filters.max_area != null ? 1 : 0);

  const totalActiveFilters =
    coreActiveFiltersCount +
    activeOutdoorCount +
    activeParkingCount +
    activeBuildingAmenitiesCount +
    activeEnergyCount +
    activeEquipmentCount +
    activeAccessibilityCount +
    activeSafetyCount +
    activeAvailabilityCount +
    activeFeaturesCount;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 py-2.5 space-y-2">
        {/* Single row: Type Toggle + Search + Sort + Filters + Count */}
        <div className="flex items-center gap-1.5">
          {/* Rent / Sale segmented toggle — colorful Airbnb-style */}
          {listingType && onListingTypeChange && (
            <div className="inline-flex items-center shrink-0 rounded-xl bg-gray-100/80 p-0.5">
              <button
                type="button"
                onClick={() => onListingTypeChange('rent')}
                className={cn(
                  'flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition-all duration-200',
                  listingType === 'rent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <span className="text-sm leading-none" role="img" aria-label="rent">🔑</span>
                <span className="hidden sm:inline">{t('listingTypes.rent')}</span>
              </button>
              <button
                type="button"
                onClick={() => onListingTypeChange('sale')}
                className={cn(
                  'flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition-all duration-200',
                  listingType === 'sale'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <span className="text-sm leading-none" role="img" aria-label="sale">🏷️</span>
                <span className="hidden sm:inline">{t('listingTypes.sale')}</span>
              </button>
            </div>
          )}

          {/* Generic pill tabs (e.g. Sold / Rented) */}
          {tabs && activeTab && onTabChange && (
            <div className="inline-flex items-center shrink-0 rounded-xl bg-gray-100/80 p-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onTabChange(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition-all duration-200',
                    activeTab === tab.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {tab.emoji && <span className="text-sm leading-none">{tab.emoji}</span>}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={cn(
                      "text-[10px] tabular-nums",
                      activeTab === tab.value ? "text-gray-500" : "text-gray-400"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Compact search */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-8 pr-8 h-9 text-xs bg-secondary border-0 rounded-xl"
            />
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full transition-opacity ${
                searchValue ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </form>
          
          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="shrink-0 w-9 md:w-auto md:max-w-[120px] h-9 px-2.5 text-sm bg-secondary border-0 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-0 transition-colors">
              <ArrowUpDown className="h-3.5 w-3.5 md:mr-1.5 text-muted-foreground shrink-0" />
              <span className="hidden md:inline truncate">
                <SelectValue placeholder={t('filters.sortBy')} />
              </span>
            </SelectTrigger>
            <SelectContent className="bg-popover rounded-xl shadow-lg">
              <SelectItem value="newest">🆕 {t('filters.newest')}</SelectItem>
              <SelectItem value="oldest">📅 {t('filters.oldest')}</SelectItem>
              <SelectItem value="price_asc">💰 {t('filters.priceAsc')}</SelectItem>
              <SelectItem value="price_desc">💎 {t('filters.priceDesc')}</SelectItem>
              <SelectItem value="size_asc">📏 {t('filters.sizeAsc')}</SelectItem>
              <SelectItem value="size_desc">📐 {t('filters.sizeDesc')}</SelectItem>
              <SelectItem value="price_per_sqm_asc">📊 {t('filters.pricePerSqmAsc')}</SelectItem>
              <SelectItem value="price_per_sqm_desc">📈 {t('filters.pricePerSqmDesc')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters button */}
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <div className="relative shrink-0">
                <DrawerTrigger asChild>
                <button className={`flex items-center justify-center rounded-xl h-9 w-9 text-sm font-medium transition-colors ${totalActiveFilters > 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    <span className="text-sm leading-none">⚙️</span>
                  </button>
                </DrawerTrigger>
                {totalActiveFilters > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold rounded-full bg-accent text-accent-foreground border-2 border-background pointer-events-none">
                    {totalActiveFilters}
                  </span>
                )}
              </div>
              <DrawerContent className="max-h-[85vh] flex flex-col overflow-hidden">
                <DrawerHeader className="pb-4 border-b border-gray-100 shrink-0">
                  <DrawerTitle className="text-[17px] font-semibold tracking-tight">{t('filters.filters')}</DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 min-h-0 overflow-y-auto px-4">
                  <FilterContent {...filterContentProps} />
                </div>
                {/* Footer */}
                <div className="sticky bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="text-[13px] font-medium text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-500 transition-colors"
                    >
                      {t('filters.clearAll') || 'Clear all'}
                    </button>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="accent"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-6 h-11 text-[13px] font-semibold min-w-[140px]"
                  >
                    {totalCount !== undefined
                      ? `${t('filters.show')} ${totalCount.toLocaleString()} ${totalCount === 1 ? t('filters.listing') : t('filters.listings')}`
                      : t('filters.applyFilters')
                    }
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className="relative shrink-0">
                <DialogTrigger asChild>
                  <button className={`flex items-center gap-1.5 rounded-xl h-9 px-2.5 text-xs font-medium transition-colors ${totalActiveFilters > 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    <span className="text-sm leading-none">⚙️</span>
                    <span>Filters</span>
                  </button>
                </DialogTrigger>
                {totalActiveFilters > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold rounded-full bg-accent text-accent-foreground border-2 border-background pointer-events-none">
                    {totalActiveFilters}
                  </span>
                )}
              </div>
              <DialogContent className="sm:max-w-[480px] max-h-[85vh] p-0 rounded-2xl flex flex-col overflow-hidden">
                <DialogHeader className="px-6 py-5 border-b border-gray-100 shrink-0">
                  <DialogTitle className="text-[17px] font-semibold tracking-tight">{t('filters.filters')}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-y-auto px-6">
                  <FilterContent {...filterContentProps} />
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="text-[13px] font-medium text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-500 transition-colors"
                    >
                      {t('filters.clearAll') || 'Clear all'}
                    </button>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="accent"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-6 h-11 text-[13px] font-semibold min-w-[160px]"
                  >
                    {totalCount !== undefined
                      ? `${t('filters.show')} ${totalCount.toLocaleString()} ${totalCount === 1 ? t('filters.listing') : t('filters.listings')}`
                      : t('filters.applyFilters')
                    }
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Listings count */}
          {totalCount !== undefined && (
            <div className="shrink-0 px-1 text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
              {totalCount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {activeChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="secondary"
                className="pl-3 pr-1.5 py-1 gap-1 cursor-pointer hover:bg-gray-200/80 hover:text-gray-800 transition-all duration-150 rounded-full text-[11px] font-semibold tracking-wide active:scale-[0.95]"
                onClick={chip.onRemove}
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
