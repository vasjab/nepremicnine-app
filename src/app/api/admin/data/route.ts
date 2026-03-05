import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  if (!sessionCookie) return false;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${password}:hemma-admin-salt-2024`);
  let hash = 0;
  for (const byte of data) {
    hash = ((hash << 5) - hash + byte) | 0;
  }
  const expectedToken = `admin_${Math.abs(hash).toString(36)}`;

  return sessionCookie.value === expectedToken;
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
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

    // Fetch all listings with stats
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, user_id, price, currency, city, country, property_type, listing_type, status, is_active, is_draft, created_at, updated_at, completed_at, images, area_sqm, bedrooms')
      .order('created_at', { ascending: false });

    if (listingsError) throw listingsError;

    // Fetch all listing stats (view counts)
    const { data: stats, error: statsError } = await supabase
      .from('listing_stats')
      .select('listing_id, view_count');

    if (statsError) throw statsError;

    // Fetch conversation counts per listing
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('listing_id');

    if (convError) throw convError;

    // Build stats maps
    const viewsByListing = new Map<string, number>();
    stats?.forEach((s) => {
      viewsByListing.set(s.listing_id, s.view_count);
    });

    const inquiriesByListing = new Map<string, number>();
    conversations?.forEach((c) => {
      const count = inquiriesByListing.get(c.listing_id) || 0;
      inquiriesByListing.set(c.listing_id, count + 1);
    });

    // Enrich listings with stats
    const enrichedListings = listings?.map((l) => ({
      ...l,
      view_count: viewsByListing.get(l.id) || 0,
      inquiry_count: inquiriesByListing.get(l.id) || 0,
    })) || [];

    // Build user map with their listing counts
    const listingsByUser = new Map<string, number>();
    const activeListingsByUser = new Map<string, number>();
    listings?.forEach((l) => {
      listingsByUser.set(l.user_id, (listingsByUser.get(l.user_id) || 0) + 1);
      if (l.is_active && !l.is_draft) {
        activeListingsByUser.set(l.user_id, (activeListingsByUser.get(l.user_id) || 0) + 1);
      }
    });

    const enrichedProfiles = profiles?.map((p) => ({
      ...p,
      listing_count: listingsByUser.get(p.user_id) || 0,
      active_listing_count: activeListingsByUser.get(p.user_id) || 0,
    })) || [];

    // Summary stats
    const totalViews = stats?.reduce((sum, s) => sum + s.view_count, 0) || 0;
    const totalInquiries = conversations?.length || 0;
    const activeListings = listings?.filter((l) => l.is_active && !l.is_draft).length || 0;
    const draftListings = listings?.filter((l) => l.is_draft).length || 0;
    const soldListings = listings?.filter((l) => l.status === 'sold').length || 0;
    const rentedListings = listings?.filter((l) => l.status === 'rented').length || 0;

    return NextResponse.json({
      users: enrichedProfiles,
      listings: enrichedListings,
      summary: {
        totalUsers: profiles?.length || 0,
        totalListings: listings?.length || 0,
        activeListings,
        draftListings,
        soldListings,
        rentedListings,
        totalViews,
        totalInquiries,
      },
    });
  } catch (error: any) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
