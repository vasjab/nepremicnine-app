import { useState } from 'react';
import { X, Heart, MapPin, Bed, Bath, Square, Calendar, Check, Images } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { Button } from '@/components/ui/button';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { cn, formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ListingDetailModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  room: 'Room',
  studio: 'Studio',
  villa: 'Villa',
  other: 'Other',
};

export function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isSaved } = useIsListingSaved(user?.id, listing.id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const [showGallery, setShowGallery] = useState(false);

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
    if (!dateString) return 'Flexible';
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
      onClick={onClose}
    >
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-background"
        onClick={(e) => e.stopPropagation()}
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
          className="relative h-[50vh] bg-muted cursor-pointer group"
          onClick={() => setShowGallery(true)}
        >
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              {/* Image count overlay */}
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Images className="h-4 w-4" />
                <span>
                  {listing.images.length} photo{listing.images.length !== 1 ? 's' : ''}
                  {(listing as any).floor_plan_url && ' • Floor plan'}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground">No images available</span>
            </div>
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

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveClick}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                  {user ? (isSaved ? 'Saved' : 'Save listing') : 'Sign in to save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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