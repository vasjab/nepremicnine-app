import {
  Building2,
  Car,
  TreePine,
  Home,
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
  AlertTriangle,
  LucideIcon
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';

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

const categoryLabels: Record<string, string> = {
  basic: 'Basics',
  outdoor: 'Outdoor & Views',
  parking: 'Parking & Storage',
  building: 'Building Amenities',
  energy: 'Energy & Climate',
  equipment: 'Appliances',
  interior: 'Interior Features',
  accessibility: 'Accessibility',
  safety: 'Safety & Security',
};

function FeatureItem({
  icon: Icon,
  label,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  detail?: string | null;
}) {
  return (
    <li className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <Icon className="h-6 w-6 shrink-0 text-gray-500" strokeWidth={1.5} />
      <div className="min-w-0">
        <span className="text-[15px] text-gray-600">{label}</span>
        {detail && (
          <span className="block text-[13px] text-gray-400 mt-0.5">{detail}</span>
        )}
      </div>
    </li>
  );
}

function CategorySection({
  categoryKey,
  features,
}: {
  categoryKey: string;
  features: Feature[];
}) {
  if (features.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 pt-2 pb-1">
        {categoryLabels[categoryKey] || categoryKey}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        {features.map((feature) => (
          <FeatureItem
            key={feature.id}
            icon={feature.icon}
            label={feature.label}
            detail={feature.detail}
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

  // Flat preview mode: no category headers, just a clean grid
  if (maxItems) {
    const allFeatures = categories.flatMap(cat => cat.features);
    const displayed = allFeatures.slice(0, maxItems);
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        {displayed.map((feature) => (
          <FeatureItem
            key={feature.id}
            icon={feature.icon}
            label={feature.label}
            detail={feature.detail}
          />
        ))}
      </ul>
    );
  }

  // Full mode (modal): grouped by category with headers
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <CategorySection key={cat.key} categoryKey={cat.key} features={cat.features} />
      ))}
    </div>
  );
}
