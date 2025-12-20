import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListing } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackListingView, useTrackLocalListingView } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingDetailContent } from '@/components/ListingDetailContent';
import { useTranslation } from '@/hooks/useTranslation';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const trackView = useTrackListingView();
  const { trackView: trackLocalView } = useTrackLocalListingView();
  const { t } = useTranslation();

  // Track listing view for both authenticated and non-authenticated users
  useEffect(() => {
    if (id && listing) {
      if (user) {
        trackView.mutate({ userId: user.id, listingId: id });
      } else {
        trackLocalView(id);
      }
    }
  }, [user, id, listing?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">{t('listing.listingNotFound')}</h1>
          <p className="text-muted-foreground mb-4">{t('listing.listingNotFoundDesc')}</p>
          <Button onClick={() => navigate('/')}>{t('listing.backToListings')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ListingDetailContent
        listing={listing}
        onClose={() => navigate(-1)}
        isModal={false}
        showSimilar={true}
        showRecentlyViewed={true}
        isAnimating={true}
        isClosing={false}
      />
    </div>
  );
}
