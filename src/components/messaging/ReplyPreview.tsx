import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReplyPreviewProps {
  replyToMessage: {
    id: string;
    content: string;
    sender_name?: string;
  };
  onClear: () => void;
}

export function ReplyPreview({ replyToMessage, onClear }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border-l-2 border-accent">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-accent truncate">
          Replying to {replyToMessage.sender_name || 'message'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {replyToMessage.content}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface QuotedMessageProps {
  content: string;
  senderName?: string;
  onClick?: () => void;
  isMine: boolean;
}

export function QuotedMessage({ content, senderName, onClick, isMine }: QuotedMessageProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 mb-1 rounded-lg text-xs border-l-2",
        "transition-colors",
        isMine
          ? "bg-accent-foreground/10 border-accent-foreground/50 hover:bg-accent-foreground/20"
          : "bg-secondary/70 border-muted-foreground/50 hover:bg-secondary"
      )}
    >
      <p className={cn(
        "font-medium truncate",
        isMine ? "text-accent-foreground/80" : "text-muted-foreground"
      )}>
        {senderName || 'Message'}
      </p>
      <p className={cn(
        "truncate",
        isMine ? "text-accent-foreground/60" : "text-muted-foreground/80"
      )}>
        {content}
      </p>
    </button>
  );
}
