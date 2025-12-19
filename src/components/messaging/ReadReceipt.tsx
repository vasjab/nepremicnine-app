import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadReceiptProps {
  isRead: boolean;
  className?: string;
}

export function ReadReceipt({ isRead, className }: ReadReceiptProps) {
  return (
    <span className={cn("inline-flex items-center ml-1", className)}>
      {isRead ? (
        <CheckCheck className="h-3.5 w-3.5 text-primary" />
      ) : (
        <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </span>
  );
}
