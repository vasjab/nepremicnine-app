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

interface PropertyFeaturesProps {
  listing: Listing;
}

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
    detail 
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    value: boolean | null | undefined;
    detail?: string | null;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-foreground">
          {label}
          {detail && <span className="text-muted-foreground ml-1">({detail})</span>}
        </span>
      </div>
    );
  };

  // Info item for non-boolean values
  const InfoItem = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    value: string | number | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium text-foreground">{value}</p>
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

  // Check what sections to show
  const hasOutdoorFeatures = listing.has_balcony || listing.has_terrace || listing.has_garden || 
    listing.has_rooftop_terrace || listing.has_bbq_area || listing.has_playground || 
    listing.has_waterfront || listing.has_view;

  const hasParkingFeatures = listing.has_parking || listing.has_garage || listing.has_carport || 
    listing.has_ev_charging || listing.has_bicycle_storage || listing.has_storage || listing.has_basement;

  const hasBuildingAmenities = isApartmentType && (listing.has_elevator || listing.has_shared_laundry || 
    listing.has_gym || listing.has_sauna || listing.has_pool || listing.has_common_room || 
    listing.has_concierge || listing.has_security);

  const hasEnergyFeatures = listing.has_fireplace || listing.has_floor_heating || 
    listing.has_district_heating || listing.has_heat_pump || listing.has_air_conditioning || 
    listing.has_ventilation || listing.has_solar_panels;

  const hasEquipment = listing.has_dishwasher || listing.has_washing_machine || listing.has_dryer;

  const hasInteriorHighlights = listing.has_high_ceilings || listing.has_large_windows || 
    listing.orientation || listing.has_smart_home || listing.has_built_in_wardrobes;

  const hasAccessibility = listing.has_step_free_access || listing.has_wheelchair_accessible || 
    listing.has_wide_doorways || listing.has_ground_floor_access || listing.has_elevator_from_garage;

  const hasSafetyFeatures = listing.has_secure_entrance || listing.has_intercom || 
    listing.has_gated_community || listing.has_fire_safety || listing.has_soundproofing;

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
      <h2 className="text-lg font-semibold text-foreground pb-3 border-b border-border/50">
        {t('listing.features')}
      </h2>
      
      {/* Basic Features */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {t('listing.basicFeatures')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FeatureItem icon={Sofa} label={t('listing.furnished')} value={listing.is_furnished} />
          <FeatureItem icon={TreePine} label={t('listing.petsAllowed')} value={listing.allows_pets} />
        </div>
      </div>

      {/* Building & Floor Info */}
      {hasBuildingFloorInfo && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t('filters.buildingFloor')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {isApartmentType && listing.floor_number != null && (
              <InfoItem 
                icon={Building2} 
                label={t('filters.floorNumber')} 
                value={listing.total_floors_building 
                  ? `${listing.floor_number} / ${listing.total_floors_building}` 
                  : listing.floor_number.toString()
                } 
              />
            )}
            {isApartmentType && (
              <FeatureItem icon={ArrowUp} label={t('listing.elevator')} value={listing.has_elevator} />
            )}
            {isHouseType && listing.property_floors != null && (
              <InfoItem 
                icon={Home} 
                label={t('filters.propertyFloors')} 
                value={listing.property_floors} 
              />
            )}
          </div>
        </div>
      )}

      {/* Outdoor & Views */}
      {hasOutdoorFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Outdoor & Views
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem 
              icon={Sun} 
              label={t('listing.balcony')} 
              value={listing.has_balcony}
              detail={listing.balcony_sqm ? `${listing.balcony_sqm} m²` : null}
            />
            <FeatureItem 
              icon={Trees} 
              label={t('listing.terrace')} 
              value={listing.has_terrace}
              detail={listing.terrace_sqm ? `${listing.terrace_sqm} m²` : null}
            />
            <FeatureItem icon={Building2} label="Rooftop Terrace" value={listing.has_rooftop_terrace} />
            <FeatureItem 
              icon={Flower2} 
              label={t('listing.garden')} 
              value={listing.has_garden}
              detail={listing.garden_sqm ? `${listing.garden_sqm} m²` : null}
            />
            <FeatureItem icon={Flame} label="BBQ Area" value={listing.has_bbq_area} />
            <FeatureItem icon={PlayCircle} label="Playground" value={listing.has_playground} />
            <FeatureItem icon={Waves} label="Waterfront" value={listing.has_waterfront} />
            <FeatureItem 
              icon={Eye} 
              label="View" 
              value={listing.has_view}
              detail={listing.view_type ? viewTypeLabels[listing.view_type] || listing.view_type : null}
            />
          </div>
        </div>
      )}

      {/* Parking & Storage */}
      {hasParkingFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Parking & Storage
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {listing.has_parking && (
              <FeatureItem 
                icon={Car} 
                label={t('listing.parking')} 
                value={listing.has_parking}
                detail={[
                  listing.parking_type ? parkingTypeLabels[listing.parking_type] || listing.parking_type : null,
                  listing.parking_spaces && listing.parking_spaces > 1 ? `${listing.parking_spaces} spaces` : null
                ].filter(Boolean).join(', ') || null}
              />
            )}
            <FeatureItem icon={Warehouse} label={t('listing.garage')} value={listing.has_garage} />
            <FeatureItem icon={SquareParking} label="Carport" value={listing.has_carport} />
            <FeatureItem icon={Zap} label="EV Charging" value={listing.has_ev_charging} />
            <FeatureItem icon={Bike} label="Bicycle Storage" value={listing.has_bicycle_storage} />
            <FeatureItem icon={Package} label={t('listing.storage')} value={listing.has_storage} />
            <FeatureItem icon={ArrowDown} label="Basement" value={listing.has_basement} />
          </div>
        </div>
      )}

      {/* Building Amenities (for apartments) */}
      {hasBuildingAmenities && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Building Amenities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={ArrowUp} label={t('listing.elevator')} value={listing.has_elevator} />
            <FeatureItem icon={Shirt} label="Shared Laundry" value={listing.has_shared_laundry} />
            <FeatureItem icon={Dumbbell} label="Gym" value={listing.has_gym} />
            <FeatureItem icon={ThermometerSun} label="Sauna" value={listing.has_sauna} />
            <FeatureItem icon={Droplets} label="Pool" value={listing.has_pool} />
            <FeatureItem icon={Sofa} label="Common Room" value={listing.has_common_room} />
            <FeatureItem icon={Bell} label="Concierge" value={listing.has_concierge} />
            <FeatureItem icon={Shield} label="Security/CCTV" value={listing.has_security} />
          </div>
        </div>
      )}

      {/* Heating, Energy & Comfort */}
      {hasEnergyFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Energy & Comfort
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={Flame} label="Fireplace" value={listing.has_fireplace} />
            <FeatureItem icon={ThermometerSun} label="Floor Heating" value={listing.has_floor_heating} />
            <FeatureItem icon={Factory} label="District Heating" value={listing.has_district_heating} />
            <FeatureItem icon={RefreshCw} label="Heat Pump" value={listing.has_heat_pump} />
            <FeatureItem icon={Wind} label={t('listing.airConditioning')} value={listing.has_air_conditioning} />
            <FeatureItem icon={Fan} label="Ventilation" value={listing.has_ventilation} />
            <FeatureItem icon={Sun} label="Solar Panels" value={listing.has_solar_panels} />
          </div>
        </div>
      )}

      {/* Equipment & Appliances */}
      {hasEquipment && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t('listing.amenities')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={Droplets} label={t('listing.dishwasher')} value={listing.has_dishwasher} />
            <FeatureItem icon={Shirt} label={t('listing.washingMachine')} value={listing.has_washing_machine} />
            <FeatureItem icon={Wind} label="Dryer" value={listing.has_dryer} />
          </div>
        </div>
      )}

      {/* Interior Highlights */}
      {hasInteriorHighlights && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Interior Highlights
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={ArrowUp} label="High Ceilings" value={listing.has_high_ceilings} />
            <FeatureItem icon={Square} label="Large Windows" value={listing.has_large_windows} />
            {listing.orientation && (
              <InfoItem 
                icon={Compass} 
                label="Orientation" 
                value={orientationLabels[listing.orientation] || listing.orientation} 
              />
            )}
            <FeatureItem icon={Smartphone} label="Smart Home" value={listing.has_smart_home} />
            <FeatureItem icon={DoorClosed} label="Built-in Wardrobes" value={listing.has_built_in_wardrobes} />
          </div>
        </div>
      )}

      {/* Accessibility */}
      {hasAccessibility && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibility
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={ArrowUp} label="Step-free Access" value={listing.has_step_free_access} />
            <FeatureItem icon={Accessibility} label="Wheelchair Accessible" value={listing.has_wheelchair_accessible} />
            <FeatureItem icon={Square} label="Wide Doorways" value={listing.has_wide_doorways} />
            <FeatureItem icon={Home} label="Ground Floor Access" value={listing.has_ground_floor_access} />
            <FeatureItem icon={ArrowUp} label="Elevator from Garage" value={listing.has_elevator_from_garage} />
          </div>
        </div>
      )}

      {/* Safety & Privacy */}
      {hasSafetyFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety & Privacy
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={Lock} label="Secure Entrance" value={listing.has_secure_entrance} />
            <FeatureItem icon={Phone} label="Intercom" value={listing.has_intercom} />
            <FeatureItem icon={Shield} label="Gated Community" value={listing.has_gated_community} />
            <FeatureItem icon={Flame} label="Fire Safety" value={listing.has_fire_safety} />
            <FeatureItem icon={VolumeX} label="Soundproofing" value={listing.has_soundproofing} />
          </div>
        </div>
      )}

      {/* Building Info */}
      {hasBuildingDetails && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t('filters.buildingInfo')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {listing.heating_type && (
              <InfoItem 
                icon={Thermometer} 
                label={t('filters.heatingType')} 
                value={heatingTypeLabels[listing.heating_type] || listing.heating_type} 
              />
            )}
            {listing.energy_rating && (
              <InfoItem 
                icon={Zap} 
                label={t('filters.energyRating')} 
                value={listing.energy_rating} 
              />
            )}
            {listing.year_built && (
              <InfoItem 
                icon={Building2} 
                label={t('filters.yearBuilt')} 
                value={listing.year_built} 
              />
            )}
            {listing.property_condition && (
              <InfoItem 
                icon={Home} 
                label={t('filters.condition')} 
                value={conditionLabels[listing.property_condition] || listing.property_condition} 
              />
            )}
          </div>
        </div>
      )}

      {/* Rental Terms */}
      {hasRentalTerms && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t('filters.rentalTerms')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {listing.deposit_amount && (
              <InfoItem 
                icon={Banknote} 
                label={t('filters.depositAmount')} 
                value={formatPrice(listing.deposit_amount, listing.currency)} 
              />
            )}
            {listing.min_lease_months && (
              <InfoItem 
                icon={Clock} 
                label={t('filters.minLease')} 
                value={`${listing.min_lease_months} ${t('filters.months')}`} 
              />
            )}
            {listing.internet_included && (
              <InfoItem 
                icon={Wifi} 
                label={t('filters.internetIncluded')} 
                value={internetLabels[listing.internet_included] || listing.internet_included} 
              />
            )}
            {listing.utilities_included && (
              <InfoItem 
                icon={Zap} 
                label={t('filters.utilitiesIncluded')} 
                value={utilitiesLabels[listing.utilities_included] || listing.utilities_included} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}