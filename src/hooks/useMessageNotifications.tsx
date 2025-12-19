import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Notification sound as a base64-encoded short beep
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAIXbPdxq11HwA/lNu7pmEMBjyR2bSkYgwGPpHZs6NiDAY+kdmzo2IMBj6R2bOjYgwGPpHZs6NiDAY+';

export function useMessageNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPathRef = useRef<string>('');

  // Track current path
  useEffect(() => {
    currentPathRef.current = window.location.pathname;
    
    const handlePopState = () => {
      currentPathRef.current = window.location.pathname;
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initialize audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;

    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };

          // Skip if we sent the message
          if (newMessage.sender_id === user.id) return;

          // Check if we're part of this conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id, renter_id, landlord_id, listing:listings(title)')
            .eq('id', newMessage.conversation_id)
            .single();

          if (!conversation) return;

          // Check if user is part of this conversation
          const isParticipant = 
            conversation.renter_id === user.id || 
            conversation.landlord_id === user.id;

          if (!isParticipant) return;

          // Get sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', newMessage.sender_id)
            .single();

          const senderName = senderProfile?.full_name || 'Someone';
          const listingTitle = (conversation.listing as any)?.title || 'a listing';

          // Play notification sound
          try {
            audioRef.current?.play();
          } catch (e) {
            console.log('Could not play notification sound');
          }

          // Show toast notification
          toast({
            title: `New message from ${senderName}`,
            description: newMessage.content.length > 50 
              ? newMessage.content.substring(0, 50) + '...' 
              : newMessage.content,
            action: currentPathRef.current !== '/messages' ? (
              <a 
                href="/messages" 
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
              >
                View
              </a>
            ) : undefined,
          });

          // Invalidate queries to refresh unread count
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, queryClient]);
}
