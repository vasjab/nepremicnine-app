'use client';

import { useState, useCallback, useMemo } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import {
  ArrowLeft, Heart, MapPin, Images, ChevronLeft, ChevronRight, CheckCircle,
  MessageCircle, User, ChevronDown, ChevronUp, LayoutGrid, Home, Calendar,
  Ruler, BedDouble, Bath, Building2, Flame, Zap, Clock, FileText, Sparkles,
  Info
} from 'lucide-react';
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

  // Quick highlights
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

  // Property detail rows
  const detailRows = useMemo(() => {
    const rows: { label: string; value: string; icon: typeof Home }[] = [];

    rows.push({
      label: 'Type',
      value: propertyTypeLabels[listing.property_type] || listing.property_type,
      icon: Building2,
    });

    if (listing.property_condition) {
      rows.push({
        label: t('listing.condition'),
        value: conditionLabels[listing.property_condition] || listing.property_condition,
        icon: Sparkles,
      });
    }

    if (listing.year_built) {
      rows.push({ label: t('listing.yearBuilt'), value: String(listing.year_built), icon: Calendar });
    }

    if (['apartment', 'room', 'studio'].includes(listing.property_type) && listing.floor_number != null) {
      const floorValue = listing.total_floors_building
        ? `${listing.floor_number} / ${listing.total_floors_building}`
        : String(listing.floor_number);
      rows.push({ label: t('listing.floor'), value: floorValue, icon: Building2 });
    }

    if (['house', 'villa'].includes(listing.property_type) && listing.property_floors != null) {
      rows.push({ label: t('listing.floors'), value: String(listing.property_floors), icon: Building2 });
    }

    if (listing.heating_type) {
      rows.push({
        label: t('listing.heating'),
        value: heatingTypeLabels[listing.heating_type] || listing.heating_type,
        icon: Flame,
      });
    }

    if (listing.energy_rating) {
      rows.push({ label: t('listing.energyRating'), value: listing.energy_rating, icon: Zap });
    }

    if (!isCompleted) {
      rows.push({ label: t('listing.availableFrom'), value: formatDate(listing.available_from), icon: Clock });
    }

    // Rental-specific details
    if (listing.listing_type === 'rent') {
      if (listing.deposit_amount) {
        rows.push({
          label: t('listing.deposit'),
          value: formatPrice(listing.deposit_amount, listing.currency),
          icon: Info,
        });
      }
      if (listing.min_lease_months) {
        rows.push({
          label: t('listing.minLease'),
          value: `${listing.min_lease_months} months`,
          icon: Calendar,
        });
      }
      if (listing.internet_included) {
        rows.push({
          label: t('listing.internet'),
          value: internetLabels[listing.internet_included] || listing.internet_included,
          icon: Info,
        });
      }
      if (listing.utilities_included) {
        rows.push({
          label: t('listing.utilities'),
          value: utilitiesLabels[listing.utilities_included] || listing.utilities_included,
          icon: Info,
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
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-[10px] bg-white/92 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:bg-white transition-all duration-150 active:scale-95 touch-target"
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
            "fixed top-4 right-4 z-50 h-10 w-10 rounded-[10px] bg-white/92 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:bg-white transition-all duration-150 active:scale-95 touch-target",
            isSaved && "text-rose-500"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Navigation arrows */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-[10px] bg-white/92 backdrop-blur-md text-gray-700 hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] z-10 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-150 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-[10px] bg-white/92 backdrop-blur-md text-gray-700 hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] z-10 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-150 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Bottom overlay with type badge + image counter */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10">
              <div className="flex items-end justify-between pointer-events-auto">
                <div>
                  {isCompleted ? (
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg",
                      listing.status === 'sold'
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                        : "bg-gradient-to-r from-emerald-400 to-green-600 text-white"
                    )}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      {statusLabel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-white/95 backdrop-blur-md text-gray-700 text-[11px] font-bold uppercase tracking-wider shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                      {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setScrollToFloorPlan(false); setShowGallery(true); }}
                  className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-[10px] text-[11px] font-bold hover:bg-white transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                >
                  <Images className="h-3.5 w-3.5" />
                  {currentImageIndex + 1}/{listing.images.length}
                </button>
              </div>
            </div>

            {/* Dot indicators */}
            {listing.images.length > 1 && listing.images.length <= 8 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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
        "container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 delay-100",
        isAnimating && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 py-8 sm:py-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{listing.address}, {listing.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-3">
                {listing.title}
              </h1>

              {/* Key specs */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-gray-50 px-3 py-2 text-[13px] font-semibold text-gray-700">
                  <BedDouble className="h-4 w-4 text-gray-400" />
                  {listing.bedrooms} {t('listing.bedrooms')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-gray-50 px-3 py-2 text-[13px] font-semibold text-gray-700">
                  <Bath className="h-4 w-4 text-gray-400" />
                  {listing.bathrooms} {t('listing.bathrooms')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-gray-50 px-3 py-2 text-[13px] font-semibold text-gray-700">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  {formatArea(listing.area_sqm)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-gray-50 px-3 py-2 text-[13px] font-semibold text-gray-700">
                  <Home className="h-4 w-4 text-gray-400" />
                  {propertyTypeLabels[listing.property_type] || listing.property_type}
                </span>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((h) => (
                    <span key={h} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Floor plan link */}
              {(listing.floor_plan_urls?.length > 0 || listing.floor_plan_url) && (
                <button
                  onClick={() => { setScrollToFloorPlan(true); setShowGallery(true); }}
                  className="flex items-center gap-1.5 text-sm text-gray-900 font-medium mt-3 hover:underline underline-offset-4"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {t('listing.floorPlan')}
                </button>
              )}
            </div>

            {/* Mobile price + CTA card */}
            <div className="lg:hidden glass-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    {!isCompleted ? (
                      <>
                        <p className="text-2xl font-extrabold text-foreground tracking-tight">
                          {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                        </p>
                        {listing.area_sqm && listing.area_sqm > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft\u00B2' : 'm\u00B2'}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-600 text-sm uppercase tracking-wider">
                          {statusLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isCompleted && (
                    <Button
                      variant="gradient"
                      size="sm"
                      className="shrink-0 rounded-xl h-11 px-5"
                      disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                      onClick={handleContactLandlord}
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Description card */}
            {listing.description && (
              <div className="glass-card overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">{t('listing.description')}</h2>
                </div>
                <div className="px-5 py-5">
                  <div className="text-gray-600 whitespace-pre-line leading-[1.7] text-[15px]">
                    {showFullDescription || listing.description.length <= 400 ? (
                      <>
                        <p>{listing.description}</p>
                        {listing.description.length > 400 && (
                          <button
                            className="mt-3 text-sm font-semibold text-gray-900 hover:underline underline-offset-4"
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
                          className="mt-3 text-sm font-semibold text-gray-900 hover:underline underline-offset-4"
                          onClick={() => setShowFullDescription(true)}
                        >
                          Read more
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Property Details card */}
            {detailRows.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100">
                    <Info className="h-4 w-4 text-gray-500" />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">Property Details</h2>
                </div>
                <div className="px-5 py-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {detailRows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                        <dt className="text-sm text-gray-500">{row.label}</dt>
                        <dd className="text-sm font-semibold text-gray-900 text-right">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Features & Amenities card */}
            {featureCount > 0 && (
              <div className="glass-card overflow-hidden">
                <button
                  className="flex items-center justify-between w-full px-5 py-4 border-b border-gray-100"
                  onClick={() => setShowFeatures(!showFeatures)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100">
                      <Sparkles className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">
                        {t('listing.features')}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">{featureCount} amenities available</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-gray-900 font-medium">
                    {showFeatures ? 'Hide' : 'Show all'}
                    {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {showFeatures && (
                  <div className="px-5 py-5 animate-fade-in">
                    <PropertyFeatures listing={listing} />
                  </div>
                )}
              </div>
            )}

            {/* Location card */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">{t('listing.location')}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{listing.address}, {listing.city}</p>
                </div>
              </div>
              <div className="p-0">
                <div className="h-[300px] sm:h-[360px]">
                  <ListingLocationMap
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    address={listing.address}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="glass-card overflow-hidden">
                {!isCompleted ? (
                  <div className="p-6">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      {propertyTypeLabels[listing.property_type]} &middot; {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                    </p>
                    <p className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                      {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                    </p>
                    {listing.area_sqm && listing.area_sqm > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft\u00B2' : 'm\u00B2'}
                      </p>
                    )}
                    {listingStats && (
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {listingStats.daysListed > 0 ? `Listed ${listingStats.daysListed} days ago` : 'Listed today'} &middot; {listingStats.viewCount} views
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {statusLabel}
                      </span>
                      {formattedCompletedDate && (
                        <span className="text-xs text-emerald-600/70">
                          {formattedCompletedDate}
                        </span>
                      )}
                    </div>
                    {listing.final_price ? (
                      <>
                        <p className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                          {formatPrice(listing.final_price, listing.currency, {
                            isRental: listing.listing_type === 'rent',
                            showPeriod: listing.listing_type === 'rent'
                          })}
                        </p>
                        <p className="text-sm text-gray-400 line-through mt-1">
                          {formatPrice(listing.price, listing.currency, {
                            isRental: listing.listing_type === 'rent',
                            showPeriod: listing.listing_type === 'rent'
                          })}
                        </p>
                        {priceDifferencePercent !== null && Math.abs(priceDifferencePercent) > 0.5 && (
                          <span className={cn(
                            "inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
                            priceDifferencePercent > 0
                              ? "bg-red-100/80 text-red-800 border border-red-200/60"
                              : "bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
                          )}>
                            {priceDifferencePercent > 0 ? '+' : ''}{priceDifferencePercent.toFixed(1)}%
                          </span>
                        )}
                      </>
                    ) : (
                      <p className="text-xl font-bold text-emerald-700">
                        {formatPrice(listing.price, listing.currency, {
                          isRental: listing.listing_type === 'rent',
                          showPeriod: listing.listing_type === 'rent'
                        })}
                      </p>
                    )}
                  </div>
                )}

                <div className="p-6 pt-0 space-y-3 mt-0">
                  {!isCompleted && (
                    <>
                      <div className="pt-4" />
                      <Button
                        variant="gradient"
                        className="w-full h-12 text-[15px] font-semibold rounded-xl"
                        disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                        onClick={handleContactLandlord}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold rounded-xl border-black/[0.08] hover:border-black/[0.12]"
                    onClick={handleSaveClick}
                  >
                    <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-rose-500')} />
                    {user ? (isSaved ? t('common.saved') : t('listing.saveListing')) : t('listing.signInToSave')}
                  </Button>

                  {listing.user_id && (
                    <button
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-50"
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
        </div>

        {/* Similar Listings */}
        {showSimilar && (
          <div className="mt-12 pt-8 border-t border-black/[0.06]">
            <SimilarListings listing={listing} />
          </div>
        )}

        {/* Recently Viewed */}
        {showRecentlyViewed && (
          <div className="mt-10 pt-8 border-t border-black/[0.06] pb-10">
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
