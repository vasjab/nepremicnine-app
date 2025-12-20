import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Home, Calendar, Phone } from 'lucide-react';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { ListingSkeletonGrid } from '@/components/ListingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Listing } from '@/types/listing';

interface LandlordProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
}

const LandlordProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<LandlordProfileData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const { data } = await supabase
          .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
          .single();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchListings = async () => {
      setIsLoadingListings(true);
      try {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setListings((data as Listing[]) || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchProfile();
    fetchListings();
  }, [userId]);

  const displayName = profile?.full_name || 'Landlord';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="h-14" />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {isLoadingProfile ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                  {displayName[0]?.toUpperCase() || 'L'}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isLoadingProfile ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-4" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{displayName}</h1>
                  {profile?.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}
                </>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                {isLoadingProfile ? (
                  <>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Home className="h-4 w-4" />
                      <span>{listings.length} active listing{listings.length !== 1 ? 's' : ''}</span>
                    </div>
                    {profile?.created_at && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${profile.phone}`}
                          className="text-accent hover:underline"
                        >
                          {profile.phone}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Listings by {displayName}
          </h2>
          
          {isLoadingListings ? (
            <ListingSkeletonGrid count={6} />
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active listings at the moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandlordProfile;
