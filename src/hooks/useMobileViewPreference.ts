import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mobile-view-preference';

export function useMobileViewPreference() {
  const [mobileView, setMobileView] = useState<'list' | 'map'>(() => {
    if (typeof window === 'undefined') return 'list';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'map' || stored === 'list') ? stored : 'list';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mobileView);
  }, [mobileView]);

  return [mobileView, setMobileView] as const;
}
