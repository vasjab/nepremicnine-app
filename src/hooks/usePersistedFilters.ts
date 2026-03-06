import { useState, useCallback, useEffect, useRef } from 'react';
import { ListingFilters, SortOption } from '@/types/listing';

interface UsePersistedFiltersOptions {
  /** Unique key for sessionStorage (e.g. 'hemma_index', 'hemma_sold') */
  storageKey: string;
  /** Default filters when nothing is persisted */
  defaultFilters: ListingFilters;
  /** Default sort when nothing is persisted */
  defaultSort?: SortOption;
}

interface PersistedState {
  filters: ListingFilters;
  sortBy: SortOption;
  activeTab?: string;
}

function readStorage(key: string): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function writeStorage(key: string, state: PersistedState) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

export function usePersistedFilters({
  storageKey,
  defaultFilters,
  defaultSort = 'newest',
}: UsePersistedFiltersOptions) {
  // Initialize from sessionStorage or defaults
  const [filters, setFiltersRaw] = useState<ListingFilters>(() => {
    const saved = readStorage(storageKey);
    return saved?.filters ?? defaultFilters;
  });

  const [sortBy, setSortByRaw] = useState<SortOption>(() => {
    const saved = readStorage(storageKey);
    return saved?.sortBy ?? defaultSort;
  });

  const [activeTab, setActiveTabRaw] = useState<string | undefined>(() => {
    const saved = readStorage(storageKey);
    return saved?.activeTab;
  });

  // Track if this is the first render to avoid double-writing
  const isInitial = useRef(true);

  // Persist whenever state changes
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    writeStorage(storageKey, { filters, sortBy, activeTab });
  }, [storageKey, filters, sortBy, activeTab]);

  // Wrapped setters
  const setFilters = useCallback((f: ListingFilters) => {
    setFiltersRaw(f);
  }, []);

  const setSortBy = useCallback((s: SortOption) => {
    setSortByRaw(s);
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabRaw(tab);
  }, []);

  /** Clear all filters + sort back to defaults */
  const clearAll = useCallback(() => {
    setFiltersRaw(defaultFilters);
    setSortByRaw(defaultSort);
    try {
      sessionStorage.removeItem(storageKey);
    } catch { /* ignore */ }
  }, [defaultFilters, defaultSort, storageKey]);

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    clearAll,
  };
}
