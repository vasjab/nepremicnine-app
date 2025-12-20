import { WizardStepWrapper } from '../WizardStepWrapper';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { CountrySelect } from '@/components/CountrySelect';
import { LocationPreviewMap } from '@/components/LocationPreviewMap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCountryCode } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
  onResetLocation?: () => void;
  errors: {
    city?: string;
    address?: string;
  };
}

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
  onResetLocation,
  errors,
}: LocationStepProps) {
  return (
    <WizardStepWrapper
      title="Where is your property?"
      subtitle="Pin the exact location on the map"
      emoji="📍"
    >
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Form Fields */}
        <div className="space-y-4">
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

          {/* Geocoding Status */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            geocodingStatus === 'searching' && "bg-secondary text-muted-foreground",
            geocodingStatus === 'found' && "bg-success/10 text-success",
            (geocodingStatus === 'error' || geocodingStatus === 'not_found') && "bg-destructive/10 text-destructive"
          )}>
            {isGeocoding && <Loader2 className="h-4 w-4 animate-spin" />}
            {geocodingStatus === 'found' && <CheckCircle2 className="h-4 w-4" />}
            {(geocodingStatus === 'error' || geocodingStatus === 'not_found') && <AlertCircle className="h-4 w-4" />}
            <span>
              {isGeocoding && "Finding location..."}
              {geocodingStatus === 'found' && "Location found! Drag marker to adjust."}
              {(geocodingStatus === 'error' || geocodingStatus === 'not_found') && "Couldn't find exact location. Try a different address."}
              {geocodingStatus === 'idle' && "Enter address to show on map"}
            </span>
          </div>
        </div>

        {/* Right: Map */}
        <div className="h-[300px] lg:h-[400px] rounded-2xl overflow-hidden border-2 border-border shadow-lg">
          <LocationPreviewMap
            latitude={coordinates?.latitude ?? null}
            longitude={coordinates?.longitude ?? null}
            status={geocodingStatus}
            isGeocoding={isGeocoding}
            onLocationChange={onCoordinatesChange}
            manualCoordinates={manualCoordinates}
            onResetLocation={onResetLocation}
          />
        </div>
      </div>
    </WizardStepWrapper>
  );
}
