'use client';

import { useState, useCallback, useMemo } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { ArrowLeft, Heart, MapPin, Images, ChevronLeft, ChevronRight, CheckCircle, MessageCircle, User, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { useGetOrCreateConversation } from '@/hooks/useMessaging';
import { useSwipe } from '@/hooks/useSwipe';
import { useListingStats } from '@/hooks/useListingStats';
import { Button } from '@/components/ui/button';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { ListingLocationMap } from '@/components/ListingLocationMap';
import { PropertyFeatures } from '@/components/PropertyFeatures';
import { SimilarListings } from '@/components/SimilarListings';
import { RecentlyViewedListings } from '@/components/RecentlyViewedListings';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useToast } from '@/hooks/use-toast';

export interface ListingDetailContentProps {
  listing: Listing;
  onClose: () => void;
  isModal?: boolean;
  showSimilar?: boolean;
  showRecentlyViewed?: boolean;
  isAnimating?: boolean;
  isClosing?: boolean;
}

export function ListingDetailContent({
  listing,
  onClose,
  isModal = false,
  showSimilar = true,
  showRecentlyViewed = true,
  isAnimating = true,
  isClosing = false,
}: ListingDetailContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { formatPrice, formatArea, areaUnit } = useFormattedPrice();
  const { data: isSaved } = useIsListingSaved(user?.id, listing.id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const getOrCreateConversation = useGetOrCreateConversation();
  const { toast } = useToast();
  const { data: listingStats } = useListingStats(listing.id, listing.created_at);

  const [showGallery, setShowGallery] = useState(false);
  const [scrollToFloorPlan, setScrollToFloorPlan] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const goToPrevImage = useCallback(() => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images!.length - 1 : prev - 1
      );
    }
  }, [listing.images]);

  const goToNextImage = useCallback(() => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  }, [listing.images]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextImage,
    onSwipeRight: goToPrevImage,
    minSwipeDistance: 50,
  });

  const handleSaveClick = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (isSaved) {
      unsaveListing.mutate({ userId: user.id, listingId: listing.id });
    } else {
      saveListing.mutate({ userId: user.id, listingId: listing.id });
    }
  };

  const handleContactLandlord = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!listing.user_id) {
      toast({ variant: 'destructive', title: 'Unable to contact', description: 'This listing has no owner' });
      return;
    }
    try {
      const data = await getOrCreateConversation.mutateAsync({
        listingId: listing.id,
        renterId: user.id,
        landlordId: listing.user_id,
      });
      if (isModal) onClose();
      router.push(`/messages?conversation=${data.id}`);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start conversation' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('listing.flexible');
    return new Date(dateString).toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCompleted = listing.status === 'sold' || listing.status === 'rented';
  const completedDate = listing.completed_at ? new Date(listing.completed_at) : null;
  const completedDaysAgo = completedDate ? differenceInDays(new Date(), completedDate) : 0;
  const statusLabel = listing.status === 'sold' ? t('listing.sold') : t('listing.rented');
  const formattedCompletedDate = completedDate
    ? completedDaysAgo <= 30
      ? formatDistanceToNow(completedDate, { addSuffix: true }).replace('about ', '')
      : format(completedDate, 'MMM d, yyyy')
    : null;

  const priceDifferencePercent = listing.final_price && listing.price
    ? ((listing.final_price - listing.price) / listing.price) * 100
    : null;

  const propertyTypeLabels: Record<string, string> = {
    apartment: t('propertyTypes.apartment'),
    house: t('propertyTypes.house'),
    room: t('propertyTypes.room'),
    studio: t('propertyTypes.studio'),
    villa: t('propertyTypes.villa'),
    other: t('propertyTypes.other'),
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
    yes: t('listing.included'),
    no: t('listing.notIncluded'),
    available: 'Available',
  };

  const utilitiesLabels: Record<string, string> = {
    yes: t('listing.included'),
    no: t('listing.notIncluded'),
    partial: t('listing.partiallyIncluded'),
  };

  // Quick highlights — key features shown as text under header
  const highlights = useMemo(() => {
    const items: string[] = [];
    if (listing.is_furnished) items.push(t('listing.furnished'));
    if (listing.allows_pets) items.push(t('listing.petsAllowed'));
    if (listing.has_balcony) items.push(t('listing.balcony'));
    if (listing.has_terrace) items.push(t('listing.terrace'));
    if (listing.has_garden) items.push(t('listing.garden'));
    if (listing.has_parking) items.push(t('listing.parking'));
    if (listing.has_garage) items.push(t('listing.garage'));
    if (listing.has_elevator) items.push(t('listing.elevator'));
    if (listing.has_air_conditioning) items.push('A/C');
    if (listing.has_view) items.push('View');
    return items.slice(0, 6);
  }, [listing, t]);

  // Count all boolean features for the collapsible section
  const featureCount = useMemo(() => {
    return [
      listing.is_furnished, listing.allows_pets,
      listing.has_balcony, listing.has_terrace, listing.has_garden, listing.has_rooftop_terrace,
      listing.has_bbq_area, listing.has_playground, listing.has_waterfront, listing.has_view,
      listing.has_parking, listing.has_garage, listing.has_carport, listing.has_ev_charging,
      listing.has_bicycle_storage, listing.has_storage, listing.has_basement,
      listing.has_elevator, listing.has_shared_laundry, listing.has_gym, listing.has_sauna,
      listing.has_pool, listing.has_common_room, listing.has_concierge, listing.has_security,
      listing.has_fireplace, listing.has_floor_heating, listing.has_district_heating,
      listing.has_heat_pump, listing.has_air_conditioning, listing.has_ventilation, listing.has_solar_panels,
      listing.has_dishwasher, listing.has_washing_machine, listing.has_dryer,
      listing.has_high_ceilings, listing.has_large_windows, listing.has_smart_home, listing.has_built_in_wardrobes,
      listing.has_step_free_access, listing.has_wheelchair_accessible, listing.has_wide_doorways,
      listing.has_ground_floor_access, listing.has_elevator_from_garage,
      listing.has_secure_entrance, listing.has_intercom, listing.has_alarm_system, listing.has_cctv,
      listing.has_gated_community, listing.has_fire_safety, listing.has_soundproofing,
    ].filter(Boolean).length;
  }, [listing]);

  // Property detail rows — structured key:value table
  const detailRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];

    rows.push({
      label: 'Type',
      value: propertyTypeLabels[listing.property_type] || listing.property_type,
    });

    if (listing.property_condition) {
      rows.push({
        label: t('listing.condition'),
        value: conditionLabels[listing.property_condition] || listing.property_condition,
      });
    }

    if (listing.year_built) {
      rows.push({ label: t('listing.yearBuilt'), value: String(listing.year_built) });
    }

    if (['apartment', 'room', 'studio'].includes(listing.property_type) && listing.floor_number != null) {
      const floorValue = listing.total_floors_building
        ? `${listing.floor_number} / ${listing.total_floors_building}`
        : String(listing.floor_number);
      rows.push({ label: t('listing.floor'), value: floorValue });
    }

    if (['house', 'villa'].includes(listing.property_type) && listing.property_floors != null) {
      rows.push({ label: t('listing.floors'), value: String(listing.property_floors) });
    }

    if (listing.heating_type) {
      rows.push({
        label: t('listing.heating'),
        value: heatingTypeLabels[listing.heating_type] || listing.heating_type,
      });
    }

    if (listing.energy_rating) {
      rows.push({ label: t('listing.energyRating'), value: listing.energy_rating });
    }

    if (!isCompleted) {
      rows.push({ label: t('listing.availableFrom'), value: formatDate(listing.available_from) });
    }

    // Rental-specific details
    if (listing.listing_type === 'rent') {
      if (listing.deposit_amount) {
        rows.push({
          label: t('listing.deposit'),
          value: formatPrice(listing.deposit_amount, listing.currency),
        });
      }
      if (listing.min_lease_months) {
        rows.push({
          label: t('listing.minLease'),
          value: `${listing.min_lease_months} months`,
        });
      }
      if (listing.internet_included) {
        rows.push({
          label: t('listing.internet'),
          value: internetLabels[listing.internet_included] || listing.internet_included,
        });
      }
      if (listing.utilities_included) {
        rows.push({
          label: t('listing.utilities'),
          value: utilitiesLabels[listing.utilities_included] || listing.utilities_included,
        });
      }
    }

    return rows;
  }, [listing, t, formatPrice, isCompleted]);

  return (
    <>
      {/* Back button */}
      {!isModal && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 h-11 w-11 rounded-full glass-strong shadow-float transition-all duration-200 touch-target"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Save button */}
      {!isModal && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-4 right-4 z-50 h-11 w-11 rounded-full glass-strong shadow-float transition-all duration-200 touch-target",
            isSaved && "text-accent"
          )}
          onClick={handleSaveClick}
        >
          <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
        </Button>
      )}

      {/* Image gallery */}
      <div
        className={cn(
          "relative h-[45vh] sm:h-[55vh] lg:h-[60vh] bg-muted group select-none overflow-hidden",
          "transition-transform duration-500",
          isAnimating && !isClosing ? "translate-y-0" : "translate-y-4",
          listing.images && listing.images.length > 0 && "cursor-pointer"
        )}
        onClick={() => {
          if (listing.images && listing.images.length > 0) setShowGallery(true);
        }}
        {...(listing.images && listing.images.length > 1 ? swipeHandlers : {})}
      >
        {listing.images && listing.images.length > 0 ? (
          <>
            {listing.images.length > 1 && (
              <>
                <link rel="prefetch" href={listing.images[(currentImageIndex + 1) % listing.images.length]} />
                <link rel="prefetch" href={listing.images[(currentImageIndex - 1 + listing.images.length) % listing.images.length]} />
              </>
            )}

            <div className="relative w-full h-full overflow-hidden">
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {listing.images.map((image, index) => (
                  <div key={index} className="relative h-full flex-shrink-0" style={{ minWidth: '100%' }}>
                    <img
                      src={image}
                      alt={`${listing.title} - Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/10 pointer-events-none" />
            </div>

            {/* Navigation arrows */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 shadow-lg z-10 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 shadow-lg z-10 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10">
              <div className="flex items-end justify-between pointer-events-auto">
                <div>
                  {isCompleted ? (
                    <span className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      listing.status === 'sold' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {statusLabel}
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                      {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setScrollToFloorPlan(false); setShowGallery(true); }}
                  className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
                >
                  <Images className="h-3.5 w-3.5" />
                  {currentImageIndex + 1}/{listing.images.length}
                </button>
              </div>
            </div>

            {/* Dot indicators */}
            {listing.images.length > 1 && listing.images.length <= 8 && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentImageIndex ? "bg-white w-5" : "bg-white/50 w-1.5 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <div className="text-center">
              <Images className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <span className="text-muted-foreground text-sm">{t('listing.noImagesAvailable')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "container mx-auto px-4 sm:px-6 transition-all duration-500 delay-100",
        isAnimating && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10 py-6 sm:py-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{listing.address}, {listing.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-2">
                {listing.title}
              </h1>
              <p className="text-muted-foreground">
                {listing.bedrooms} {t('listing.bedrooms')} · {listing.bathrooms} {t('listing.bathrooms')} · {formatArea(listing.area_sqm)}
                {' · '}{propertyTypeLabels[listing.property_type] || listing.property_type}
              </p>
              {highlights.length > 0 && (
                <p className="text-sm text-accent font-medium mt-2">
                  {highlights.join(' · ')}
                </p>
              )}
              {/* Floor plan link */}
              {(listing.floor_plan_urls?.length > 0 || listing.floor_plan_url) && (
                <button
                  onClick={() => { setScrollToFloorPlan(true); setShowGallery(true); }}
                  className="flex items-center gap-1.5 text-sm text-accent font-medium mt-2 hover:underline underline-offset-4"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {t('listing.floorPlan')}
                </button>
              )}
            </div>

            {/* Mobile price + CTA */}
            <div className="lg:hidden p-4 bg-card rounded-2xl border border-border/40">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {!isCompleted ? (
                    <>
                      <p className="text-xl font-extrabold text-foreground tracking-tight truncate">
                        {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                      </p>
                      {listing.area_sqm && listing.area_sqm > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider">
                        {statusLabel}
                      </span>
                    </div>
                  )}
                </div>
                {!isCompleted && (
                  <Button
                    variant="accent"
                    size="sm"
                    className="shrink-0 rounded-xl shadow-sm shadow-accent/20"
                    disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                    onClick={handleContactLandlord}
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Contact
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-2">{t('listing.description')}</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed text-[15px]">
                  {showFullDescription || listing.description.length <= 400 ? (
                    <>
                      <p>{listing.description}</p>
                      {listing.description.length > 400 && (
                        <button
                          className="mt-2 text-sm font-semibold text-accent hover:underline underline-offset-4"
                          onClick={() => setShowFullDescription(false)}
                        >
                          Show less
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p>{listing.description.slice(0, 400)}...</p>
                      <button
                        className="mt-2 text-sm font-semibold text-accent hover:underline underline-offset-4"
                        onClick={() => setShowFullDescription(true)}
                      >
                        Read more
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-border/30" />

            {/* Property Details */}
            {detailRows.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-3">Property Details</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  {detailRows.map((row) => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-border/20">
                      <dt className="text-sm text-muted-foreground">{row.label}</dt>
                      <dd className="text-sm font-medium text-foreground text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Features & Amenities — collapsible */}
            {featureCount > 0 && (
              <>
                <div className="border-t border-border/30" />
                <div>
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowFeatures(!showFeatures)}
                  >
                    <h2 className="text-base font-semibold text-foreground">
                      {t('listing.features')}
                      <span className="text-muted-foreground font-normal ml-1.5 text-sm">({featureCount})</span>
                    </h2>
                    <span className="text-sm text-accent font-medium flex items-center gap-1">
                      {showFeatures ? 'Hide' : 'Show all'}
                      {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  {showFeatures && (
                    <div className="mt-4 animate-fade-in">
                      <PropertyFeatures listing={listing} />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="border-t border-border/30" />

            {/* Location */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">{t('listing.location')}</h2>
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <ListingLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  address={listing.address}
                />
              </div>
              <p className="flex items-center gap-1.5 mt-2.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {listing.address}, {listing.city}
              </p>
            </div>
          </div>

          {/* Sidebar — hidden on mobile (mobile CTA is inline above) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 bg-card rounded-2xl border border-border/40 overflow-hidden">
              {/* Price header */}
              {!isCompleted ? (
                <div className="p-6 border-b border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {propertyTypeLabels[listing.property_type]} · {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                  </p>
                  <p className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                    {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                  </p>
                  {listing.area_sqm && listing.area_sqm > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                    </p>
                  )}
                  {listingStats && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {listingStats.daysListed > 0 ? `Listed ${listingStats.daysListed} days ago` : 'Listed today'} · {listingStats.viewCount} views
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 border-b border-border/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase text-xs tracking-wider">
                      {statusLabel}
                    </span>
                    {formattedCompletedDate && (
                      <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        · {formattedCompletedDate}
                      </span>
                    )}
                  </div>
                  {listing.final_price ? (
                    <>
                      <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
                        {formatPrice(listing.final_price, listing.currency, {
                          isRental: listing.listing_type === 'rent',
                          showPeriod: listing.listing_type === 'rent'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground line-through mt-1">
                        {formatPrice(listing.price, listing.currency, {
                          isRental: listing.listing_type === 'rent',
                          showPeriod: listing.listing_type === 'rent'
                        })}
                      </p>
                      {priceDifferencePercent !== null && Math.abs(priceDifferencePercent) > 0.5 && (
                        <span className={cn(
                          "inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                          priceDifferencePercent > 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}>
                          {priceDifferencePercent > 0 ? '+' : ''}{priceDifferencePercent.toFixed(1)}%
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {formatPrice(listing.price, listing.currency, {
                        isRental: listing.listing_type === 'rent',
                        showPeriod: listing.listing_type === 'rent'
                      })}
                    </p>
                  )}
                </div>
              )}

              <div className="p-6 space-y-3">
                <Button
                  variant="accent"
                  className="w-full h-12 text-[15px] font-semibold rounded-xl shadow-sm shadow-accent/20"
                  disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                  onClick={handleContactLandlord}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-[15px] font-semibold rounded-xl"
                  onClick={handleSaveClick}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                  {user ? (isSaved ? t('common.saved') : t('listing.saveListing')) : t('listing.signInToSave')}
                </Button>

                {listing.user_id && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => router.push(`/landlord/${listing.user_id}`)}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">View landlord profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {showSimilar && (
          <div className="mt-10 pt-8 border-t border-border/30">
            <SimilarListings listing={listing} />
          </div>
        )}

        {/* Recently Viewed */}
        {showRecentlyViewed && (
          <div className="mt-8 pt-8 border-t border-border/30 pb-8">
            <RecentlyViewedListings excludeListingId={listing.id} limit={6} />
          </div>
        )}
      </div>

      {/* Image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={listing.floor_plan_url}
        floorPlanUrls={listing.floor_plan_urls || []}
        isOpen={showGallery}
        onClose={() => { setShowGallery(false); setScrollToFloorPlan(false); }}
        title={listing.title}
        initialScrollToFloorPlan={scrollToFloorPlan}
      />
    </>
  );
}
