import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Map, Satellite, Mountain } from 'lucide-react';

type MapStyle = 'streets' | 'satellite' | 'outdoors';

const MAP_STYLES: Record<MapStyle, { url: string; label: string; icon: typeof Map }> = {
  streets: { url: 'mapbox://styles/mapbox/light-v11', label: 'Streets', icon: Map },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite', icon: Satellite },
  outdoors: { url: 'mapbox://styles/mapbox/outdoors-v12', label: 'Outdoors', icon: Mountain },
};

interface MapViewProps {
  listings: Listing[];
  activeListing?: string | null;
  onListingClick?: (listing: Listing) => void;
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

export function MapView({ listings, activeListing, onListingClick, onMapMove }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const onMapMoveRef = useRef(onMapMove);
  const onListingClickRef = useRef(onListingClick);
  const initialFitDone = useRef(false);
  const listingsRef = useRef<Listing[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');

  // Keep refs updated
  useEffect(() => {
    onMapMoveRef.current = onMapMove;
  }, [onMapMove]);

  useEffect(() => {
    onListingClickRef.current = onListingClick;
  }, [onListingClick]);

  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)}k`;
    }
    return price.toString();
  }, []);

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

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [14.5058, 46.0515], // Ljubljana center
        zoom: 12,
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

      mapInstance.on('moveend', () => {
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

  // Update markers when listings change (but don't re-fit bounds on every change)
  useEffect(() => {
    if (!map.current || !mapReady) return;

    const currentListingIds = new Set(listings.map(l => l.id));
    const existingIds = new Set(Object.keys(markers.current));

    // Remove markers that are no longer in listings
    existingIds.forEach(id => {
      if (!currentListingIds.has(id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });

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
        el.innerHTML = formatPrice(listing.price);
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

        // Create popup for hover preview
        const imageUrl = listing.images && listing.images.length > 0 
          ? listing.images[0] 
          : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
        
        const propertyTypeLabels: Record<string, string> = {
          apartment: 'Apartment',
          house: 'House',
          room: 'Room',
          studio: 'Studio',
          villa: 'Villa',
          other: 'Other',
        };

        const priceDisplay = listing.listing_type === 'rent' 
          ? `€${listing.price.toLocaleString()}/mo`
          : `€${listing.price.toLocaleString()}`;

        const popupContent = `
          <div style="width: 220px; font-family: 'DM Sans', system-ui, sans-serif;">
            <div style="width: 100%; height: 120px; overflow: hidden; border-radius: 8px 8px 0 0;">
              <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 12px;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px; text-transform: uppercase;">
                ${propertyTypeLabels[listing.property_type] || 'Property'} • ${listing.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #2d2319; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${listing.address}
              </div>
              <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
                ${listing.bedrooms} room${listing.bedrooms !== 1 ? 's' : ''} • ${listing.area_sqm ? listing.area_sqm + ' m²' : 'N/A'}
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #2d2319;">
                ${priceDisplay}
              </div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
          className: 'listing-popup',
        }).setHTML(popupContent);
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentListing = listingsRef.current.find(l => l.id === listing.id);
          if (currentListing && onListingClickRef.current) {
            onListingClickRef.current(currentListing);
          }
        });

        el.addEventListener('mouseenter', () => {
          el.style.background = 'hsl(350, 70%, 72%)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
          popup.setLngLat([listing.longitude, listing.latitude]).addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          const isActive = listing.id === activeListing;
          el.style.background = isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)';
          el.style.boxShadow = isActive ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)';
          popup.remove();
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
  }, [listings, mapReady, formatPrice, activeListing]);

  // Update active marker styling separately
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      const isActive = id === activeListing;
      el.style.background = isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)';
      el.style.boxShadow = isActive ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)';
    });
  }, [activeListing]);

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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Style Switcher */}
      <div className="absolute top-3 left-3 z-10 flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border/50">
        {(Object.keys(MAP_STYLES) as MapStyle[]).map((style) => {
          const { label, icon: Icon } = MAP_STYLES[style];
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
    </div>
  );
}
