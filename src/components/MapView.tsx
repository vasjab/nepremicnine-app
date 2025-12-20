import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Map, Satellite, Mountain, Maximize2 } from 'lucide-react';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useTranslation } from '@/hooks/useTranslation';

type MapStyle = 'streets' | 'satellite' | 'outdoors';

const MAP_STYLES: Record<MapStyle, { url: string; icon: typeof Map }> = {
  streets: { url: 'mapbox://styles/mapbox/light-v11', icon: Map },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12', icon: Satellite },
  outdoors: { url: 'mapbox://styles/mapbox/outdoors-v12', icon: Mountain },
};

interface MapViewProps {
  listings: Listing[];
  activeListing?: string | null;
  onListingClick?: (listing: Listing) => void;
  onPopupClick?: (listing: Listing) => void;
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';
const MAP_STATE_KEY = 'hemma_map_state';

interface MapState {
  center: [number, number];
  zoom: number;
}

const getStoredMapState = (): MapState | null => {
  try {
    const stored = sessionStorage.getItem(MAP_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const saveMapState = (center: [number, number], zoom: number) => {
  try {
    sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify({ center, zoom }));
  } catch {
    // Ignore storage errors
  }
};

export function MapView({ listings, activeListing, onListingClick, onPopupClick, onMapMove }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popups = useRef<{ [key: string]: mapboxgl.Popup }>({});
  const activePopupId = useRef<string | null>(null);
  const onMapMoveRef = useRef(onMapMove);
  const onListingClickRef = useRef(onListingClick);
  const onPopupClickRef = useRef(onPopupClick);
  const initialFitDone = useRef(false);
  const listingsRef = useRef<Listing[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');

  // Use internationalization hooks
  const { formatPrice, formatArea, currency, rentPeriod, areaUnit } = useFormattedPrice();
  const { t } = useTranslation();

  // Keep refs updated
  useEffect(() => {
    onMapMoveRef.current = onMapMove;
  }, [onMapMove]);

  useEffect(() => {
    onListingClickRef.current = onListingClick;
  }, [onListingClick]);

  useEffect(() => {
    onPopupClickRef.current = onPopupClick;
  }, [onPopupClick]);

  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setMapError(false);
    }
  };

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Restore saved map state or use defaults
      const savedState = getStoredMapState();
      const initialCenter: [number, number] = savedState?.center || [14.5058, 46.0515];
      const initialZoom = savedState?.zoom || 12;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialCenter,
        zoom: initialZoom,
      });

      mapInstance.on('error', () => {
        setMapError(true);
        localStorage.removeItem(MAPBOX_TOKEN_KEY);
      });

