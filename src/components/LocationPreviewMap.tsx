import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPreviewMapProps {
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
  formattedAddress?: string;
  isGeocoding: boolean;
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
}: LocationPreviewMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check for token on mount
  useEffect(() => {
    const token = getMapboxToken();
    setHasToken(!!token);
  }, []);

  // Initialize map when we have valid coordinates
  useEffect(() => {
    if (!mapContainer.current || !hasToken) return;
    if (latitude === null || longitude === null) return;

    const token = getMapboxToken();
    if (!token) return;

    mapboxgl.accessToken = token;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 15,
        interactive: false,
      });

      map.current.on('load', () => {
        setMapReady(true);
      });
    } else {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1000,
      });
    }

    // Update or create marker
    if (marker.current) {
      marker.current.setLngLat([longitude, latitude]);
    } else {
      marker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }

    return () => {
      // Don't remove map on cleanup, just update coordinates
    };
  }, [latitude, longitude, hasToken]);

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
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm truncate">
              {formattedAddress || 'Location found'}
            </span>
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

  const showMap = hasToken && latitude !== null && longitude !== null && status === 'found';

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      <div className="p-3 rounded-lg bg-muted/50">
        {renderStatus()}
      </div>

      {/* Map preview */}
      <div
        className={cn(
          'relative rounded-lg overflow-hidden border border-border transition-all duration-300',
          showMap ? 'h-48 opacity-100' : 'h-0 opacity-0 border-0'
        )}
      >
        <div ref={mapContainer} className="absolute inset-0" />
        {!mapReady && showMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
