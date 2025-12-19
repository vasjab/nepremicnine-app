import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { ListingFilters, SortOption } from '@/types/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

interface FilterBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount?: number;
}

export function FilterBar({ filters, onFiltersChange, sortBy, onSortChange, totalCount }: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.city || '');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, city: searchValue || null });
  };

  const handleListingTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      listing_type: value === 'all' ? null : (value as 'rent' | 'sale'),
    });
  };

  const handlePropertyTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      property_type: value === 'all' ? null : value,
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

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== undefined);

  return (
    <div className="bg-background border-b border-border">
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
          Find your home
        </h1>

        {/* Search and filters row */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search input */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or area"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-accent"
            />
          </form>

          {/* Quick filters - desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Select
              value={filters.listing_type || 'all'}
              onValueChange={handleListingTypeChange}
            >
              <SelectTrigger className="w-[120px] bg-secondary border-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.property_type || 'all'}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger className="w-[140px] bg-secondary border-0">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.min_bedrooms?.toString() || 'all'}
              onValueChange={handleBedroomChange}
            >
              <SelectTrigger className="w-[130px] bg-secondary border-0">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rooms</SelectItem>
                <SelectItem value="1">1+ room</SelectItem>
                <SelectItem value="2">2+ rooms</SelectItem>
                <SelectItem value="3">3+ rooms</SelectItem>
                <SelectItem value="4">4+ rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter button - mobile and additional filters */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
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

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={filters.property_type || 'all'}
                    onValueChange={handlePropertyTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All properties</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <span className="text-muted-foreground">-</span>
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
            </SheetContent>
          </Sheet>
        </div>

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
