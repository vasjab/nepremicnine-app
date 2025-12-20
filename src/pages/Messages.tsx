import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, Conversation } from '@/hooks/useMessaging';
import { Header } from '@/components/Header';
import { ConversationsList } from '@/components/messaging/ConversationsList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { MessageSearch } from '@/components/messaging/MessageSearch';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

export default function Messages() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [highlightMessageId, setHighlightMessageId] = useState<string | undefined>();
  
  const { data: conversations = [], isLoading, refetch } = useConversations(user?.id);

  // Auto-select conversation from navigation state (e.g., from "Contact Landlord")
  const stateConversationId = (location.state as { conversationId?: string })?.conversationId;
  
  useEffect(() => {
    if (stateConversationId && conversations.length > 0 && !selectedConversation) {
      const convo = conversations.find(c => c.id === stateConversationId);
      if (convo) {
        setSelectedConversation(convo);
        // Clear the state so it doesn't re-trigger
        window.history.replaceState({}, document.title);
      }
    }
  }, [stateConversationId, conversations, selectedConversation]);

  // Subscribe to realtime updates for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  // Update selected conversation when conversations change
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConversation?.id]);

  // Clear highlight after a delay
  useEffect(() => {
    if (highlightMessageId) {
      const timer = setTimeout(() => {
        setHighlightMessageId(undefined);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightMessageId]);

  const handleSearchResultClick = useCallback((conversationId: string, messageId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setHighlightMessageId(messageId);
    }
  }, [conversations]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Messages</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to view your messages and contact landlords
            </p>
            <Link to="/auth">
              <Button variant="accent">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Mobile: Show either list or chat
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 h-[calc(100vh-4rem)]">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              showBackButton
              onBack={() => setSelectedConversation(null)}
              highlightMessageId={highlightMessageId}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <MessageSearch 
                  onResultClick={handleSearchResultClick}
                  className="w-full"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationsList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Desktop: Split view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 h-[calc(100vh-4rem)] flex">
        {/* Conversations sidebar */}
        <div className={cn(
          "w-80 xl:w-96 border-r border-border flex-shrink-0",
          "flex flex-col bg-card"
        )}>
          <div className="p-4 border-b border-border space-y-3">
            <h1 className="text-xl font-semibold text-foreground">Messages</h1>
            <MessageSearch 
              onResultClick={handleSearchResultClick}
              className="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationsList
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={setSelectedConversation}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1">
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation}
              highlightMessageId={highlightMessageId}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
