'use client';

import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { List, MapIcon, X } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Listing, ListingFilters, SortOption } from '@/types/listing';
import { useListings } from '@/hooks/useListings';
import { useMobileViewPreference } from '@/hooks/useMobileViewPreference';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Memoized listing card wrapper for performance
const MemoizedListingCard = memo(ListingCard);



const Index = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { trigger: haptic } = useHapticFeedback();
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [highlightedFromMap, setHighlightedFromMap] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [modalListing, setModalListing] = useState<Listing | null>(null);
  const [mobileView, setMobileView] = useMobileViewPreference();
  const isMobileLayout = useIsMobile();
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  
  
  const landlordId = searchParams.get('landlord');
  const [landlordName, setLandlordName] = useState<string | null>(null);
  
  const { data: allListings, isLoading } = useListings(filters, user?.id);

  // Fetch landlord name when filtering by landlord
  useEffect(() => {
    if (!landlordId) {
      setLandlordName(null);
      return;
    }
    
    const fetchLandlordName = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_profile_for_viewer', { p_profile_user_id: landlordId })
          .single();
        if (error) throw error;
        setLandlordName(data?.full_name || 'Landlord');
      } catch {
        setLandlordName('Landlord');
      }
    };

    fetchLandlordName();
  }, [landlordId]);

  // Filter listings based on map bounds and landlord filter
  const filteredListings = useMemo(() => {
    let result = allListings?.filter(listing => {
      // Filter by landlord if specified
      if (landlordId && listing.user_id !== landlordId) return false;
      
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
        case 'price_per_sqm_asc': {
          const aPricePerSqm = a.area_sqm ? a.price / a.area_sqm : Infinity;
          const bPricePerSqm = b.area_sqm ? b.price / b.area_sqm : Infinity;
          return aPricePerSqm - bPricePerSqm;
        }
        case 'price_per_sqm_desc': {
          const aPricePerSqm = a.area_sqm ? a.price / a.area_sqm : -Infinity;
          const bPricePerSqm = b.area_sqm ? b.price / b.area_sqm : -Infinity;
          return bPricePerSqm - aPricePerSqm;
        }
        default:
          return 0;
      }
    });
  }, [allListings, mapBounds, sortBy, landlordId]);

  const clearLandlordFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('landlord');
    const query = params.toString();
    router.replace(query ? `/?${query}` : '/');
  };

  const visibleListings = filteredListings;

  const handleListingClick = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  const handleCardHover = (listingId: string | null) => {
    setActiveListingId(listingId);
  };

  const handleMapMove = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  // Handle marker click - scroll to card and highlight it with animation
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleMarkerClick = useCallback((listing: Listing) => {
    setActiveListingId(listing.id);
    setHighlightedFromMap(listing.id);

    // Scroll the card into view
    const cardElement = listingRefs.current[listing.id];
    if (cardElement && listContainerRef.current) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    // Clear previous timer and set new one
    clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedFromMap(null);
    }, 3000);
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


  // Shared listings grid component
  const ListingsGrid = ({ showAnimations = true }: { showAnimations?: boolean }) => (
    <>
      {isLoading ? (
        <ListingSkeletonGrid count={4} />
      ) : visibleListings.length > 0 ? (
        <div className="grid grid-cols-1 @[600px]:grid-cols-2 gap-3 sm:gap-4">
          {visibleListings.map((listing, index) => (
            <div
              key={listing.id}
              ref={(el) => {
                listingRefs.current[listing.id] = el;
              }}
              onMouseEnter={() => handleCardHover(listing.id)}
              onMouseLeave={() => handleCardHover(null)}
              className={cn(
                "transition-all duration-200",
                showAnimations && isMobileLayout && index < 4 && "animate-fade-in",
                highlightedFromMap === listing.id && "ring-2 ring-accent ring-offset-2 ring-offset-background rounded-xl animate-pulse-highlight"
              )}
            >
              <MemoizedListingCard
                listing={listing}
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
          <p className="text-sm text-muted-foreground">{t('listing.noListingsInAreaDesc')}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-dvh h-dvh flex flex-col bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-16 shrink-0" />
      
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {isMobileLayout ? (
          <>
            {/* Mobile: Keep both views mounted, toggle visibility with CSS */}
            <div className="w-full flex flex-col flex-1 min-h-0 overflow-hidden relative">
              {/* List View - always mounted */}
              <div 
                className={cn(
                  "flex flex-col flex-1 min-h-0 overflow-hidden absolute inset-0 transition-opacity duration-150",
                  mobileView === 'list' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >

                {landlordId && (
                  <div className="px-4 pt-3 pb-0">
                    <div className="flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-lg px-3 py-2 text-sm">
                      <span>
                        Showing listings from{' '}
                        <Link href={`/landlord/${landlordId}`} className="font-medium hover:underline">
                          {landlordName || 'loading...'}
                        </Link>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={clearLandlordFilter}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <FilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalCount={visibleListings.length}
                  userId={user?.id}
                />

                <div ref={listContainerRef} className="flex-1 rubber-band-scroll p-3 sm:p-4">
                  <ListingsGrid showAnimations={true} />
                </div>
              </div>
              
              {/* Map View - always mounted */}
              <div 
                className={cn(
                  "flex-1 h-full min-h-0 absolute inset-0 transition-opacity duration-150",
                  mobileView === 'map' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                <MapView
                  listings={allListings || []}
                  activeListing={activeListingId}
                  onListingClick={handleMarkerClick}
                  onPopupClick={handlePopupClick}
                  onMapMove={handleMapMove}
                />
                <div className="absolute bottom-20 right-4 z-30">
                  <MobileMapFilterButton filters={filters} onFiltersChange={setFilters} />
                </div>
              </div>
            </div>

            {/* Mobile view toggle - iOS Safari optimized */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <div className="flex glass-strong rounded-full shadow-float p-1">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-center rounded-full px-5 py-2.5 min-h-[44px] min-w-[80px] text-sm font-semibold transition-all duration-200 touch-safe-button',
                    mobileView === 'list'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => {
                    haptic('medium');
                    setMobileView('list');
                  }}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <List className="h-4 w-4 mr-2" />
                  {t('map.list')}
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-center rounded-full px-5 py-2.5 min-h-[44px] min-w-[80px] text-sm font-semibold transition-all duration-200 touch-safe-button',
                    mobileView === 'map'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => {
                    haptic('medium');
                    setMobileView('map');
                  }}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  {t('map.map')}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Desktop: Fixed 50-50 split view */
          <div className="flex-1 flex min-h-0 h-full">
            {/* Left panel - Listings (50%) */}
            <div className="w-1/2 flex flex-col h-full min-h-0 border-r border-border overflow-hidden">

              {landlordId && (
                <div className="px-4 pt-3 pb-0">
                  <div className="flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-lg px-3 py-2 text-sm">
                    <span>
                      Showing listings from{' '}
                      <Link href={`/landlord/${landlordId}`} className="font-medium hover:underline">
                        {landlordName || 'loading...'}
                      </Link>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={clearLandlordFilter}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalCount={visibleListings.length}
                userId={user?.id}
              />

              <div ref={!isMobileLayout ? listContainerRef : undefined} className="flex-1 min-h-0 rubber-band-scroll p-3 sm:p-4 @container">
                <ListingsGrid showAnimations={false} />
              </div>
            </div>

            {/* Right panel - Map (50%) */}
            <div className="w-1/2 h-full relative">
              <MapView
                listings={allListings || []}
                activeListing={activeListingId}
                onListingClick={handleMarkerClick}
                onPopupClick={handlePopupClick}
                onMapMove={handleMapMove}
              />
            </div>
          </div>
        )}
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
