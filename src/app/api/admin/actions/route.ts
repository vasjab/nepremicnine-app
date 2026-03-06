import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // --- Listing actions ---
      case 'toggle_listing': {
        const { listing_id, is_active } = body;
        const { error } = await supabase
          .from('listings')
          .update({ is_active })
          .eq('id', listing_id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case 'delete_listing': {
        const { listing_id } = body;
        // Delete related data first
        await supabase.from('listing_stats').delete().eq('listing_id', listing_id);
        await supabase.from('recently_viewed_listings').delete().eq('listing_id', listing_id);
        await supabase.from('saved_listings').delete().eq('listing_id', listing_id);
        // Delete conversations and their messages
        const { data: convos } = await supabase
          .from('conversations')
          .select('id')
          .eq('listing_id', listing_id);
        if (convos && convos.length > 0) {
          const convoIds = convos.map((c) => c.id);
          await supabase.from('messages').delete().in('conversation_id', convoIds);
          await supabase.from('conversations').delete().eq('listing_id', listing_id);
        }
        // Delete the listing
        const { error } = await supabase.from('listings').delete().eq('id', listing_id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      // --- User actions ---
      case 'ban_user': {
        const { user_id } = body;
        const { error } = await supabase.auth.admin.updateUserById(user_id, {
          ban_duration: '876000h', // ~100 years
        });
        if (error) throw error;
        // Deactivate all their listings
        await supabase.from('listings').update({ is_active: false }).eq('user_id', user_id);
        return NextResponse.json({ ok: true });
      }

      case 'unban_user': {
        const { user_id } = body;
        const { error } = await supabase.auth.admin.updateUserById(user_id, {
          ban_duration: 'none',
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case 'impersonate_user': {
        const { user_id } = body;
        // Generate a magic link for the user
        const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(user_id);
        if (userErr || !userData?.user?.email) throw userErr || new Error('User not found');

        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: userData.user.email,
        });
        if (linkErr) throw linkErr;

        // The hashed_token can be used to build the verify URL
        const token = linkData.properties?.hashed_token;
        if (!token) throw new Error('Failed to generate token');

        // Build the OTP verify URL that the app can consume
        const siteUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const verifyUrl = `${siteUrl}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${process.env.NEXT_PUBLIC_SITE_URL || 'https://nepremicnine-app.vercel.app'}/`;

        return NextResponse.json({ ok: true, url: verifyUrl, email: userData.user.email });
      }

      case 'delete_user': {
        const { user_id } = body;
        // Get user's listings
        const { data: userListings } = await supabase
          .from('listings')
          .select('id')
          .eq('user_id', user_id);

        // Delete listing-related data
        if (userListings && userListings.length > 0) {
          const listingIds = userListings.map((l) => l.id);
          await supabase.from('listing_stats').delete().in('listing_id', listingIds);
          await supabase.from('recently_viewed_listings').delete().in('listing_id', listingIds);
          await supabase.from('saved_listings').delete().in('listing_id', listingIds);
          // Conversations and messages
          const { data: convos } = await supabase
            .from('conversations')
            .select('id')
            .in('listing_id', listingIds);
          if (convos && convos.length > 0) {
            const convoIds = convos.map((c) => c.id);
            await supabase.from('messages').delete().in('conversation_id', convoIds);
          }
          await supabase.from('conversations').delete().in('listing_id', listingIds);
          await supabase.from('listings').delete().eq('user_id', user_id);
        }

        // Delete user's other data
        await supabase.from('saved_listings').delete().eq('user_id', user_id);
        await supabase.from('recently_viewed_listings').delete().eq('user_id', user_id);
        await supabase.from('notification_preferences').delete().eq('user_id', user_id);
        await supabase.from('profiles').delete().eq('user_id', user_id);

        // Also delete conversations where user is renter
        const { data: renterConvos } = await supabase
          .from('conversations')
          .select('id')
          .eq('renter_id', user_id);
        if (renterConvos && renterConvos.length > 0) {
          const convoIds = renterConvos.map((c) => c.id);
          await supabase.from('messages').delete().in('conversation_id', convoIds);
          await supabase.from('conversations').delete().eq('renter_id', user_id);
        }

        // Delete auth user last
        const { error } = await supabase.auth.admin.deleteUser(user_id);
        if (error) throw error;

        return NextResponse.json({ ok: true });
      }

      case 'assign_owners': {
        // Create 5 landlord accounts and distribute ALL listings across them
        const landlords = [
          { email: 'marko.novak@test.si', name: 'Marko Novak' },
          { email: 'ana.horvat@test.si', name: 'Ana Horvat' },
          { email: 'janez.krajnc@test.si', name: 'Janez Krajnc' },
          { email: 'maja.zupan@test.si', name: 'Maja Zupan' },
          { email: 'luka.kovac@test.si', name: 'Luka Kovac' },
        ];

        const landlordIds: string[] = [];
        const log: string[] = [];

        for (const ll of landlords) {
          // Check if user already exists
          const { data: existing } = await supabase
            .from('profiles')
            .select('user_id')
            .ilike('full_name', ll.name)
            .maybeSingle();

          if (existing) {
            landlordIds.push(existing.user_id);
            log.push(`Found existing: ${ll.name}`);
          } else {
            // Create auth user
            const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
              email: ll.email,
              email_confirm: true,
              user_metadata: { full_name: ll.name },
            });
            if (authErr) {
              // If user exists in auth but not profiles, find by email
              const { data: { users } } = await supabase.auth.admin.listUsers();
              const found = (users as Array<{ id: string; email?: string }>)?.find((u) => u.email === ll.email);
              if (found) {
                landlordIds.push(found.id);
                log.push(`Found auth user: ${ll.name}`);
              } else {
                log.push(`Failed to create ${ll.name}: ${authErr.message}`);
              }
              continue;
            }
            landlordIds.push(authData.user.id);

            // Create profile
            await supabase.from('profiles').upsert({
              user_id: authData.user.id,
              full_name: ll.name,
              phone: `+386 ${40 + landlordIds.length} ${String(100000 + Math.floor(Math.random() * 899999))}`,
              bio: `Property owner in Slovenia`,
            });
            log.push(`Created: ${ll.name}`);
          }
        }

        if (landlordIds.length === 0) {
          throw new Error('Failed to create any landlord accounts');
        }

        // Get ALL listings
        const { data: allListings, error: listErr } = await supabase
          .from('listings')
          .select('id')
          .order('created_at', { ascending: true });

        if (listErr) throw listErr;
        if (!allListings || allListings.length === 0) {
          return NextResponse.json({ ok: true, log, assigned: 0, message: 'No listings found to assign' });
        }

        // Distribute listings round-robin
        let assigned = 0;
        for (let i = 0; i < allListings.length; i++) {
          const landlordId = landlordIds[i % landlordIds.length];
          const { error: upErr } = await supabase
            .from('listings')
            .update({ user_id: landlordId })
            .eq('id', allListings[i].id);
          if (!upErr) assigned++;
        }

        log.push(`Assigned ${assigned}/${allListings.length} listings to ${landlordIds.length} landlords`);
        return NextResponse.json({ ok: true, log, assigned, total: allListings.length });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
