import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, MapIcon } from 'lucide-react';
import { Listing, ListingFilters, SortOption } from '@/types/listing';
import { useListings } from '@/hooks/useListings';
import { useMobileViewPreference } from '@/hooks/useMobileViewPreference';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { ListingSkeletonGrid } from '@/components/ListingSkeleton';
import { MobileMapFilterButton } from '@/components/MobileMapFilterButton';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [modalListing, setModalListing] = useState<Listing | null>(null);
  const [mobileView, setMobileView] = useMobileViewPreference();
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: allListings, isLoading } = useListings(filters, user?.id);

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
    <div className="min-h-dvh h-dvh flex flex-col bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 shrink-0" />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left panel - Listings */}
        <div className={`w-full lg:w-[480px] xl:w-[540px] flex flex-col border-r border-border overflow-hidden ${
          mobileView === 'map' ? 'hidden lg:flex' : 'flex flex-1 min-h-0'
        }`}>
          <FilterBar 
            filters={filters} 
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={visibleListings.length}
            userId={user?.id}
          />
          
          <div ref={listContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
            {isLoading ? (
              <ListingSkeletonGrid count={4} />
            ) : visibleListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                {visibleListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    ref={(el) => { listingRefs.current[listing.id] = el; }}
                    onMouseEnter={() => handleCardHover(listing.id)}
                    onMouseLeave={() => handleCardHover(null)}
                    className={cn(
                      "opacity-0 animate-slide-up-spring",
                      "transition-opacity duration-300"
                    )}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
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
                <h3 className="font-semibold text-foreground mb-2">{t('listing.noListingsInArea')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('listing.noListingsInAreaDesc')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Map */}
        <div className={`flex-1 h-full min-h-0 relative ${
          mobileView === 'list' ? 'hidden lg:block' : 'block'
        }`}>
          <MapView
            listings={allListings || []}
            activeListing={activeListingId}
            onListingClick={handleMarkerClick}
            onPopupClick={handlePopupClick}
            onMapMove={handleMapMove}
          />
          
          {/* Mobile Map Filter Button - only visible on mobile map view */}
          {mobileView === 'map' && (
            <div className="lg:hidden absolute top-4 right-4 z-30">
              <MobileMapFilterButton 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>
          )}
        </div>

        {/* Mobile view toggle */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex bg-card rounded-full shadow-lg border border-border p-1">
            <Button
              variant={mobileView === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 ${mobileView === 'list' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => setMobileView('list')}
            >
              <List className="h-4 w-4 mr-2" />
              {t('map.list')}
            </Button>
            <Button
              variant={mobileView === 'map' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 ${mobileView === 'map' ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => setMobileView('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              {t('map.map')}
            </Button>
          </div>
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
