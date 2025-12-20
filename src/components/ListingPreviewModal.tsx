import { useState, useCallback, useEffect } from 'react';
import { X, Eye, Images, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Calendar, LayoutGrid, ExternalLink } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useSwipe } from '@/hooks/useSwipe';
import { Button } from '@/components/ui/button';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { ListingLocationMap } from '@/components/ListingLocationMap';
import { PropertyFeatures } from '@/components/PropertyFeatures';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import type { UploadedImage } from '@/hooks/useImageUpload';
import type { Currency } from '@/lib/exchangeRates';

interface FormData {
  title: string;
  description: string;
  listing_type: 'rent' | 'sale';
  property_type: 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other';
  price: string;
  currency: Currency;
  address: string;
  city: string;
  postal_code: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  available_from: string;
  available_until: string;
  is_furnished: boolean;
  allows_pets: boolean;
  floor_number: string;
  total_floors_building: string;
  property_floors: string;
  has_elevator: boolean;
  has_balcony: boolean;
  balcony_sqm: string;
  has_terrace: boolean;
  terrace_sqm: string;
  has_garden: boolean;
  garden_sqm: string;
  has_parking: boolean;
  parking_type: string;
  parking_spaces: string;
  has_garage: boolean;
  has_storage: boolean;
  has_air_conditioning: boolean;
  has_dishwasher: boolean;
  has_washing_machine: boolean;
  heating_type: string;
  energy_rating: string;
  year_built: string;
  property_condition: string;
  deposit_amount: string;
  min_lease_months: string;
  internet_included: string;
  utilities_included: string;
}

