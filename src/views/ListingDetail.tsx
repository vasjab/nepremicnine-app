'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useListing } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackListingView, useTrackLocalListingView } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingDetailContent } from '@/components/ListingDetailContent';
import { useTranslation } from '@/hooks/useTranslation';

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
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
        {/* Header bar skeleton */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-16 rounded-lg" />
          </div>
        </div>

        {/* Gallery skeleton */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <Skeleton className="h-[280px] sm:h-[360px] w-full rounded-2xl" />
        </div>

        {/* Content skeleton — 3 col grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/5" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
              <Skeleton className="h-px w-full mt-4" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            {/* Sidebar */}
            <div className="hidden lg:block space-y-4">
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="text-5xl mb-4 block">🔍</span>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{t('listing.listingNotFound')}</h1>
          <p className="text-muted-foreground mb-4">{t('listing.listingNotFoundDesc')}</p>
          <Button onClick={() => router.push('/')}>{t('listing.backToListings')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ListingDetailContent
        listing={listing}
        onClose={() => router.back()}
        isModal={false}
        showSimilar={true}
        showRecentlyViewed={true}
        isAnimating={true}
        isClosing={false}
      />
    </div>
  );
}
