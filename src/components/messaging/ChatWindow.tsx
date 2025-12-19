import { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Message, Conversation, useMessages, useSendMessage, useMarkMessagesRead } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  showBackButton?: boolean;
}

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday ' + format(date, 'h:mm a');
  }
  return format(date, 'MMM d, h:mm a');
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groups.push({ date: messageDate, messages: [message] });
    } else {
      groups[groups.length - 1].messages.push(message);
    }
  });

  return groups;
}

function formatGroupDate(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export function ChatWindow({ conversation, onBack, showBackButton }: ChatWindowProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [newMessage, setNewMessage] = useState('');

  const { data: messages = [], isLoading, refetch } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();

  const isRenter = conversation.renter_id === user?.id;
  const otherUser = conversation.other_user;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (user && conversation.id) {
      markAsRead.mutate({ conversationId: conversation.id, userId: user.id });
    }
  }, [conversation.id, user]);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => {
          refetch();
          if (user) {
            markAsRead.mutate({ conversationId: conversation.id, userId: user.id });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, refetch, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        senderId: user.id,
        content,
      });
    } catch (error) {
      setNewMessage(content); // Restore message on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.avatar_url || undefined} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {otherUser?.full_name?.[0]?.toUpperCase() || (isRenter ? 'L' : 'R')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">
            {otherUser?.full_name || (isRenter ? 'Landlord' : 'Renter')}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.listing?.title}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs text-muted-foreground bg-secondary rounded-full">
                  {formatGroupDate(group.date)}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-2">
                {group.messages.map((message) => {
                  const isMine = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          isMine
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p className={cn(
                          "text-xs mt-1",
                          isMine ? "text-accent-foreground/70" : "text-muted-foreground"
                        )}>
                          {formatMessageDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="h-[44px] w-[44px] flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
