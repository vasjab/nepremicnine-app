import {
  Building2,
  Car,
  TreePine,
  Thermometer,
  Home,
  Wifi,
  Zap,
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
  Camera,
  AlertTriangle,
  LucideIcon
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface PropertyFeaturesProps {
  listing: Listing;
  maxItems?: number;
}

interface Feature {
  id: string;
  icon: LucideIcon;
  label: string;
  detail?: string | null;
  category: 'outdoor' | 'parking' | 'building' | 'energy' | 'equipment' | 'interior' | 'accessibility' | 'safety' | 'basic';
}

const categoryThemes = {
  outdoor: { iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100', headerColor: 'text-emerald-600', label: 'Outdoor & Views' },
  parking: { iconColor: 'text-blue-600', iconBg: 'bg-blue-100', headerColor: 'text-blue-600', label: 'Parking & Storage' },
  building: { iconColor: 'text-violet-600', iconBg: 'bg-violet-100', headerColor: 'text-violet-600', label: 'Building Amenities' },
  energy: { iconColor: 'text-amber-600', iconBg: 'bg-amber-100', headerColor: 'text-amber-600', label: 'Energy & Climate' },
  equipment: { iconColor: 'text-sky-600', iconBg: 'bg-sky-100', headerColor: 'text-sky-600', label: 'Appliances' },
  interior: { iconColor: 'text-rose-600', iconBg: 'bg-rose-100', headerColor: 'text-rose-600', label: 'Interior Features' },
  accessibility: { iconColor: 'text-teal-600', iconBg: 'bg-teal-100', headerColor: 'text-teal-600', label: 'Accessibility' },
  safety: { iconColor: 'text-slate-600', iconBg: 'bg-slate-100', headerColor: 'text-slate-600', label: 'Safety & Security' },
  basic: { iconColor: 'text-gray-700', iconBg: 'bg-gray-100', headerColor: 'text-gray-700', label: 'Basics' },
};

function FeatureItem({
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
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", theme.iconBg)}>
        <Icon className={cn("h-4 w-4", theme.iconColor)} />
      </div>
      <span className="text-[14px] text-gray-800 font-medium">
        {label}
        {detail && <span className="text-gray-400 font-normal ml-1">· {detail}</span>}
      </span>
    </li>
  );
}

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
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("flex h-5 w-5 items-center justify-center rounded-md", theme.iconBg)}>
          <span className={cn("h-2.5 w-2.5 rounded-full", theme.iconColor.replace('text-', 'bg-'))} />
        </div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {theme.label}
        </h3>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {features.map((feature) => (
          <FeatureItem
            key={feature.id}
            icon={feature.icon}
            label={feature.label}
            detail={feature.detail}
            category={feature.category}
          />
        ))}
      </ul>
    </div>
  );
}

