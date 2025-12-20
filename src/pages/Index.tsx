import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { List, MapIcon, X, Key, Banknote } from 'lucide-react';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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

// Custom hook for scroll-based header collapse - improved to reappear on scroll up
function useScrollCollapse(containerRef: React.RefObject<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const lastScrollTop = useRef(0);
  const isCollapsedRef = useRef(false);
  const scrollThreshold = 15;

  // Keep ref in sync with state to avoid stale closure
  useEffect(() => {
    isCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);

  // Check when container becomes available
  useEffect(() => {
    const checkReady = () => {
      if (containerRef.current && !isReady) {
        setIsReady(true);
      }
    };
    checkReady();
    const interval = setInterval(checkReady, 100);
    if (isReady) clearInterval(interval);
    return () => clearInterval(interval);
  }, [containerRef, isReady]);

  useEffect(() => {
    if (!isReady) return;
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollDelta = scrollTop - lastScrollTop.current;
      
      if (Math.abs(scrollDelta) < scrollThreshold) return;
      
      const isScrollingDown = scrollDelta > 0 && scrollTop > 80;
      const isScrollingUp = scrollDelta < 0;
      
      if (isScrollingDown && !isCollapsedRef.current) {
        setIsCollapsed(true);
      } else if (isScrollingUp && isCollapsedRef.current) {
        setIsCollapsed(false);
      }
      
      lastScrollTop.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isReady, containerRef]);

  return isCollapsed;
}

// LocalStorage key for panel sizes
const PANEL_SIZES_KEY = 'lovable-panel-sizes';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  
  // Use scroll collapse for mobile header
  const isHeaderCollapsed = useScrollCollapse(listContainerRef);
  
  // Load saved panel sizes from localStorage
  const [savedPanelSizes, setSavedPanelSizes] = useState<number[] | null>(() => {
    try {
      const saved = localStorage.getItem(PANEL_SIZES_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
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
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', landlordId)
        .single();
      setLandlordName(data?.full_name || 'Landlord');
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
        default:
          return 0;
      }
    });
  }, [allListings, mapBounds, sortBy, landlordId]);

  const clearLandlordFilter = () => {
    searchParams.delete('landlord');
    setSearchParams(searchParams);
  };

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

  // Handle marker click - scroll to card and highlight it with animation
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
    
    // Clear the highlight animation after 3 seconds
    setTimeout(() => {
      setHighlightedFromMap(null);
    }, 3000);
  }, []);

  // Handle popup click - open modal
  const handlePopupClick = useCallback((listing: Listing) => {
    setModalListing(listing);
  }, []);

  // Save panel sizes to localStorage
  const handlePanelResize = useCallback((sizes: number[]) => {
    try {
      localStorage.setItem(PANEL_SIZES_KEY, JSON.stringify(sizes));
      setSavedPanelSizes(sizes);
    } catch {
      // Ignore storage errors
    }
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

  // Shared rent/sale tabs component
  const RentSaleTabs = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className={cn(
      "grid transition-all duration-400 ease-in-out will-change-[grid-template-rows,opacity,transform]",
      collapsed 
        ? "grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none" 
        : "grid-rows-[1fr] opacity-100 translate-y-0"
    )}>
      <div className="overflow-hidden px-4 pt-4 pb-0">
      <div className="flex bg-secondary rounded-xl p-1 gap-1">
        <button
          onClick={() => setFilters({ ...filters, listing_type: null })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            !filters.listing_type
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilters({ ...filters, listing_type: 'rent' })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            filters.listing_type === 'rent'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Key className="h-4 w-4" />
          {t('listingTypes.rent')}
        </button>
        <button
          onClick={() => setFilters({ ...filters, listing_type: 'sale' })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            filters.listing_type === 'sale'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Banknote className="h-4 w-4" />
          {t('listingTypes.sale')}
        </button>
      </div>
      </div>
    </div>
  );

  // Shared listings grid component
  const ListingsGrid = ({ showAnimations = true }: { showAnimations?: boolean }) => (
    <>
      {isLoading ? (
        <ListingSkeletonGrid count={4} />
      ) : visibleListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 @[500px]:grid-cols-2 gap-3 sm:gap-4">
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
          <p className="text-sm text-muted-foreground">{t('listing.noListingsInAreaDesc')}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-dvh h-dvh flex flex-col bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 shrink-0" />
      
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
                {/* Collapsible Rent/Sale Tabs */}
                <RentSaleTabs collapsed={isHeaderCollapsed && mobileView === 'list'} />

                {landlordId && (
                  <div className="px-4 pt-3 pb-0">
                    <div className="flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-lg px-3 py-2 text-sm">
                      <span>
                        Showing listings from{' '}
                        <Link to={`/landlord/${landlordId}`} className="font-medium hover:underline">
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
                  isCollapsed={isHeaderCollapsed && mobileView === 'list'}
                />

                <div ref={listContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain">
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
              <div className="flex bg-card rounded-full shadow-lg border border-border p-1">
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-center rounded-full px-4 py-2.5 min-h-[44px] min-w-[80px] text-sm font-medium transition-colors touch-safe-button',
                    mobileView === 'list' 
                      ? 'bg-accent text-accent-foreground' 
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
                    'flex items-center justify-center rounded-full px-4 py-2.5 min-h-[44px] min-w-[80px] text-sm font-medium transition-colors touch-safe-button',
                    mobileView === 'map' 
                      ? 'bg-accent text-accent-foreground' 
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
          /* Desktop: resizable split view with persistent sizes */
          <ResizablePanelGroup 
            direction="horizontal" 
            className="flex-1"
            onLayout={handlePanelResize}
          >
            {/* Left panel - Listings */}
            <ResizablePanel 
              defaultSize={savedPanelSizes?.[0] ?? 35} 
              minSize={30} 
              maxSize={55}
            >
              <div className="flex flex-col h-full border-r border-border overflow-hidden">
                {/* For Rent / For Sale Tabs */}
                <RentSaleTabs collapsed={isHeaderCollapsed} />

                {landlordId && (
                  <div className="px-4 pt-3 pb-0">
                    <div className="flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-lg px-3 py-2 text-sm">
                      <span>
                        Showing listings from{' '}
                        <Link to={`/landlord/${landlordId}`} className="font-medium hover:underline">
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
                  isCollapsed={isHeaderCollapsed}
                />

                <div ref={!isMobileLayout ? listContainerRef : undefined} className="flex-1 overflow-y-auto p-3 sm:p-4 @container">
                  <ListingsGrid showAnimations={false} />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right panel - Map */}
            <ResizablePanel 
              defaultSize={savedPanelSizes?.[1] ?? 65} 
              minSize={45}
            >
              <div className="h-full relative">
                <MapView
                  listings={allListings || []}
                  activeListing={activeListingId}
                  onListingClick={handleMarkerClick}
                  onPopupClick={handlePopupClick}
                  onMapMove={handleMapMove}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
