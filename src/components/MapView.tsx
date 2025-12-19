import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/types/listing';

interface MapViewProps {
  listings: Listing[];
  activeListing?: string | null;
  onListingClick?: (listing: Listing) => void;
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export function MapView({ listings, activeListing, onListingClick, onMapMove }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)}k`;
    }
    return price.toString();
  }, []);

  const createMarkerElement = useCallback((listing: Listing, isActive: boolean) => {
    const el = document.createElement('div');
    el.className = `map-marker ${isActive ? 'map-marker-active' : ''}`;
    el.innerHTML = formatPrice(listing.price);
    el.style.cssText = `
      background: ${isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)'};
      color: ${isActive ? 'hsl(25, 30%, 12%)' : 'hsl(25, 30%, 12%)'};
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: all 0.2s ease;
      transform: ${isActive ? 'scale(1.1)' : 'scale(1)'};
      z-index: ${isActive ? '10' : '1'};
    `;
    return el;
  }, [formatPrice]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [18.0686, 59.3293], // Stockholm by default
      zoom: 10,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    map.current.on('moveend', () => {
      if (map.current && onMapMove) {
        const bounds = map.current.getBounds();
        onMapMove({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [onMapMove]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    listings.forEach(listing => {
      const el = createMarkerElement(listing, listing.id === activeListing);
      
      el.addEventListener('click', () => {
        onListingClick?.(listing);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map.current!);

      markers.current[listing.id] = marker;
    });

    // Fit bounds to show all markers
    if (listings.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      listings.forEach(listing => {
        bounds.extend([listing.longitude, listing.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [listings, activeListing, createMarkerElement, onListingClick]);

  // Update active marker styling
  useEffect(() => {
    listings.forEach(listing => {
      const marker = markers.current[listing.id];
      if (marker) {
        const el = marker.getElement();
        const isActive = listing.id === activeListing;
        el.style.background = isActive ? 'hsl(350, 70%, 72%)' : 'hsl(0, 0%, 100%)';
        el.style.transform = isActive ? 'scale(1.1)' : 'scale(1)';
        el.style.zIndex = isActive ? '10' : '1';
      }
    });
  }, [activeListing, listings]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
