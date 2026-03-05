export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Index from '@/views/Index';

export default function HomePage() {
  return (
    <Suspense>
      <Index />
    </Suspense>
  );
}
