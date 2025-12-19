import { useState, useCallback } from 'react';
import { X, Heart, MapPin, Bed, Bath, Square, Calendar, Images, ChevronLeft, ChevronRight, LayoutGrid, ExternalLink } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { useSwipe } from '@/hooks/useSwipe';
import { Button } from '@/components/ui/button';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { ListingLocationMap } from '@/components/ListingLocationMap';
import { PropertyFeatures } from '@/components/PropertyFeatures';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';

interface ListingDetailModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatPrice, formatArea } = useFormattedPrice();
  const { data: isSaved } = useIsListingSaved(user?.id, listing.id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const [showGallery, setShowGallery] = useState(false);
  const [scrollToFloorPlan, setScrollToFloorPlan] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('listing.flexible');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-background"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Save button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'fixed top-4 right-4 z-50 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card',
            isSaved && 'text-accent'
          )}
          onClick={handleSaveClick}
        >
          <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
        </Button>

        {/* Image gallery preview */}
        <div 
          className="relative h-[40vh] sm:h-[50vh] bg-muted cursor-pointer group select-none"
          onClick={() => setShowGallery(true)}
          {...swipeHandlers}
        >
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Navigation arrows */}
              {listing.images.length >= 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={listing.images.length <= 1}
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md z-10",
                      listing.images.length <= 1 && "opacity-50 cursor-not-allowed"
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
                    disabled={listing.images.length <= 1}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md z-10",
                      listing.images.length <= 1 && "opacity-50 cursor-not-allowed"
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
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Images className="h-4 w-4" />
                <span>
                  {currentImageIndex + 1} / {listing.images.length}
                  {(listing as any).floor_plan_url && ` • ${t('listing.floorPlan')}`}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground">{t('listing.noImagesAvailable')}</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-sm font-medium">
              {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
            </span>
          </div>
        </div>

        {/* Quick action buttons - Floor plan & All images */}
        {listing.images && listing.images.length > 0 && (
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-row gap-3">
              {listing.floor_plan_url && (
                <button
                  onClick={() => {
                    setScrollToFloorPlan(true);
                    setShowGallery(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  <LayoutGrid className="h-4 w-4" />
                  {t('listing.floorPlan')}
                </button>
              )}
              <button
                onClick={() => {
                  setScrollToFloorPlan(false);
                  setShowGallery(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
              >
                {listing.images.length} {t('listing.images')}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Header */}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.address}, {listing.city}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <Bed className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.bedrooms')}</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bedrooms}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Bath className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.bathrooms')}</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bathrooms}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Square className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.area')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatArea(listing.area_sqm)}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.available')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(listing.available_from)}</p>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">{t('listing.description')}</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
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
              <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-card">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t(`propertyTypes.${listing.property_type}`)}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                  </p>
                </div>

                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3">
                  {t('listing.contactLandlord')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveClick}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                  {user ? (isSaved ? t('common.saved') : t('listing.saveListing')) : t('listing.signInToSave')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={listing.floor_plan_url}
        isOpen={showGallery}
        onClose={() => {
          setShowGallery(false);
          setScrollToFloorPlan(false);
        }}
        title={listing.title}
        initialScrollToFloorPlan={scrollToFloorPlan}
      />
    </div>
  );
}