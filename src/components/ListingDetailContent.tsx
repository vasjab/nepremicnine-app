'use client';

import { useState, useCallback } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { ArrowLeft, Heart, MapPin, Bed, Bath, Square, Calendar, Images, ChevronLeft, ChevronRight, LayoutGrid, ExternalLink, CheckCircle, Eye, Clock, MessageCircle, Flame, User } from 'lucide-react';
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
import { FeatureHighlightBadges } from '@/components/FeatureHighlightBadges';
import { SimilarListings } from '@/components/SimilarListings';
import { RecentlyViewedListings } from '@/components/RecentlyViewedListings';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      if (isModal) {
        onClose();
      }
      router.push(`/messages?conversation=${data.id}`);
    } catch (error) {
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

  // Format completed date for sold/rented listings
  const isCompleted = listing.status === 'sold' || listing.status === 'rented';
  const completedDate = listing.completed_at ? new Date(listing.completed_at) : null;
  const completedDaysAgo = completedDate ? differenceInDays(new Date(), completedDate) : 0;
  const statusLabel = listing.status === 'sold' ? t('listing.sold') : t('listing.rented');
  const formattedCompletedDate = completedDate 
    ? completedDaysAgo <= 30 
      ? formatDistanceToNow(completedDate, { addSuffix: true }).replace('about ', '')
      : format(completedDate, 'MMM d, yyyy')
    : null;

  // Calculate price difference for sold/rented listings
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

  return (
    <>
      {/* Back button - only render here for non-modal view (modal has its own fixed button) */}
      {!isModal && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-4 left-4 z-50 h-11 w-11 rounded-full glass-strong",
            "hover:scale-105 active:scale-95",
            "shadow-float transition-all duration-200",
            "touch-target"
          )}
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Save button - fixed top right */}
      {!isModal && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-4 right-4 z-50 h-11 w-11 rounded-full glass-strong",
            "hover:scale-105 active:scale-95",
            "shadow-float transition-all duration-200",
            "touch-target",
            isSaved && "text-accent"
          )}
          onClick={handleSaveClick}
        >
          <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
        </Button>
      )}

      {/* Image gallery preview */}
      <div
        className={cn(
          "relative h-[45vh] sm:h-[55vh] lg:h-[60vh] bg-muted group select-none overflow-hidden",
          "transition-transform duration-500",
          isAnimating && !isClosing ? "translate-y-0" : "translate-y-4",
          listing.images && listing.images.length > 0 && "cursor-pointer"
        )}
        onClick={() => {
          if (listing.images && listing.images.length > 0) {
            setShowGallery(true);
          }
        }}
        {...(listing.images && listing.images.length > 1 ? swipeHandlers : {})}
      >
        {listing.images && listing.images.length > 0 ? (
          <>
            {/* Preload adjacent images */}
            {listing.images.length > 1 && (
              <>
                <link rel="prefetch" href={listing.images[(currentImageIndex + 1) % listing.images.length]} />
                <link rel="prefetch" href={listing.images[(currentImageIndex - 1 + listing.images.length) % listing.images.length]} />
              </>
            )}

            <div className="relative w-full h-full overflow-hidden">
              {/* Sliding images container */}
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-full flex-shrink-0"
                    style={{ minWidth: '100%' }}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Photo ${index + 1}`}
                      className={cn(
                        "w-full h-full object-cover",
                        "group-hover:scale-[1.02] transition-transform duration-700"
                      )}
                    />
                  </div>
                ))}
              </div>
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/10 pointer-events-none" />
            </div>

            {/* Navigation arrows */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full",
                    "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 shadow-lg z-10",
                    "opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200",
                    "hover:scale-110 active:scale-95"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full",
                    "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 shadow-lg z-10",
                    "opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200",
                    "hover:scale-110 active:scale-95"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Bottom overlay with image counter and dots */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10">
              <div className="flex items-end justify-between pointer-events-auto">
                {/* Type badge */}
                <div>
                  {listing.status === 'sold' || listing.status === 'rented' ? (
                    <span className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      listing.status === 'sold' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {listing.status === 'sold' ? t('listing.sold') : t('listing.rented')}
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                      {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                    </span>
                  )}
                </div>

                {/* Image counter pill */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setScrollToFloorPlan(false);
                    setShowGallery(true);
                  }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentImageIndex
                        ? "bg-white w-5"
                        : "bg-white/50 w-1.5 hover:bg-white/70"
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
        {/* Quick action buttons - Floor plan & All images */}
        {listing.images && listing.images.length > 0 && (
          <div className="flex flex-row gap-2 py-4 border-b border-border/30">
            {(listing.floor_plan_urls?.length > 0 || listing.floor_plan_url) && (
              <button
                onClick={() => {
                  setScrollToFloorPlan(true);
                  setShowGallery(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full",
                  "text-sm font-medium text-foreground",
                  "bg-secondary/70 hover:bg-secondary border border-border/40",
                  "active:scale-95 transition-all duration-200 touch-target"
                )}
              >
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                {t('listing.floorPlan')}
              </button>
            )}
            {listing.images.length > 1 && (
              <button
                onClick={() => {
                  setScrollToFloorPlan(false);
                  setShowGallery(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full",
                  "text-sm font-medium text-foreground",
                  "bg-secondary/70 hover:bg-secondary border border-border/40",
                  "active:scale-95 transition-all duration-200 touch-target"
                )}
              >
                <Images className="h-4 w-4 text-muted-foreground" />
                {t('listing.allPhotos') || `All ${listing.images.length} photos`}
              </button>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10 py-6 sm:py-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{listing.address}, {listing.city}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {listing.title}
              </h1>
            </div>

            {/* Quick stats - pill style */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
              <div className="bg-secondary/60 rounded-2xl p-4 text-center hover:bg-secondary transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 mb-2">
                  <Bed className="h-5 w-5 text-accent" />
                </div>
                <p className="text-lg font-bold text-foreground">{listing.bedrooms}</p>
                <p className="text-xs text-muted-foreground">{t('listing.bedrooms')}</p>
              </div>
              <div className="bg-secondary/60 rounded-2xl p-4 text-center hover:bg-secondary transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mb-2">
                  <Bath className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-foreground">{listing.bathrooms}</p>
                <p className="text-xs text-muted-foreground">{t('listing.bathrooms')}</p>
              </div>
              <div className="bg-secondary/60 rounded-2xl p-4 text-center hover:bg-secondary transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 mb-2">
                  <Square className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-foreground">{formatArea(listing.area_sqm)}</p>
                <p className="text-xs text-muted-foreground">{t('listing.area')}</p>
              </div>
              {isCompleted && formattedCompletedDate ? (
                <div className="bg-secondary/60 rounded-2xl p-4 text-center hover:bg-secondary transition-colors">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 mb-2">
                    <CheckCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{formattedCompletedDate}</p>
                  <p className="text-xs text-muted-foreground">{statusLabel}</p>
                </div>
              ) : (
                <div className="bg-secondary/60 rounded-2xl p-4 text-center hover:bg-secondary transition-colors">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 mb-2">
                    <Calendar className="h-5 w-5 text-violet-500" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatDate(listing.available_from)}</p>
                  <p className="text-xs text-muted-foreground">{t('listing.available')}</p>
                </div>
              )}
            </div>

            {/* Feature Highlight Badges */}
            <FeatureHighlightBadges listing={listing} maxBadges={8} />

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 tracking-tight">{t('listing.description')}</h2>
                {listing.description.length > 500 ? (
                  <>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-[15px]">
                      {listing.description.slice(0, 500)}...
                    </p>
                    <button
                      className="mt-3 text-sm font-semibold text-accent hover:underline underline-offset-4 transition-colors"
                      onClick={() => setShowFullDescription(true)}
                    >
                      {t('listing.readMore') || 'Read more'}
                    </button>
                  </>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-[15px]">{listing.description}</p>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Property Features */}
            <PropertyFeatures listing={listing} />

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Location Map */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 tracking-tight">{t('listing.location')}</h2>
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <ListingLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  address={listing.address}
                />
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {listing.address}, {listing.city}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={cn(
              "sticky top-6 bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden",
              "transition-all duration-300"
            )}>
              {/* Price header with accent gradient */}
              {!isCompleted ? (
                <div className="bg-gradient-to-br from-accent/5 via-accent/3 to-transparent p-6 border-b border-border/30">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                    {propertyTypeLabels[listing.property_type]} · {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
                  </p>
                  <p className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                    {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                  </p>
                  {listing.area_sqm && listing.area_sqm > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/30 dark:to-emerald-950/10 p-6 border-b border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase text-xs tracking-wider">
                      {statusLabel}
                    </span>
                  </div>
                  {formattedCompletedDate && (
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-2">
                      {formattedCompletedDate}
                    </p>
                  )}
                  {listing.final_price ? (
                    <>
                      <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
                        {formatPrice(listing.final_price, listing.currency, {
                          isRental: listing.listing_type === 'rent',
                          showPeriod: listing.listing_type === 'rent'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground line-through mt-1">
                        {t('markCompleted.askingPrice')}: {formatPrice(listing.price, listing.currency, {
                          isRental: listing.listing_type === 'rent',
                          showPeriod: listing.listing_type === 'rent'
                        })}
                      </p>
                      {priceDifferencePercent !== null && (
                        <span className={cn(
                          "inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold",
                          priceDifferencePercent > 0.5
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : priceDifferencePercent < -0.5
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                        )}>
                          {priceDifferencePercent > 0.5
                            ? `+${priceDifferencePercent.toFixed(1)}% ${t('markCompleted.aboveAsking')}`
                            : priceDifferencePercent < -0.5
                              ? `${priceDifferencePercent.toFixed(1)}% ${t('markCompleted.belowAsking')}`
                              : t('markCompleted.atAsking')}
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

              <div className="p-6 space-y-5">
                {/* Listing Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2.5 rounded-xl bg-secondary/40">
                    <span className="font-bold text-lg text-foreground block">{listingStats?.viewCount ?? 0}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{t('listing.views')}</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-secondary/40">
                    <span className="font-bold text-lg text-foreground block">{listingStats?.daysListed ?? 0}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{t('listing.daysListed')}</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-secondary/40">
                    <span className="font-bold text-lg text-foreground block">{listingStats?.contactCount ?? 0}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{t('listing.inquiries')}</p>
                  </div>
                </div>

                {/* Hot listing badge */}
                {listingStats?.isHotListing && (
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 text-orange-600 dark:text-orange-400 rounded-xl px-4 py-2.5 border border-orange-200/50 dark:border-orange-800/30">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-semibold">{t('listing.hotListing')}</span>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-2.5">
                  <Button
                    variant="accent"
                    className={cn(
                      "w-full h-12 text-[15px] font-semibold rounded-xl",
                      "hover:scale-[1.01] active:scale-[0.99]",
                      "transition-all duration-200 touch-target shadow-sm shadow-accent/20"
                    )}
                    disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                    onClick={handleContactLandlord}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
                  </Button>

                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 text-[15px] font-semibold rounded-xl",
                      "hover:scale-[1.01] active:scale-[0.99]",
                      "transition-all duration-200 touch-target"
                    )}
                    onClick={handleSaveClick}
                  >
                    <Heart className={cn(
                      'h-4 w-4 mr-2 transition-all duration-200',
                      isSaved && 'fill-current text-accent scale-110'
                    )} />
                    {user ? (isSaved ? t('common.saved') : t('listing.saveListing')) : t('listing.signInToSave')}
                  </Button>
                </div>

                {/* Landlord link */}
                {listing.user_id && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Full image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={listing.floor_plan_url}
        floorPlanUrls={listing.floor_plan_urls || []}
        isOpen={showGallery}
        onClose={() => {
          setShowGallery(false);
          setScrollToFloorPlan(false);
        }}
        title={listing.title}
        initialScrollToFloorPlan={scrollToFloorPlan}
      />

      {/* Full description modal */}
      <Dialog open={showFullDescription} onOpenChange={setShowFullDescription}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('listing.description')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">
            {listing.description}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
