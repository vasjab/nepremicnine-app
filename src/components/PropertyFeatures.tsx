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
  Heater,
  Camera,
  AlertTriangle,
  LucideIcon
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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
    headerColor: 'text-emerald-700 dark:text-emerald-400',
    label: 'Outdoor & Views',
  },
  parking: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    headerColor: 'text-blue-700 dark:text-blue-400',
    label: 'Parking & Storage',
  },
  building: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    headerColor: 'text-violet-700 dark:text-violet-400',
    label: 'Building Amenities',
  },
  energy: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    headerColor: 'text-amber-700 dark:text-amber-400',
    label: 'Energy & Climate',
  },
  equipment: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
    headerColor: 'text-sky-700 dark:text-sky-400',
    label: 'Appliances',
  },
  interior: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    headerColor: 'text-rose-700 dark:text-rose-400',
    label: 'Interior Features',
  },
  accessibility: {
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
    headerColor: 'text-teal-700 dark:text-teal-400',
    label: 'Accessibility',
  },
  safety: {
    iconBg: 'bg-slate-200 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    headerColor: 'text-slate-700 dark:text-slate-400',
    label: 'Safety & Security',
  },
  basic: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    headerColor: 'text-primary',
    label: 'Basics',
  },
  info: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    headerColor: 'text-muted-foreground',
    label: 'Info',
  },
};

// Feature descriptions for info tooltips
const featureDescriptions: Record<string, string> = {
  furnished: 'Property comes with essential furniture like beds, sofas, and dining table',
  pets: 'Tenants are allowed to keep pets in the property',
  balcony: 'An outdoor platform attached to the apartment, accessible from inside',
  terrace: 'A larger outdoor paved area, often at ground level or rooftop',
  rooftop: 'Shared or private terrace area on the building roof',
  garden: 'Private or shared green outdoor space',
  bbq: 'Dedicated outdoor area for barbecuing',
  playground: 'Outdoor play area for children',
  waterfront: 'Property is located near a body of water (lake, river, sea)',
  view: 'Property offers scenic views from windows or outdoor areas',
  parking: 'Dedicated parking space for vehicles',
  garage: 'Enclosed parking structure attached to or near the property',
  carport: 'Covered parking structure that is open on at least one side',
  ev: 'Electric vehicle charging station available on premises',
  bike: 'Secure storage area for bicycles',
  storage: 'Additional storage space (basement, attic, or storage room)',
  basement: 'Underground storage or living space',
  elevator: 'Building has an elevator for easy access to higher floors',
  laundry: 'Shared laundry room available in the building',
  gym: 'Fitness center or gym available in the building',
  sauna: 'Sauna facility available in the building',
  pool: 'Swimming pool available in the building',
  common: 'Common room or social space for residents',
  concierge: 'Concierge or doorman service available',
  security: 'Building has security personnel or systems',
  fireplace: 'Wood-burning or gas fireplace for ambiance and heat',
  floorHeat: 'Radiant heating system under the floor for even warmth',
  district: 'Heat supplied from a central municipal facility',
  heatPump: 'Efficient system that extracts heat from air, water, or ground',
  ac: 'Active cooling system for temperature control in hot weather',
  vent: 'Mechanical ventilation system for fresh air circulation',
  solar: 'Photovoltaic panels that generate electricity from sunlight',
  dishwasher: 'Built-in dishwasher for automatic dishwashing',
  washer: 'In-unit washing machine for laundry',
  dryer: 'Tumble dryer or heat pump dryer for drying clothes',
  ceilings: 'Higher than standard ceiling height (typically 2.7m+)',
  windows: 'Larger than standard windows for more natural light',
  orientation: 'The direction the main windows or living areas face',
  smart: 'Connected home automation for lighting, heating, security',
  wardrobes: 'Permanent wardrobe storage built into walls',
  stepFree: 'No steps or stairs required to enter the property',
  wheelchair: 'Property is accessible for wheelchair users',
  wideDoors: 'Door frames wider than standard (80cm+) for accessibility',
  groundFloor: 'Property is on the ground floor with direct access',
  garageElev: 'Elevator access directly from the garage level',
  secureEntry: 'Controlled entrance with key card, code, or intercom',
  intercom: 'Video or audio intercom system for visitors',
  gated: 'Property is within a gated residential community',
  fire: 'Smoke detectors, fire extinguishers, or sprinkler systems',
  sound: 'Enhanced sound insulation between walls and floors',
};

