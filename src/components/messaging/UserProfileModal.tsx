'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Home, Calendar, Phone, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  userAvatar?: string;
}

export function UserProfileModal({ isOpen, onClose, userId, userName, userAvatar }: UserProfileModalProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listingsCount, setListingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Fetch profile using secure function that conditionally exposes phone
        const { data: profileData } = await supabase
          .rpc('get_profile_for_viewer', { p_profile_user_id: userId })
          .single();

        setProfile(profileData);

        // Fetch active listings count
        const { count } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true);

        setListingsCount(count || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId]);

  const displayName = profile?.full_name || userName || 'User';
  const avatarUrl = profile?.avatar_url || userAvatar;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
              {displayName[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          {isLoading ? (
            <Skeleton className="h-7 w-40" />
          ) : (
            <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
          )}

          {/* Bio */}
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : profile?.bio ? (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          ) : null}

          {/* Stats & Info */}
          <div className="w-full space-y-3 pt-4 border-t border-border">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </>
            ) : (
              <>
                {/* Active Listings */}
                <div className="flex items-center gap-3 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Active listings:</span>
                  <span className="text-foreground font-medium">{listingsCount}</span>
                </div>

                {/* Member Since */}
                {profile?.created_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Member since:</span>
                    <span className="text-foreground font-medium">
                      {format(new Date(profile.created_at), 'MMMM yyyy')}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Phone:</span>
                    <a 
                      href={`tel:${profile.phone}`} 
                      className="text-accent hover:underline font-medium"
                    >
                      {profile.phone}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {listingsCount > 0 && (
            <Button
              onClick={() => {
                onClose();
                router.push(`/landlord/${userId}`);
              }}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View all listings ({listingsCount})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
