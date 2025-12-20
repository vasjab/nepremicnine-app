import { useState, useEffect } from 'react';
import { WizardStepWrapper } from '../WizardStepWrapper';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { CountrySelect } from '@/components/CountrySelect';
import { LocationPreviewMap } from '@/components/LocationPreviewMap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getCountryCode } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertCircle, Locate, MapPin } from 'lucide-react';

interface LocationStepProps {
  country: string;
  city: string;
  address: string;
  postalCode: string;
  coordinates: { latitude: number; longitude: number } | null;
  manualCoordinates: { latitude: number; longitude: number } | null;
  isGeocoding: boolean;
  geocodingStatus: 'idle' | 'searching' | 'found' | 'not_found' | 'error';
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onAddressSelect: (suggestion: { address: string; city?: string; postalCode?: string }) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onReverseGeocode?: (address: { address: string; city: string; postalCode: string; country: string }) => void;
  onResetLocation?: () => void;
  errors: {
    city?: string;
    address?: string;
  };
}

// Default center coordinates for countries
const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Sweden': { lat: 59.3293, lng: 18.0686 },
  'Norway': { lat: 59.9139, lng: 10.7522 },
  'Denmark': { lat: 55.6761, lng: 12.5683 },
  'Finland': { lat: 60.1699, lng: 24.9384 },
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'Germany': { lat: 52.5200, lng: 13.4050 },
  'France': { lat: 48.8566, lng: 2.3522 },
  'Spain': { lat: 40.4168, lng: -3.7038 },
  'Italy': { lat: 41.9028, lng: 12.4964 },
  'United States': { lat: 40.7128, lng: -74.0060 },
};

export function LocationStep({
  country,
  city,
  address,
  postalCode,
  coordinates,
  manualCoordinates,
  isGeocoding,
  geocodingStatus,
  onCountryChange,
  onCityChange,
  onAddressChange,
  onPostalCodeChange,
  onAddressSelect,
  onCoordinatesChange,
  onReverseGeocode,
  onResetLocation,
  errors,
}: LocationStepProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Get default center based on country or use Sweden as fallback
  const getDefaultCenter = () => {
    return COUNTRY_CENTERS[country] || COUNTRY_CENTERS['Sweden'];
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCoordinatesChange(position.coords.latitude, position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out');
            break;
          default:
            setGeoError('An unknown error occurred');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Determine what coordinates to show on map
  const displayCoords = manualCoordinates || coordinates;
  const hasLocation = displayCoords !== null;

  return (
    <WizardStepWrapper
      title="Where is your property?"
      subtitle="Click on the map to drop a pin, or type the address"
      emoji="📍"
    >
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Map (shown first on mobile) */}
        <div className="order-1 lg:order-2 space-y-3">
          {/* Map container */}
          <div className="h-[300px] lg:h-[400px] rounded-2xl overflow-hidden border-2 border-border shadow-lg">
            <LocationPreviewMap
              latitude={displayCoords?.latitude ?? null}
              longitude={displayCoords?.longitude ?? null}
              status={geocodingStatus}
              isGeocoding={isGeocoding}
              onLocationChange={onCoordinatesChange}
              onReverseGeocode={onReverseGeocode}
              manualCoordinates={manualCoordinates}
              onResetLocation={onResetLocation}
              defaultCenter={getDefaultCenter()}
              showClickPrompt={!hasLocation}
            />
          </div>

          {/* Use My Location button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting your location...
              </>
            ) : (
              <>
                <Locate className="h-4 w-4 mr-2" />
                Use my current location
              </>
            )}
          </Button>

          {geoError && (
            <p className="text-sm text-destructive text-center">{geoError}</p>
          )}

          {/* Status message */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            geocodingStatus === 'searching' && "bg-secondary text-muted-foreground",
            geocodingStatus === 'found' && "bg-success/10 text-success",
            (geocodingStatus === 'error' || geocodingStatus === 'not_found') && "bg-destructive/10 text-destructive",
            geocodingStatus === 'idle' && !hasLocation && "bg-accent/10 text-accent-foreground"
          )}>
            {isGeocoding && <Loader2 className="h-4 w-4 animate-spin" />}
            {geocodingStatus === 'found' && <CheckCircle2 className="h-4 w-4" />}
            {(geocodingStatus === 'error' || geocodingStatus === 'not_found') && <AlertCircle className="h-4 w-4" />}
            {geocodingStatus === 'idle' && !hasLocation && <MapPin className="h-4 w-4" />}
            <span>
              {isGeocoding && "Finding location..."}
              {geocodingStatus === 'found' && "Location found! Drag marker or click to adjust."}
              {(geocodingStatus === 'error' || geocodingStatus === 'not_found') && "Couldn't find exact location. Click on map to set manually."}
              {geocodingStatus === 'idle' && !hasLocation && "Click on the map to drop a pin"}
              {geocodingStatus === 'idle' && hasLocation && manualCoordinates && "Location set manually. Drag marker to adjust."}
            </span>
          </div>
        </div>

        {/* Right: Form Fields (shown second on mobile) */}
        <div className="order-2 lg:order-1 space-y-4">
          {/* Country */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Country</Label>
            <CountrySelect
              value={country}
              onValueChange={(value) => {
                onCountryChange(value);
                onCityChange('');
              }}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              City <span className="text-destructive">*</span>
            </Label>
            <CityAutocomplete
              value={city}
              onChange={onCityChange}
              onSelect={(suggestion) => {
                onCityChange(suggestion.city);
                if (suggestion.postalCode) {
                  onPostalCodeChange(suggestion.postalCode);
                }
              }}
              placeholder="Start typing a city..."
              hasError={!!errors.city}
              country={getCountryCode(country)}
            />
            <p className="text-xs text-muted-foreground">Enter the city or town name</p>
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <AddressAutocomplete
              value={address}
              onChange={onAddressChange}
              onSelect={(suggestion) => {
                onAddressSelect({
                  address: suggestion.address,
                  city: suggestion.city,
                  postalCode: suggestion.postalCode,
                });
              }}
              placeholder="Start typing an address..."
              hasError={!!errors.address}
              country={getCountryCode(country)}
              city={city}
            />
            <p className="text-xs text-muted-foreground">Start typing to see suggestions, or enter manually</p>
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Postal Code</Label>
            <Input
              placeholder="111 22"
              value={postalCode}
              onChange={(e) => onPostalCodeChange(e.target.value)}
              className="h-12"
            />
          </div>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
