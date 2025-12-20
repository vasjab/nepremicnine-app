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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      navigate('/auth');
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
      navigate('/auth');
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
      navigate('/messages', { state: { conversationId: data.id } });
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
            "fixed top-4 left-4 z-50 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm",
            "hover:bg-card hover:scale-105 active:scale-95",
            "shadow-lg transition-all duration-200",
            "touch-target"
          )}
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Image gallery preview */}
      <div 
        className={cn(
          "relative h-[40vh] sm:h-[50vh] bg-muted group select-none overflow-hidden",
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
            
            <div className="relative w-full h-full">
              <img
                src={listing.images[currentImageIndex]}
                alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  "group-hover:scale-[1.02]"
                )}
              />
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Navigation arrows */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
                    "bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg z-10",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "hover:scale-110 active:scale-95",
                    "sm:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
                    "bg-card/90 backdrop-blur-sm hover:bg-card shadow-lg z-10",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "hover:scale-110 active:scale-95",
                    "sm:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image count overlay */}
            <div className={cn(
              "absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl",
              "flex items-center gap-2 text-sm font-medium shadow-lg",
              "transition-transform duration-200 hover:scale-105"
            )}>
              <Images className="h-4 w-4" />
              <span>
                {currentImageIndex + 1} / {listing.images.length}
                {listing.floor_plan_url && ` • ${t('listing.floorPlan')}`}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground">{t('listing.noImagesAvailable')}</span>
          </div>
        )}

        {/* Type badge - show SOLD/RENTED for completed listings, otherwise For Sale/For Rent */}
        <div className="absolute bottom-4 left-4">
          {listing.status === 'sold' || listing.status === 'rented' ? (
            <span className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold shadow-lg uppercase tracking-wide",
              "bg-green-500 text-white",
              "transition-transform duration-200 hover:scale-105"
            )}>
              {listing.status === 'sold' ? t('listing.sold') : t('listing.rented')}
            </span>
          ) : (
            <span className={cn(
              "px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm text-sm font-medium shadow-lg",
              "transition-transform duration-200 hover:scale-105"
            )}>
              {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
            </span>
          )}
        </div>
      </div>

      {/* Quick action buttons - Floor plan & All images */}
      {listing.images && listing.images.length > 0 && (
        <div className={cn(
          "container mx-auto px-4 py-4 transition-all duration-500 delay-100",
          isAnimating && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex flex-row gap-3">
            {((listing as any).floor_plan_urls?.length > 0 || listing.floor_plan_url) && (
              <button
                onClick={() => {
                  setScrollToFloorPlan(true);
                  setShowGallery(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl",
                  "text-sm font-medium text-foreground shadow-sm",
                  "hover:bg-muted hover:scale-105 active:scale-95",
                  "transition-all duration-200 touch-target"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
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
                  "flex items-center gap-2 px-5 py-3 bg-secondary border border-border rounded-xl",
                  "text-sm font-medium text-foreground shadow-sm",
                  "hover:bg-muted hover:scale-105 active:scale-95",
                  "transition-all duration-200 touch-target"
                )}
              >
                {listing.images.length} {t('listing.images')}
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "container mx-auto px-4 py-6 sm:py-8 transition-all duration-500 delay-150",
        isAnimating && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.address}, {listing.city}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                <Bed className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('listing.bedrooms')}</p>
                <p className="text-lg font-semibold text-foreground">{listing.bedrooms}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                <Bath className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('listing.bathrooms')}</p>
                <p className="text-lg font-semibold text-foreground">{listing.bathrooms}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                <Square className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('listing.area')}</p>
                <p className="text-lg font-semibold text-foreground">{formatArea(listing.area_sqm)}</p>
              </div>
              {isCompleted && formattedCompletedDate ? (
                <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{statusLabel}</p>
                  <p className="text-lg font-semibold text-foreground">{formattedCompletedDate}</p>
                </div>
              ) : (
                <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                  <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.available')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(listing.available_from)}</p>
                </div>
              )}
            </div>

            {/* Feature Highlight Badges */}
            <FeatureHighlightBadges listing={listing} maxBadges={8} />

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">{t('listing.description')}</h2>
                {listing.description.length > 500 ? (
                  <>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {listing.description.slice(0, 500)}...
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-2 text-primary"
                      onClick={() => setShowFullDescription(true)}
                    >
                      {t('listing.readMore') || 'Read more'}
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{listing.description}</p>
                )}
              </div>
            )}

            {/* Property Features */}
            <PropertyFeatures listing={listing} />

            {/* Location Map */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t('listing.location')}</h2>
              <ListingLocationMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                address={listing.address}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {listing.address}, {listing.city}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={cn(
              "sticky top-24 bg-card rounded-2xl p-6 shadow-elevated",
              "transition-all duration-300",
              "hover:shadow-xl"
            )}>
              {/* Transaction Complete Section for Sold/Rented */}
              {isCompleted && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-300 uppercase text-sm tracking-wide">
                      {statusLabel}
                    </span>
                  </div>
                  {formattedCompletedDate && (
                    <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                      {formattedCompletedDate}
                    </p>
                  )}
                  
                  {listing.final_price ? (
                    <>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
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
                          "inline-block mt-2 px-2 py-1 rounded-md text-xs font-medium",
                          priceDifferencePercent > 0.5 
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : priceDifferencePercent < -0.5 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
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
                    <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {formatPrice(listing.price, listing.currency, { 
                        isRental: listing.listing_type === 'rent', 
                        showPeriod: listing.listing_type === 'rent' 
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Regular Price Section (only for active listings) */}
              {!isCompleted && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {propertyTypeLabels[listing.property_type]}
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">
                    {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                  </p>
                  {listing.area_sqm && listing.area_sqm > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                    </p>
                  )}
                </div>
              )}

              {/* Listing Stats */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-bold text-base sm:text-lg">{listingStats?.viewCount ?? 0}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.views')}</p>
                </div>
                <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-bold text-base sm:text-lg">{listingStats?.daysListed ?? 0}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.daysListed')}</p>
                </div>
                <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                    <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-bold text-base sm:text-lg">{listingStats?.contactCount ?? 0}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.inquiries')}</p>
                </div>
              </div>

              {/* Hot listing badge */}
              {listingStats?.isHotListing && (
                <div className="flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-xl px-4 py-2.5 mb-6">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('listing.hotListing')}</span>
                </div>
              )}

              <Button
                variant="accent"
                className={cn(
                  "w-full mb-3 h-12",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "transition-all duration-200 touch-target"
                )}
                disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                onClick={handleContactLandlord}
              >
                {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 mb-3",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "transition-all duration-200 touch-target"
                )}
                onClick={handleSaveClick}
              >
                <Heart className={cn(
                  'h-4 w-4 mr-2 transition-transform duration-200',
                  isSaved && 'fill-current text-accent'
                )} />
                {user ? (isSaved ? t('common.saved') : t('listing.saveListing')) : t('listing.signInToSave')}
              </Button>

              {listing.user_id && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => navigate(`/landlord/${listing.user_id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View landlord profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {showSimilar && (
          <div className="mt-8 pt-8 border-t border-border">
            <SimilarListings listing={listing} />
          </div>
        )}

        {/* Recently Viewed */}
        {showRecentlyViewed && (
          <div className="mt-8 pt-8 border-t border-border">
            <RecentlyViewedListings excludeListingId={listing.id} limit={6} />
          </div>
        )}
      </div>

      {/* Full image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={listing.floor_plan_url}
        floorPlanUrls={(listing as any).floor_plan_urls || []}
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
