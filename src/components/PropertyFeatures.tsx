import { useState } from 'react';
import { 
  Building2, 
  Car, 
  TreePine, 
  Thermometer, 
  Home, 
  Wifi, 
  Zap, 
  Clock, 
  Banknote,
  Sun,
  Trees,
  Flower2,
  Flame,
  Waves,
  Eye,
  Warehouse,
  SquareParking,
  Bike,
  Package,
  ArrowDown,
  Shirt,
  Dumbbell,
  Droplets,
  Sofa,
  Bell,
  Shield,
  RefreshCw,
  Fan,
  ArrowUp,
  Square,
  Compass,
  Smartphone,
  DoorClosed,
  Accessibility,
  Lock,
  Phone,
  VolumeX,
  Wind,
  ThermometerSun,
  Factory,
  PlayCircle,
  ChevronDown,
  LucideIcon
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PropertyFeaturesProps {
  listing: Listing;
}

// Feature definition with icon, label, and optional detail
interface Feature {
  id: string;
  icon: LucideIcon;
  label: string;
  detail?: string | null;
  category: 'outdoor' | 'parking' | 'building' | 'energy' | 'equipment' | 'interior' | 'accessibility' | 'safety' | 'basic' | 'info';
}

// Category theme configurations
const categoryThemes = {
  outdoor: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  parking: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  building: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  energy: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  equipment: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  interior: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  accessibility: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  safety: {
    iconBg: 'bg-slate-200 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  basic: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  info: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
};

// Compact Feature Card component
function FeatureCard({ 
  icon: Icon, 
  label, 
  detail,
  category,
}: { 
  icon: LucideIcon; 
  label: string; 
  detail?: string | null;
  category: keyof typeof categoryThemes;
}) {
  const theme = categoryThemes[category];
  const hasDetail = detail && detail.length > 0;
  
  const CardContent = (
    <div className={cn(
      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200",
      "bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50",
      "cursor-default group"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
        theme.iconBg
      )}>
        <Icon className={cn("h-5 w-5", theme.iconColor)} />
      </div>
      <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2">
        {label}
      </span>
    </div>
  );

  if (hasDetail) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {CardContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground ml-1">• {detail}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return CardContent;
}

// Info Card for non-boolean values (larger, more prominent)
function InfoCard({ 
  icon: Icon, 
  label, 
  value,
  category = 'info',
}: { 
  icon: LucideIcon; 
  label: string; 
  value: string | number;
  category?: keyof typeof categoryThemes;
}) {
  const theme = categoryThemes[category];
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        theme.iconBg
      )}>
        <Icon className={cn("h-5 w-5", theme.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="font-semibold text-foreground text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

export function PropertyFeatures({ listing }: PropertyFeaturesProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();
  const [showAll, setShowAll] = useState(false);

  const isApartmentType = ['apartment', 'room', 'studio'].includes(listing.property_type);
  const isHouseType = ['house', 'villa'].includes(listing.property_type);
  const isRental = listing.listing_type === 'rent';

  // Label mappings
  const parkingTypeLabels: Record<string, string> = {
    street: t('filters.parkingStreet'),
    designated: t('filters.parkingDesignated'),
    underground: t('filters.parkingUnderground'),
    private: t('filters.parkingPrivate'),
  };

  const heatingTypeLabels: Record<string, string> = {
    central: t('filters.heatingCentral'),
    electric: t('filters.heatingElectric'),
    gas: t('filters.heatingGas'),
    heat_pump: t('filters.heatingHeatPump'),
    other: t('filters.heatingOther'),
  };

  const conditionLabels: Record<string, string> = {
    new: t('filters.conditionNew'),
    renovated: t('filters.conditionRenovated'),
    good: t('filters.conditionGood'),
    needs_work: t('filters.conditionNeedsWork'),
  };

  const internetLabels: Record<string, string> = {
    yes: t('filters.included'),
    no: t('filters.notIncluded'),
    available: t('filters.available'),
  };

  const utilitiesLabels: Record<string, string> = {
    yes: t('filters.included'),
    no: t('filters.notIncluded'),
    partial: t('filters.partial'),
  };

  const viewTypeLabels: Record<string, string> = {
    mountain: 'Mountain',
    city: 'City',
    sea: 'Sea',
    park: 'Park',
    garden: 'Garden',
    lake: 'Lake',
  };

  const orientationLabels: Record<string, string> = {
    south: 'South',
    north: 'North',
    east: 'East',
    west: 'West',
    'south-east': 'SE',
    'south-west': 'SW',
    'north-east': 'NE',
    'north-west': 'NW',
  };

  // Build feature list dynamically
  const allFeatures: Feature[] = [];

  // Basic features
  if (listing.is_furnished) {
    allFeatures.push({ id: 'furnished', icon: Sofa, label: t('listing.furnished'), category: 'basic' });
  }
  if (listing.allows_pets) {
    allFeatures.push({ id: 'pets', icon: TreePine, label: t('listing.petsAllowed'), category: 'basic' });
  }

  // Outdoor features
  if (listing.has_balcony) {
    allFeatures.push({ 
      id: 'balcony', 
      icon: Sun, 
      label: t('listing.balcony'), 
      detail: listing.balcony_sqm ? `${listing.balcony_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_terrace) {
    allFeatures.push({ 
      id: 'terrace', 
      icon: Trees, 
      label: t('listing.terrace'), 
      detail: listing.terrace_sqm ? `${listing.terrace_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_rooftop_terrace) {
    allFeatures.push({ id: 'rooftop', icon: Building2, label: 'Rooftop', category: 'outdoor' });
  }
  if (listing.has_garden) {
    allFeatures.push({ 
      id: 'garden', 
      icon: Flower2, 
      label: t('listing.garden'), 
      detail: listing.garden_sqm ? `${listing.garden_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_bbq_area) {
    allFeatures.push({ id: 'bbq', icon: Flame, label: 'BBQ', category: 'outdoor' });
  }
  if (listing.has_playground) {
    allFeatures.push({ id: 'playground', icon: PlayCircle, label: 'Playground', category: 'outdoor' });
  }
  if (listing.has_waterfront) {
    allFeatures.push({ id: 'waterfront', icon: Waves, label: 'Waterfront', category: 'outdoor' });
  }
  if (listing.has_view) {
    allFeatures.push({ 
      id: 'view', 
      icon: Eye, 
      label: 'View', 
      detail: listing.view_type ? viewTypeLabels[listing.view_type] : null,
      category: 'outdoor' 
    });
  }

  // Parking & Storage
  if (listing.has_parking) {
    const parkingDetail = [
      listing.parking_type ? parkingTypeLabels[listing.parking_type] : null,
      listing.parking_spaces && listing.parking_spaces > 1 ? `${listing.parking_spaces}×` : null
    ].filter(Boolean).join(' ');
    allFeatures.push({ 
      id: 'parking', 
      icon: Car, 
      label: t('listing.parking'), 
      detail: parkingDetail || null,
      category: 'parking' 
    });
  }
  if (listing.has_garage) {
    allFeatures.push({ id: 'garage', icon: Warehouse, label: t('listing.garage'), category: 'parking' });
  }
  if (listing.has_carport) {
    allFeatures.push({ id: 'carport', icon: SquareParking, label: 'Carport', category: 'parking' });
  }
  if (listing.has_ev_charging) {
    allFeatures.push({ id: 'ev', icon: Zap, label: 'EV Charging', category: 'parking' });
  }
  if (listing.has_bicycle_storage) {
    allFeatures.push({ id: 'bike', icon: Bike, label: 'Bike Storage', category: 'parking' });
  }
  if (listing.has_storage) {
    allFeatures.push({ id: 'storage', icon: Package, label: t('listing.storage'), category: 'parking' });
  }
  if (listing.has_basement) {
    allFeatures.push({ id: 'basement', icon: ArrowDown, label: 'Basement', category: 'parking' });
  }

  // Building amenities (apartments)
  if (isApartmentType) {
    if (listing.has_elevator) {
      allFeatures.push({ id: 'elevator', icon: ArrowUp, label: t('listing.elevator'), category: 'building' });
    }
    if (listing.has_shared_laundry) {
      allFeatures.push({ id: 'laundry', icon: Shirt, label: 'Laundry', category: 'building' });
    }
    if (listing.has_gym) {
      allFeatures.push({ id: 'gym', icon: Dumbbell, label: 'Gym', category: 'building' });
    }
    if (listing.has_sauna) {
      allFeatures.push({ id: 'sauna', icon: ThermometerSun, label: 'Sauna', category: 'building' });
    }
    if (listing.has_pool) {
      allFeatures.push({ id: 'pool', icon: Droplets, label: 'Pool', category: 'building' });
    }
    if (listing.has_common_room) {
      allFeatures.push({ id: 'common', icon: Sofa, label: 'Common Room', category: 'building' });
    }
    if (listing.has_concierge) {
      allFeatures.push({ id: 'concierge', icon: Bell, label: 'Concierge', category: 'building' });
    }
    if (listing.has_security) {
      allFeatures.push({ id: 'security', icon: Shield, label: 'Security', category: 'building' });
    }
  }

  // Energy & Climate
  if (listing.has_fireplace) {
    allFeatures.push({ id: 'fireplace', icon: Flame, label: 'Fireplace', category: 'energy' });
  }
  if (listing.has_floor_heating) {
    allFeatures.push({ id: 'floorHeat', icon: ThermometerSun, label: 'Floor Heat', category: 'energy' });
  }
  if (listing.has_district_heating) {
    allFeatures.push({ id: 'district', icon: Factory, label: 'District Heat', category: 'energy' });
  }
  if (listing.has_heat_pump) {
    allFeatures.push({ id: 'heatPump', icon: RefreshCw, label: 'Heat Pump', category: 'energy' });
  }
  if (listing.has_air_conditioning) {
    allFeatures.push({ id: 'ac', icon: Wind, label: 'A/C', category: 'energy' });
  }
  if (listing.has_ventilation) {
    allFeatures.push({ id: 'vent', icon: Fan, label: 'Ventilation', category: 'energy' });
  }
  if (listing.has_solar_panels) {
    allFeatures.push({ id: 'solar', icon: Sun, label: 'Solar', category: 'energy' });
  }

  // Equipment
  if (listing.has_dishwasher) {
    allFeatures.push({ id: 'dishwasher', icon: Droplets, label: t('listing.dishwasher'), category: 'equipment' });
  }
  if (listing.has_washing_machine) {
    allFeatures.push({ id: 'washer', icon: Shirt, label: t('listing.washingMachine'), category: 'equipment' });
  }
  if (listing.has_dryer) {
    allFeatures.push({ id: 'dryer', icon: Wind, label: 'Dryer', category: 'equipment' });
  }

  // Interior
  if (listing.has_high_ceilings) {
    allFeatures.push({ id: 'ceilings', icon: ArrowUp, label: 'High Ceilings', category: 'interior' });
  }
  if (listing.has_large_windows) {
    allFeatures.push({ id: 'windows', icon: Square, label: 'Large Windows', category: 'interior' });
  }
  if (listing.orientation) {
    allFeatures.push({ 
      id: 'orientation', 
      icon: Compass, 
      label: orientationLabels[listing.orientation] || listing.orientation,
      category: 'interior' 
    });
  }
  if (listing.has_smart_home) {
    allFeatures.push({ id: 'smart', icon: Smartphone, label: 'Smart Home', category: 'interior' });
  }
  if (listing.has_built_in_wardrobes) {
    allFeatures.push({ id: 'wardrobes', icon: DoorClosed, label: 'Wardrobes', category: 'interior' });
  }

  // Accessibility
  if (listing.has_step_free_access) {
    allFeatures.push({ id: 'stepFree', icon: ArrowUp, label: 'Step-free', category: 'accessibility' });
  }
  if (listing.has_wheelchair_accessible) {
    allFeatures.push({ id: 'wheelchair', icon: Accessibility, label: 'Wheelchair', category: 'accessibility' });
  }
  if (listing.has_wide_doorways) {
    allFeatures.push({ id: 'wideDoors', icon: Square, label: 'Wide Doors', category: 'accessibility' });
  }
  if (listing.has_ground_floor_access) {
    allFeatures.push({ id: 'groundFloor', icon: Home, label: 'Ground Floor', category: 'accessibility' });
  }
  if (listing.has_elevator_from_garage) {
    allFeatures.push({ id: 'garageElev', icon: ArrowUp, label: 'Garage Elevator', category: 'accessibility' });
  }

  // Safety
  if (listing.has_secure_entrance) {
    allFeatures.push({ id: 'secureEntry', icon: Lock, label: 'Secure Entry', category: 'safety' });
  }
  if (listing.has_intercom) {
    allFeatures.push({ id: 'intercom', icon: Phone, label: 'Intercom', category: 'safety' });
  }
  if (listing.has_gated_community) {
    allFeatures.push({ id: 'gated', icon: Shield, label: 'Gated', category: 'safety' });
  }
  if (listing.has_fire_safety) {
    allFeatures.push({ id: 'fire', icon: Flame, label: 'Fire Safety', category: 'safety' });
  }
  if (listing.has_soundproofing) {
    allFeatures.push({ id: 'sound', icon: VolumeX, label: 'Soundproof', category: 'safety' });
  }

  // How many to show initially
  const INITIAL_DISPLAY_COUNT = 12;
  const displayedFeatures = showAll ? allFeatures : allFeatures.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = allFeatures.length - INITIAL_DISPLAY_COUNT;

  // Building info cards (always shown separately)
  const buildingInfoCards: { icon: LucideIcon; label: string; value: string | number }[] = [];

  if (isApartmentType && listing.floor_number != null) {
    const floorValue = listing.total_floors_building 
      ? `${listing.floor_number} / ${listing.total_floors_building}` 
      : listing.floor_number.toString();
    buildingInfoCards.push({ icon: Building2, label: t('filters.floorNumber'), value: floorValue });
  }

  if (isHouseType && listing.property_floors != null) {
    buildingInfoCards.push({ icon: Home, label: t('filters.propertyFloors'), value: listing.property_floors });
  }

  if (listing.heating_type) {
    buildingInfoCards.push({ 
      icon: Thermometer, 
      label: t('filters.heatingType'), 
      value: heatingTypeLabels[listing.heating_type] || listing.heating_type 
    });
  }

  if (listing.energy_rating) {
    buildingInfoCards.push({ icon: Zap, label: t('filters.energyRating'), value: listing.energy_rating });
  }

  if (listing.year_built) {
    buildingInfoCards.push({ icon: Building2, label: t('filters.yearBuilt'), value: listing.year_built });
  }

  if (listing.property_condition) {
    buildingInfoCards.push({ 
      icon: Home, 
      label: t('filters.condition'), 
      value: conditionLabels[listing.property_condition] || listing.property_condition 
    });
  }

  // Rental terms cards
  const rentalTermCards: { icon: LucideIcon; label: string; value: string | number }[] = [];
  
  if (isRental) {
    if (listing.deposit_amount) {
      rentalTermCards.push({ 
        icon: Banknote, 
        label: t('filters.depositAmount'), 
        value: formatPrice(listing.deposit_amount, listing.currency) 
      });
    }
    if (listing.min_lease_months) {
      rentalTermCards.push({ 
        icon: Clock, 
        label: t('filters.minLease'), 
        value: `${listing.min_lease_months} ${t('filters.months')}` 
      });
    }
    if (listing.internet_included) {
      rentalTermCards.push({ 
        icon: Wifi, 
        label: t('filters.internetIncluded'), 
        value: internetLabels[listing.internet_included] || listing.internet_included 
      });
    }
    if (listing.utilities_included) {
      rentalTermCards.push({ 
        icon: Zap, 
        label: t('filters.utilitiesIncluded'), 
        value: utilitiesLabels[listing.utilities_included] || listing.utilities_included 
      });
    }
  }

  const hasAnyContent = allFeatures.length > 0 || buildingInfoCards.length > 0 || rentalTermCards.length > 0;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* Section Header */}
        <h2 className="text-xl font-semibold text-foreground pb-4 border-b border-border/50">
          {t('listing.features')}
        </h2>

        {/* Building Info Cards (prominent display) */}
        {buildingInfoCards.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {buildingInfoCards.map((card) => (
              <InfoCard 
                key={card.label} 
                icon={card.icon} 
                label={card.label} 
                value={card.value}
                category="info"
              />
            ))}
          </div>
        )}

        {/* Feature Grid */}
        {allFeatures.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {displayedFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  icon={feature.icon}
                  label={feature.label}
                  detail={feature.detail}
                  category={feature.category}
                />
              ))}
            </div>

            {/* Show All Button */}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showAll && "rotate-180"
                )} />
                {showAll ? 'Show less' : `Show all ${allFeatures.length} features`}
              </button>
            )}
          </div>
        )}

        {/* Rental Terms Cards */}
        {rentalTermCards.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              {t('filters.rentalTerms')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {rentalTermCards.map((card) => (
                <InfoCard 
                  key={card.label} 
                  icon={card.icon} 
                  label={card.label} 
                  value={card.value}
                  category="basic"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
