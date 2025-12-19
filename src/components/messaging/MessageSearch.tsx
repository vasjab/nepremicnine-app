import { useState, useCallback } from 'react';
import { Search, X, MessageCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchMessages, SearchResult } from '@/hooks/useSearchMessages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageSearchProps {
  onResultClick: (conversationId: string, messageId: string) => void;
  className?: string;
}

export function MessageSearch({ onResultClick, className }: MessageSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: results = [], isLoading } = useSearchMessages(query, user?.id);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick(result.conversation_id, result.id);
    handleClear();
  }, [onResultClick, handleClear]);

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-accent/30 text-foreground rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          placeholder="Search messages..."
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {result.listing_title || 'Conversation'}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {format(new Date(result.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {highlightMatch(result.content, query)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
