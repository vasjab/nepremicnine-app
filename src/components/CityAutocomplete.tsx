import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Building2, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const MAPBOX_TOKEN_KEY = 'hemma_mapbox_token';

const getMapboxToken = (): string => {
  return localStorage.getItem(MAPBOX_TOKEN_KEY) || process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || '';
};

interface CitySuggestion {
  id: string;
  city: string;
  region?: string;
  postalCode?: string;
  fullName: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: { city: string; postalCode?: string; region?: string }) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  country?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder = 'Start typing a city...',
  className,
  hasError,
  country = 'SE',
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  const debouncedQuery = useDebounce(value, 300);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Skip fetching if we just selected a suggestion
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }

      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      const token = getMapboxToken();
      if (!token) {
        console.warn('No Mapbox token available for city autocomplete');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?` +
          `access_token=${token}&autocomplete=true&country=${country}&types=locality,neighborhood,place&limit=5`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch city suggestions');
        }

        const data = await response.json();
        
        const mappedSuggestions: CitySuggestion[] = data.features.map((feature: any) => {
          // Extract region and postal code from context
          let region = '';
          let postalCode = '';
          
          if (feature.context) {
            for (const ctx of feature.context) {
              if (ctx.id.startsWith('region')) {
                region = ctx.text;
              } else if (ctx.id.startsWith('postcode')) {
                postalCode = ctx.text;
              }
            }
          }

          return {
            id: feature.id,
            city: feature.text,
            region,
            postalCode,
            fullName: feature.place_name,
          };
        });

        setSuggestions(mappedSuggestions);
        setIsOpen(mappedSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, country]);

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

  const handleSelect = (suggestion: CitySuggestion) => {
    justSelectedRef.current = true;
    onChange(suggestion.city);
    onSelect?.({ city: suggestion.city, postalCode: suggestion.postalCode, region: suggestion.region });
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
                <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{suggestion.city}</p>
                  {suggestion.region && (
                    <p className="text-sm text-muted-foreground truncate">
                      {suggestion.region}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
