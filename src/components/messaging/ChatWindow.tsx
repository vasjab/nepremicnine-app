import { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Message, Conversation, useMessages, useSendMessage, useMarkMessagesRead, useEditMessage, useDeleteMessage } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { TypingIndicator } from './TypingIndicator';
import { ReadReceipt } from './ReadReceipt';
import { MessageContextMenu } from './MessageContextMenu';
import { MessageEditForm } from './MessageEditForm';
import { AttachmentUploader, AttachmentPreview } from './AttachmentUploader';
import { MessageAttachment } from './MessageAttachment';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  showBackButton?: boolean;
  highlightMessageId?: string;
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

const EDIT_TIME_LIMIT_MINUTES = 15;

export function ChatWindow({ conversation, onBack, showBackButton, highlightMessageId }: ChatWindowProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);

  const { data: messages = [], isLoading, refetch } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();

  const isRenter = conversation.renter_id === user?.id;
  const otherUser = conversation.other_user;
  const recipientId = isRenter ? conversation.landlord_id : conversation.renter_id;

  // Typing indicator
  const { isOtherTyping, setTyping } = useTypingIndicator(conversation.id, user?.id);

  // Scroll to bottom or highlighted message
  useEffect(() => {
    if (highlightMessageId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, highlightMessageId]);

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
          event: '*',
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
    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    const content = newMessage.trim() || (attachments.length > 0 ? '📎 Attachment' : '');
    const attachmentFiles = attachments.map(a => ({ file: a.file, type: a.type }));
    
    setNewMessage('');
    setAttachments([]);
    setTyping(false);

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        senderId: user.id,
        content,
        recipientId,
        senderName: user.user_metadata?.full_name || user.email?.split('@')[0],
        listingTitle: conversation.listing?.title || 'Listing',
        attachmentFiles: attachmentFiles.length > 0 ? attachmentFiles : undefined,
      });
    } catch (error) {
      setNewMessage(content);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEdit = async (messageId: string, newContent: string, originalContent: string) => {
    try {
      await editMessage.mutateAsync({ messageId, newContent, originalContent });
      setEditingMessageId(null);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync({ messageId });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const canEditMessage = (message: Message) => {
    if (message.sender_id !== user?.id) return false;
    if (message.is_deleted) return false;
    const minutesOld = differenceInMinutes(new Date(), new Date(message.created_at));
    return minutesOld <= EDIT_TIME_LIMIT_MINUTES;
  };

  const canDeleteMessage = (message: Message) => {
    return message.sender_id === user?.id && !message.is_deleted;
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
                  const isHighlighted = message.id === highlightMessageId;
                  const isEditing = editingMessageId === message.id;

                  return (
                    <div
                      key={message.id}
                      ref={isHighlighted ? highlightRef : undefined}
                      className={cn(
                        "flex group",
                        isMine ? "justify-end" : "justify-start",
                        isHighlighted && "animate-pulse"
                      )}
                    >
                      {/* Context menu for own messages */}
                      {isMine && !isEditing && (
                        <MessageContextMenu
                          canEdit={canEditMessage(message)}
                          canDelete={canDeleteMessage(message)}
                          onEdit={() => setEditingMessageId(message.id)}
                          onDelete={() => handleDelete(message.id)}
                          className="self-center mr-1"
                        />
                      )}

                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          isMine
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md",
                          message.is_deleted && "opacity-60 italic",
                          isHighlighted && "ring-2 ring-primary"
                        )}
                      >
                        {message.is_deleted ? (
                          <p className="text-sm">This message was deleted</p>
                        ) : isEditing ? (
                          <MessageEditForm
                            initialContent={message.content}
                            onSave={(content) => handleEdit(message.id, content, message.content)}
                            onCancel={() => setEditingMessageId(null)}
                            isSaving={editMessage.isPending}
                          />
                        ) : (
                          <>
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="space-y-2 mb-2">
                                {message.attachments.map((att) => (
                                  <MessageAttachment
                                    key={att.id}
                                    fileUrl={att.file_url}
                                    fileName={att.file_name}
                                    fileType={att.file_type as 'image' | 'document' | 'other'}
                                    fileSize={att.file_size}
                                  />
                                ))}
                              </div>
                            )}
                            
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </>
                        )}

                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isMine ? "justify-end" : "justify-start"
                        )}>
                          {message.is_edited && !message.is_deleted && (
                            <span className={cn(
                              "text-xs",
                              isMine ? "text-accent-foreground/50" : "text-muted-foreground/70"
                            )}>
                              edited
                            </span>
                          )}
                          <span className={cn(
                            "text-xs",
                            isMine ? "text-accent-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatMessageDate(message.created_at)}
                          </span>
                          {isMine && !message.is_deleted && (
                            <ReadReceipt 
                              isRead={message.is_read} 
                              readAt={message.read_at}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isOtherTyping && (
          <TypingIndicator userName={otherUser?.full_name || undefined} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="mb-2">
            <AttachmentUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={sendMessage.isPending}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <AttachmentUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            disabled={sendMessage.isPending}
          />
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none flex-1"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && attachments.length === 0) || sendMessage.isPending}
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
