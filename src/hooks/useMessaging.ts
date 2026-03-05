import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  listing_id: string;
  renter_id: string;
  landlord_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  is_pinned_by_renter?: boolean;
  is_pinned_by_landlord?: boolean;
  is_marked_unread_by_renter?: boolean;
  is_marked_unread_by_landlord?: boolean;
  listing?: {
    id: string;
    title: string;
    images: string[] | null;
    address: string;
    city: string;
  };
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
    is_deleted?: boolean;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  is_edited?: boolean;
  edited_at?: string | null;
  original_content?: string | null;
  reply_to_message_id?: string | null;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
}

// Fetch all conversations for current user with optimized batched queries
export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Step 1: Get all conversations with listings
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, address, city)
        `)
        .or(`renter_id.eq.${userId},landlord_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (!conversations || conversations.length === 0) return [];

      const conversationIds = conversations.map(c => c.id);
      
      // Step 2: Batch fetch last messages for all conversations
      const { data: allMessages } = await supabase
        .from('messages')
        .select('conversation_id, content, sender_id, created_at, is_read, is_deleted')
        .in('conversation_id', conversationIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Group messages by conversation and get the latest
      const lastMessageMap = new Map<string, typeof allMessages extends (infer T)[] ? T : never>();
      allMessages?.forEach(msg => {
        if (!lastMessageMap.has(msg.conversation_id)) {
          lastMessageMap.set(msg.conversation_id, msg);
        }
      });

      // Step 3: Batch fetch unread counts
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .eq('is_deleted', false)
        .neq('sender_id', userId);

      // Count unread per conversation
      const unreadCountMap = new Map<string, number>();
      unreadMessages?.forEach(msg => {
        unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) || 0) + 1);
      });

      // Step 4: Batch fetch profiles for other users
      const otherUserIds = conversations.map(conv => 
        conv.renter_id === userId ? conv.landlord_id : conv.renter_id
      );
      const uniqueUserIds = [...new Set(otherUserIds)];
      
      const profileResults = await Promise.all(
        uniqueUserIds.map(async (uid) => {
          const { data } = await supabase
            .rpc('get_profile_for_viewer', { p_profile_user_id: uid })
            .single();
          return { id: uid, profile: data };
        })
      );
      
      const profileMap = new Map<string, any>();
      profileResults.forEach(({ id, profile }) => {
        profileMap.set(id, profile);
      });

      // Step 5: Combine all data and sort (pinned first)
      const result = conversations.map(conv => {
        const otherUserId = conv.renter_id === userId ? conv.landlord_id : conv.renter_id;
        const profile = profileMap.get(otherUserId);
        
        return {
          ...conv,
          last_message: lastMessageMap.get(conv.id) || null,
          unread_count: unreadCountMap.get(conv.id) || 0,
          other_user: profile 
            ? { id: profile.user_id, full_name: profile.full_name, avatar_url: profile.avatar_url }
            : { id: otherUserId, full_name: null, avatar_url: null },
        } as Conversation;
      });

      // Sort: pinned first, then by last_message_at
      return result.sort((a, b) => {
        const aIsPinned = a.renter_id === userId ? a.is_pinned_by_renter : a.is_pinned_by_landlord;
        const bIsPinned = b.renter_id === userId ? b.is_pinned_by_renter : b.is_pinned_by_landlord;
        
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        
        return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
      });
    },
    enabled: !!userId,
  });
}

// Fetch messages for a conversation
export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch attachments for all messages
      const messageIds = messages?.map(m => m.id) || [];
      
      if (messageIds.length > 0) {
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('*')
          .in('message_id', messageIds);

        const attachmentMap = new Map<string, MessageAttachment[]>();
        attachments?.forEach(att => {
          if (!attachmentMap.has(att.message_id)) {
            attachmentMap.set(att.message_id, []);
          }
          attachmentMap.get(att.message_id)!.push(att as MessageAttachment);
        });

        return messages?.map(m => ({
          ...m,
          attachments: attachmentMap.get(m.id) || [],
        })) as Message[];
      }

      return messages as Message[];
    },
    enabled: !!conversationId,
  });
}

