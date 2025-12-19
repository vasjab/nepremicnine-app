import { useMessageNotifications } from '@/hooks/useMessageNotifications';

export function GlobalMessageListener() {
  useMessageNotifications();
  return null;
}
