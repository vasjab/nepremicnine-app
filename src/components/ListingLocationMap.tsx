import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ListingLocationMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

export function ListingLocationMap({ latitude, longitude, address }: ListingLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState(() => {
    return localStorage.getItem(MAPBOX_TOKEN_KEY) || import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState(false);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setMapError(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [longitude, latitude],
        zoom: 15,
        interactive: true,
      });

      map.current.on('error', () => {
        setMapError(true);
        localStorage.removeItem(MAPBOX_TOKEN_KEY);
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        'top-right'
      );

      // Add marker for the listing location
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: hsl(350, 70%, 72%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          border: 3px solid white;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3" fill="hsl(350, 70%, 72%)" stroke="hsl(350, 70%, 72%)"/>
          </svg>
        </div>
      `;

      marker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

    } catch (error) {
      setMapError(true);
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, latitude, longitude]);

  if (!mapboxToken || mapError) {
    return (
      <div className="w-full h-[300px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="max-w-sm p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Mapbox Token Required
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to view the map.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="pk.eyJ1Ijo..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={handleSaveToken}
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Save
            </Button>
          </div>
          {mapError && (
            <p className="text-xs text-destructive mt-2">
              Invalid token. Please try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
