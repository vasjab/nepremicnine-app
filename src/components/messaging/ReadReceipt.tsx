import { CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReadReceiptProps {
  isRead: boolean;
  readAt?: string | null;
  className?: string;
}

export function ReadReceipt({ isRead, readAt, className }: ReadReceiptProps) {
  const formattedTime = readAt ? format(new Date(readAt), 'MMM d, h:mm a') : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center ml-1 cursor-default", className)}>
            <CheckCheck 
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-300",
                isRead ? "text-primary" : "text-muted-foreground/50"
              )} 
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {isRead ? (
            formattedTime ? `Seen at ${formattedTime}` : 'Seen'
          ) : (
            'Delivered'
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
