import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/integrations/supabase/server';
import LandlordProfileClient from './LandlordProfileClient';

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
    .single();

  const name = profile?.full_name || 'Landlord';

  return {
    title: `${name} - Listings | hemma`,
    description: profile?.bio || `View property listings by ${name} on hemma.`,
    openGraph: {
      title: `${name} - Listings | hemma`,
      description: profile?.bio || `View property listings by ${name} on hemma.`,
      images: profile?.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
  };
}

export default async function LandlordProfilePage({ params }: Props) {
  const { userId } = await params;
  return <LandlordProfileClient userId={userId} />;
}
