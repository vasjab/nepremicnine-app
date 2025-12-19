import { Heart } from 'lucide-react';
import { Listing } from '@/types/listing';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  isActive?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, isActive, onClick }: ListingCardProps) {
  const { user } = useAuth();
  const { data: isSaved } = useIsListingSaved(user?.id, listing.id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (isSaved) {
      unsaveListing.mutate({ userId: user.id, listingId: listing.id });
    } else {
      saveListing.mutate({ userId: user.id, listingId: listing.id });
    }
  };

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    room: 'Room',
    studio: 'Studio',
    villa: 'Villa',
    other: 'Other',
  };

  return (
    <article
      className={cn(
        'listing-card cursor-pointer group',
        isActive && 'ring-2 ring-accent shadow-warm'
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}

        {/* Save button */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card',
              isSaved && 'text-accent'
            )}
            onClick={handleSaveClick}
          >
            <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
          </Button>
        )}

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm text-xs font-medium">
            {listing.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">
            {listing.address}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {propertyTypeLabels[listing.property_type]} • {listing.bedrooms} room{listing.bedrooms !== 1 ? 's' : ''} • {listing.area_sqm ? `${listing.area_sqm} m²` : 'N/A'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(listing.price, listing.currency)}
            {listing.listing_type === 'rent' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
          </span>
          <span className="text-xs text-muted-foreground">
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}
