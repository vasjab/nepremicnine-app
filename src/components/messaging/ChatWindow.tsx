import { useEffect, useRef, useState, useMemo } from 'react';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { ArrowLeft, Send, Loader2, MoreVertical, User, Trash2, Reply, Home, ExternalLink, Pencil, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Message, Conversation, useMessages, useSendMessage, useMarkMessagesRead, useEditMessage, useDeleteMessage } from '@/hooks/useMessaging';
import { useMessageReactions, useToggleReaction } from '@/hooks/useMessageReactions';
import { useAuth } from '@/contexts/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useDeleteConversation } from '@/hooks/useDeleteConversation';
import { useMessageSwipe } from '@/hooks/useMessageSwipe';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { ImageViewerModal } from './ImageViewerModal';
import { UserProfileModal } from './UserProfileModal';
import { EmojiReactionPicker } from './EmojiReactionPicker';
import { MessageReactions, Reaction } from './MessageReactions';
import { ReplyPreview, QuotedMessage } from './ReplyPreview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  showBackButton?: boolean;
  highlightMessageId?: string;
  onConversationDeleted?: () => void;
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

export function ChatWindow({ conversation, onBack, showBackButton, highlightMessageId, onConversationDeleted }: ChatWindowProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  
  // Modal states
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  
  // Mobile message selection state
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data: messages = [], isLoading, refetch } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const deleteConversation = useDeleteConversation();
  const toggleReaction = useToggleReaction();

  // Swipe to reply (mobile only)
  const handleSwipeReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && !message.is_deleted) {
      setReplyToMessage(message);
      textareaRef.current?.focus();
    }
  };

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getSwipeStyles,
    getReplyIconOpacity,
    getReplyIconScale,
  } = useMessageSwipe({ onSwipeComplete: handleSwipeReply });

  // Fetch reactions for all messages
  const messageIds = useMemo(() => messages.map(m => m.id), [messages]);
  const { data: allReactions = [], refetch: refetchReactions } = useMessageReactions(messageIds);

  // Build a map of reactions per message
  const reactionsMap = useMemo(() => {
    const map = new Map<string, Reaction[]>();
    
    allReactions.forEach(r => {
      if (!map.has(r.message_id)) {
        map.set(r.message_id, []);
      }
      const msgReactions = map.get(r.message_id)!;
      const existing = msgReactions.find(x => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === user?.id) existing.hasReacted = true;
      } else {
        msgReactions.push({
          emoji: r.emoji,
          count: 1,
          hasReacted: r.user_id === user?.id,
        });
      }
    });
    
    return map;
  }, [allReactions, user?.id]);

  const isRenter = conversation.renter_id === user?.id;
  const otherUser = conversation.other_user;
  const recipientId = isRenter ? conversation.landlord_id : conversation.renter_id;
  const otherUserId = isRenter ? conversation.landlord_id : conversation.renter_id;

  // Typing indicator
  const { isOtherTyping, setTyping } = useTypingIndicator(conversation.id, user?.id);

  // Scroll to bottom or highlighted message - scroll within container only
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    if (highlightMessageId && highlightRef.current) {
      // Scroll to highlighted message within the container
      const element = highlightRef.current;
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      const elementHeight = element.clientHeight;
      container.scrollTo({ 
        top: elementTop - (containerHeight / 2) + (elementHeight / 2), 
        behavior: 'smooth' 
      });
    } else {
      // Scroll to bottom of container
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, highlightMessageId]);

  // Mark messages as read when user scrolls to bottom
  useEffect(() => {
    if (!user || !messagesEndRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && messages.length > 0) {
          markAsRead.mutate({ conversationId: conversation.id, userId: user.id });
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(messagesEndRef.current);
    return () => observer.disconnect();
  }, [conversation.id, user, messages.length]);

  // Subscribe to realtime messages and reactions
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          refetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, refetch, refetchReactions, user]);

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    const content = newMessage.trim() || (attachments.length > 0 ? '📎 Attachment' : '');
    const attachmentFiles = attachments.map(a => ({ file: a.file, type: a.type }));
    const replyToId = replyToMessage?.id;
    
    setNewMessage('');
    setAttachments([]);
    setTyping(false);
    setReplyToMessage(null);

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        senderId: user.id,
        content,
        recipientId,
        senderName: user.user_metadata?.full_name || user.email?.split('@')[0],
        listingTitle: conversation.listing?.title || 'Listing',
        attachmentFiles: attachmentFiles.length > 0 ? attachmentFiles : undefined,
        replyToMessageId: replyToId,
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

  const handleImageClick = (url: string, fileName: string) => {
    setSelectedImage({ url, fileName });
    setImageViewerOpen(true);
  };

  const handleDeleteConversation = async () => {
    try {
      await deleteConversation.mutateAsync(conversation.id);
      setDeleteDialogOpen(false);
      onConversationDeleted?.();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    try {
      await toggleReaction.mutateAsync({ messageId, userId: user.id, emoji });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setSelectedMessageId(null);
    textareaRef.current?.focus();
  };

  // Handle mobile message tap to show action menu
  const handleMessageTap = (messageId: string) => {
    if (!isMobile) return;
    setSelectedMessageId(prev => prev === messageId ? null : messageId);
  };

  // Close mobile action menu when tapping elsewhere
  const handleContainerTap = (e: React.MouseEvent) => {
    // Only close if clicking directly on the container, not on a message
    if (e.target === e.currentTarget) {
      setSelectedMessageId(null);
    }
  };

  const getReplyToContent = (replyToId: string | null | undefined) => {
    if (!replyToId) return null;
    return messages.find(m => m.id === replyToId);
  };

  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return 'You';
    return otherUser?.full_name || 'User';
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header - fixed at top with flex-shrink-0 */}
      <div className="flex-shrink-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-card">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar_url || undefined} />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {otherUser?.full_name?.[0]?.toUpperCase() || (isRenter ? 'L' : 'R')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 text-left">
            <h2 className="font-semibold text-foreground truncate">
              {otherUser?.full_name || (isRenter ? 'Landlord' : 'Renter')}
            </h2>
            <Link 
              to={`/listing/${conversation.listing?.id}`}
              className="text-xs text-muted-foreground truncate hover:text-accent hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Home className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{conversation.listing?.title}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </Link>
          </div>
        </button>

        {/* Options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2 min-w-[200px]">
            <DropdownMenuItem onClick={() => setProfileModalOpen(true)} className="px-4 py-3 text-base cursor-pointer">
              <User className="h-5 w-5 mr-3" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-4 py-3 text-base cursor-pointer">
              <Link to={`/listing/${conversation.listing?.id}`}>
                <Home className="h-5 w-5 mr-3" />
                View Listing
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-3" />
            
            <DropdownMenuItem 
              onClick={() => setDeleteDialogOpen(true)}
              className="px-4 py-3 text-base cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages - scrollable container with min-h-0 for flex overflow on iOS */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 space-y-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
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
                  const messageReactions = reactionsMap.get(message.id) || [];
                  const replyTo = getReplyToContent(message.reply_to_message_id);
                  const canSwipe = isMobile && !message.is_deleted && !isEditing;

                  return (
                    <div
                      key={message.id}
                      ref={isHighlighted ? highlightRef : undefined}
                      className={cn(
                        "flex group relative",
                        isMine ? "justify-end" : "justify-start",
                        isHighlighted && "animate-pulse"
                      )}
                    >
                      {/* Swipe reply icon indicator (mobile) */}
                      {canSwipe && (
                        <div 
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 pointer-events-none",
                            isMine ? "left-0" : "left-0"
                          )}
                          style={{
                            opacity: getReplyIconOpacity(message.id),
                            transform: `translateY(-50%) scale(${getReplyIconScale(message.id)})`,
                          }}
                        >
                          <Reply className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      {/* Action buttons for other's messages (left side) - desktop only */}
                      {!isMobile && !isMine && !message.is_deleted && !isEditing && (
                        <div className="self-center mr-1 flex gap-0.5">
                          <EmojiReactionPicker
                            onSelect={(emoji) => handleReaction(message.id, emoji)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Context menu for own messages - desktop only */}
                      {!isMobile && isMine && !isEditing && (
                        <div className="self-center mr-1 flex gap-0.5">
                          <EmojiReactionPicker
                            onSelect={(emoji) => handleReaction(message.id, emoji)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <MessageContextMenu
                            canEdit={canEditMessage(message)}
                            canDelete={canDeleteMessage(message)}
                            onEdit={() => setEditingMessageId(message.id)}
                            onDelete={() => handleDelete(message.id)}
                          />
                        </div>
                      )}

                      <div 
                        className="flex flex-col max-w-[75%]"
                        style={canSwipe ? getSwipeStyles(message.id) : undefined}
                        onTouchStart={canSwipe ? (e) => handleTouchStart(e, message.id) : undefined}
                        onTouchMove={canSwipe ? handleTouchMove : undefined}
                        onTouchEnd={canSwipe ? handleTouchEnd : undefined}
                      >
                        <div
                          onClick={isMobile && !message.is_deleted && !isEditing ? () => handleMessageTap(message.id) : undefined}
                          className={cn(
                            "rounded-2xl px-4 py-2",
                            isMobile && "touch-action-manipulation cursor-pointer",
                            isMine
                              ? "bg-accent text-accent-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md",
                            message.is_deleted && "opacity-60 italic",
                            isHighlighted && "ring-2 ring-primary",
                            isMobile && selectedMessageId === message.id && "ring-2 ring-accent/50"
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
                              {/* Reply quote */}
                              {replyTo && (
                                <QuotedMessage
                                  content={replyTo.is_deleted ? 'This message was deleted' : replyTo.content}
                                  senderName={getSenderName(replyTo.sender_id)}
                                  isMine={isMine}
                                />
                              )}

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
                                      mimeType={att.mime_type || undefined}
                                      onImageClick={handleImageClick}
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

                        {/* Reactions */}
                        {messageReactions.length > 0 && (
                          <MessageReactions
                            reactions={messageReactions}
                            onToggle={(emoji) => handleReaction(message.id, emoji)}
                            isMine={isMine}
                          />
                        )}

                        {/* Mobile action bar - shown when message is selected */}
                        {isMobile && selectedMessageId === message.id && !message.is_deleted && !isEditing && (
                          <div className={cn(
                            "flex items-center gap-1 mt-2 p-1 rounded-lg bg-card border border-border shadow-lg animate-fade-in",
                            isMine ? "justify-end" : "justify-start"
                          )}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(message);
                              }}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                            <EmojiReactionPicker
                              onSelect={(emoji) => {
                                handleReaction(message.id, emoji);
                                setSelectedMessageId(null);
                              }}
                            />
                            {canEditMessage(message) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMessageId(message.id);
                                  setSelectedMessageId(null);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDeleteMessage(message) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(message.id);
                                  setSelectedMessageId(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessageId(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
          <TypingIndicator 
            userName={otherUser?.full_name || undefined} 
            avatarUrl={otherUser?.avatar_url || undefined}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - fixed at bottom with flex-shrink-0 */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card space-y-2" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {/* Reply preview */}
        {replyToMessage && (
          <ReplyPreview
            replyToMessage={{
              id: replyToMessage.id,
              content: replyToMessage.is_deleted ? 'This message was deleted' : replyToMessage.content,
              sender_name: getSenderName(replyToMessage.sender_id),
            }}
            onClear={() => setReplyToMessage(null)}
          />
        )}

        
        <div className="flex gap-2">
          <AttachmentUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onImagePreviewClick={handleImageClick}
            disabled={sendMessage.isPending}
          />
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none flex-1 text-base"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && attachments.length === 0) || sendMessage.isPending}
            variant="accent"
            className="h-[44px] w-[44px] flex-shrink-0"
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

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => {
          setImageViewerOpen(false);
          setSelectedImage(null);
        }}
        imageUrl={selectedImage?.url || ''}
        fileName={selectedImage?.fileName}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={otherUserId}
        userName={otherUser?.full_name || undefined}
        userAvatar={otherUser?.avatar_url || undefined}
      />

      {/* Delete Conversation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This will permanently remove all messages and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConversation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
