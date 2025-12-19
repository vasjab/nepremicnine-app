import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, ListingFilters, SortOption } from '@/types/listing';
import { useListings } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { Skeleton } from '@/components/ui/skeleton';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [modalListing, setModalListing] = useState<Listing | null>(null);
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: allListings, isLoading } = useListings(filters);

  // Filter listings based on map bounds
  const filteredListings = useMemo(() => {
    let result = allListings?.filter(listing => {
      if (!mapBounds) return true; // Show all if no bounds set yet
      
      return (
        listing.latitude >= mapBounds.south &&
        listing.latitude <= mapBounds.north &&
        listing.longitude >= mapBounds.west &&
        listing.longitude <= mapBounds.east
      );
    }) || [];

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'size_asc':
          return (a.area_sqm || 0) - (b.area_sqm || 0);
        case 'size_desc':
          return (b.area_sqm || 0) - (a.area_sqm || 0);
        default:
          return 0;
      }
    });
  }, [allListings, mapBounds, sortBy]);

  const visibleListings = filteredListings;

  const handleListingClick = (listing: Listing) => {
    navigate(`/listing/${listing.id}`);
  };

  const handleCardHover = (listingId: string | null) => {
    setActiveListingId(listingId);
  };

  const handleMapMove = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  // Handle marker click - scroll to card and highlight it
  const handleMarkerClick = useCallback((listing: Listing) => {
    setActiveListingId(listing.id);
    
    // Scroll the card into view
    const cardElement = listingRefs.current[listing.id];
    if (cardElement && listContainerRef.current) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  // Handle popup click - open modal
  const handlePopupClick = useCallback((listing: Listing) => {
    setModalListing(listing);
  }, []);

  // Clear highlight after a delay when set via marker click
  useEffect(() => {
    if (activeListingId) {
      const timer = setTimeout(() => {
        // Only clear if it wasn't set by hovering
        const cardElement = listingRefs.current[activeListingId];
        if (cardElement && !cardElement.matches(':hover')) {
          // Keep it highlighted for visibility
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeListingId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen flex flex-col lg:flex-row">
        {/* Left panel - Listings */}
        <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-[50vh] lg:h-full border-r border-border">
          <FilterBar 
            filters={filters} 
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={visibleListings.length}
          />
          
          <div ref={listContainerRef} className="flex-1 overflow-y-auto p-4">
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
            ) : visibleListings.length > 0 ? (
              <div className="grid gap-4">
                {visibleListings.map((listing) => (
                  <div
                    key={listing.id}
                    ref={(el) => { listingRefs.current[listing.id] = el; }}
                    onMouseEnter={() => handleCardHover(listing.id)}
                    onMouseLeave={() => handleCardHover(null)}
                    className={`transition-all duration-300 rounded-xl ${
                      listing.id === activeListingId 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' 
                        : ''
                    }`}
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
                <h3 className="font-semibold text-foreground mb-2">No listings in this area</h3>
                <p className="text-sm text-muted-foreground">
                  Try zooming out or panning the map to see more listings.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Map */}
        <div className="flex-1 h-[50vh] lg:h-full">
          <MapView
            listings={allListings || []}
            activeListing={activeListingId}
            onListingClick={handleMarkerClick}
            onPopupClick={handlePopupClick}
            onMapMove={handleMapMove}
          />
        </div>
      </main>

      {/* Listing Detail Modal */}
      {modalListing && (
        <ListingDetailModal
          listing={modalListing}
          isOpen={!!modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
};

export default Index;
