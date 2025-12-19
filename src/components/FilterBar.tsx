import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ListingFilters, SortOption } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface FilterBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount?: number;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'room', label: 'Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
] as const;

export function FilterBar({ filters, onFiltersChange, sortBy, onSortChange, totalCount }: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.city || '');
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      const newCity = searchValue.trim() || null;
      if (newCity !== filters.city) {
        onFiltersChange({ ...filters, city: newCity });
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFiltersChange({ ...filters, city: searchValue.trim() || null });
  };

  const clearSearch = () => {
    setSearchValue('');
    onFiltersChange({ ...filters, city: null });
  };

  const handleListingTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      listing_type: value === 'all' ? null : (value as 'rent' | 'sale'),
    });
  };

  const handlePropertyTypeToggle = (value: string) => {
    const current = filters.property_types || [];
    const updated = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    onFiltersChange({
      ...filters,
      property_types: updated.length > 0 ? updated : null,
    });
  };

  const clearPropertyTypes = () => {
    onFiltersChange({
      ...filters,
      property_types: null,
    });
  };

  const handleBedroomChange = (value: string) => {
    onFiltersChange({
      ...filters,
      min_bedrooms: value === 'all' ? null : parseInt(value),
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : null;
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'min_price' : 'max_price']: numValue,
    });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true));

  // Build active filter chips
  const getActiveFilterChips = () => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.listing_type) {
      chips.push({
        label: filters.listing_type === 'rent' ? 'For Rent' : 'For Sale',
        onRemove: () => handleListingTypeChange('all'),
      });
    }

    if (filters.property_types && filters.property_types.length > 0) {
      filters.property_types.forEach((type) => {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        chips.push({
          label,
          onRemove: () => handlePropertyTypeToggle(type),
        });
      });
    }

    if (filters.min_bedrooms) {
      chips.push({
        label: `${filters.min_bedrooms}+ rooms`,
        onRemove: () => handleBedroomChange('all'),
      });
    }

    if (filters.min_price || filters.max_price) {
      let priceLabel = '';
      if (filters.min_price && filters.max_price) {
        priceLabel = `€${filters.min_price.toLocaleString()} - €${filters.max_price.toLocaleString()}`;
      } else if (filters.min_price) {
        priceLabel = `Min €${filters.min_price.toLocaleString()}`;
      } else if (filters.max_price) {
        priceLabel = `Max €${filters.max_price.toLocaleString()}`;
      }
      chips.push({
        label: priceLabel,
        onRemove: () => {
          onFiltersChange({ ...filters, min_price: null, max_price: null });
        },
      });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div className="bg-background border-b border-border">
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
          Find your home
        </h1>

        {/* Search input + Filter button inline */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Search city..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-10 text-sm bg-secondary border-0 rounded-full focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Filter button - opens centered Dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0 rounded-full">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-5">
                <div className="space-y-2">
                  <Label>Listing Type</Label>
                  <Select
                    value={filters.listing_type || 'all'}
                    onValueChange={handleListingTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Property Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((type) => {
                      const isSelected = filters.property_types?.includes(type.value) || false;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handlePropertyTypeToggle(type.value)}
                          className={`
                            px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                            border-2 cursor-pointer
                            ${isSelected 
                              ? 'bg-foreground text-background border-foreground' 
                              : 'bg-background text-foreground border-border hover:border-foreground/50'
                            }
                          `}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Rooms</Label>
                  <Select
                    value={filters.min_bedrooms?.toString() || 'all'}
                    onValueChange={handleBedroomChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+ room</SelectItem>
                      <SelectItem value="2">2+ rooms</SelectItem>
                      <SelectItem value="3">3+ rooms</SelectItem>
                      <SelectItem value="4">4+ rooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price || ''}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price || ''}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearFilters();
                      setIsOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {activeChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="secondary"
                className="pl-2.5 pr-1.5 py-1 gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={chip.onRemove}
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        {/* Results count and sort */}
        {totalCount !== undefined && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'listing' : 'listings'}
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
                <SelectTrigger className="w-[130px] sm:w-[150px] h-7 sm:h-8 text-xs sm:text-sm bg-secondary border-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="size_asc">Size: Small to Large</SelectItem>
                  <SelectItem value="size_desc">Size: Large to Small</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
