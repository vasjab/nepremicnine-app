import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, ListingFilters } from '@/types/listing';
import { useListings } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListingFilters>({});
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  
  const { data: listings, isLoading } = useListings(filters);

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`);
  };

  const handleCardHover = (listingId: string | null) => {
    setActiveListingId(listingId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen flex flex-col lg:flex-row">
        {/* Left panel - Listings */}
        <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-[50vh] lg:h-full border-r border-border">
          <FilterBar 
            filters={filters} 
            onFiltersChange={setFilters}
            totalCount={listings?.length}
          />
          
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onMouseEnter={() => handleCardHover(listing.id)}
                    onMouseLeave={() => handleCardHover(null)}
                  >
                    <ListingCard
                      listing={listing}
                      isActive={listing.id === activeListingId}
                      onClick={() => handleListingClick(listing)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">No listings found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search in a different area.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Map */}
        <div className="flex-1 h-[50vh] lg:h-full">
          <MapView
            listings={listings || []}
            activeListing={activeListingId}
            onListingClick={handleListingClick}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
