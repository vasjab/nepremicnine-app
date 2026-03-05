import { useState, useCallback } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { Heart, ChevronLeft, ChevronRight, Building2, Car, TreePine, Snowflake, TrendingUp, TrendingDown, Camera, Bed, Bath, Maximize2, MapPin, CalendarDays, Sofa, PawPrint } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { useSwipe } from '@/hooks/useSwipe';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
  showStatusOverlay?: boolean;
}

export function ListingCard({ listing, onClick, showStatusOverlay = false }: ListingCardProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatPrice, formatArea, areaUnit } = useFormattedPrice();
  const { data: isSaved } = useIsListingSaved(user?.id, listing.id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const isSoldOrRented = listing.status === 'sold' || listing.status === 'rented';
  const isSold = listing.status === 'sold';
  const isRental = listing.listing_type === 'rent';

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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 600);

    if (isSaved) {
      unsaveListing.mutate({ userId: user.id, listingId: listing.id });
    } else {
      saveListing.mutate({ userId: user.id, listingId: listing.id });
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevImage();
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextImage();
  };

  const propertyTypeKey = listing.property_type as string;
  const propertyTypeLabel = t(`propertyTypes.${propertyTypeKey}`);

  const hasMultipleImages = listing.images && listing.images.length > 1;

  // Build feature badges
  const featureBadges: { icon: React.ComponentType<{ className?: string }>; label: string; color: string }[] = [];

  if (listing.has_elevator) {
    featureBadges.push({ icon: Building2, label: t('listing.elevator'), color: 'blue' });
  }
  if (listing.has_parking || listing.has_garage) {
    featureBadges.push({ icon: Car, label: listing.has_garage ? t('listing.garage') : t('listing.parking'), color: 'indigo' });
  }
  if (listing.has_garden) {
    featureBadges.push({ icon: TreePine, label: t('listing.garden'), color: 'green' });
  }
  if (listing.has_air_conditioning) {
    featureBadges.push({ icon: Snowflake, label: t('listing.airConditioning'), color: 'sky' });
  }

  // Limit to 3 badges max
  const displayBadges = featureBadges.slice(0, 3);

  // Price comparison for sold/rented
  const hasFinalPrice = listing.final_price && listing.final_price > 0;
  const priceDiff = hasFinalPrice ? listing.final_price! - listing.price : 0;
  const priceDiffPercent = listing.price > 0 ? ((priceDiff / listing.price) * 100).toFixed(1) : '0';

  // Format listing date - show relative for recent, absolute for older
  const listingDate = listing.created_at ? new Date(listing.created_at) : null;
  const daysAgo = listingDate ? differenceInDays(new Date(), listingDate) : 0;
  const formattedCreatedDate = listingDate
    ? daysAgo <= 30
      ? formatDistanceToNow(listingDate, { addSuffix: true })
      : format(listingDate, 'MMM d, yyyy')
    : null;

  // Format completed date for sold/rented listings
  const isCompleted = listing.status === 'sold' || listing.status === 'rented';
  const completedDate = listing.completed_at ? new Date(listing.completed_at) : null;
  const completedDaysAgo = completedDate ? differenceInDays(new Date(), completedDate) : 0;
  const statusLabel = listing.status === 'sold' ? t('listing.sold') : t('listing.rented');
  const formattedCompletedDate = completedDate
    ? completedDaysAgo <= 30
      ? `${statusLabel} ${formatDistanceToNow(completedDate, { addSuffix: true }).replace('about ', '')}`
      : `${statusLabel} ${format(completedDate, 'MMM d, yyyy')}`
    : null;

  // Use completed date for sold/rented, otherwise use created date
  const formattedDate = isCompleted && showStatusOverlay && formattedCompletedDate
    ? formattedCompletedDate
    : formattedCreatedDate;

  // NEW badge: listing is less than 3 days old
  const isNew = listingDate ? differenceInDays(new Date(), listingDate) < 3 : false;

  // Availability for rentals
  const availableFrom = listing.available_from ? new Date(listing.available_from) : null;
  const availableUntil = listing.available_until ? new Date(listing.available_until) : null;
  const formattedAvailFrom = availableFrom ? format(availableFrom, 'MMM d, yyyy') : null;
  const formattedAvailUntil = availableUntil ? format(availableUntil, 'MMM d, yyyy') : null;

  return (
    <article
      className="listing-card cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Image container */}
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-muted",
          isSoldOrRented && showStatusOverlay && "after:absolute after:inset-0 after:bg-foreground/20 after:pointer-events-none"
        )}
        {...swipeHandlers}
      >
        {listing.images && listing.images.length > 0 ? (
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {listing.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${listing.title} - Photo ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover flex-shrink-0",
                  isSoldOrRented && showStatusOverlay && "saturate-[0.7]"
                )}
                style={{ minWidth: '100%' }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">{t('listing.noImage')}</span>
          </div>
        )}

        {/* Sold/Rented status badge */}
        {isSoldOrRented && showStatusOverlay && (
          <div className="absolute top-3 left-3 z-20">
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wide",
              isSold
                ? "bg-slate-200/90 text-slate-700 backdrop-blur-sm"
                : "bg-slate-200/90 text-slate-700 backdrop-blur-sm"
            )}>
              {isSold ? t('listing.sold') : t('listing.rented')}
            </span>
          </div>
        )}

        {/* NEW badge for listings less than 3 days old */}
        {isNew && !isSoldOrRented && (
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              New
            </span>
          </div>
        )}

        {/* Navigation arrows - always visible on mobile, hover on desktop */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-95 z-10"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-95 z-10"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            {/* Airbnb-style pill dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {listing.images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentImageIndex
                      ? "bg-white w-6 shadow-sm"
                      : "bg-white/60 w-1.5 hover:bg-white/80"
                  )}
                />
              ))}
              {listing.images.length > 5 && (
                <span className="text-white/80 text-xs ml-1">+{listing.images.length - 5}</span>
              )}
            </div>
          </>
        )}

        {/* Image count indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 text-white text-[11px] font-medium backdrop-blur-sm">
            <Camera className="h-3 w-3" />
            {listing.images.length}
          </div>
        )}

        {/* Save button - larger touch target */}
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-10 transition-all duration-200 active:scale-90 hover:bg-white',
                  isSaved && 'text-accent',
                  isSoldOrRented && showStatusOverlay && 'opacity-60'
                )}
                onClick={handleSaveClick}
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isSaved && 'fill-current',
                    isHeartAnimating && 'animate-heart-beat'
                  )}
                />
              </button>
            </TooltipTrigger>
            {isSoldOrRented && showStatusOverlay && (
              <TooltipContent>
                <p>{t('listing.noLongerAvailable')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        )}

        {/* Type badge */}
        {(!isSoldOrRented || !showStatusOverlay) && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-white/95 backdrop-blur-sm text-gray-700 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              {t(`listingTypes.${listing.listing_type}`)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-3.5">
        {/* Row 1: Type label + city */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            {propertyTypeLabel}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </span>
        </div>

        {/* Row 2: Address title */}
        <h3 className="font-bold text-foreground line-clamp-1 text-[15px] tracking-tight mb-2.5">
          {listing.address}
        </h3>

        {/* Row 3: Key specs - larger, clearer icons */}
        <div className="flex items-center gap-4 mb-3">
          {listing.bedrooms != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bed className="h-[18px] w-[18px] text-gray-400" />
              <span className="text-sm font-medium text-foreground">{listing.bedrooms}</span>
            </div>
          )}
          {listing.bathrooms != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bath className="h-[18px] w-[18px] text-gray-400" />
              <span className="text-sm font-medium text-foreground">{listing.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Maximize2 className="h-[18px] w-[18px] text-gray-400" />
            <span className="text-sm font-medium text-foreground">{formatArea(listing.area_sqm)}</span>
          </div>
        </div>

        {/* Row 4: Quick feature indicators - subtle inline icons */}
        {displayBadges.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            {displayBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs text-muted-foreground">{badge.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>{badge.label}</p></TooltipContent>
                </Tooltip>
              );
            })}
            {isRental && listing.is_furnished && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Sofa className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">{t('listing.furnished')}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>{t('listing.furnished')}</p></TooltipContent>
              </Tooltip>
            )}
            {isRental && listing.allows_pets && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-gray-400">
                    <PawPrint className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">{t('listing.petsAllowed')}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>{t('listing.petsAllowed')}</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2.5">
          {/* Price row */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {isSoldOrRented && showStatusOverlay && hasFinalPrice ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-extrabold text-foreground tracking-tight leading-tight">
                      {formatPrice(listing.final_price!, listing.currency, { isRental, showPeriod: isRental })}
                    </span>
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      priceDiff < 0 ? "text-red-500" : priceDiff > 0 ? "text-emerald-500" : "text-muted-foreground"
                    )}>
                      {priceDiff < 0 ? <TrendingDown className="h-3 w-3" /> : priceDiff > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                      {priceDiff !== 0 && `${priceDiff > 0 ? '+' : ''}${priceDiffPercent}%`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(listing.price, listing.currency, { isRental, showPeriod: false })}
                  </span>
                </>
              ) : (
                <span className="text-[17px] font-extrabold text-foreground tracking-tight leading-tight">
                  {formatPrice(listing.price, listing.currency, { isRental, showPeriod: isRental })}
                </span>
              )}
              {listing.area_sqm && listing.area_sqm > 0 && (
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {formatPrice((hasFinalPrice && isSoldOrRented && showStatusOverlay ? listing.final_price! : listing.price) / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                </span>
              )}
            </div>
            <div className="text-right">
              {formattedDate && (
                <span className="text-[11px] text-muted-foreground leading-tight block">
                  {formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* Rental availability row */}
          {isRental && !isSoldOrRented && (formattedAvailFrom || listing.move_in_immediately) && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>
                {listing.move_in_immediately
                  ? t('listing.availableNow')
                  : formattedAvailFrom && `${t('listing.from')} ${formattedAvailFrom}`}
                {formattedAvailUntil && ` — ${t('listing.until')} ${formattedAvailUntil}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
