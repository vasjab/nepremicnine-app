import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Map, Satellite, Mountain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ListingLocationMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

type MapStyle = 'streets' | 'satellite' | 'outdoors';

const MAP_STYLES: Record<MapStyle, { url: string; label: string; icon: typeof Map }> = {
  streets: { url: 'mapbox://styles/mapbox/light-v11', label: 'Streets', icon: Map },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite', icon: Satellite },
  outdoors: { url: 'mapbox://styles/mapbox/outdoors-v12', label: 'Outdoors', icon: Mountain },
};

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
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [mapReady, setMapReady] = useState(false);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setMapError(false);
    }
  };

  const handleStyleChange = (style: MapStyle) => {
    if (map.current && style !== mapStyle) {
      setMapStyle(style);
      map.current.setStyle(MAP_STYLES[style].url);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[mapStyle].url,
        center: [longitude, latitude],
        zoom: 15,
        interactive: true,
      });

      map.current.on('error', () => {
        setMapError(true);
        localStorage.removeItem(MAPBOX_TOKEN_KEY);
      });

      map.current.on('load', () => {
        setMapReady(true);
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        'top-right'
      );

      // Add marker for the listing location using DOM methods (safer than innerHTML)
      const el = document.createElement('div');
      const markerDiv = document.createElement('div');
      markerDiv.style.cssText = `
        width: 40px;
        height: 40px;
        background: hsl(350, 70%, 72%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 3px solid white;
      `;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'white');
      svg.setAttribute('stroke', 'white');
      svg.setAttribute('stroke-width', '2');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '10');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'hsl(350, 70%, 72%)');
      circle.setAttribute('stroke', 'hsl(350, 70%, 72%)');
      
      svg.appendChild(path);
      svg.appendChild(circle);
      markerDiv.appendChild(svg);
      el.appendChild(markerDiv);

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
      setMapReady(false);
    };
  }, [mapboxToken, latitude, longitude]);

  if (!mapboxToken || mapError) {
    return (
      <div className="w-full h-[400px] bg-secondary rounded-xl flex items-center justify-center">
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
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Style Switcher */}
      {mapReady && (
        <div className="absolute top-3 left-3 z-10 flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border/50">
          {(Object.keys(MAP_STYLES) as MapStyle[]).map((style) => {
            const { label, icon: Icon } = MAP_STYLES[style];
            const isActive = mapStyle === style;
            return (
              <button
                key={style}
                onClick={() => handleStyleChange(style)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
