'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackListingView, useTrackLocalListingView } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/button';
import { ListingDetailContent } from '@/components/ListingDetailContent';
import { useTranslation } from '@/hooks/useTranslation';
import { Listing } from '@/types/listing';

interface Props {
  listing: Listing | null;
  id: string;
}

export function ListingDetailClient({ listing, id }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const trackView = useTrackListingView();
  const { trackView: trackLocalView } = useTrackLocalListingView();
  const { t } = useTranslation();

  useEffect(() => {
    if (id && listing) {
      if (user) {
        trackView.mutate({ userId: user.id, listingId: id });
      } else {
        trackLocalView(id);
      }
    }
  }, [user, id, listing?.id]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
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
