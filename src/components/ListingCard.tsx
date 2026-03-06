import { useState, useCallback } from 'react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { Heart, ChevronLeft, ChevronRight, Camera, Bed, Bath, Maximize2, MapPin, CalendarDays, Sofa, PawPrint, TrendingUp, TrendingDown } from 'lucide-react';
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

  // Price comparison for sold/rented
  const hasFinalPrice = listing.final_price && listing.final_price > 0;
  const priceDiff = hasFinalPrice ? listing.final_price! - listing.price : 0;
  const priceDiffPercent = listing.price > 0 ? ((priceDiff / listing.price) * 100).toFixed(1) : '0';

  // Format listing date
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
      {/* ── Image ───────────────────────────────────── */}
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
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">{t('listing.noImage')}</span>
          </div>
        )}

        {/* Status badge — sold / rented */}
        {isSoldOrRented && showStatusOverlay && (
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
              {isSold ? t('listing.sold') : t('listing.rented')}
            </span>
          </div>
        )}

        {/* NEW badge */}
        {isNew && !isSoldOrRented && (
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              NEW
            </span>
          </div>
        )}

        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-95 z-10"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-4 w-4 text-gray-800" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 active:scale-95 z-10"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-4 w-4 text-gray-800" />
            </button>

            {/* Minimal dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {listing.images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    "h-[5px] rounded-full transition-all duration-300",
                    index === currentImageIndex
                      ? "bg-white w-5 shadow-sm"
                      : "bg-white/40 w-[5px] hover:bg-white/60"
                  )}
                />
              ))}
              {listing.images.length > 5 && (
                <span className="text-white/50 text-[9px] font-medium ml-0.5">+{listing.images.length - 5}</span>
              )}
            </div>
          </>
        )}

        {/* Image count */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white/90 text-[11px] font-medium backdrop-blur-sm">
            <Camera className="h-3 w-3" />
            {listing.images.length}
          </div>
        )}

        {/* Save button */}
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm z-10 transition-all duration-200 active:scale-90 hover:bg-white',
                  isSaved && 'text-accent',
                  isSoldOrRented && showStatusOverlay && 'opacity-60'
                )}
                onClick={handleSaveClick}
              >
                <Heart
                  className={cn(
                    'h-[18px] w-[18px] transition-all duration-200',
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

        {/* Type badge — bottom left */}
        {(!isSoldOrRented || !showStatusOverlay) && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md shadow-sm",
              isRental
                ? "bg-blue-600/90 text-white"
                : "bg-white/90 text-gray-900"
            )}>
              {t(`listingTypes.${listing.listing_type}`)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="px-4 pt-3.5 pb-4 antialiased">
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="h-3.5 w-3.5 text-blue-500/70 dark:text-blue-400/70 shrink-0" />
          <span className="text-[12px] font-semibold text-foreground/60 truncate tracking-wide uppercase">
            {listing.city}
            <span className="mx-1.5 text-foreground/20">·</span>
            {propertyTypeLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-foreground line-clamp-1 text-[17px] tracking-[-0.02em] leading-tight mb-3">
          {listing.address}
        </h3>

        {/* Specs — bold inline row */}
        <div className="flex items-center gap-3.5 text-[14px] text-foreground/75 font-semibold mb-3">
          {listing.bedrooms != null && (
            <div className="inline-flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-violet-500/60 dark:text-violet-400/60" />
              <span>{listing.bedrooms}</span>
            </div>
          )}
          {listing.bathrooms != null && (
            <div className="inline-flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-sky-500/60 dark:text-sky-400/60" />
              <span>{listing.bathrooms}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5">
            <Maximize2 className="h-4 w-4 text-amber-500/60 dark:text-amber-400/60" />
            <span>{formatArea(listing.area_sqm)}</span>
          </div>
        </div>

        {/* Tags row — colored pills */}
        {(isRental && (listing.is_furnished || listing.allows_pets)) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {isRental && listing.is_furnished && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100/80 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-[11px] font-semibold">
                <Sofa className="h-3.5 w-3.5" />
                <span>{t('listing.furnished')}</span>
              </div>
            )}
            {isRental && listing.allows_pets && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                <PawPrint className="h-3.5 w-3.5" />
                <span>{t('listing.petsAllowed')}</span>
              </div>
            )}
          </div>
        )}

        {/* Price section */}
        <div className="flex items-end justify-between">
          <div>
            {isSoldOrRented && showStatusOverlay && hasFinalPrice ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-black text-foreground tracking-[-0.03em] leading-none">
                    {formatPrice(listing.final_price!, listing.currency, { isRental, showPeriod: isRental })}
                  </span>
                  <span className={cn(
                    "text-[11px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                    priceDiff < 0 ? "text-red-600 bg-red-50 dark:bg-red-950/30" : priceDiff > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-muted-foreground"
                  )}>
                    {priceDiff < 0 ? <TrendingDown className="h-3 w-3" /> : priceDiff > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                    {priceDiff !== 0 && `${priceDiff > 0 ? '+' : ''}${priceDiffPercent}%`}
                  </span>
                </div>
                <span className="text-[12px] text-foreground/45 line-through mt-0.5 block font-medium">
                  {formatPrice(listing.price, listing.currency, { isRental, showPeriod: false })}
                </span>
              </>
            ) : (
              <span className="text-[22px] font-black text-foreground tracking-[-0.03em] leading-none">
                {formatPrice(listing.price, listing.currency, { isRental, showPeriod: isRental })}
              </span>
            )}
            {listing.area_sqm && listing.area_sqm > 0 && (
              <span className="text-[12px] font-medium text-foreground/45 mt-1 block tabular-nums">
                {formatPrice((hasFinalPrice && isSoldOrRented && showStatusOverlay ? listing.final_price! : listing.price) / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
              </span>
            )}
          </div>
          {formattedDate && (
            <span className="text-[11px] text-foreground/40 font-medium">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Rental availability */}
        {isRental && !isSoldOrRented && (formattedAvailFrom || listing.move_in_immediately) && (
          <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/25">
            <CalendarDays className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              {listing.move_in_immediately
                ? t('listing.availableNow')
                : formattedAvailFrom && `${t('listing.from')} ${formattedAvailFrom}`}
              {formattedAvailUntil && ` — ${t('listing.until')} ${formattedAvailUntil}`}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