// Send a message with optional attachments
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      senderId, 
      content, 
      recipientId, 
      senderName, 
      listingTitle,
      attachmentFiles,
      replyToMessageId,
    }: {
      conversationId: string;
      senderId: string;
      content: string;
      recipientId?: string;
      senderName?: string;
      listingTitle?: string;
      attachmentFiles?: { file: File; type: string }[];
      replyToMessageId?: string;
    }) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) throw new Error('Message content cannot be empty');

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: trimmedContent,
          reply_to_message_id: replyToMessageId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments if any
      if (attachmentFiles && attachmentFiles.length > 0) {
        for (const { file, type } of attachmentFiles) {
          // Sanitize file extension to prevent directory traversal
          const rawExt = file.name.split('.').pop() || 'bin';
          const fileExt = rawExt.replace(/[^a-zA-Z0-9]/g, '');
          const fileName = `${senderId}/${message.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Failed to upload attachment:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(fileName);

          await supabase.from('message_attachments').insert({
            message_id: message.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: type,
            file_size: file.size,
            mime_type: file.type,
          });
        }
      }

      // Trigger email notification if we have recipient info
      if (recipientId && listingTitle) {
        try {
          await supabase.functions.invoke('send-message-notification', {
            body: {
              recipientId,
              senderId,
              senderName: senderName || 'Someone',
              messagePreview: content.trim(),
              listingTitle,
              conversationId,
            },
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }

      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Edit a message
export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, newContent, originalContent }: {
      messageId: string;
      newContent: string;
      originalContent: string;
    }) => {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
          original_content: originalContent,
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Delete a message (soft delete)
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Mark messages as read and clear manual unread flag
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, userId }: {
      conversationId: string;
      userId: string;
    }) => {
      // First, get conversation to determine if user is renter or landlord
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('renter_id, landlord_id')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      const isRenter = conversation.renter_id === userId;
      const updateField = isRenter ? 'is_marked_unread_by_renter' : 'is_marked_unread_by_landlord';

      // Mark all messages as read
      const { error: msgError } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (msgError) throw msgError;

      // Also clear the manual unread flag
      const { error: flagError } = await supabase
        .from('conversations')
        .update({ [updateField]: false })
        .eq('id', conversationId);

      if (flagError) throw flagError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

// Get or create a conversation
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, renterId, landlordId }: {
      listingId: string;
      renterId: string;
      landlordId: string;
    }) => {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('renter_id', renterId)
        .eq('landlord_id', landlordId)
        .maybeSingle();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          renter_id: renterId,
          landlord_id: landlordId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Get unread message count
export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['unread-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      // Get all conversations for user
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`renter_id.eq.${userId},landlord_id.eq.${userId}`);

      if (!conversations || conversations.length === 0) return 0;

      const conversationIds = conversations.map(c => c.id);

      // Count unread messages across all conversations (excluding deleted)
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .eq('is_deleted', false)
        .neq('sender_id', userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

// Pin or unpin a conversation
export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, userId, isRenter, isPinned }: {
      conversationId: string;
      userId: string;
      isRenter: boolean;
      isPinned: boolean;
    }) => {
      const updateField = isRenter ? 'is_pinned_by_renter' : 'is_pinned_by_landlord';
      
      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: isPinned })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Mark a conversation as unread/read for the current user
export function useMarkConversationUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, userId, isRenter, isMarkedUnread }: {
      conversationId: string;
      userId: string;
      isRenter: boolean;
      isMarkedUnread: boolean;
    }) => {
      const updateField = isRenter ? 'is_marked_unread_by_renter' : 'is_marked_unread_by_landlord';
      
      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: isMarkedUnread })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