// Simple Feature Card (no detail) - Horizontal layout with icon left
function FeatureCard({ 
  icon: Icon, 
  label, 
  category,
  featureId,
}: { 
  icon: LucideIcon; 
  label: string; 
  category: keyof typeof categoryThemes;
  featureId?: string;
}) {
  const theme = categoryThemes[category];
  const description = featureId ? featureDescriptions[featureId] : undefined;
  
  return (
    <div className={cn(
      "relative flex items-center gap-3 p-4 rounded-xl h-24 transition-all duration-200",
      "bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50",
      "cursor-default group"
    )}>
      {description && (
        <div className="absolute top-1.5 right-1.5">
          <InfoTooltip content={description} />
        </div>
      )}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        theme.iconBg
      )}>
        <Icon className={cn("h-6 w-6", theme.iconColor)} />
      </div>
      <span className="text-sm font-medium text-foreground leading-tight break-words pr-6">
        {label}
      </span>
    </div>
  );
}

// Detail Feature Card - horizontal layout with icon left, label and detail stacked
function DetailFeatureCard({ 
  icon: Icon, 
  label, 
  detail,
  category,
  featureId,
}: { 
  icon: LucideIcon; 
  label: string; 
  detail: string;
  category: keyof typeof categoryThemes;
  featureId?: string;
}) {
  const theme = categoryThemes[category];
  const description = featureId ? featureDescriptions[featureId] : undefined;
  
  return (
    <div className={cn(
      "relative flex items-center gap-3 p-4 rounded-xl h-24 transition-all duration-200",
      "bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50",
      "cursor-default group"
    )}>
      {description && (
        <div className="absolute top-1.5 right-1.5">
          <InfoTooltip content={description} />
        </div>
      )}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        theme.iconBg
      )}>
        <Icon className={cn("h-6 w-6", theme.iconColor)} />
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-medium text-foreground break-words leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground break-words">{detail}</p>
      </div>
    </div>
  );
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
        <p className="text-xs text-muted-foreground break-words">{label}</p>
        <p className="font-semibold text-foreground text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

// Category Section with header and feature grid
function CategorySection({
  categoryKey,
  features,
}: {
  categoryKey: keyof typeof categoryThemes;
  features: Feature[];
}) {
  const theme = categoryThemes[categoryKey];
  
  if (features.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h3 className={cn("text-xs font-semibold uppercase tracking-wide", theme.headerColor)}>
        {theme.label}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((feature) => (
          feature.detail ? (
            <DetailFeatureCard
              key={feature.id}
              icon={feature.icon}
              label={feature.label}
              detail={feature.detail}
              category={feature.category}
              featureId={feature.id}
            />
          ) : (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              label={feature.label}
              category={feature.category}
              featureId={feature.id}
            />
          )
        ))}
      </div>
    </div>
  );
}

