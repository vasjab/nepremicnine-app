import { useState, useCallback } from 'react';
import { Heart, ChevronLeft, ChevronRight, Building2, Car, TreePine, Snowflake, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  const featureBadges: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
  
  if (listing.has_elevator) {
    featureBadges.push({ icon: Building2, label: t('listing.elevator') });
  }
  if (listing.has_parking || listing.has_garage) {
    featureBadges.push({ icon: Car, label: listing.has_garage ? t('listing.garage') : t('listing.parking') });
  }
  if (listing.has_garden) {
    featureBadges.push({ icon: TreePine, label: t('listing.garden') });
  }
  if (listing.has_air_conditioning) {
    featureBadges.push({ icon: Snowflake, label: t('listing.airConditioning') });
  }

  // Limit to 3 badges max
  const displayBadges = featureBadges.slice(0, 3);

  // Price comparison for sold/rented
  const hasFinalPrice = listing.final_price && listing.final_price > 0;
  const priceDiff = hasFinalPrice ? listing.final_price! - listing.price : 0;
  const priceDiffPercent = listing.price > 0 ? ((priceDiff / listing.price) * 100).toFixed(1) : '0';

  return (
    <article
      className="listing-card cursor-pointer group"
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
          <img
            src={listing.images[currentImageIndex]}
            alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
            className={cn(
              "w-full h-full object-cover",
              isSoldOrRented && showStatusOverlay && "saturate-[0.7]"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">{t('listing.noImage')}</span>
          </div>
        )}

        {/* Sold/Rented status badge */}
        {isSoldOrRented && showStatusOverlay && (
          <div className="absolute top-3 left-3 z-20">
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide",
              isSold 
                ? "bg-amber-500/90 text-white" 
                : "bg-emerald-500/90 text-white"
            )}>
              {isSold ? t('listing.sold') : t('listing.rented')}
            </span>
          </div>
        )}


        {/* Navigation arrows - always visible on mobile, hover on desktop */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 z-10"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 z-10"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            {/* Airbnb-style pill dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

        {/* Save button - larger touch target */}
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'absolute top-3 right-3 h-10 w-10 rounded-full glass flex items-center justify-center shadow-md z-10 transition-all duration-200 active:scale-90',
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

        {/* Type badge - hide if showing status overlay */}
        {(!isSoldOrRented || !showStatusOverlay) && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1.5 rounded-xl glass text-xs font-semibold">
              {t(`listingTypes.${listing.listing_type}`)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-foreground line-clamp-1 text-[15px]">
            {listing.address}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {propertyTypeLabel} • {listing.bedrooms} {listing.bedrooms !== 1 ? t('filters.rooms') : t('filters.room')} • {formatArea(listing.area_sqm)}
        </p>

        {/* Feature badges */}
        {displayBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/80 text-xs text-muted-foreground font-medium"
                >
                  <Icon className="h-3 w-3" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            {/* For sold/rented listings with final price */}
            {isSoldOrRented && showStatusOverlay && hasFinalPrice ? (
              <>
                {/* Final price with percentage difference */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
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
                {/* Original listed price - strikethrough */}
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(listing.price, listing.currency, { isRental, showPeriod: false })}
                </span>
              </>
            ) : (
              /* Regular listing price */
              <span className="text-lg font-bold text-foreground">
                {formatPrice(listing.price, listing.currency, { isRental, showPeriod: isRental })}
              </span>
            )}
            {/* Price per sqm - always show */}
            {listing.area_sqm && listing.area_sqm > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatPrice((hasFinalPrice && isSoldOrRented && showStatusOverlay ? listing.final_price! : listing.price) / listing.area_sqm, listing.currency, { compact: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}
