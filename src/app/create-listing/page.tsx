export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CreateListing from '@/views/CreateListing';

export default function CreateListingPage() {
  return (
    <Suspense>
      <CreateListing />
    </Suspense>
  );
}
