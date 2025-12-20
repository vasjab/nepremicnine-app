import { Check, X, Building2, Car, TreePine, Thermometer, Home, Wifi, Zap, Clock, Banknote } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';

interface PropertyFeaturesProps {
  listing: Listing;
}

export function PropertyFeatures({ listing }: PropertyFeaturesProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();

  const isApartmentType = ['apartment', 'room', 'studio'].includes(listing.property_type);
  const isHouseType = ['house', 'villa'].includes(listing.property_type);
  const isRental = listing.listing_type === 'rent';

  // Check if there are any building/floor features to show
  const hasBuildingInfo = isApartmentType 
    ? (listing.floor_number != null || listing.has_elevator)
    : (isHouseType && listing.property_floors != null);

  // Check if there are any outdoor features
  const hasOutdoorFeatures = listing.has_balcony || listing.has_terrace || listing.has_garden;

  // Check if there are any parking features
  const hasParkingFeatures = listing.has_parking || listing.has_garage;

  // Check if there are any amenities
  const hasAmenities = listing.has_air_conditioning || listing.has_dishwasher || listing.has_washing_machine || listing.has_storage;

  // Check if there are any building info features
  const hasBuildingDetails = listing.heating_type || listing.energy_rating || listing.year_built || listing.property_condition;

  // Check if there are any rental terms
  const hasRentalTerms = isRental && (listing.deposit_amount || listing.min_lease_months || listing.internet_included || listing.utilities_included);

  const FeatureItem = ({ value, label }: { value: boolean | null | undefined; label: string }) => (
    <div className="flex items-center gap-2">
      {value ? (
        <Check className="h-5 w-5 text-success" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground" />
      )}
      <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium text-foreground">{value}</p>
        </div>
      </div>
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-lg font-semibold text-foreground pb-3 border-b border-border/50">{t('listing.features')}</h2>
      
      {/* Basic Features */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('listing.basicFeatures')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <FeatureItem value={listing.is_furnished} label={t('listing.furnished')} />
          <FeatureItem value={listing.allows_pets} label={t('listing.petsAllowed')} />
        </div>
      </div>

      {/* Building & Floor Info */}
      {hasBuildingInfo && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('filters.buildingFloor')}</h3>
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
              <FeatureItem value={listing.has_elevator} label={t('listing.elevator')} />
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

      {/* Outdoor Features */}
      {hasOutdoorFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('filters.outdoor')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {listing.has_balcony && (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="text-foreground">
                  {t('listing.balcony')}
                  {listing.balcony_sqm && ` (${listing.balcony_sqm} m²)`}
                </span>
              </div>
            )}
            {listing.has_terrace && (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="text-foreground">
                  {t('listing.terrace')}
                  {listing.terrace_sqm && ` (${listing.terrace_sqm} m²)`}
                </span>
              </div>
            )}
            {listing.has_garden && (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="text-foreground">
                  {t('listing.garden')}
                  {listing.garden_sqm && ` (${listing.garden_sqm} m²)`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parking */}
      {hasParkingFeatures && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('filters.parking')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {listing.has_parking && (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="text-foreground">
                  {t('listing.parking')}
                  {listing.parking_type && ` (${parkingTypeLabels[listing.parking_type] || listing.parking_type})`}
                  {listing.parking_spaces && listing.parking_spaces > 1 && ` - ${listing.parking_spaces} ${t('listing.spaces')}`}
                </span>
              </div>
            )}
            <FeatureItem value={listing.has_garage} label={t('listing.garage')} />
          </div>
        </div>
      )}

      {/* Amenities */}
      {hasAmenities && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('listing.amenities')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem value={listing.has_air_conditioning} label={t('listing.airConditioning')} />
            <FeatureItem value={listing.has_dishwasher} label={t('listing.dishwasher')} />
            <FeatureItem value={listing.has_washing_machine} label={t('listing.washingMachine')} />
            <FeatureItem value={listing.has_storage} label={t('listing.storage')} />
          </div>
        </div>
      )}

      {/* Building Info */}
      {hasBuildingDetails && (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('filters.buildingInfo')}</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t('filters.rentalTerms')}</h3>
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
