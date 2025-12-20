import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

const getMapboxToken = (): string => {
  return localStorage.getItem(MAPBOX_TOKEN_KEY) || import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
};

interface AddressSuggestion {
  id: string;
  address: string;
  fullAddress: string;
  city?: string;
  postalCode?: string;
  coordinates: [number, number]; // [lng, lat]
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  country?: string;
  city?: string; // Used to bias results toward this city
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder = 'Start typing an address...',
  className,
  hasError,
  country = 'SE',
  city,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(value, 300);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      const token = getMapboxToken();
      if (!token) {
        console.warn('No Mapbox token available for autocomplete');
        return;
      }

      setIsLoading(true);
      try {
        // Include city in search query to bias results toward that city
        const searchQuery = city 
          ? `${debouncedQuery}, ${city}`
          : debouncedQuery;

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
          `access_token=${token}&autocomplete=true&country=${country}&types=address&limit=5`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        
        const mappedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => {
          // Extract city and postal code from context
          let featureCity = '';
          let postalCode = '';
          
          if (feature.context) {
            for (const ctx of feature.context) {
              if (ctx.id.startsWith('place')) {
                featureCity = ctx.text;
              } else if (ctx.id.startsWith('postcode')) {
                postalCode = ctx.text;
              }
            }
          }

          return {
            id: feature.id,
            address: feature.text + (feature.address ? ` ${feature.address}` : ''),
            fullAddress: feature.place_name,
            city: featureCity,
            postalCode,
            coordinates: feature.center as [number, number],
          };
        });

        // Sort results: prioritize addresses in the selected city
        if (city) {
          mappedSuggestions.sort((a, b) => {
            const aInCity = a.city?.toLowerCase() === city.toLowerCase();
            const bInCity = b.city?.toLowerCase() === city.toLowerCase();
            if (aInCity && !bInCity) return -1;
            if (!aInCity && bInCity) return 1;
            return 0;
          });
        }

        setSuggestions(mappedSuggestions);
        setIsOpen(mappedSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, country, city]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.address);
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(hasError && 'border-destructive', className)}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                className={cn(
                  'flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors',
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                )}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{suggestion.address}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {suggestion.fullAddress}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
