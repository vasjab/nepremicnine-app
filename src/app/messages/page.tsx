export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Messages from '@/views/Messages';

export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}
