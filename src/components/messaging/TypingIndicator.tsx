import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  userName?: string;
  avatarUrl?: string;
  className?: string;
}

export function TypingIndicator({ userName, avatarUrl, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-end gap-2 px-4 py-2", className)}>
      {/* Avatar */}
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
          {userName?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      {/* WhatsApp-style typing bubble */}
      <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span 
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" 
            style={{ animationDuration: '0.6s', animationDelay: '0ms' }} 
          />
          <span 
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" 
            style={{ animationDuration: '0.6s', animationDelay: '150ms' }} 
          />
          <span 
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" 
            style={{ animationDuration: '0.6s', animationDelay: '300ms' }} 
          />
        </div>
      </div>
    </div>
  );
}
