import { cn } from '@/lib/utils';

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onToggle: (emoji: string) => void;
  isMine: boolean;
}

export function MessageReactions({ reactions, onToggle, isMine }: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap gap-1 mt-1",
      isMine ? "justify-end" : "justify-start"
    )}>
      {reactions.map(({ emoji, count, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs",
            "border transition-colors",
            hasReacted
              ? "bg-accent/20 border-accent/50 text-foreground"
              : "bg-secondary/50 border-border hover:bg-secondary"
          )}
        >
          <span>{emoji}</span>
          <span className="text-muted-foreground">{count}</span>
        </button>
      ))}
    </div>
  );
}
