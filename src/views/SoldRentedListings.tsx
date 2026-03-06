'use client';

import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Home, List, MapIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { MobileMapFilterButton } from '@/components/MobileMapFilterButton';
import { Skeleton } from '@/components/ui/skeleton';
// Tabs/TabsContent removed — we use conditional rendering with our own activeTab state
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileViewPreference } from '@/hooks/useMobileViewPreference';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, ListingFilters, SortOption } from '@/types/listing';
import { usePersistedFilters } from '@/hooks/usePersistedFilters';
import { cn } from '@/lib/utils';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const MemoizedListingCard = memo(ListingCard);

function useCompletedListings(status: 'sold' | 'rented') {
  return useQuery({
    queryKey: ['completed-listings', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', status)
        .eq('is_draft', false)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Listing[];
    },
  });
}

export default function SoldRentedListings() {
  const { t } = useTranslation();
  const router = useRouter();
  const isMobileLayout = useIsMobile();
  const { trigger: haptic } = useHapticFeedback();
  const { user } = useAuth();
  
  const { filters, setFilters, sortBy, setSortBy, activeTab: persistedTab, setActiveTab: setPersistedTab } = usePersistedFilters({
    storageKey: 'hemma_sold_filters',
    defaultFilters: {},
    defaultSort: 'newest',
  });
  const activeTab = (persistedTab as 'sold' | 'rented') || 'sold';
  const setActiveTab = (v: 'sold' | 'rented') => setPersistedTab(v);

  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [highlightedFromMap, setHighlightedFromMap] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useMobileViewPreference();
  
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: soldListings, isLoading: isSoldLoading } = useCompletedListings('sold');
  const { data: rentedListings, isLoading: isRentedLoading } = useCompletedListings('rented');

  const isLoading = activeTab === 'sold' ? isSoldLoading : isRentedLoading;
  const allListings = activeTab === 'sold' ? soldListings : rentedListings;

  // Filter listings based on map bounds, filters, and sorting
  const filteredListings = useMemo(() => {
    if (!allListings) return [];
    
    let result = allListings.filter(listing => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          listing.title?.toLowerCase().includes(searchLower) ||
          listing.address?.toLowerCase().includes(searchLower) ||
          listing.city?.toLowerCase().includes(searchLower) ||
          listing.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Property type filter
      if (filters.property_types?.length && !filters.property_types.includes(listing.property_type)) return false;
      
      // Price filter
      if (filters.min_price && listing.price < filters.min_price) return false;
      if (filters.max_price && listing.price > filters.max_price) return false;
      
      // Size filter
      if (filters.min_area && (!listing.area_sqm || listing.area_sqm < filters.min_area)) return false;
      if (filters.max_area && listing.area_sqm && listing.area_sqm > filters.max_area) return false;
      
      // Bedrooms filter
      if (filters.min_bedrooms && listing.bedrooms < filters.min_bedrooms) return false;
      
      // Bathrooms filter
      if (filters.min_bathrooms && listing.bathrooms < filters.min_bathrooms) return false;
      
      return true;
    });

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime();
        case 'oldest':
          return new Date(a.completed_at || a.created_at).getTime() - new Date(b.completed_at || b.created_at).getTime();
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
  }, [allListings, sortBy, filters]);

  const handleListingClick = (listing: Listing) => {
    setNavigatingId(listing.id);
    router.push(`/listing/${listing.id}`);
  };

  const handleCardHover = (listingId: string | null) => {
    setActiveListingId(listingId);
  };

  const handleMapMove = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleMarkerClick = useCallback((listing: Listing) => {
    setActiveListingId(listing.id);
    setHighlightedFromMap(listing.id);
    
    const cardElement = listingRefs.current[listing.id];
    if (cardElement && listContainerRef.current) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
    
    setTimeout(() => {
      setHighlightedFromMap(null);
    }, 3000);
  }, []);

  const handlePopupClick = useCallback((listing: Listing) => {
    setNavigatingId(listing.id);
    router.push(`/listing/${listing.id}`);
  }, [router]);

  // Clear highlight after delay
  useEffect(() => {
    if (activeListingId) {
      const timer = setTimeout(() => {
        const cardElement = listingRefs.current[activeListingId];
        if (cardElement && !cardElement.matches(':hover')) {
          // Keep highlighted for visibility
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeListingId]);

  const statusTabs = [
    { value: 'sold', label: t('soldRented.recentlySold'), emoji: '🏠', count: soldListings?.length },
    { value: 'rented', label: t('soldRented.recentlyRented'), emoji: '🔑', count: rentedListings?.length },
  ];

  const ListingsGrid = ({ showAnimations = true }: { showAnimations?: boolean }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 @[600px]:grid-cols-2 @[900px]:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (!filteredListings || filteredListings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {activeTab === 'sold' ? t('soldRented.noSoldYet') : t('soldRented.noRentedYet')}
          </h2>
          <p className="text-muted-foreground max-w-sm">
            {t('soldRented.noListingsDesc')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 @[600px]:grid-cols-2 @[900px]:grid-cols-3 gap-3 sm:gap-4">
        {filteredListings.map((listing, index) => (
          <div
            key={listing.id}
            ref={(el) => {
              listingRefs.current[listing.id] = el;
            }}
            onMouseEnter={() => handleCardHover(listing.id)}
            onMouseLeave={() => handleCardHover(null)}
            className={cn(
              "transition-all duration-200 relative",
              showAnimations && isMobileLayout && index < 4 && "animate-fade-in",
              highlightedFromMap === listing.id && "ring-2 ring-accent ring-offset-2 ring-offset-background rounded-xl animate-pulse-highlight"
            )}
          >
            <MemoizedListingCard
              listing={listing}
              onClick={() => handleListingClick(listing)}
              showStatusOverlay={true}
            />
            {navigatingId === listing.id && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 animate-fade-in">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-dvh h-dvh flex flex-col bg-background">
      <Header pageTitle={t('soldRented.title')} />
      
      {/* Spacer for fixed header */}
      <div className="h-16 shrink-0" />
      
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {isMobileLayout ? (
            <>
              {/* Mobile: Keep both views mounted, toggle visibility */}
              <div className="w-full flex flex-col flex-1 min-h-0 overflow-hidden relative">
                {/* List View */}
                <div 
                  className={cn(
                    "flex flex-col flex-1 min-h-0 overflow-hidden absolute inset-0 transition-opacity duration-150",
                    mobileView === 'list' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                >
                  <FilterBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalCount={filteredListings.length}
                    userId={user?.id}
                    tabs={statusTabs}
                    activeTab={activeTab}
                    onTabChange={(v) => setActiveTab(v as 'sold' | 'rented')}
                  />

                  <div className="flex-1 overflow-hidden">
                    <div ref={listContainerRef} className="h-full rubber-band-scroll p-3 sm:p-4 @container">
                      <ListingsGrid showAnimations={true} />
                    </div>
                  </div>
                </div>
                
                {/* Map View */}
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

              {/* Mobile view toggle */}
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="flex rounded-full bg-gray-900/90 backdrop-blur-xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-center rounded-full px-5 py-2.5 min-h-[44px] min-w-[80px] text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.95] touch-safe-button',
                      mobileView === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-white',
                    )}
                    onClick={() => {
                      haptic('medium');
                      setMobileView('list');
                    }}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <List className="h-4 w-4 mr-1.5" />
                    {t('map.list')}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center justify-center rounded-full px-5 py-2.5 min-h-[44px] min-w-[80px] text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.95] touch-safe-button',
                      mobileView === 'map'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-white',
                    )}
                    onClick={() => {
                      haptic('medium');
                      setMobileView('map');
                    }}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <MapIcon className="h-4 w-4 mr-1.5" />
                    {t('map.map')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Desktop: Fixed 50-50 split view */
            <div className="flex-1 flex min-h-0 h-full">
              {/* Left panel - Tabs + Listings (50%) */}
              <div className="w-1/2 flex flex-col h-full min-h-0 border-r border-border overflow-hidden">
                <FilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalCount={filteredListings.length}
                  userId={user?.id}
                  tabs={statusTabs}
                  activeTab={activeTab}
                  onTabChange={(v) => setActiveTab(v as 'sold' | 'rented')}
                />
                
                <div className="flex-1 overflow-hidden">
                  <div ref={listContainerRef} className="h-full rubber-band-scroll p-3 sm:p-4 @container">
                    <ListingsGrid showAnimations={false} />
                  </div>
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
      </div>

    </div>
  );
}
