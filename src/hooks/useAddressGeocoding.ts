import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface UseAddressGeocodingProps {
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
}

interface UseAddressGeocodingReturn {
  coordinates: GeocodingResult | null;
  isGeocoding: boolean;
  error: string | null;
  status: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
}

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

const getMapboxToken = (): string => {
  return localStorage.getItem(MAPBOX_TOKEN_KEY) || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
};

export function useAddressGeocoding({
  address,
  city,
  postalCode,
  country = 'Sweden',
}: UseAddressGeocodingProps): UseAddressGeocodingReturn {
  const [coordinates, setCoordinates] = useState<GeocodingResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'error'>('idle');

  // Combine address parts for geocoding
  const fullAddress = [address, postalCode, city, country]
    .filter(Boolean)
    .join(', ');

  // Debounce the full address to avoid too many API calls
  const debouncedAddress = useDebounce(fullAddress, 800);

  const geocodeAddress = useCallback(async (searchAddress: string) => {
    if (!searchAddress || searchAddress.split(',').filter(s => s.trim()).length < 2) {
      setStatus('idle');
      setCoordinates(null);
      return;
    }

    // Check if we have at least address and city
    if (!address.trim() || !city.trim()) {
      setStatus('idle');
      return;
    }

    setIsGeocoding(true);
    setStatus('searching');
    setError(null);

    try {
      const token = getMapboxToken();
      if (!token) {
        setError('Mapbox token not configured');
        setStatus('error');
        setIsGeocoding(false);
        return;
      }
      
      const encodedAddress = encodeURIComponent(searchAddress);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1&types=address,place`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;

        setCoordinates({
          latitude,
          longitude,
          formattedAddress: feature.place_name,
        });
        setStatus('found');
      } else {
        setCoordinates(null);
        setStatus('not_found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to geocode address');
      setStatus('error');
      setCoordinates(null);
    } finally {
      setIsGeocoding(false);
    }
  }, [address, city]);

  useEffect(() => {
    geocodeAddress(debouncedAddress);
  }, [debouncedAddress, geocodeAddress]);

  return {
    coordinates,
    isGeocoding,
    error,
    status,
  };
}
