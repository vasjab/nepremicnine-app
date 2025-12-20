import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LocationPreviewMapProps {
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
  formattedAddress?: string;
  isGeocoding: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  manualCoordinates?: { latitude: number; longitude: number } | null;
  onResetLocation?: () => void;
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
  manualCoordinates,
  onResetLocation,
}: LocationPreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Use manual coordinates if available, otherwise use geocoded coordinates
  const displayLat = manualCoordinates?.latitude ?? latitude;
  const displayLng = manualCoordinates?.longitude ?? longitude;
  const isManuallyAdjusted = manualCoordinates !== null && manualCoordinates !== undefined;

  // Check for token on mount
  useEffect(() => {
    const token = getMapboxToken();
    setHasToken(!!token);
  }, []);

  // Handle marker position update
  const updateMarkerPosition = useCallback((lng: number, lat: number) => {
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    }
    onLocationChange?.(lat, lng);
  }, [onLocationChange]);

  // Initialize map when we have valid coordinates
  useEffect(() => {
    if (!mapContainer.current || !hasToken) return;
    if (displayLat === null || displayLng === null) return;

    const token = getMapboxToken();
    if (!token) return;

    mapboxgl.accessToken = token;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [displayLng, displayLat],
        zoom: 15,
        interactive: true, // Enable interactivity
      });

      map.current.on('load', () => {
        setMapReady(true);
      });

      // Add click handler to reposition marker
      map.current.on('click', (e) => {
        updateMarkerPosition(e.lngLat.lng, e.lngLat.lat);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    } else {
      map.current.flyTo({
        center: [displayLng, displayLat],
        zoom: 15,
        duration: 1000,
      });
    }

    // Update or create marker
    if (marker.current) {
      marker.current.setLngLat([displayLng, displayLat]);
    } else {
      marker.current = new mapboxgl.Marker({ 
        color: '#ef4444',
        draggable: true, // Enable dragging
      })
        .setLngLat([displayLng, displayLat])
        .addTo(map.current);

      // Handle marker drag end
      marker.current.on('dragend', () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          onLocationChange?.(lngLat.lat, lngLat.lng);
        }
      });
    }

    return () => {
      // Don't remove map on cleanup, just update coordinates
    };
  }, [displayLat, displayLng, hasToken, updateMarkerPosition, onLocationChange]);

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

  // Show status indicator
  const renderStatus = () => {
    if (isGeocoding) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Searching for location...</span>
        </div>
      );
    }

    switch (status) {
      case 'found':
        return (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-green-600 min-w-0">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">
                {isManuallyAdjusted ? 'Location manually adjusted' : formattedAddress || 'Location found'}
              </span>
            </div>
            {isManuallyAdjusted && onResetLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetLocation}
                className="shrink-0 h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        );
      case 'not_found':
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Could not find location</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error looking up location</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Enter address to see location</span>
          </div>
        );
    }
  };

  const showMap = hasToken && displayLat !== null && displayLng !== null && (status === 'found' || isManuallyAdjusted);

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
      
      {/* Idle state placeholder */}
      {!showMap && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-2 opacity-30" />
          <span className="text-sm">Enter address to see location</span>
        </div>
      )}
      
      {/* Help text overlay */}
      {showMap && mapReady && onLocationChange && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground text-center">
          Click or drag the marker to adjust location
        </div>
      )}
    </div>
  );
}
