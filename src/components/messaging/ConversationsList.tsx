import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { Conversation } from '@/hooks/useMessaging';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

export function ConversationsList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationsListProps) {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3 p-3">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by contacting a landlord on a listing
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isSelected = selectedId === conversation.id;
        const hasUnread = (conversation.unread_count || 0) > 0;
        const otherUser = conversation.other_user;
        const isRenter = conversation.renter_id === user?.id;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full p-4 flex gap-3 text-left transition-colors",
              "hover:bg-secondary/50",
              isSelected && "bg-secondary",
              hasUnread && "bg-accent/5"
            )}
          >
            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={otherUser?.avatar_url || undefined} />
              <AvatarFallback className="bg-accent text-accent-foreground">
                {otherUser?.full_name?.[0]?.toUpperCase() || (isRenter ? 'L' : 'R')}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={cn(
                  "font-medium text-sm truncate",
                  hasUnread ? "text-foreground" : "text-foreground"
                )}>
                  {otherUser?.full_name || (isRenter ? 'Landlord' : 'Renter')}
                </span>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false })}
                  </span>
                )}
              </div>

              {/* Listing title */}
              <p className="text-xs text-muted-foreground truncate mb-1">
                {conversation.listing?.title}
              </p>

              {/* Last message */}
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm truncate flex-1",
                  hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {conversation.last_message?.sender_id === user?.id && (
                    <span className="text-muted-foreground">You: </span>
                  )}
                  {conversation.last_message?.content || 'No messages yet'}
                </p>

                {/* Unread badge */}
                {hasUnread && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