export function PropertyFeatures({ listing }: PropertyFeaturesProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();

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

  const heatingDistributionLabels: Record<string, string> = {
    central: 'Central Heating',
    individual: 'Individual Heaters',
    both: 'Central + Individual',
  };

  const elevatorConditionLabels: Record<string, string> = {
    new: 'New / Recently installed',
    good: 'Good condition',
    old: 'Older model',
    needs_repair: 'Needs repair',
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
    mountain: 'Mountain View',
    city: 'City View',
    sea: 'Sea View',
    park: 'Park View',
    garden: 'Garden View',
    lake: 'Lake View',
  };

  const orientationLabels: Record<string, string> = {
    south: 'South Facing',
    north: 'North Facing',
    east: 'East Facing',
    west: 'West Facing',
    'south-east': 'Southeast Facing',
    'south-west': 'Southwest Facing',
    'north-east': 'Northeast Facing',
    'north-west': 'Northwest Facing',
  };

  // Build feature lists by category
  const outdoorFeatures: Feature[] = [];
  const parkingFeatures: Feature[] = [];
  const buildingFeatures: Feature[] = [];
  const energyFeatures: Feature[] = [];
  const equipmentFeatures: Feature[] = [];
  const interiorFeatures: Feature[] = [];
  const accessibilityFeatures: Feature[] = [];
  const safetyFeatures: Feature[] = [];
  const basicFeatures: Feature[] = [];

  // Basic features
  if (listing.is_furnished) {
    basicFeatures.push({ 
      id: 'furnished', 
      icon: Sofa, 
      label: t('listing.furnished'), 
      detail: listing.furnished_details || null,
      category: 'basic' 
    });
  }
  if (listing.allows_pets) {
    basicFeatures.push({ 
      id: 'pets', 
      icon: TreePine, 
      label: t('listing.petsAllowed'), 
      detail: listing.pets_details || null,
      category: 'basic' 
    });
  }

  // Outdoor features
  if (listing.has_balcony) {
    outdoorFeatures.push({ 
      id: 'balcony', 
      icon: Sun, 
      label: t('listing.balcony'), 
      detail: listing.balcony_sqm ? `${listing.balcony_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_terrace) {
    outdoorFeatures.push({ 
      id: 'terrace', 
      icon: Trees, 
      label: t('listing.terrace'), 
      detail: listing.terrace_sqm ? `${listing.terrace_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_rooftop_terrace) {
    outdoorFeatures.push({ id: 'rooftop', icon: Building2, label: 'Rooftop Terrace', category: 'outdoor' });
  }
  if (listing.has_garden) {
    outdoorFeatures.push({ 
      id: 'garden', 
      icon: Flower2, 
      label: t('listing.garden'), 
      detail: listing.garden_sqm ? `${listing.garden_sqm} m²` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_bbq_area) {
    outdoorFeatures.push({ id: 'bbq', icon: Flame, label: 'BBQ Area', category: 'outdoor' });
  }
  if (listing.has_playground) {
    outdoorFeatures.push({ id: 'playground', icon: PlayCircle, label: 'Playground', category: 'outdoor' });
  }
  if (listing.has_waterfront) {
    // Show waterfront with distance if available
    const waterfrontDistance = listing.waterfront_distance_m;
    outdoorFeatures.push({ 
      id: 'waterfront', 
      icon: Waves, 
      label: 'Waterfront',
      detail: waterfrontDistance ? `${waterfrontDistance}m to water` : null,
      category: 'outdoor' 
    });
  }
  if (listing.has_view) {
    outdoorFeatures.push({ 
      id: 'view', 
      icon: Eye, 
      label: listing.view_type ? viewTypeLabels[listing.view_type] || 'View' : 'View',
      category: 'outdoor' 
    });
  }

  // Parking & Storage
  if (listing.has_parking) {
    const parkingDetails: string[] = [];
    if (listing.parking_type) {
      parkingDetails.push(parkingTypeLabels[listing.parking_type] || listing.parking_type);
    }
    if (listing.parking_spaces && listing.parking_spaces > 1) {
      parkingDetails.push(`${listing.parking_spaces} spaces`);
    }
    parkingFeatures.push({ 
      id: 'parking', 
      icon: Car, 
      label: t('listing.parking'), 
      detail: parkingDetails.length > 0 ? parkingDetails.join(' • ') : null,
      category: 'parking' 
    });
  }
  if (listing.has_garage) {
    parkingFeatures.push({ id: 'garage', icon: Warehouse, label: t('listing.garage'), category: 'parking' });
  }
  if (listing.has_carport) {
    parkingFeatures.push({ id: 'carport', icon: SquareParking, label: 'Carport', category: 'parking' });
  }
  if (listing.has_ev_charging) {
    const evPower = listing.ev_charger_power;
    parkingFeatures.push({ 
      id: 'ev', 
      icon: Zap, 
      label: 'EV Charging',
      detail: evPower ? `${evPower} kW` : null,
      category: 'parking' 
    });
  }
  if (listing.has_bicycle_storage) {
    parkingFeatures.push({ id: 'bike', icon: Bike, label: 'Bicycle Storage', category: 'parking' });
  }
  if (listing.has_storage) {
    parkingFeatures.push({ id: 'storage', icon: Package, label: t('listing.storage'), category: 'parking' });
  }
  if (listing.has_basement) {
    parkingFeatures.push({ id: 'basement', icon: ArrowDown, label: 'Basement', category: 'parking' });
  }

  // Building amenities (apartments)
  if (isApartmentType) {
    if (listing.has_elevator) {
      // Show elevator with condition if available
      const elevatorCondition = listing.elevator_condition;
      buildingFeatures.push({ 
        id: 'elevator', 
        icon: ArrowUp, 
        label: t('listing.elevator'),
        detail: elevatorCondition ? elevatorConditionLabels[elevatorCondition] || elevatorCondition : null,
        category: 'building' 
      });
    }
    if (listing.has_shared_laundry) {
      buildingFeatures.push({ id: 'laundry', icon: Shirt, label: 'Shared Laundry', category: 'building' });
    }
    if (listing.has_gym) {
      buildingFeatures.push({ id: 'gym', icon: Dumbbell, label: 'Fitness Center', category: 'building' });
    }
    if (listing.has_sauna) {
      buildingFeatures.push({ id: 'sauna', icon: ThermometerSun, label: 'Sauna', category: 'building' });
    }
    if (listing.has_pool) {
      buildingFeatures.push({ id: 'pool', icon: Droplets, label: 'Swimming Pool', category: 'building' });
    }
    if (listing.has_common_room) {
      buildingFeatures.push({ id: 'common', icon: Sofa, label: 'Common Room', category: 'building' });
    }
    if (listing.has_concierge) {
      buildingFeatures.push({ id: 'concierge', icon: Bell, label: 'Concierge', category: 'building' });
    }
    if (listing.has_security) {
      // Show security with sub-details if available
      const securityDetails: string[] = [];
      if (listing.has_alarm_system) securityDetails.push('Alarm System');
      if (listing.has_cctv) securityDetails.push('CCTV');
      buildingFeatures.push({ 
        id: 'security', 
        icon: Shield, 
        label: 'Building Security',
        detail: securityDetails.length > 0 ? securityDetails.join(' • ') : null,
        category: 'building' 
      });
    }
  }

  // Energy & Climate
  if (listing.has_fireplace) {
    energyFeatures.push({ id: 'fireplace', icon: Flame, label: 'Fireplace', category: 'energy' });
  }
  if (listing.has_floor_heating) {
    energyFeatures.push({ id: 'floorHeat', icon: ThermometerSun, label: 'Floor Heating', category: 'energy' });
  }
  if (listing.has_district_heating) {
    energyFeatures.push({ id: 'district', icon: Factory, label: 'District Heating', category: 'energy' });
  }
  if (listing.has_heat_pump) {
    energyFeatures.push({ id: 'heatPump', icon: RefreshCw, label: 'Heat Pump', category: 'energy' });
  }
  if (listing.has_air_conditioning) {
    const acType = listing.ac_type;
    const acCount = listing.ac_unit_count;
    let acDetail = null;
    if (acType || acCount) {
      const parts: string[] = [];
      if (acType) parts.push(acType);
      if (acCount && acCount > 1) parts.push(`${acCount} units`);
      acDetail = parts.join(' • ');
    }
    energyFeatures.push({ 
      id: 'ac', 
      icon: Wind, 
      label: 'Air Conditioning',
      detail: acDetail,
      category: 'energy' 
    });
  }
  if (listing.has_ventilation) {
    energyFeatures.push({ id: 'vent', icon: Fan, label: 'Ventilation System', category: 'energy' });
  }
  if (listing.has_solar_panels) {
    energyFeatures.push({ id: 'solar', icon: Sun, label: 'Solar Panels', category: 'energy' });
  }

  // Equipment
  if (listing.has_dishwasher) {
    equipmentFeatures.push({ id: 'dishwasher', icon: Droplets, label: t('listing.dishwasher'), category: 'equipment' });
  }
  if (listing.has_washing_machine) {
    equipmentFeatures.push({ id: 'washer', icon: Shirt, label: t('listing.washingMachine'), category: 'equipment' });
  }
  if (listing.has_dryer) {
    equipmentFeatures.push({ id: 'dryer', icon: Wind, label: 'Tumble Dryer', category: 'equipment' });
  }

  // Interior
  if (listing.has_high_ceilings) {
    interiorFeatures.push({ id: 'ceilings', icon: ArrowUp, label: 'High Ceilings', category: 'interior' });
  }
  if (listing.has_large_windows) {
    interiorFeatures.push({ id: 'windows', icon: Square, label: 'Large Windows', category: 'interior' });
  }
  if (listing.orientation) {
    interiorFeatures.push({ 
      id: 'orientation', 
      icon: Compass, 
      label: orientationLabels[listing.orientation] || listing.orientation,
      category: 'interior' 
    });
  }
  if (listing.has_smart_home) {
    interiorFeatures.push({ id: 'smart', icon: Smartphone, label: 'Smart Home', category: 'interior' });
  }
  if (listing.has_built_in_wardrobes) {
    interiorFeatures.push({ id: 'wardrobes', icon: DoorClosed, label: 'Built-in Wardrobes', category: 'interior' });
  }

  // Accessibility
  if (listing.has_step_free_access) {
    accessibilityFeatures.push({ id: 'stepFree', icon: ArrowUp, label: 'Step-free Access', category: 'accessibility' });
  }
  if (listing.has_wheelchair_accessible) {
    accessibilityFeatures.push({ id: 'wheelchair', icon: Accessibility, label: 'Wheelchair Accessible', category: 'accessibility' });
  }
  if (listing.has_wide_doorways) {
    accessibilityFeatures.push({ id: 'wideDoors', icon: Square, label: 'Wide Doorways', category: 'accessibility' });
  }
  if (listing.has_ground_floor_access) {
    accessibilityFeatures.push({ id: 'groundFloor', icon: Home, label: 'Ground Floor Access', category: 'accessibility' });
  }
  if (listing.has_elevator_from_garage) {
    accessibilityFeatures.push({ id: 'garageElev', icon: ArrowUp, label: 'Elevator from Garage', category: 'accessibility' });
  }

  // Safety
  if (listing.has_secure_entrance) {
    safetyFeatures.push({ id: 'secureEntry', icon: Lock, label: 'Secure Entrance', category: 'safety' });
  }
  if (listing.has_intercom) {
    safetyFeatures.push({ id: 'intercom', icon: Phone, label: 'Intercom System', category: 'safety' });
  }
  if (listing.has_gated_community) {
    safetyFeatures.push({ id: 'gated', icon: Shield, label: 'Gated Community', category: 'safety' });
  }
  if (listing.has_fire_safety) {
    safetyFeatures.push({ id: 'fire', icon: AlertTriangle, label: 'Fire Safety System', category: 'safety' });
  }
  if (listing.has_soundproofing) {
    safetyFeatures.push({ id: 'sound', icon: VolumeX, label: 'Soundproofing', category: 'safety' });
  }

  // Combine all features for counting
  const allFeatures = [
    ...basicFeatures,
    ...outdoorFeatures,
    ...parkingFeatures,
    ...buildingFeatures,
    ...energyFeatures,
    ...equipmentFeatures,
    ...interiorFeatures,
    ...accessibilityFeatures,
    ...safetyFeatures,
  ];

  // Categories to show (in order) - show ALL categories, no more "show more/less"
  const categories = [
    { key: 'basic' as const, features: basicFeatures },
    { key: 'outdoor' as const, features: outdoorFeatures },
    { key: 'parking' as const, features: parkingFeatures },
    { key: 'building' as const, features: buildingFeatures },
    { key: 'energy' as const, features: energyFeatures },
    { key: 'equipment' as const, features: equipmentFeatures },
    { key: 'interior' as const, features: interiorFeatures },
    { key: 'accessibility' as const, features: accessibilityFeatures },
    { key: 'safety' as const, features: safetyFeatures },
  ].filter(cat => cat.features.length > 0);

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

  // Show heating distribution if available
  const heatingDistribution = listing.heating_distribution;
  if (heatingDistribution) {
    buildingInfoCards.push({ 
      icon: Heater, 
      label: 'Heat Distribution', 
      value: heatingDistributionLabels[heatingDistribution] || heatingDistribution 
    });
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
      label: t('filters.propertyCondition'), 
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
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-lg font-bold text-foreground tracking-tight">
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

      {/* Feature Categories - show ALL, no show more/less */}
      {allFeatures.length > 0 && (
        <div className="space-y-5">
          {categories.map((cat) => (
            <CategorySection 
              key={cat.key} 
              categoryKey={cat.key} 
              features={cat.features} 
            />
          ))}
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
  );
}
