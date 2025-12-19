import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTypingIndicator(conversationId: string, userId: string | undefined) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingUsers = Object.entries(state)
          .filter(([key]) => key !== userId)
          .flatMap(([, presences]) => presences as { typing?: boolean; user_id?: string }[])
          .filter((p) => p.typing);

        if (typingUsers.length > 0) {
          setIsOtherTyping(true);
          setTypingUser(typingUsers[0]?.user_id || null);
        } else {
          setIsOtherTyping(false);
          setTypingUser(null);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ typing: false, user_id: userId });
        }
      });

    channelRef.current = channel;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !userId) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      await channelRef.current.track({ typing: isTyping, user_id: userId });

      // Auto-clear typing after 3 seconds of no activity
      if (isTyping) {
        timeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({ typing: false, user_id: userId });
          }
        }, 3000);
      }
    },
    [userId]
  );

  return { isOtherTyping, typingUser, setTyping };
}
