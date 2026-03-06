'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, User, Mail, FileText, LogOut, Key, ShoppingCart, Home as HomeIcon, Building2,
  Briefcase, Users, PawPrint, Cigarette, Clock, Sparkles, Heart, Baby, Globe,
  GraduationCap, UserCheck, Trash2, Plus, Link as LinkIcon,
} from 'lucide-react';
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
    // Renter details
    employment_status: '',
    employment_other: '',
    move_in_timeline: '',
    household_size: 1,
    has_pets: false,
    pet_details: '',
    is_smoker: false,
    looking_duration: '',
    looking_duration_date: '',
    // Optional details
    age_bracket: '',
    marital_status: '',
    has_kids: false,
    kids_count: 0,
    kids_ages: '',
    nationality: '',
    education_level: '',
    occupation: '',
    social_links: { linkedin: '', facebook: '', instagram: '' },
    // References
    renter_references: [] as Array<{ name: string; contact: string; relationship: string }>,
    // Cover letter
    default_cover_letter: '',
    // Landlord details
    management_type: '',
    num_properties: 1,
    response_time: '',
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
        const sl = (data.social_links as Record<string, string>) || {};
        const refs = (data.renter_references as Array<{ name: string; contact: string; relationship: string }>) || [];
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          employment_status: data.employment_status || '',
          employment_other: data.employment_other || '',
          move_in_timeline: data.move_in_timeline || '',
          household_size: data.household_size || 1,
          has_pets: data.has_pets ?? false,
          pet_details: data.pet_details || '',
          is_smoker: data.is_smoker ?? false,
          looking_duration: data.looking_duration || '',
          looking_duration_date: data.looking_duration_date || '',
          age_bracket: data.age_bracket || '',
          marital_status: data.marital_status || '',
          has_kids: data.has_kids ?? false,
          kids_count: data.kids_count || 0,
          kids_ages: data.kids_ages || '',
          nationality: data.nationality || '',
          education_level: data.education_level || '',
          occupation: data.occupation || '',
          social_links: {
            linkedin: sl.linkedin || '',
            facebook: sl.facebook || '',
            instagram: sl.instagram || '',
          },
          renter_references: refs,
          default_cover_letter: data.default_cover_letter || '',
          management_type: data.management_type || '',
          num_properties: data.num_properties || 1,
          response_time: data.response_time || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    // Build social_links JSONB — strip empty values
    const socialLinks: Record<string, string> = {};
    if (formData.social_links.linkedin) socialLinks.linkedin = formData.social_links.linkedin;
    if (formData.social_links.facebook) socialLinks.facebook = formData.social_links.facebook;
    if (formData.social_links.instagram) socialLinks.instagram = formData.social_links.instagram;

    // Filter out empty references
    const cleanRefs = formData.renter_references.filter(r => r.name.trim() || r.contact.trim());

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        employment_status: formData.employment_status || null,
        employment_other: formData.employment_other || null,
        move_in_timeline: formData.move_in_timeline || null,
        household_size: formData.household_size,
        has_pets: formData.has_pets,
        pet_details: formData.pet_details || null,
        is_smoker: formData.is_smoker,
        looking_duration: formData.looking_duration || null,
        looking_duration_date: formData.looking_duration_date || null,
        age_bracket: formData.age_bracket || null,
        marital_status: formData.marital_status || null,
        has_kids: formData.has_kids,
        kids_count: formData.has_kids ? formData.kids_count : null,
        kids_ages: formData.has_kids ? formData.kids_ages || null : null,
        nationality: formData.nationality || null,
        education_level: formData.education_level || null,
        occupation: formData.occupation || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        renter_references: cleanRefs.length > 0 ? cleanRefs : null,
        default_cover_letter: formData.default_cover_letter || null,
        management_type: formData.management_type || null,
        num_properties: formData.num_properties,
        response_time: formData.response_time || null,
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

  const update = (patch: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...patch }));

  const isRenter = profile?.user_intents?.includes('rent') || profile?.user_intents?.includes('buy');
  const isLandlord = profile?.user_intents?.includes('renting_out') || profile?.user_intents?.includes('selling');

  const EMPLOYMENT_OPTIONS = [
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'other', label: 'Other' },
  ];
  const TIMELINE_OPTIONS = [
    { value: 'asap', label: 'ASAP' },
    { value: '1_month', label: '1 month' },
    { value: '2_3_months', label: '2–3 months' },
    { value: 'flexible', label: 'Flexible' },
  ];
  const DURATION_OPTIONS = [
    { value: 'few_months', label: 'A few months' },
    { value: 'a_year', label: 'About a year' },
    { value: 'indefinite', label: 'As long as possible' },
  ];
  const AGE_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const MARITAL_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'partner', label: 'Partner' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];
  const EDUCATION_OPTIONS = [
    { value: 'high_school', label: 'High school' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'other', label: 'Other' },
  ];
  const MANAGEMENT_OPTIONS = [
    { value: 'individual', label: 'Individual' },
    { value: 'agency', label: 'Agency' },
    { value: 'company', label: 'Company' },
  ];
  const RESPONSE_TIME_OPTIONS = [
    { value: 'within_hour', label: 'Within an hour' },
    { value: 'within_day', label: 'Within a day' },
    { value: 'within_few_days', label: 'Within a few days' },
  ];

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
                      {isLandlord && (formData.management_type || profile.management_type) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                          {(formData.management_type || profile.management_type) && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span className="capitalize">{(formData.management_type || profile.management_type || '').replace('_', ' ')}</span>
                            </div>
                          )}
                          {(formData.num_properties || profile.num_properties) && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <HomeIcon className="h-3 w-3" />
                              <span>{formData.num_properties || profile.num_properties} {(formData.num_properties || profile.num_properties || 1) === 1 ? 'property' : 'properties'}</span>
                            </div>
                          )}
                          {(formData.response_time || profile.response_time) && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="capitalize">{(formData.response_time || profile.response_time || '').replace(/_/g, ' ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Renter Details (editable) */}
                {isRenter && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Renter Details</span>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Employment */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Employment</label>
                        <div className="flex flex-wrap gap-2">
                          {EMPLOYMENT_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ employment_status: formData.employment_status === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.employment_status === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {formData.employment_status === 'other' && (
                          <Input placeholder="Tell us what you do" value={formData.employment_other} onChange={(e) => update({ employment_other: e.target.value })} className="mt-2 max-w-xs text-sm" />
                        )}
                      </div>

                      {/* Move-in timeline */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Move-in timeline</label>
                        <div className="flex flex-wrap gap-2">
                          {TIMELINE_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ move_in_timeline: formData.move_in_timeline === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.move_in_timeline === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Household size */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Household size</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => update({ household_size: Math.max(1, formData.household_size - 1) })} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50">-</button>
                          <span className="text-sm font-semibold w-6 text-center">{formData.household_size}</span>
                          <button onClick={() => update({ household_size: Math.min(10, formData.household_size + 1) })} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50">+</button>
                        </div>
                      </div>

                      {/* Pets & Smoker */}
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => update({ has_pets: !formData.has_pets })} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors', formData.has_pets ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                          <PawPrint className="h-4 w-4" /> I have pets
                        </button>
                        <button onClick={() => update({ is_smoker: !formData.is_smoker })} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors', formData.is_smoker ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                          <Cigarette className="h-4 w-4" /> I smoke
                        </button>
                      </div>
                      {formData.has_pets && (
                        <Input placeholder="What pets do you have? (e.g. 1 small dog)" value={formData.pet_details} onChange={(e) => update({ pet_details: e.target.value })} className="text-sm" />
                      )}

                      {/* Looking duration */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">How long are you looking to stay?</label>
                        <div className="flex flex-wrap gap-2">
                          {DURATION_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ looking_duration: formData.looking_duration === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.looking_duration === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Details (editable) */}
                {isRenter && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">About You</span>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Age bracket */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Age range</label>
                        <div className="flex flex-wrap gap-2">
                          {AGE_OPTIONS.map(age => (
                            <button key={age} onClick={() => update({ age_bracket: formData.age_bracket === age ? '' : age })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.age_bracket === age ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {age}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Marital status */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                          <Heart className="h-3.5 w-3.5 inline mr-1" /> Relationship status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MARITAL_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ marital_status: formData.marital_status === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.marital_status === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kids */}
                      <div className="space-y-2">
                        <button onClick={() => update({ has_kids: !formData.has_kids, kids_count: formData.has_kids ? 0 : formData.kids_count || 1 })} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors', formData.has_kids ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                          <Baby className="h-4 w-4" /> I have children
                        </button>
                        {formData.has_kids && (
                          <div className="flex items-center gap-3 pl-1">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">How many:</label>
                              <button onClick={() => update({ kids_count: Math.max(1, (formData.kids_count || 1) - 1) })} className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50">-</button>
                              <span className="text-sm font-semibold w-5 text-center">{formData.kids_count || 1}</span>
                              <button onClick={() => update({ kids_count: Math.min(10, (formData.kids_count || 1) + 1) })} className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50">+</button>
                            </div>
                            <Input placeholder="Ages (e.g. 3, 7)" value={formData.kids_ages} onChange={(e) => update({ kids_ages: e.target.value })} className="max-w-[140px] h-8 text-sm" />
                          </div>
                        )}
                      </div>

                      {/* Nationality */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                          <Globe className="h-3.5 w-3.5 inline mr-1" /> Nationality
                        </label>
                        <Input placeholder="e.g. Slovenian" value={formData.nationality} onChange={(e) => update({ nationality: e.target.value })} className="max-w-xs" />
                      </div>

                      {/* Education & Occupation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                            <GraduationCap className="h-3.5 w-3.5 inline mr-1" /> Education
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {EDUCATION_OPTIONS.map(opt => (
                              <button key={opt.value} onClick={() => update({ education_level: formData.education_level === opt.value ? '' : opt.value })} className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border', formData.education_level === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                            <Briefcase className="h-3.5 w-3.5 inline mr-1" /> Occupation
                          </label>
                          <Input placeholder="e.g. Software engineer" value={formData.occupation} onChange={(e) => update({ occupation: e.target.value })} className="text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* References (editable) */}
                {isRenter && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <UserCheck className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">References</span>
                    </div>
                    <div className="p-5 space-y-4">
                      {formData.renter_references.map((ref, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference {i + 1}</span>
                            <button onClick={() => update({ renter_references: formData.renter_references.filter((_, idx) => idx !== i) })} className="text-muted-foreground hover:text-red-500 transition-colors p-1" aria-label={`Remove reference ${i + 1}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <Input placeholder="Full name" value={ref.name} onChange={(e) => { const updated = [...formData.renter_references]; updated[i] = { ...updated[i], name: e.target.value }; update({ renter_references: updated }); }} className="text-sm" />
                          <Input placeholder="Email or phone" value={ref.contact} onChange={(e) => { const updated = [...formData.renter_references]; updated[i] = { ...updated[i], contact: e.target.value }; update({ renter_references: updated }); }} className="text-sm" />
                          <Input placeholder="Relationship (e.g. Previous landlord)" value={ref.relationship} onChange={(e) => { const updated = [...formData.renter_references]; updated[i] = { ...updated[i], relationship: e.target.value }; update({ renter_references: updated }); }} className="text-sm" />
                        </div>
                      ))}
                      {formData.renter_references.length < 3 && (
                        <button onClick={() => update({ renter_references: [...formData.renter_references, { name: '', contact: '', relationship: '' }] })} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm font-medium text-muted-foreground hover:border-gray-400 hover:text-foreground transition-colors w-full justify-center">
                          <Plus className="h-4 w-4" /> Add a reference
                        </button>
                      )}
                      {formData.renter_references.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">No references added yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cover Letter (editable) */}
                {isRenter && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FileText className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Default Cover Letter</span>
                    </div>
                    <div className="p-5 space-y-2">
                      <Textarea
                        placeholder="Hi, I'm looking for a comfortable place to call home. I work as..."
                        rows={5}
                        value={formData.default_cover_letter}
                        onChange={(e) => { if (e.target.value.length <= 2000) update({ default_cover_letter: e.target.value }); }}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Pre-filled when you apply to listings.</p>
                        <span className={cn('text-xs', formData.default_cover_letter.length > 1800 ? 'text-orange-500' : 'text-muted-foreground')}>
                          {formData.default_cover_letter.length}/2000
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Links (editable) */}
                {isRenter && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <LinkIcon className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Social Profiles</span>
                    </div>
                    <div className="p-5 space-y-3">
                      <Input placeholder="LinkedIn URL" value={formData.social_links.linkedin} onChange={(e) => update({ social_links: { ...formData.social_links, linkedin: e.target.value } })} className="text-sm" />
                      <Input placeholder="Facebook URL" value={formData.social_links.facebook} onChange={(e) => update({ social_links: { ...formData.social_links, facebook: e.target.value } })} className="text-sm" />
                      <Input placeholder="Instagram URL" value={formData.social_links.instagram} onChange={(e) => update({ social_links: { ...formData.social_links, instagram: e.target.value } })} className="text-sm" />
                    </div>
                  </div>
                )}

                {/* Landlord Details (editable) */}
                {isLandlord && (
                  <div className="glass-card overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Building2 className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Landlord Details</span>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Management type */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">I manage as</label>
                        <div className="flex flex-wrap gap-2">
                          {MANAGEMENT_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ management_type: formData.management_type === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.management_type === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of properties */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Number of properties</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => update({ num_properties: Math.max(1, formData.num_properties - 1) })} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50">-</button>
                          <span className="text-sm font-semibold w-6 text-center">{formData.num_properties}</span>
                          <button onClick={() => update({ num_properties: Math.min(100, formData.num_properties + 1) })} className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50">+</button>
                        </div>
                      </div>

                      {/* Response time */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Typical response time</label>
                        <div className="flex flex-wrap gap-2">
                          {RESPONSE_TIME_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => update({ response_time: formData.response_time === opt.value ? '' : opt.value })} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors border', formData.response_time === opt.value ? 'border-slate-900 bg-slate-50 text-foreground' : 'border-gray-200 text-muted-foreground hover:border-gray-300')}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
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
