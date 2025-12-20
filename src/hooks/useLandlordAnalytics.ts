import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ListingAnalytics {
  listingId: string;
  title: string;
  isActive: boolean;
  images: string[];
  viewCount: number;
  inquiryCount: number;
  messageCount: number;
  lastActivityAt: string | null;
}

interface DailyMetric {
  date: string;
  views: number;
  inquiries: number;
}

interface LandlordAnalytics {
  totalViews: number;
  totalInquiries: number;
  totalMessages: number;
  activeListings: number;
  totalListings: number;
  listingAnalytics: ListingAnalytics[];
  dailyMetrics: DailyMetric[];
}

export function useLandlordAnalytics(userId: string | undefined) {
  return useQuery({
    queryKey: ['landlord-analytics', userId],
    queryFn: async (): Promise<LandlordAnalytics> => {
      if (!userId) {
        return {
          totalViews: 0,
          totalInquiries: 0,
          totalMessages: 0,
          activeListings: 0,
          totalListings: 0,
          listingAnalytics: [],
          dailyMetrics: [],
        };
      }

      // Fetch user's listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, is_active, images')
        .eq('user_id', userId);

      if (listingsError) throw listingsError;
      if (!listings || listings.length === 0) {
        return {
          totalViews: 0,
          totalInquiries: 0,
          totalMessages: 0,
          activeListings: 0,
          totalListings: 0,
          listingAnalytics: [],
          dailyMetrics: [],
        };
      }

      const listingIds = listings.map(l => l.id);

      // Fetch view counts per listing
      const { data: viewsData, error: viewsError } = await supabase
        .from('recently_viewed_listings')
        .select('listing_id, viewed_at')
        .in('listing_id', listingIds);

      if (viewsError) throw viewsError;

      // Fetch conversations (inquiries) per listing
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('id, listing_id, created_at, last_message_at')
        .in('listing_id', listingIds);

      if (convError) throw convError;

      // Fetch messages count for each conversation
      const conversationIds = conversationsData?.map(c => c.id) || [];
      let messagesData: { conversation_id: string; created_at: string }[] = [];
      
      if (conversationIds.length > 0) {
        const { data: msgs, error: msgsError } = await supabase
          .from('messages')
          .select('conversation_id, created_at')
          .in('conversation_id', conversationIds);

        if (msgsError) throw msgsError;
        messagesData = msgs || [];
      }

      // Create a map of conversation_id to listing_id
      const convToListingMap = new Map<string, string>();
      conversationsData?.forEach(c => {
        convToListingMap.set(c.id, c.listing_id);
      });

      // Aggregate per listing
      const viewsByListing = new Map<string, number>();
      const inquiriesByListing = new Map<string, number>();
      const messagesByListing = new Map<string, number>();
      const lastActivityByListing = new Map<string, string>();

      // Count views
      viewsData?.forEach(v => {
        const count = viewsByListing.get(v.listing_id) || 0;
        viewsByListing.set(v.listing_id, count + 1);
      });

      // Count inquiries (unique conversations)
      conversationsData?.forEach(c => {
        const count = inquiriesByListing.get(c.listing_id) || 0;
        inquiriesByListing.set(c.listing_id, count + 1);
        
        // Track last activity
        const currentLast = lastActivityByListing.get(c.listing_id);
        if (!currentLast || (c.last_message_at && c.last_message_at > currentLast)) {
          lastActivityByListing.set(c.listing_id, c.last_message_at || c.created_at);
        }
      });

      // Count messages
      messagesData.forEach(m => {
        const listingId = convToListingMap.get(m.conversation_id);
        if (listingId) {
          const count = messagesByListing.get(listingId) || 0;
          messagesByListing.set(listingId, count + 1);
        }
      });

      // Build listing analytics
      const listingAnalytics: ListingAnalytics[] = listings.map(listing => ({
        listingId: listing.id,
        title: listing.title,
        isActive: listing.is_active,
        images: listing.images || [],
        viewCount: viewsByListing.get(listing.id) || 0,
        inquiryCount: inquiriesByListing.get(listing.id) || 0,
        messageCount: messagesByListing.get(listing.id) || 0,
        lastActivityAt: lastActivityByListing.get(listing.id) || null,
      }));

      // Sort by view count descending
      listingAnalytics.sort((a, b) => b.viewCount - a.viewCount);

      // Calculate daily metrics for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyViews = new Map<string, number>();
      const dailyInquiries = new Map<string, number>();

      viewsData?.forEach(v => {
        const date = v.viewed_at.split('T')[0];
        if (new Date(date) >= thirtyDaysAgo) {
          const count = dailyViews.get(date) || 0;
          dailyViews.set(date, count + 1);
        }
      });

      conversationsData?.forEach(c => {
        const date = c.created_at.split('T')[0];
        if (new Date(date) >= thirtyDaysAgo) {
          const count = dailyInquiries.get(date) || 0;
          dailyInquiries.set(date, count + 1);
        }
      });

      // Generate all dates for last 30 days
      const dailyMetrics: DailyMetric[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMetrics.push({
          date: dateStr,
          views: dailyViews.get(dateStr) || 0,
          inquiries: dailyInquiries.get(dateStr) || 0,
        });
      }

      return {
        totalViews: viewsData?.length || 0,
        totalInquiries: conversationsData?.length || 0,
        totalMessages: messagesData.length,
        activeListings: listings.filter(l => l.is_active).length,
        totalListings: listings.length,
        listingAnalytics,
        dailyMetrics,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
