import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Bed, Bath, Square, Calendar, Check, X, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { useSwipe } from '@/hooks/useSwipe';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { cn, formatPrice } from '@/lib/utils';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const { data: isSaved } = useIsListingSaved(user?.id, id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
      );
    }
  }, [listing?.images]);

  const goToNextImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  }, [listing?.images]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextImage,
    onSwipeRight: goToPrevImage,
    minSwipeDistance: 50,
  });

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevImage();
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextImage();
  };

  const handleSaveClick = () => {
    if (!user || !id) return;

    if (isSaved) {
      unsaveListing.mutate({ userId: user.id, listingId: id });
    } else {
      saveListing.mutate({ userId: user.id, listingId: id });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    room: 'Room',
    studio: 'Studio',
    villa: 'Villa',
    other: 'Other',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <Skeleton className="h-[50vh] w-full" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Listing not found</h1>
            <p className="text-muted-foreground mb-4">This listing may have been removed or doesn't exist.</p>
            <Button onClick={() => navigate('/')}>Back to listings</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Fixed back button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-40 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <main className="pt-16">
        {/* Image gallery preview */}
        <div 
          className="relative h-[50vh] bg-muted cursor-pointer group select-none"
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
              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  {/* Image indicator dots */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentImageIndex 
                            ? "bg-white w-4" 
                            : "bg-white/50 hover:bg-white/75"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Image count overlay */}
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Images className="h-4 w-4" />
                <span>
                  {currentImageIndex + 1} / {listing.images.length}
                  {(listing as any).floor_plan_url && ' • Floor plan'}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground">No images available</span>
            </div>
          )}

          {/* Save button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card',
                isSaved && 'text-accent'
              )}
              onClick={(e) => { e.stopPropagation(); handleSaveClick(); }}
            >
              <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
            </Button>
          )}

          {/* Type badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-sm font-medium">
              {listing.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.address}, {listing.city}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <Bed className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bedrooms}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Bath className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bathrooms}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Square className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="text-lg font-semibold text-foreground">{listing.area_sqm ? `${listing.area_sqm} m²` : 'N/A'}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(listing.available_from)}</p>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {/* Features */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    {listing.is_furnished ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={listing.is_furnished ? 'text-foreground' : 'text-muted-foreground'}>
                      Furnished
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.allows_pets ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={listing.allows_pets ? 'text-foreground' : 'text-muted-foreground'}>
                      Pets allowed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-card">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {propertyTypeLabels[listing.property_type]}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.listing_type === 'rent' && (
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    )}
                  </p>
                </div>

                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3">
                  Contact landlord
                </Button>

                {user ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveClick}
                  >
                    <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                    {isSaved ? 'Saved' : 'Save listing'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in to save
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={(listing as any).floor_plan_url}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        title={listing.title}
      />
    </div>
  );
}
