import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewedListings, useLocalRecentlyViewedListings } from '@/hooks/useRecentlyViewed';
import { ListingCard } from '@/components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentlyViewedListingsProps {
  excludeListingId?: string;
  limit?: number;
  showTitle?: boolean;
}

export function RecentlyViewedListings({ 
  excludeListingId, 
  limit = 6,
  showTitle = true 
}: RecentlyViewedListingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use database for logged-in users, localStorage for guests
  const { data: dbRecentlyViewed, isLoading: dbLoading } = useRecentlyViewedListings(user?.id, limit + 1);
  const { data: localRecentlyViewed, isLoading: localLoading } = useLocalRecentlyViewedListings(limit + 1);

  const isLoading = user ? dbLoading : localLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Recently Viewed</h2>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle both data formats
  let listings: { id: string; listing: any }[] = [];
  
  if (user && dbRecentlyViewed) {
    listings = dbRecentlyViewed
      .filter(item => item.listing_id !== excludeListingId)
      .slice(0, limit)
      .map(item => ({ id: item.id, listing: item.listing }));
  } else if (!user && localRecentlyViewed) {
    listings = localRecentlyViewed
      .filter(listing => listing.id !== excludeListingId)
      .slice(0, limit)
      .map(listing => ({ id: listing.id, listing }));
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Recently Viewed</h2>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((item) => (
          <ListingCard
            key={item.id}
            listing={item.listing}
            onClick={() => navigate(`/listing/${item.listing.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
