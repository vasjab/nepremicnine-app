import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch auth users to get ban status
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const authUsers = authError ? [] : authData?.users || [];
    const authMap = new Map(authUsers.map((u) => [u.id, u]));

    // Fetch all listings
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, user_id, price, currency, city, country, property_type, listing_type, status, is_active, is_draft, created_at, updated_at, completed_at, images, area_sqm, bedrooms')
      .order('created_at', { ascending: false });

    if (listingsError) throw listingsError;

    // Fetch listing stats
    const { data: stats, error: statsError } = await supabase
      .from('listing_stats')
      .select('listing_id, view_count');

    if (statsError) throw statsError;

    // Fetch conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('listing_id');

    if (convError) throw convError;

    // Build maps
    const viewsByListing = new Map<string, number>();
    stats?.forEach((s) => viewsByListing.set(s.listing_id, s.view_count));

    const inquiriesByListing = new Map<string, number>();
    conversations?.forEach((c) => {
      inquiriesByListing.set(c.listing_id, (inquiriesByListing.get(c.listing_id) || 0) + 1);
    });

    const enrichedListings = listings?.map((l) => ({
      ...l,
      view_count: viewsByListing.get(l.id) || 0,
      inquiry_count: inquiriesByListing.get(l.id) || 0,
    })) || [];

    const listingsByUser = new Map<string, number>();
    const activeListingsByUser = new Map<string, number>();
    listings?.forEach((l) => {
      listingsByUser.set(l.user_id, (listingsByUser.get(l.user_id) || 0) + 1);
      if (l.is_active && !l.is_draft) {
        activeListingsByUser.set(l.user_id, (activeListingsByUser.get(l.user_id) || 0) + 1);
      }
    });

    const enrichedProfiles = profiles?.map((p) => {
      const authUser = authMap.get(p.user_id);
      return {
        ...p,
        email: authUser?.email || null,
        listing_count: listingsByUser.get(p.user_id) || 0,
        active_listing_count: activeListingsByUser.get(p.user_id) || 0,
        is_banned: !!authUser?.banned_until && new Date(authUser.banned_until) > new Date(),
        last_sign_in: authUser?.last_sign_in_at || null,
      };
    }) || [];

    const totalViews = stats?.reduce((sum, s) => sum + s.view_count, 0) || 0;
    const totalInquiries = conversations?.length || 0;

    return NextResponse.json({
      users: enrichedProfiles,
      listings: enrichedListings,
      summary: {
        totalUsers: profiles?.length || 0,
        totalListings: listings?.length || 0,
        activeListings: listings?.filter((l) => l.is_active && !l.is_draft).length || 0,
        draftListings: listings?.filter((l) => l.is_draft).length || 0,
        soldListings: listings?.filter((l) => l.status === 'sold').length || 0,
        rentedListings: listings?.filter((l) => l.status === 'rented').length || 0,
        totalViews,
        totalInquiries,
      },
    });
  } catch (error: any) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}
