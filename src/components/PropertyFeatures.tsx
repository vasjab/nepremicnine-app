import { 
  Check, 
  X, 
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
  Mountain,
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
  PlayCircle
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';

interface PropertyFeaturesProps {
  listing: Listing;
}

// Section theme configurations
const sectionThemes = {
  outdoor: {
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/50 dark:border-emerald-800/30',
  },
  parking: {
    bg: 'bg-blue-50/60 dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/50 dark:border-blue-800/30',
  },
  building: {
    bg: 'bg-purple-50/60 dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200/50 dark:border-purple-800/30',
  },
  energy: {
    bg: 'bg-amber-50/60 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/50 dark:border-amber-800/30',
  },
  equipment: {
    bg: 'bg-sky-50/60 dark:bg-sky-950/30',
    iconBg: 'bg-sky-100 dark:bg-sky-900/50',
    iconColor: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200/50 dark:border-sky-800/30',
  },
  interior: {
    bg: 'bg-pink-50/60 dark:bg-pink-950/30',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50',
    iconColor: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200/50 dark:border-pink-800/30',
  },
  accessibility: {
    bg: 'bg-teal-50/60 dark:bg-teal-950/30',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
    iconColor: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200/50 dark:border-teal-800/30',
  },
  safety: {
    bg: 'bg-slate-50/60 dark:bg-slate-900/40',
    iconBg: 'bg-slate-200 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200/50 dark:border-slate-700/30',
  },
  basic: {
    bg: 'bg-secondary/50',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    border: 'border-border/30',
  },
  info: {
    bg: 'bg-muted/50',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    border: 'border-border/30',
  },
};

export function PropertyFeatures({ listing }: PropertyFeaturesProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();

  const isApartmentType = ['apartment', 'room', 'studio'].includes(listing.property_type);
  const isHouseType = ['house', 'villa'].includes(listing.property_type);
  const isRental = listing.listing_type === 'rent';

  // Feature item with checkmark
  const FeatureItem = ({ 
    icon: Icon, 
    label, 
    value, 
    detail,
    theme = 'basic',
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    value: boolean | null | undefined;
    detail?: string | null;
    theme?: keyof typeof sectionThemes;
  }) => {
    if (!value) return null;
    const themeConfig = sectionThemes[theme];
    return (
      <div className="flex items-center gap-3 py-1">
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", themeConfig.iconBg)}>
          <Icon className={cn("h-5 w-5", themeConfig.iconColor)} />
        </div>
        <span className="text-foreground font-medium">
          {label}
          {detail && <span className="text-muted-foreground font-normal ml-1.5">({detail})</span>}
        </span>
      </div>
    );
  };

  // Info item for non-boolean values
  const InfoItem = ({ 
    icon: Icon, 
    label, 
    value,
    theme = 'info',
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    value: string | number | null | undefined;
    theme?: keyof typeof sectionThemes;
  }) => {
    if (!value) return null;
    const themeConfig = sectionThemes[theme];
    return (
      <div className="flex items-center gap-3 py-2">
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", themeConfig.iconBg)}>
          <Icon className={cn("h-5 w-5", themeConfig.iconColor)} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-semibold text-foreground">{value}</p>
        </div>
      </div>
    );
  };

  // Section wrapper component
  const Section = ({ 
    title, 
    icon: Icon, 
    theme,
    featureCount,
    children,
  }: { 
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    theme: keyof typeof sectionThemes;
    featureCount?: number;
    children: React.ReactNode;
  }) => {
    const themeConfig = sectionThemes[theme];
    return (
      <div className={cn("rounded-2xl p-5 sm:p-6 border shadow-sm", themeConfig.bg, themeConfig.border)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2.5 text-sm font-semibold text-foreground uppercase tracking-wide">
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", themeConfig.iconBg)}>
              <Icon className={cn("h-4 w-4", themeConfig.iconColor)} />
            </div>
            {title}
          </h3>
          {featureCount && featureCount > 0 && (
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", themeConfig.iconBg, themeConfig.iconColor)}>
              {featureCount} features
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {children}
        </div>
      </div>
    );
  };

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
    mountain: 'Mountain view',
    city: 'City view',
    sea: 'Sea view',
    park: 'Park view',
    garden: 'Garden view',
    lake: 'Lake view',
  };

  const orientationLabels: Record<string, string> = {
    south: 'South',
    north: 'North',
    east: 'East',
    west: 'West',
    'south-east': 'South-East',
    'south-west': 'South-West',
    'north-east': 'North-East',
    'north-west': 'North-West',
  };

  // Count features for each section
  const countOutdoor = [listing.has_balcony, listing.has_terrace, listing.has_garden, 
    listing.has_rooftop_terrace, listing.has_bbq_area, listing.has_playground, 
    listing.has_waterfront, listing.has_view].filter(Boolean).length;

  const countParking = [listing.has_parking, listing.has_garage, listing.has_carport, 
    listing.has_ev_charging, listing.has_bicycle_storage, listing.has_storage, listing.has_basement].filter(Boolean).length;

  const countBuildingAmenities = [listing.has_elevator, listing.has_shared_laundry, 
    listing.has_gym, listing.has_sauna, listing.has_pool, listing.has_common_room, 
    listing.has_concierge, listing.has_security].filter(Boolean).length;

  const countEnergy = [listing.has_fireplace, listing.has_floor_heating, 
    listing.has_district_heating, listing.has_heat_pump, listing.has_air_conditioning, 
    listing.has_ventilation, listing.has_solar_panels].filter(Boolean).length;

  const countEquipment = [listing.has_dishwasher, listing.has_washing_machine, listing.has_dryer].filter(Boolean).length;

  const countInterior = [listing.has_high_ceilings, listing.has_large_windows, 
    listing.orientation, listing.has_smart_home, listing.has_built_in_wardrobes].filter(Boolean).length;

  const countAccessibility = [listing.has_step_free_access, listing.has_wheelchair_accessible, 
    listing.has_wide_doorways, listing.has_ground_floor_access, listing.has_elevator_from_garage].filter(Boolean).length;

  const countSafety = [listing.has_secure_entrance, listing.has_intercom, 
    listing.has_gated_community, listing.has_fire_safety, listing.has_soundproofing].filter(Boolean).length;

  // Check what sections to show
  const hasOutdoorFeatures = countOutdoor > 0;
  const hasParkingFeatures = countParking > 0;
  const hasBuildingAmenities = isApartmentType && countBuildingAmenities > 0;
  const hasEnergyFeatures = countEnergy > 0;
  const hasEquipment = countEquipment > 0;
  const hasInteriorHighlights = countInterior > 0;
  const hasAccessibility = countAccessibility > 0;
  const hasSafetyFeatures = countSafety > 0;

  const hasBuildingDetails = listing.heating_type || listing.energy_rating || 
    listing.year_built || listing.property_condition;

  const hasRentalTerms = isRental && (listing.deposit_amount || listing.min_lease_months || 
    listing.internet_included || listing.utilities_included);

  const hasBuildingFloorInfo = isApartmentType 
    ? (listing.floor_number != null || listing.has_elevator)
    : (isHouseType && listing.property_floors != null);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-xl font-semibold text-foreground pb-4 border-b border-border/50">
        {t('listing.features')}
      </h2>
      
      {/* Basic Features */}
      <Section title={t('listing.basicFeatures')} icon={Home} theme="basic">
        <FeatureItem icon={Sofa} label={t('listing.furnished')} value={listing.is_furnished} theme="basic" />
        <FeatureItem icon={TreePine} label={t('listing.petsAllowed')} value={listing.allows_pets} theme="basic" />
      </Section>

      {/* Building & Floor Info */}
      {hasBuildingFloorInfo && (
        <Section title={t('filters.buildingFloor')} icon={Building2} theme="building">
          {isApartmentType && listing.floor_number != null && (
            <InfoItem 
              icon={Building2} 
              label={t('filters.floorNumber')} 
              value={listing.total_floors_building 
                ? `${listing.floor_number} / ${listing.total_floors_building}` 
                : listing.floor_number.toString()
              }
              theme="building"
            />
          )}
          {isApartmentType && (
            <FeatureItem icon={ArrowUp} label={t('listing.elevator')} value={listing.has_elevator} theme="building" />
          )}
          {isHouseType && listing.property_floors != null && (
            <InfoItem 
              icon={Home} 
              label={t('filters.propertyFloors')} 
              value={listing.property_floors}
              theme="building"
            />
          )}
        </Section>
      )}

      {/* Outdoor & Views */}
      {hasOutdoorFeatures && (
        <Section title="Outdoor & Views" icon={TreePine} theme="outdoor" featureCount={countOutdoor}>
          <FeatureItem 
            icon={Sun} 
            label={t('listing.balcony')} 
            value={listing.has_balcony}
            detail={listing.balcony_sqm ? `${listing.balcony_sqm} m²` : null}
            theme="outdoor"
          />
          <FeatureItem 
            icon={Trees} 
            label={t('listing.terrace')} 
            value={listing.has_terrace}
            detail={listing.terrace_sqm ? `${listing.terrace_sqm} m²` : null}
            theme="outdoor"
          />
          <FeatureItem icon={Building2} label="Rooftop Terrace" value={listing.has_rooftop_terrace} theme="outdoor" />
          <FeatureItem 
            icon={Flower2} 
            label={t('listing.garden')} 
            value={listing.has_garden}
            detail={listing.garden_sqm ? `${listing.garden_sqm} m²` : null}
            theme="outdoor"
          />
          <FeatureItem icon={Flame} label="BBQ Area" value={listing.has_bbq_area} theme="outdoor" />
          <FeatureItem icon={PlayCircle} label="Playground" value={listing.has_playground} theme="outdoor" />
          <FeatureItem icon={Waves} label="Waterfront" value={listing.has_waterfront} theme="outdoor" />
          <FeatureItem 
            icon={Eye} 
            label="View" 
            value={listing.has_view}
            detail={listing.view_type ? viewTypeLabels[listing.view_type] || listing.view_type : null}
            theme="outdoor"
          />
        </Section>
      )}

      {/* Parking & Storage */}
      {hasParkingFeatures && (
        <Section title="Parking & Storage" icon={Car} theme="parking" featureCount={countParking}>
          {listing.has_parking && (
            <FeatureItem 
              icon={Car} 
              label={t('listing.parking')} 
              value={listing.has_parking}
              detail={[
                listing.parking_type ? parkingTypeLabels[listing.parking_type] || listing.parking_type : null,
                listing.parking_spaces && listing.parking_spaces > 1 ? `${listing.parking_spaces} spaces` : null
              ].filter(Boolean).join(', ') || null}
              theme="parking"
            />
          )}
          <FeatureItem icon={Warehouse} label={t('listing.garage')} value={listing.has_garage} theme="parking" />
          <FeatureItem icon={SquareParking} label="Carport" value={listing.has_carport} theme="parking" />
          <FeatureItem icon={Zap} label="EV Charging" value={listing.has_ev_charging} theme="parking" />
          <FeatureItem icon={Bike} label="Bicycle Storage" value={listing.has_bicycle_storage} theme="parking" />
          <FeatureItem icon={Package} label={t('listing.storage')} value={listing.has_storage} theme="parking" />
          <FeatureItem icon={ArrowDown} label="Basement" value={listing.has_basement} theme="parking" />
        </Section>
      )}

      {/* Building Amenities (for apartments) */}
      {hasBuildingAmenities && (
        <Section title="Building Amenities" icon={Building2} theme="building" featureCount={countBuildingAmenities}>
          <FeatureItem icon={ArrowUp} label={t('listing.elevator')} value={listing.has_elevator} theme="building" />
          <FeatureItem icon={Shirt} label="Shared Laundry" value={listing.has_shared_laundry} theme="building" />
          <FeatureItem icon={Dumbbell} label="Gym" value={listing.has_gym} theme="building" />
          <FeatureItem icon={ThermometerSun} label="Sauna" value={listing.has_sauna} theme="building" />
          <FeatureItem icon={Droplets} label="Pool" value={listing.has_pool} theme="building" />
          <FeatureItem icon={Sofa} label="Common Room" value={listing.has_common_room} theme="building" />
          <FeatureItem icon={Bell} label="Concierge" value={listing.has_concierge} theme="building" />
          <FeatureItem icon={Shield} label="Security/CCTV" value={listing.has_security} theme="building" />
        </Section>
      )}

      {/* Heating, Energy & Comfort */}
      {hasEnergyFeatures && (
        <Section title="Energy & Comfort" icon={Zap} theme="energy" featureCount={countEnergy}>
          <FeatureItem icon={Flame} label="Fireplace" value={listing.has_fireplace} theme="energy" />
          <FeatureItem icon={ThermometerSun} label="Floor Heating" value={listing.has_floor_heating} theme="energy" />
          <FeatureItem icon={Factory} label="District Heating" value={listing.has_district_heating} theme="energy" />
          <FeatureItem icon={RefreshCw} label="Heat Pump" value={listing.has_heat_pump} theme="energy" />
          <FeatureItem icon={Wind} label={t('listing.airConditioning')} value={listing.has_air_conditioning} theme="energy" />
          <FeatureItem icon={Fan} label="Ventilation" value={listing.has_ventilation} theme="energy" />
          <FeatureItem icon={Sun} label="Solar Panels" value={listing.has_solar_panels} theme="energy" />
        </Section>
      )}

      {/* Equipment & Appliances */}
      {hasEquipment && (
        <Section title={t('listing.amenities')} icon={Droplets} theme="equipment" featureCount={countEquipment}>
          <FeatureItem icon={Droplets} label={t('listing.dishwasher')} value={listing.has_dishwasher} theme="equipment" />
          <FeatureItem icon={Shirt} label={t('listing.washingMachine')} value={listing.has_washing_machine} theme="equipment" />
          <FeatureItem icon={Wind} label="Dryer" value={listing.has_dryer} theme="equipment" />
        </Section>
      )}

      {/* Interior Highlights */}
      {hasInteriorHighlights && (
        <Section title="Interior Highlights" icon={Home} theme="interior" featureCount={countInterior}>
          <FeatureItem icon={ArrowUp} label="High Ceilings" value={listing.has_high_ceilings} theme="interior" />
          <FeatureItem icon={Square} label="Large Windows" value={listing.has_large_windows} theme="interior" />
          {listing.orientation && (
            <InfoItem 
              icon={Compass} 
              label="Orientation" 
              value={orientationLabels[listing.orientation] || listing.orientation}
              theme="interior"
            />
          )}
          <FeatureItem icon={Smartphone} label="Smart Home" value={listing.has_smart_home} theme="interior" />
          <FeatureItem icon={DoorClosed} label="Built-in Wardrobes" value={listing.has_built_in_wardrobes} theme="interior" />
        </Section>
      )}

      {/* Accessibility */}
      {hasAccessibility && (
        <Section title="Accessibility" icon={Accessibility} theme="accessibility" featureCount={countAccessibility}>
          <FeatureItem icon={ArrowUp} label="Step-free Access" value={listing.has_step_free_access} theme="accessibility" />
          <FeatureItem icon={Accessibility} label="Wheelchair Accessible" value={listing.has_wheelchair_accessible} theme="accessibility" />
          <FeatureItem icon={Square} label="Wide Doorways" value={listing.has_wide_doorways} theme="accessibility" />
          <FeatureItem icon={Home} label="Ground Floor Access" value={listing.has_ground_floor_access} theme="accessibility" />
          <FeatureItem icon={ArrowUp} label="Elevator from Garage" value={listing.has_elevator_from_garage} theme="accessibility" />
        </Section>
      )}

      {/* Safety & Privacy */}
      {hasSafetyFeatures && (
        <Section title="Safety & Privacy" icon={Shield} theme="safety" featureCount={countSafety}>
          <FeatureItem icon={Lock} label="Secure Entrance" value={listing.has_secure_entrance} theme="safety" />
          <FeatureItem icon={Phone} label="Intercom" value={listing.has_intercom} theme="safety" />
          <FeatureItem icon={Shield} label="Gated Community" value={listing.has_gated_community} theme="safety" />
          <FeatureItem icon={Flame} label="Fire Safety" value={listing.has_fire_safety} theme="safety" />
          <FeatureItem icon={VolumeX} label="Soundproofing" value={listing.has_soundproofing} theme="safety" />
        </Section>
      )}

      {/* Building Info */}
      {hasBuildingDetails && (
        <Section title={t('filters.buildingInfo')} icon={Building2} theme="info">
          {listing.heating_type && (
            <InfoItem 
              icon={Thermometer} 
              label={t('filters.heatingType')} 
              value={heatingTypeLabels[listing.heating_type] || listing.heating_type}
              theme="info"
            />
          )}
          {listing.energy_rating && (
            <InfoItem 
              icon={Zap} 
              label={t('filters.energyRating')} 
              value={listing.energy_rating}
              theme="info"
            />
          )}
          {listing.year_built && (
            <InfoItem 
              icon={Building2} 
              label={t('filters.yearBuilt')} 
              value={listing.year_built}
              theme="info"
            />
          )}
          {listing.property_condition && (
            <InfoItem 
              icon={Home} 
              label={t('filters.condition')} 
              value={conditionLabels[listing.property_condition] || listing.property_condition}
              theme="info"
            />
          )}
        </Section>
      )}

      {/* Rental Terms */}
      {hasRentalTerms && (
        <Section title={t('filters.rentalTerms')} icon={Banknote} theme="basic">
          {listing.deposit_amount && (
            <InfoItem 
              icon={Banknote} 
              label={t('filters.depositAmount')} 
              value={formatPrice(listing.deposit_amount, listing.currency)}
              theme="basic"
            />
          )}
          {listing.min_lease_months && (
            <InfoItem 
              icon={Clock} 
              label={t('filters.minLease')} 
              value={`${listing.min_lease_months} ${t('filters.months')}`}
              theme="basic"
            />
          )}
          {listing.internet_included && (
            <InfoItem 
              icon={Wifi} 
              label={t('filters.internetIncluded')} 
              value={internetLabels[listing.internet_included] || listing.internet_included}
              theme="basic"
            />
          )}
          {listing.utilities_included && (
            <InfoItem 
              icon={Zap} 
              label={t('filters.utilitiesIncluded')} 
              value={utilitiesLabels[listing.utilities_included] || listing.utilities_included}
              theme="basic"
            />
          )}
        </Section>
      )}
    </div>
  );
}
