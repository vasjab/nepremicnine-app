import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface ReadReceiptProps {
  isRead: boolean;
  readAt?: string | null;
  isSending?: boolean;
  className?: string;
}

function getDeliveryStatus(isRead: boolean, isSending?: boolean): DeliveryStatus {
  if (isSending) return 'sending';
  if (isRead) return 'read';
  // For web messages, they're instantly delivered once sent
  return 'delivered';
}

function getStatusText(status: DeliveryStatus, readAt?: string | null): string {
  switch (status) {
    case 'sending':
      return 'Sending...';
    case 'sent':
      return 'Sent';
    case 'delivered':
      return 'Delivered';
    case 'read':
      if (readAt) {
        return `Seen at ${format(new Date(readAt), 'MMM d, h:mm a')}`;
      }
      return 'Seen';
  }
}

export function ReadReceipt({ isRead, readAt, isSending, className }: ReadReceiptProps) {
  const status = getDeliveryStatus(isRead, isSending);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center ml-1 cursor-default", className)}>
            {status === 'sending' || status === 'sent' ? (
              <Check 
                className={cn(
                  "h-3.5 w-3.5 transition-all duration-300",
                  status === 'sending' 
                    ? "text-muted-foreground/30 animate-pulse" 
                    : "text-muted-foreground/50"
                )} 
              />
            ) : (
              <CheckCheck 
                className={cn(
                  "h-3.5 w-3.5 transition-colors duration-300",
                  status === 'read' ? "text-primary" : "text-muted-foreground/50"
                )} 
              />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {getStatusText(status, readAt)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
