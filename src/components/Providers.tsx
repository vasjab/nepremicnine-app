'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { GlobalMessageListener } from '@/components/GlobalMessageListener';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <InternationalizationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalMessageListener />
            {children}
          </TooltipProvider>
        </AuthProvider>
      </InternationalizationProvider>
    </QueryClientProvider>
  );
}