interface ListingPreviewModalProps {
  formData: FormData;
  uploadedImages: UploadedImage[];
  coordinates: { latitude: number; longitude: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

function formDataToListing(formData: FormData, uploadedImages: UploadedImage[], coordinates: { latitude: number; longitude: number } | null): Listing {
  return {
    id: 'preview',
    user_id: 'preview',
    title: formData.title || 'Untitled Listing',
    description: formData.description || null,
    listing_type: formData.listing_type,
    property_type: formData.property_type,
    price: parseFloat(formData.price) || 0,
    currency: formData.currency,
    address: formData.address || 'Address not set',
    city: formData.city || 'City not set',
    postal_code: formData.postal_code || null,
    country: 'Sweden',
    latitude: coordinates?.latitude || 0,
    longitude: coordinates?.longitude || 0,
    bedrooms: parseInt(formData.bedrooms) || 0,
    bathrooms: parseInt(formData.bathrooms) || 0,
    area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
    available_from: formData.available_from || null,
    available_until: formData.available_until || null,
    is_furnished: formData.is_furnished || false,
    allows_pets: formData.allows_pets || false,
    images: uploadedImages.map(img => img.url),
    floor_plan_url: null,
    floor_plan_urls: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
    total_floors_building: formData.total_floors_building ? parseInt(formData.total_floors_building) : null,
    property_floors: formData.property_floors ? parseInt(formData.property_floors) : null,
    has_elevator: formData.has_elevator || false,
    has_balcony: formData.has_balcony || false,
    balcony_sqm: formData.balcony_sqm ? parseFloat(formData.balcony_sqm) : null,
    has_terrace: formData.has_terrace || false,
    terrace_sqm: formData.terrace_sqm ? parseFloat(formData.terrace_sqm) : null,
    has_garden: formData.has_garden || false,
    garden_sqm: formData.garden_sqm ? parseFloat(formData.garden_sqm) : null,
    has_parking: formData.has_parking || false,
    parking_type: (formData.parking_type || null) as 'street' | 'designated' | 'underground' | 'private' | null,
    parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
    has_garage: formData.has_garage || false,
    has_storage: formData.has_storage || false,
    has_air_conditioning: formData.has_air_conditioning || false,
    has_dishwasher: formData.has_dishwasher || false,
    has_washing_machine: formData.has_washing_machine || false,
    heating_type: (formData.heating_type || null) as 'central' | 'electric' | 'gas' | 'heat_pump' | 'other' | null,
    energy_rating: (formData.energy_rating || null) as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null,
    year_built: formData.year_built ? parseInt(formData.year_built) : null,
    property_condition: (formData.property_condition || null) as 'new' | 'renovated' | 'good' | 'needs_work' | null,
    deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
    min_lease_months: formData.min_lease_months ? parseInt(formData.min_lease_months) : null,
    internet_included: (formData.internet_included || null) as 'yes' | 'no' | 'available' | null,
    utilities_included: (formData.utilities_included || null) as 'yes' | 'no' | 'partial' | null,
  };
}

export function ListingPreviewModal({ formData, uploadedImages, coordinates, isOpen, onClose }: ListingPreviewModalProps) {
  const { t } = useTranslation();
  const { formatPrice, formatArea } = useFormattedPrice();
  const [showGallery, setShowGallery] = useState(false);
  const [scrollToFloorPlan, setScrollToFloorPlan] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const listing = formDataToListing(formData, uploadedImages, coordinates);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsAnimating(false);
    }, 200);
  }, [onClose]);

  const goToPrevImage = useCallback(() => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  }, [listing.images]);

  const goToNextImage = useCallback(() => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [listing.images]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextImage,
    onSwipeRight: goToPrevImage,
    minSwipeDistance: 50,
  });

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
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isAnimating && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />
      
      <div 
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-background transition-all duration-300",
          isAnimating && !isClosing 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-[0.98]"
        )}
      >
        {/* Preview Mode Banner */}
        <div className="fixed top-0 left-0 right-0 z-[60] bg-accent text-accent-foreground py-3 px-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">{t('preview.title')}</p>
                <p className="text-xs opacity-90">{t('preview.safeMessage')}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClose}
              className="bg-accent-foreground/10 hover:bg-accent-foreground/20 text-accent-foreground border-none"
            >
              {t('preview.closeButton')}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed top-20 left-4 z-50 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm",
            "hover:bg-card hover:scale-105 active:scale-95",
            "shadow-lg transition-all duration-200",
            "touch-target"
          )}
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Image gallery preview */}
        <div 
          className={cn(
            "relative h-[40vh] sm:h-[50vh] bg-muted cursor-pointer group select-none overflow-hidden mt-14",
            "transition-transform duration-500",
            isAnimating && !isClosing ? "translate-y-0" : "translate-y-4"
          )}
          onClick={() => listing.images.length > 0 && setShowGallery(true)}
          {...swipeHandlers}
        >
          {listing.images && listing.images.length > 0 ? (
            <>
              <div className="relative w-full h-full">
                <img
                  src={listing.images[currentImageIndex]}
                  alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    "group-hover:scale-[1.02]"
                  )}
                />
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
            <span className={cn(
              "px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm text-sm font-medium shadow-lg",
              "transition-transform duration-200 hover:scale-105"
            )}>
              {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
            </span>
          </div>
        </div>

        {/* Quick action buttons - All images */}
        {listing.images && listing.images.length > 0 && (
          <div className={cn(
            "container mx-auto px-4 py-4 transition-all duration-500 delay-100",
            isAnimating && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex flex-row gap-3">
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
                <div className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                  <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.available')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(listing.available_from)}</p>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">{t('listing.description')}</h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Property Features */}
              <PropertyFeatures listing={listing} />

              {/* Location Map */}
              {coordinates && (
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
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className={cn(
                "sticky top-24 bg-card rounded-2xl p-6 shadow-elevated",
                "transition-all duration-300",
                "hover:shadow-xl"
              )}>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t(`propertyTypes.${listing.property_type}`)}
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">
                    {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                  </p>
                </div>

                {/* Disabled action buttons for preview */}
                <Button 
                  className={cn(
                    "w-full bg-muted text-muted-foreground mb-3 h-12 cursor-not-allowed"
                  )}
                  disabled
                >
                  {t('listing.contactLandlord')}
                </Button>

                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 cursor-not-allowed opacity-50"
                  )}
                  disabled
                >
                  {t('listing.saveListing')}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {t('preview.actionsDisabled')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Modal */}
        <ImageGalleryModal
          images={listing.images}
          floorPlanUrl={listing.floor_plan_url || undefined}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          initialScrollToFloorPlan={scrollToFloorPlan}
        />
      </div>
    </div>
  );
}
