'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Home, Calendar, Phone, List, MapIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { ListingSkeletonGrid } from '@/components/ListingSkeleton';
import { MapView } from '@/components/MapView';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, Profile } from '@/types/listing';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function LandlordProfileClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatPrice, formatArea } = useFormattedPrice();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [modalListing, setModalListing] = useState<Listing | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
          .single();
        if (error) throw error;
        setProfile(data as unknown as Profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('is_draft', false)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setListings(data as Listing[]);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchListings();
  }, [userId]);

  const handleListingClick = useCallback((listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  }, [router]);

  const handlePopupClick = useCallback((listing: Listing) => {
    setModalListing(listing);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-16" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <ListingSkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />

      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile header */}
        <div className="flex items-start gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || 'Landlord'}</h1>
            {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {profile?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {format(new Date(profile.created_at), 'MMM yyyy')}
                </span>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1 text-accent hover:underline">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Listings section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            <Home className="h-5 w-5 inline mr-2" />
            Listings by {profile?.full_name || 'this landlord'} ({listings.length})
          </h2>
          {listings.length > 0 && (
            <div className="flex bg-card rounded-full border border-border p-0.5">
              <button
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  view === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  view === 'map' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setView('map')}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {listings.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">No active listings at the moment.</p>
        ) : view === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onClick={() => handleListingClick(listing)} />
            ))}
          </div>
        ) : (
          <div className="h-[60vh] rounded-xl overflow-hidden border border-border">
            <MapView
              listings={listings}
              activeListing={null}
              onListingClick={handleListingClick}
              onPopupClick={handlePopupClick}
              onMapMove={() => {}}
            />
          </div>
        )}
      </div>

      {modalListing && (
        <ListingDetailModal
          listing={modalListing}
          isOpen={!!modalListing}
          onClose={() => setModalListing(null)}
        />
      )}
    </div>
  );
}
