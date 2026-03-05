'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { RecentlyViewedListings } from '@/components/RecentlyViewedListings';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Profile } from '@/types/listing';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile.',
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight">
              👤 My Profile
            </h1>

            {loading ? (
              <div className="space-y-4">
                <div className="h-24 w-24 rounded-full bg-muted skeleton-shimmer" />
                <div className="h-11 bg-muted rounded-xl skeleton-shimmer" />
                <div className="h-11 bg-muted rounded-xl skeleton-shimmer" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="text-xl bg-secondary">
                      {formData.full_name ? getInitials(formData.full_name) : user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+46 70 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">About</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    variant="accent"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-destructive hover:text-destructive"
                  >
                    Sign Out
                  </Button>
                </div>

                {/* Notification Preferences */}
                <div className="pt-4">
                  <NotificationPreferences />
                </div>
              </div>
            )}
          </div>

          {/* Recently Viewed Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <RecentlyViewedListings limit={6} />
          </div>
        </div>
      </main>
    </div>
  );
}