      mapInstance.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      mapInstance.on('load', () => {
        setMapReady(true);
        
        // Initial bounds report
        if (onMapMoveRef.current) {
          const bounds = mapInstance.getBounds();
          onMapMoveRef.current({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      });

      // Close popup when clicking on the map (not on a marker)
      mapInstance.on('click', () => {
        if (activePopupId.current) {
          popups.current[activePopupId.current]?.remove();
          activePopupId.current = null;
        }
      });

      mapInstance.on('moveend', () => {
        // Save map state to sessionStorage for persistence
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        saveMapState([center.lng, center.lat], zoom);

        if (onMapMoveRef.current) {
          const bounds = mapInstance.getBounds();
          onMapMoveRef.current({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      });

      map.current = mapInstance;
    } catch (error) {
      setMapError(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Track i18n settings to force marker recreation
  const lastI18nKey = useRef<string>('');
  const currentI18nKey = `${currency}-${rentPeriod}-${areaUnit}`;

  // Update markers when listings or i18n settings change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    const currentListingIds = new Set(listings.map(l => l.id));
    const existingIds = new Set(Object.keys(markers.current));
    const i18nChanged = lastI18nKey.current !== currentI18nKey;

    // If i18n settings changed, remove ALL markers to force recreation
    if (i18nChanged) {
      existingIds.forEach(id => {
        markers.current[id].remove();
        popups.current[id]?.remove();
        delete markers.current[id];
        delete popups.current[id];
      });
      lastI18nKey.current = currentI18nKey;
    } else {
      // Remove only markers that are no longer in listings
      existingIds.forEach(id => {
        if (!currentListingIds.has(id)) {
          markers.current[id].remove();
          delete markers.current[id];
        }
      });
    }

    // Add or update markers
    listings.forEach(listing => {
      if (markers.current[listing.id]) {
        // Marker exists, just update position if needed
        const marker = markers.current[listing.id];
        const lngLat = marker.getLngLat();
        if (lngLat.lng !== listing.longitude || lngLat.lat !== listing.latitude) {
          marker.setLngLat([listing.longitude, listing.latitude]);
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.textContent = formatPrice(listing.price, listing.currency || 'EUR', { 
          isRental: listing.listing_type === 'rent', 
          showPeriod: listing.listing_type === 'rent'
        });
        el.style.cssText = `
          background: hsl(0, 0%, 100%);
          color: hsl(25, 30%, 12%);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        `;

        // Create popup for click preview
        const images = listing.images && listing.images.length > 0 
          ? listing.images 
          : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'];
        const hasMultipleImages = images.length > 1;
        
        const propertyTypeLabels: Record<string, string> = {
          apartment: t('propertyTypes.apartment'),
          house: t('propertyTypes.house'),
          room: t('propertyTypes.room'),
          studio: t('propertyTypes.studio'),
          villa: t('propertyTypes.villa'),
          other: t('propertyTypes.other'),
        };

        const priceDisplay = formatPrice(listing.price, listing.currency || 'EUR', { 
          isRental: listing.listing_type === 'rent', 
          showPeriod: listing.listing_type === 'rent' 
        });

        const dotsHtml = hasMultipleImages 
          ? `<div class="popup-dots-${listing.id}" style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 10;">
              ${images.map((_, i) => `<span class="popup-dot-${listing.id}" data-index="${i}" style="width: 6px; height: 6px; border-radius: 50%; background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.6)'}; cursor: pointer; transition: all 0.2s;"></span>`).join('')}
            </div>`
          : '';

        const arrowsHtml = hasMultipleImages
          ? `<button class="popup-prev-${listing.id}" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; z-index: 10;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button class="popup-next-${listing.id}" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; z-index: 10;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>`
          : '';

        const popupContent = `
          <style>
            .popup-btn-${listing.id} {
              margin-top: 8px;
              padding: 10px 8px;
              background: hsl(350, 70%, 72%);
              border-radius: 6px;
              text-align: center;
              font-size: 13px;
              font-weight: 600;
              color: white;
              transition: background 0.15s ease, transform 0.15s ease;
            }
            .popup-btn-${listing.id}:hover {
              background: hsl(350, 70%, 62%);
              transform: scale(1.02);
            }
            .popup-img-container-${listing.id}:hover .popup-prev-${listing.id},
            .popup-img-container-${listing.id}:hover .popup-next-${listing.id} {
              opacity: 1 !important;
            }
          </style>
          <div class="popup-content-${listing.id}" style="width: 240px; font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer;">
            <div class="popup-img-container-${listing.id}" style="position: relative; width: 100%; height: 140px; overflow: hidden; border-radius: 8px 8px 0 0;">
              <img class="popup-img-${listing.id}" src="${images[0]}" alt="${listing.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s ease;" />
              ${arrowsHtml}
              ${dotsHtml}
            </div>
            <div style="padding: 14px;">
              <div style="font-size: 11px; color: #888; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
                ${propertyTypeLabels[listing.property_type] || t('propertyTypes.other')} • ${listing.listing_type === 'rent' ? t('map.forRent') : t('map.forSale')}
              </div>
              <div style="font-size: 15px; font-weight: 600; color: #2d2319; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${listing.address}
              </div>
              <div style="font-size: 13px; color: #666; margin-bottom: 10px;">
                ${listing.bedrooms} ${listing.bedrooms !== 1 ? t('map.rooms') : t('map.room')} • ${formatArea(listing.area_sqm)}
              </div>
              <div style="font-size: 18px; font-weight: 700; color: #2d2319;">
                ${priceDisplay}
              </div>
              <div class="popup-btn-${listing.id}">
                ${t('map.viewDetails')}
              </div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: [0, -10],
          className: 'listing-popup',
        }).setHTML(popupContent);

        // Add click handler to popup content after it opens
        popup.on('open', () => {
          let currentIndex = 0;
          const popupEl = document.querySelector(`.popup-content-${listing.id}`);
          const imgEl = document.querySelector(`.popup-img-${listing.id}`) as HTMLImageElement;
          const imgContainer = document.querySelector(`.popup-img-container-${listing.id}`) as HTMLElement;
          const prevBtn = document.querySelector(`.popup-prev-${listing.id}`);
          const nextBtn = document.querySelector(`.popup-next-${listing.id}`);
          const dots = document.querySelectorAll(`.popup-dot-${listing.id}`);

          const updateImage = (newIndex: number) => {
            currentIndex = newIndex;
            if (imgEl && images[currentIndex]) {
              imgEl.src = images[currentIndex];
            }
            dots.forEach((dot, i) => {
              (dot as HTMLElement).style.background = i === currentIndex ? 'white' : 'rgba(255,255,255,0.6)';
              (dot as HTMLElement).style.width = i === currentIndex ? '12px' : '6px';
            });
          };

          // Touch swipe support for mobile
          if (imgContainer && hasMultipleImages) {
            let touchStartX = 0;
            let touchEndX = 0;

            imgContainer.addEventListener('touchstart', (e) => {
              touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            imgContainer.addEventListener('touchend', (e) => {
              touchEndX = e.changedTouches[0].screenX;
              const diff = touchStartX - touchEndX;
              
              // Only trigger swipe if horizontal movement is significant (>50px)
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  // Swipe left → next image
                  const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
                  updateImage(newIndex);
                } else {
                  // Swipe right → previous image
                  const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                  updateImage(newIndex);
                }
              }
            }, { passive: true });
          }

          if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
              updateImage(newIndex);
            });
          }

          if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
              updateImage(newIndex);
            });
          }

          dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
              e.stopPropagation();
              const index = parseInt((dot as HTMLElement).dataset.index || '0', 10);
              updateImage(index);
            });
          });

          if (popupEl) {
            popupEl.addEventListener('click', (e) => {
              // Only trigger if not clicking on navigation elements
              const target = e.target as HTMLElement;
              if (target.closest(`.popup-prev-${listing.id}`) || 
                  target.closest(`.popup-next-${listing.id}`) ||
                  target.closest(`.popup-dot-${listing.id}`)) {
                return;
              }
              const currentListing = listingsRef.current.find(l => l.id === listing.id);
              if (currentListing && onPopupClickRef.current) {
                onPopupClickRef.current(currentListing);
              }
            });
          }
        });

        // Store popup reference
        popups.current[listing.id] = popup;
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Close any existing popup
          if (activePopupId.current && activePopupId.current !== listing.id) {
            popups.current[activePopupId.current]?.remove();
          }
          
          // Toggle popup for this marker
          if (activePopupId.current === listing.id) {
            popup.remove();
            activePopupId.current = null;
          } else {
            popup.setLngLat([listing.longitude, listing.latitude]).addTo(map.current!);
            activePopupId.current = listing.id;
          }
          
          // Also trigger the listing click callback
          const currentListing = listingsRef.current.find(l => l.id === listing.id);
          if (currentListing && onListingClickRef.current) {
            onListingClickRef.current(currentListing);
          }
        });

        // Handle popup close via X button
        popup.on('close', () => {
          if (activePopupId.current === listing.id) {
            activePopupId.current = null;
          }
        });

        el.addEventListener('mouseenter', () => {
          el.style.background = 'hsl(350, 70%, 72%)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        });

        el.addEventListener('mouseleave', () => {
          const isActive = listing.id === activeListing;
          el.style.background = isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)';
          el.style.boxShadow = isActive ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)';
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(map.current!);

        markers.current[listing.id] = marker;
      }
    });

    // Fit bounds only on first load with listings
    if (!initialFitDone.current && listings.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      listings.forEach(listing => {
        bounds.extend([listing.longitude, listing.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 14,
        duration: 500,
      });
      
      initialFitDone.current = true;
    }
  }, [listings, mapReady, activeListing, formatPrice, formatArea, currency, rentPeriod, areaUnit]);

  // Update active marker styling separately
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      const isActive = id === activeListing;
      el.style.background = isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)';
      el.style.boxShadow = isActive ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)';
    });
  }, [activeListing]);

  // Add ResizeObserver to trigger map resize when container size changes
  useEffect(() => {
    if (!mapContainer.current || !map.current || !mapReady) return;
    
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    
    resizeObserver.observe(mapContainer.current);
    
    return () => resizeObserver.disconnect();
  }, [mapReady]);

  // Show token input if no token is available
  if (!mapboxToken || mapError) {
    return (
      <div className="relative w-full h-full bg-secondary flex items-center justify-center">
        <div className="max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Mapbox API Token Required
          </h3>
          <p className="text-muted-foreground mb-6">
            To display the map, enter your Mapbox public token. Get one for free at{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="pk.eyJ1Ijo..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSaveToken}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Save
            </Button>
          </div>
          {mapError && (
            <p className="text-sm text-destructive mt-3">
              Invalid token. Please check and try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleStyleChange = (style: MapStyle) => {
    if (map.current && style !== mapStyle) {
      setMapStyle(style);
      map.current.setStyle(MAP_STYLES[style].url);
    }
  };

  const handleResetView = () => {
    if (!map.current || listings.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    listings.forEach(listing => {
      bounds.extend([listing.longitude, listing.latitude]);
    });
    
    map.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 14,
      duration: 500,
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Style Switcher */}
      <div className="absolute top-3 left-3 z-10 flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border/50">
        {(Object.keys(MAP_STYLES) as MapStyle[]).map((style) => {
          const { icon: Icon } = MAP_STYLES[style];
          const label = t(`map.${style}`);
          const isActive = mapStyle === style;
          return (
            <button
              key={style}
              onClick={() => handleStyleChange(style)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Reset View Button */}
      <button
        onClick={handleResetView}
        className="absolute top-3 right-14 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-background/95 backdrop-blur-sm rounded-lg shadow-md border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        title={t('map.resetView')}
      >
        <Maximize2 className="h-4 w-4" />
        <span className="hidden sm:inline">{t('map.resetView')}</span>
      </button>
    </div>
  );
}
