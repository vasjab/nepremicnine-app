import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, RotateCcw, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ReverseGeocodedAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface LocationPreviewMapProps {
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
  formattedAddress?: string;
  isGeocoding: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  onReverseGeocode?: (address: ReverseGeocodedAddress) => void;
  manualCoordinates?: { latitude: number; longitude: number } | null;
  onResetLocation?: () => void;
  defaultCenter?: { lat: number; lng: number };
  showClickPrompt?: boolean;
}

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

const getMapboxToken = (): string => {
  return localStorage.getItem(MAPBOX_TOKEN_KEY) || import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
};

export function LocationPreviewMap({
  latitude,
  longitude,
  status,
  formattedAddress,
  isGeocoding,
  onLocationChange,
  onReverseGeocode,
  manualCoordinates,
  onResetLocation,
  defaultCenter = { lat: 59.3293, lng: 18.0686 }, // Stockholm default
  showClickPrompt = false,
}: LocationPreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Use manual coordinates if available, otherwise use geocoded coordinates
  const displayLat = manualCoordinates?.latitude ?? latitude;
  const displayLng = manualCoordinates?.longitude ?? longitude;
  const isManuallyAdjusted = manualCoordinates !== null && manualCoordinates !== undefined;
  const hasLocation = displayLat !== null && displayLng !== null;

  // Check for token on mount
  useEffect(() => {
    const token = getMapboxToken();
    setHasToken(!!token);
  }, []);

  // Reverse geocode function
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!onReverseGeocode) return;
    
    const token = getMapboxToken();
    if (!token) return;

    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,place&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        // Extract address components
        let address = feature.text || '';
        let city = '';
        let postalCode = '';
        let country = '';

        // If it's a full address, use the place_name but extract street
        if (feature.properties?.address) {
          address = `${feature.properties.address} ${feature.text}`;
        } else if (feature.address) {
          address = `${feature.address} ${feature.text}`;
        }

        // Extract city, postal code, country from context
        for (const ctx of context) {
          if (ctx.id.startsWith('place')) {
            city = ctx.text;
          } else if (ctx.id.startsWith('postcode')) {
            postalCode = ctx.text;
          } else if (ctx.id.startsWith('country')) {
            country = ctx.text;
          }
        }

        onReverseGeocode({ address, city, postalCode, country });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [onReverseGeocode]);

  // Handle marker position update
  const updateMarkerPosition = useCallback((lng: number, lat: number) => {
    if (marker.current && map.current) {
      marker.current.setLngLat([lng, lat]);
    }
    onLocationChange?.(lat, lng);
    // Trigger reverse geocoding when pin is placed/moved
    reverseGeocode(lat, lng);
  }, [onLocationChange, reverseGeocode]);

  // Initialize map - always show it even without coordinates
  useEffect(() => {
    if (!mapContainer.current || !hasToken) return;

    const token = getMapboxToken();
    if (!token) return;

    mapboxgl.accessToken = token;

    // If map doesn't exist yet, create it
    if (!map.current) {
      const initialCenter: [number, number] = hasLocation 
        ? [displayLng!, displayLat!] 
        : [defaultCenter.lng, defaultCenter.lat];
      
      const initialZoom = hasLocation ? 15 : 5;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
        interactive: true,
      });

      map.current.on('load', () => {
        setMapReady(true);
      });

      // Add click handler to position marker
      map.current.on('click', (e) => {
        updateMarkerPosition(e.lngLat.lng, e.lngLat.lat);
        
        // Add or update marker on click
        if (!marker.current && map.current) {
          marker.current = new mapboxgl.Marker({ 
            color: '#ef4444',
            draggable: true,
          })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);

          marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) {
              onLocationChange?.(lngLat.lat, lngLat.lng);
              reverseGeocode(lngLat.lat, lngLat.lng);
            }
          });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    }

    // If we have coordinates, fly to them and add/update marker
    if (hasLocation && map.current) {
      map.current.flyTo({
        center: [displayLng!, displayLat!],
        zoom: 15,
        duration: 1000,
      });

      // Update or create marker
      if (marker.current) {
        marker.current.setLngLat([displayLng!, displayLat!]);
      } else {
        marker.current = new mapboxgl.Marker({ 
          color: '#ef4444',
          draggable: true,
        })
          .setLngLat([displayLng!, displayLat!])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            onLocationChange?.(lngLat.lat, lngLat.lng);
            reverseGeocode(lngLat.lat, lngLat.lng);
          }
        });
      }
    }

    return () => {
      // Don't remove map on cleanup, just update coordinates
    };
  }, [displayLat, displayLng, hasToken, hasLocation, defaultCenter, updateMarkerPosition, onLocationChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Show map if we have a token (always show, even without location)
  const showMap = hasToken;

  return (
    <div className="h-full w-full relative">
      {/* Map container - fills entire parent */}
      <div
        ref={mapContainer}
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          showMap ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Loading overlay */}
      {!mapReady && showMap && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* No token state */}
      {!hasToken && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-30" />
          <span className="text-sm">Map unavailable</span>
        </div>
      )}
      
      {/* Click to drop pin prompt - shown when map is ready but no location yet */}
      {showMap && mapReady && !hasLocation && showClickPrompt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border-2 border-accent/50 animate-pulse">
            <div className="flex items-center gap-3 text-foreground">
              <MousePointer2 className="h-6 w-6 text-accent" />
              <span className="font-medium">Click anywhere to drop a pin</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating reset button on map */}
      {showMap && mapReady && isManuallyAdjusted && onResetLocation && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onResetLocation}
          className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm shadow-md z-10"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset to original
        </Button>
      )}

      {/* Help text overlay - shown when location exists */}
      {showMap && mapReady && hasLocation && onLocationChange && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground text-center">
          Click or drag the marker to adjust location
        </div>
      )}
    </div>
  );
}
