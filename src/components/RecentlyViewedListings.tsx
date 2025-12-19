import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewedListings } from '@/hooks/useRecentlyViewed';
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
  const { data: recentlyViewed, isLoading } = useRecentlyViewedListings(user?.id, limit + 1);

  if (!user) return null;

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

  // Filter out the current listing if provided
  const filteredListings = recentlyViewed
    ?.filter(item => item.listing_id !== excludeListingId)
    .slice(0, limit);

  if (!filteredListings || filteredListings.length === 0) {
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
        {filteredListings.map((item) => (
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
