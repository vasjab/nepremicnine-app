'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2, Loader2, Home, MoreVertical, Pin, Mail, MailOpen } from 'lucide-react';
import Link from 'next/link';
import { Conversation, usePinConversation, useMarkConversationUnread } from '@/hooks/useMessaging';
import { useDeleteConversation } from '@/hooks/useDeleteConversation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onDelete?: (conversationId: string) => void;
  isLoading?: boolean;
}

export function ConversationsList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  isLoading,
}: ConversationsListProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const deleteConversation = useDeleteConversation();
  const pinConversation = usePinConversation();
  const markConversationUnread = useMarkConversationUnread();

  // Long press state for mobile action sheet
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [longPressConversation, setLongPressConversation] = useState<Conversation | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // FLIP animation tracking
  const [prevPositions, setPrevPositions] = useState<Record<string, number>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isFirstRender = useRef(true);

  // Track position changes and apply FLIP animation
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Store initial positions
      const positions: Record<string, number> = {};
      conversations.forEach((conv, index) => {
        positions[conv.id] = index;
      });
      setPrevPositions(positions);
      return;
    }

    // Calculate and apply FLIP animations
    conversations.forEach((conv, newIndex) => {
      const oldIndex = prevPositions[conv.id];
      const element = itemRefs.current[conv.id];
      
      if (element && oldIndex !== undefined && oldIndex !== newIndex) {
        // Calculate how far it moved (in pixels)
        const delta = (oldIndex - newIndex) * element.offsetHeight;
        
        // FLIP: Start from old position immediately
        element.style.transform = `translateY(${delta}px)`;
        element.style.transition = 'none';
        
        // Force reflow to apply the transform
        element.offsetHeight;
        
        // Animate to final position with spring-like easing
        requestAnimationFrame(() => {
          element.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
          element.style.transform = 'translateY(0)';
          
          // Add highlight pulse effect
          element.classList.add('animate-highlight-pulse');
          
          // Remove highlight after animation completes
          setTimeout(() => {
            element.classList.remove('animate-highlight-pulse');
            element.style.transition = '';
          }, 800);
        });
      }
    });

    // Store new positions for next comparison
    const newPositions: Record<string, number> = {};
    conversations.forEach((conv, index) => {
      newPositions[conv.id] = index;
    });
    setPrevPositions(newPositions);
  }, [conversations]);

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    
    try {
      await deleteConversation.mutateAsync(conversationToDelete);
      onDelete?.(conversationToDelete);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handlePinToggle = async (conversation: Conversation) => {
    if (!user) return;
    const isRenter = conversation.renter_id === user.id;
    const currentlyPinned = isRenter ? conversation.is_pinned_by_renter : conversation.is_pinned_by_landlord;
    
    await pinConversation.mutateAsync({
      conversationId: conversation.id,
      userId: user.id,
      isRenter,
      isPinned: !currentlyPinned,
    });
  };

  const handleMarkUnreadToggle = async (conversation: Conversation) => {
    if (!user) return;
    const isRenter = conversation.renter_id === user.id;
    const hasUnread = (conversation.unread_count || 0) > 0;
    const isMarkedUnread = isRenter ? conversation.is_marked_unread_by_renter : conversation.is_marked_unread_by_landlord;
    
    // If has real unread or is marked unread, we mark as read; otherwise mark as unread
    const shouldMarkUnread = !hasUnread && !isMarkedUnread;
    
    await markConversationUnread.mutateAsync({
      conversationId: conversation.id,
      userId: user.id,
      isRenter,
      isMarkedUnread: shouldMarkUnread,
    });
  };

  // Long press handlers for mobile
  const handleTouchStart = (conversation: Conversation) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressConversation(conversation);
      setActionSheetOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    // Only select if action sheet is not open
    if (!actionSheetOpen) {
      onSelect(conversation);
    }
  };

  // Action sheet handlers
  const handleActionSheetPin = async () => {
    if (longPressConversation) {
      await handlePinToggle(longPressConversation);
      setActionSheetOpen(false);
    }
  };

  const handleActionSheetMarkUnread = async () => {
    if (longPressConversation) {
      await handleMarkUnreadToggle(longPressConversation);
      setActionSheetOpen(false);
    }
  };

  const handleActionSheetDelete = () => {
    if (longPressConversation) {
      handleDeleteClick(longPressConversation.id);
      setActionSheetOpen(false);
    }
  };

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
        const isRenter = conversation.renter_id === user?.id;
        const isPinned = isRenter ? conversation.is_pinned_by_renter : conversation.is_pinned_by_landlord;
        const isMarkedUnread = isRenter ? conversation.is_marked_unread_by_renter : conversation.is_marked_unread_by_landlord;
        const hasUnread = (conversation.unread_count || 0) > 0 || isMarkedUnread;
        const otherUser = conversation.other_user;

        return (
          <div
            key={conversation.id}
            ref={(el) => { itemRefs.current[conversation.id] = el; }}
            onClick={() => handleConversationClick(conversation)}
            onTouchStart={isMobile ? () => handleTouchStart(conversation) : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            onTouchMove={isMobile ? handleTouchEnd : undefined}
            className={cn(
              "w-full p-4 flex gap-3 text-left group relative cursor-pointer",
              "transition-all duration-200 ease-out",
              "hover:bg-secondary/50",
              "border-l-4 border-transparent",
              "touch-action-manipulation select-none",
              isSelected && "bg-primary/10 !border-primary pl-5 shadow-sm",
              !isSelected && hasUnread && "bg-accent/10 !border-accent"
            )}
          >
            {/* Avatar with pin indicator */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser?.avatar_url || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {otherUser?.full_name?.[0]?.toUpperCase() || (isRenter ? 'L' : 'R')}
                </AvatarFallback>
              </Avatar>
              {isPinned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Pin className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={cn(
                  "font-medium text-sm truncate",
                  hasUnread && "font-semibold"
                )}>
                  {otherUser?.full_name || (isRenter ? 'Landlord' : 'Renter')}
                </span>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false })}
                  </span>
                )}
              </div>

              {/* Listing title - plain text now */}
              <p className="text-xs text-muted-foreground truncate mb-1 flex items-center gap-1">
                <Home className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{conversation.listing?.title}</span>
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
                {hasUnread && (conversation.unread_count || 0) > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>

            {/* Dropdown menu - desktop only */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => handlePinToggle(conversation)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/listing/${conversation.listing?.id}`}>
                      <Home className="h-4 w-4 mr-2" />
                      View Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarkUnreadToggle(conversation)}>
                    {hasUnread ? (
                      <>
                        <MailOpen className="h-4 w-4 mr-2" />
                        Mark as Read
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Mark as Unread
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(conversation.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
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
              onClick={handleConfirmDelete}
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

      {/* Mobile Action Sheet */}
      <Drawer open={actionSheetOpen} onOpenChange={setActionSheetOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={longPressConversation?.other_user?.avatar_url || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {longPressConversation?.other_user?.full_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span>{longPressConversation?.other_user?.full_name || 'Conversation'}</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-base"
              onClick={handleActionSheetPin}
            >
              <Pin className="h-5 w-5 mr-3" />
              {longPressConversation && (
                (longPressConversation.renter_id === user?.id 
                  ? longPressConversation.is_pinned_by_renter 
                  : longPressConversation.is_pinned_by_landlord) 
                  ? 'Unpin' 
                  : 'Pin'
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-base" 
              asChild
              onClick={() => setActionSheetOpen(false)}
            >
              <Link href={`/listing/${longPressConversation?.listing?.id}`}>
                <Home className="h-5 w-5 mr-3" />
                View Listing
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-base"
              onClick={handleActionSheetMarkUnread}
            >
              {longPressConversation && (
                ((longPressConversation.unread_count || 0) > 0 || 
                  (longPressConversation.renter_id === user?.id 
                    ? longPressConversation.is_marked_unread_by_renter 
                    : longPressConversation.is_marked_unread_by_landlord)) ? (
                  <>
                    <MailOpen className="h-5 w-5 mr-3" />
                    Mark as Read
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-3" />
                    Mark as Unread
                  </>
                )
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-base text-destructive hover:text-destructive"
              onClick={handleActionSheetDelete}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Delete
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
