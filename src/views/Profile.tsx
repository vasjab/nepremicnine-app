'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, FileText, LogOut, Key, ShoppingCart, Home as HomeIcon, Building2, Briefcase, Users, PawPrint, Cigarette, Clock, Sparkles } from 'lucide-react';
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
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

      <main className="pt-16 relative overflow-hidden">
        {/* Decorative ambient blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gray-400/[0.03] blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-32 h-60 w-60 rounded-full bg-gray-400/[0.03] blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="max-w-xl mx-auto animate-fade-in">
            {/* Gradient header banner */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 pb-16 mb-[-3rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    My Profile
                  </h1>
                  <p className="text-slate-300 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 pt-16">
                <div className="h-24 w-24 rounded-full bg-muted skeleton-shimmer mx-auto" />
                <div className="h-11 bg-muted rounded-xl skeleton-shimmer" />
                <div className="h-11 bg-muted rounded-xl skeleton-shimmer" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatar with gradient ring - overlapping banner */}
                <div className="flex justify-center relative z-10">
                  <div className="rounded-full p-1 ring-2 ring-slate-200 bg-white shadow-sm">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-xl bg-secondary">
                        {formData.full_name ? getInitials(formData.full_name) : user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Avatar URL field */}
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Avatar</span>
                  </div>
                  <div className="p-5">
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Personal Information section */}
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Mail className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Personal Information</span>
                  </div>
                  <div className="p-5 space-y-5">
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
                  </div>
                </div>

                {/* About section */}
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FileText className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">About</span>
                  </div>
                  <div className="p-5">
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Onboarding prompt */}
                {profile && !profile.onboarding_completed && (
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-5 text-left hover:border-slate-400 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Complete your profile</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Tell us what you're looking for so we can personalize your experience</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Intent badges */}
                {profile?.user_intents && profile.user_intents.length > 0 && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">My Interests</span>
                      </div>
                      <button
                        onClick={() => setShowOnboarding(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {profile.user_intents.map(intent => {
                          const config: Record<string, { label: string; icon: typeof Key; color: string }> = {
                            rent: { label: 'Renting', icon: Key, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            buy: { label: 'Buying', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                            renting_out: { label: 'Renting out', icon: HomeIcon, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                            selling: { label: 'Selling', icon: Building2, color: 'bg-violet-50 text-violet-700 border-violet-200' },
                          };
                          const c = config[intent];
                          if (!c) return null;
                          return (
                            <span key={intent} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border', c.color)}>
                              <c.icon className="h-3 w-3" />
                              {c.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Renter details summary */}
                      {(profile.user_intents.includes('rent') || profile.user_intents.includes('buy')) && profile.employment_status && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                          {profile.employment_status && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span className="capitalize">{profile.employment_status.replace('_', '-')}</span>
                            </div>
                          )}
                          {profile.household_size && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{profile.household_size} {profile.household_size === 1 ? 'person' : 'people'}</span>
                            </div>
                          )}
                          {profile.move_in_timeline && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="capitalize">{profile.move_in_timeline.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                          {profile.has_pets && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <PawPrint className="h-3 w-3" />
                              <span>Has pets</span>
                            </div>
                          )}
                          {profile.is_smoker && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Cigarette className="h-3 w-3" />
                              <span>Smoker</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Landlord details summary */}
                      {(profile.user_intents.includes('renting_out') || profile.user_intents.includes('selling')) && profile.management_type && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                          {profile.management_type && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span className="capitalize">{profile.management_type.replace('_', ' ')}</span>
                            </div>
                          )}
                          {profile.num_properties && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HomeIcon className="h-3 w-3" />
                              <span>{profile.num_properties} {profile.num_properties === 1 ? 'property' : 'properties'}</span>
                            </div>
                          )}
                          {profile.response_time && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="capitalize">{profile.response_time.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-b border-gray-100" />

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSave}
                    variant="gradient"
                    disabled={saving}
                    className="h-12 text-base font-semibold rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                {/* Notification Preferences */}
                <div className="pt-2">
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

      <OnboardingModal
        open={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // Refetch profile to get updated data
          if (user) {
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single()
              .then(({ data }) => {
                if (data) setProfile(data as Profile);
              });
          }
        }}
      />
    </div>
  );
}