export function PropertyFeatures({ listing, maxItems }: PropertyFeaturesProps) {
  const { t } = useTranslation();

  const isApartmentType = ['apartment', 'room', 'studio'].includes(listing.property_type);

  const parkingTypeLabels: Record<string, string> = {
    street: t('filters.parkingStreet'),
    designated: t('filters.parkingDesignated'),
    underground: t('filters.parkingUnderground'),
    private: t('filters.parkingPrivate'),
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

  const elevatorConditionLabels: Record<string, string> = {
    new: 'New / Recently installed',
    good: 'Good condition',
    old: 'Older model',
    needs_repair: 'Needs repair',
  };

  // Build feature lists by category
  const basicFeatures: Feature[] = [];
  const outdoorFeatures: Feature[] = [];
  const parkingFeatures: Feature[] = [];
  const buildingFeatures: Feature[] = [];
  const energyFeatures: Feature[] = [];
  const equipmentFeatures: Feature[] = [];
  const interiorFeatures: Feature[] = [];
  const accessibilityFeatures: Feature[] = [];
  const safetyFeatures: Feature[] = [];

  // Basic
  if (listing.is_furnished) {
    basicFeatures.push({ id: 'furnished', icon: Sofa, label: t('listing.furnished'), detail: listing.furnished_details || null, category: 'basic' });
  }
  if (listing.allows_pets) {
    basicFeatures.push({ id: 'pets', icon: TreePine, label: t('listing.petsAllowed'), detail: listing.pets_details || null, category: 'basic' });
  }

  // Outdoor
  if (listing.has_balcony) {
    outdoorFeatures.push({ id: 'balcony', icon: Sun, label: t('listing.balcony'), detail: listing.balcony_sqm ? `${listing.balcony_sqm} m²` : null, category: 'outdoor' });
  }
  if (listing.has_terrace) {
    outdoorFeatures.push({ id: 'terrace', icon: Trees, label: t('listing.terrace'), detail: listing.terrace_sqm ? `${listing.terrace_sqm} m²` : null, category: 'outdoor' });
  }
  if (listing.has_rooftop_terrace) {
    outdoorFeatures.push({ id: 'rooftop', icon: Building2, label: 'Rooftop Terrace', category: 'outdoor' });
  }
  if (listing.has_garden) {
    outdoorFeatures.push({ id: 'garden', icon: Flower2, label: t('listing.garden'), detail: listing.garden_sqm ? `${listing.garden_sqm} m²` : null, category: 'outdoor' });
  }
  if (listing.has_bbq_area) {
    outdoorFeatures.push({ id: 'bbq', icon: Flame, label: 'BBQ Area', category: 'outdoor' });
  }
  if (listing.has_playground) {
    outdoorFeatures.push({ id: 'playground', icon: PlayCircle, label: 'Playground', category: 'outdoor' });
  }
  if (listing.has_waterfront) {
    outdoorFeatures.push({ id: 'waterfront', icon: Waves, label: 'Waterfront', detail: listing.waterfront_distance_m ? `${listing.waterfront_distance_m}m to water` : null, category: 'outdoor' });
  }
  if (listing.has_view) {
    outdoorFeatures.push({ id: 'view', icon: Eye, label: listing.view_type ? viewTypeLabels[listing.view_type] || 'View' : 'View', category: 'outdoor' });
  }

  // Parking & Storage
  if (listing.has_parking) {
    const parts: string[] = [];
    if (listing.parking_type) parts.push(parkingTypeLabels[listing.parking_type] || listing.parking_type);
    if (listing.parking_spaces && listing.parking_spaces > 1) parts.push(`${listing.parking_spaces} spaces`);
    parkingFeatures.push({ id: 'parking', icon: Car, label: t('listing.parking'), detail: parts.length > 0 ? parts.join(' · ') : null, category: 'parking' });
  }
  if (listing.has_garage) parkingFeatures.push({ id: 'garage', icon: Warehouse, label: t('listing.garage'), category: 'parking' });
  if (listing.has_carport) parkingFeatures.push({ id: 'carport', icon: SquareParking, label: 'Carport', category: 'parking' });
  if (listing.has_ev_charging) {
    parkingFeatures.push({ id: 'ev', icon: Zap, label: 'EV Charging', detail: listing.ev_charger_power ? `${listing.ev_charger_power} kW` : null, category: 'parking' });
  }
  if (listing.has_bicycle_storage) parkingFeatures.push({ id: 'bike', icon: Bike, label: 'Bicycle Storage', category: 'parking' });
  if (listing.has_storage) parkingFeatures.push({ id: 'storage', icon: Package, label: t('listing.storage'), category: 'parking' });
  if (listing.has_basement) parkingFeatures.push({ id: 'basement', icon: ArrowDown, label: 'Basement', category: 'parking' });

  // Building amenities
  if (isApartmentType) {
    if (listing.has_elevator) {
      buildingFeatures.push({ id: 'elevator', icon: ArrowUp, label: t('listing.elevator'), detail: listing.elevator_condition ? elevatorConditionLabels[listing.elevator_condition] || listing.elevator_condition : null, category: 'building' });
    }
    if (listing.has_shared_laundry) buildingFeatures.push({ id: 'laundry', icon: Shirt, label: 'Shared Laundry', category: 'building' });
    if (listing.has_gym) buildingFeatures.push({ id: 'gym', icon: Dumbbell, label: 'Fitness Center', category: 'building' });
    if (listing.has_sauna) buildingFeatures.push({ id: 'sauna', icon: ThermometerSun, label: 'Sauna', category: 'building' });
    if (listing.has_pool) buildingFeatures.push({ id: 'pool', icon: Droplets, label: 'Swimming Pool', category: 'building' });
    if (listing.has_common_room) buildingFeatures.push({ id: 'common', icon: Sofa, label: 'Common Room', category: 'building' });
    if (listing.has_concierge) buildingFeatures.push({ id: 'concierge', icon: Bell, label: 'Concierge', category: 'building' });
    if (listing.has_security) {
      const secDetails: string[] = [];
      if (listing.has_alarm_system) secDetails.push('Alarm');
      if (listing.has_cctv) secDetails.push('CCTV');
      buildingFeatures.push({ id: 'security', icon: Shield, label: 'Building Security', detail: secDetails.length > 0 ? secDetails.join(' · ') : null, category: 'building' });
    }
  }

  // Energy & Climate
  if (listing.has_fireplace) energyFeatures.push({ id: 'fireplace', icon: Flame, label: 'Fireplace', category: 'energy' });
  if (listing.has_floor_heating) energyFeatures.push({ id: 'floorHeat', icon: ThermometerSun, label: 'Floor Heating', category: 'energy' });
  if (listing.has_district_heating) energyFeatures.push({ id: 'district', icon: Factory, label: 'District Heating', category: 'energy' });
  if (listing.has_heat_pump) energyFeatures.push({ id: 'heatPump', icon: RefreshCw, label: 'Heat Pump', category: 'energy' });
  if (listing.has_air_conditioning) {
    let acDetail = null;
    if (listing.ac_type || listing.ac_unit_count) {
      const parts: string[] = [];
      if (listing.ac_type) parts.push(listing.ac_type);
      if (listing.ac_unit_count && listing.ac_unit_count > 1) parts.push(`${listing.ac_unit_count} units`);
      acDetail = parts.join(' · ');
    }
    energyFeatures.push({ id: 'ac', icon: Wind, label: 'Air Conditioning', detail: acDetail, category: 'energy' });
  }
  if (listing.has_ventilation) energyFeatures.push({ id: 'vent', icon: Fan, label: 'Ventilation System', category: 'energy' });
  if (listing.has_solar_panels) energyFeatures.push({ id: 'solar', icon: Sun, label: 'Solar Panels', category: 'energy' });

  // Equipment
  if (listing.has_dishwasher) equipmentFeatures.push({ id: 'dishwasher', icon: Droplets, label: t('listing.dishwasher'), category: 'equipment' });
  if (listing.has_washing_machine) equipmentFeatures.push({ id: 'washer', icon: Shirt, label: t('listing.washingMachine'), category: 'equipment' });
  if (listing.has_dryer) equipmentFeatures.push({ id: 'dryer', icon: Wind, label: 'Tumble Dryer', category: 'equipment' });

  // Interior
  if (listing.has_high_ceilings) interiorFeatures.push({ id: 'ceilings', icon: ArrowUp, label: 'High Ceilings', category: 'interior' });
  if (listing.has_large_windows) interiorFeatures.push({ id: 'windows', icon: Square, label: 'Large Windows', category: 'interior' });
  if (listing.orientation) {
    interiorFeatures.push({ id: 'orientation', icon: Compass, label: orientationLabels[listing.orientation] || listing.orientation, category: 'interior' });
  }
  if (listing.has_smart_home) interiorFeatures.push({ id: 'smart', icon: Smartphone, label: 'Smart Home', category: 'interior' });
  if (listing.has_built_in_wardrobes) interiorFeatures.push({ id: 'wardrobes', icon: DoorClosed, label: 'Built-in Wardrobes', category: 'interior' });

  // Accessibility
  if (listing.has_step_free_access) accessibilityFeatures.push({ id: 'stepFree', icon: ArrowUp, label: 'Step-free Access', category: 'accessibility' });
  if (listing.has_wheelchair_accessible) accessibilityFeatures.push({ id: 'wheelchair', icon: Accessibility, label: 'Wheelchair Accessible', category: 'accessibility' });
  if (listing.has_wide_doorways) accessibilityFeatures.push({ id: 'wideDoors', icon: Square, label: 'Wide Doorways', category: 'accessibility' });
  if (listing.has_ground_floor_access) accessibilityFeatures.push({ id: 'groundFloor', icon: Home, label: 'Ground Floor Access', category: 'accessibility' });
  if (listing.has_elevator_from_garage) accessibilityFeatures.push({ id: 'garageElev', icon: ArrowUp, label: 'Elevator from Garage', category: 'accessibility' });

  // Safety
  if (listing.has_secure_entrance) safetyFeatures.push({ id: 'secureEntry', icon: Lock, label: 'Secure Entrance', category: 'safety' });
  if (listing.has_intercom) safetyFeatures.push({ id: 'intercom', icon: Phone, label: 'Intercom System', category: 'safety' });
  if (listing.has_gated_community) safetyFeatures.push({ id: 'gated', icon: Shield, label: 'Gated Community', category: 'safety' });
  if (listing.has_fire_safety) safetyFeatures.push({ id: 'fire', icon: AlertTriangle, label: 'Fire Safety System', category: 'safety' });
  if (listing.has_soundproofing) safetyFeatures.push({ id: 'sound', icon: VolumeX, label: 'Soundproofing', category: 'safety' });

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

  if (categories.length === 0) return null;

  // Flat preview mode: no category headers, just a grid of items
  if (maxItems) {
    const allFeatures = categories.flatMap(cat => cat.features);
    const displayed = allFeatures.slice(0, maxItems);
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
        {displayed.map((feature) => (
          <FeatureItem
            key={feature.id}
            icon={feature.icon}
            label={feature.label}
            detail={feature.detail}
            category={feature.category}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <CategorySection key={cat.key} categoryKey={cat.key} features={cat.features} />
      ))}
    </div>
  );
}
