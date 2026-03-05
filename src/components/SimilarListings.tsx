'use client';

import { useRouter } from 'next/navigation';
import { Listing } from '@/types/listing';
import { useSimilarListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

interface SimilarListingsProps {
  listing: Listing;
}

export function SimilarListings({ listing }: SimilarListingsProps) {
  const router = useRouter();
  const { data: similarListings, isLoading } = useSimilarListings(listing, 6);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Similar Listings</h2>
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

  if (!similarListings || similarListings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Similar Listings</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarListings.map((similar) => (
          <ListingCard
            key={similar.id}
            listing={similar}
            onClick={() => router.push(`/listing/${similar.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
