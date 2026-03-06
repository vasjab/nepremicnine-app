'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RecentlyViewedListings } from '@/components/RecentlyViewedListings';
import { Profile } from '@/types/listing';

import { BasicInfoSection } from '@/components/profile/BasicInfoSection';
import { RoleSwitcher } from '@/components/profile/RoleSwitcher';
import { RenterDetailsSection } from '@/components/profile/RenterDetailsSection';
import { OptionalDetailsSection } from '@/components/profile/OptionalDetailsSection';
import { ReferencesSection } from '@/components/profile/ReferencesSection';
import { CoverLetterSection } from '@/components/profile/CoverLetterSection';
import { LandlordDetailsSection } from '@/components/profile/LandlordDetailsSection';
import { AccountSection } from '@/components/profile/AccountSection';
import type { ProfileFormData } from '@/components/profile/types';

const DEFAULT_FORM_DATA: ProfileFormData = {
  full_name: '',
  phone: '',
  bio: '',
  avatar_url: '',
  employment_status: '',
  employment_other: '',
  move_in_timeline: '',
  household_size: 1,
  has_pets: false,
  pet_details: '',
  is_smoker: false,
  looking_duration: '',
  looking_duration_date: '',
  age_bracket: '',
  marital_status: '',
  has_kids: false,
  kids_count: 0,
  kids_ages: '',
  nationality: '',
  education_level: '',
  occupation: '',
  social_links: { linkedin: '', facebook: '', instagram: '' },
  renter_references: [],
  default_cover_letter: '',
  management_type: '',
  num_properties: 1,
  response_time: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [intents, setIntents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);

  // ── Fetch profile ───────────────────────────────────────────────────────────
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

      if (error) {
        console.error('Failed to fetch profile:', error);
      }

      if (data) {
        setProfile(data as Profile);
        setIntents((data.user_intents as string[]) ?? []);
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

  // ── Save all fields ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const socialLinks: Record<string, string> = {};
    if (formData.social_links.linkedin) socialLinks.linkedin = formData.social_links.linkedin;
    if (formData.social_links.facebook) socialLinks.facebook = formData.social_links.facebook;
    if (formData.social_links.instagram) socialLinks.instagram = formData.social_links.instagram;

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
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    } else {
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const update = (patch: Partial<ProfileFormData>) => setFormData(prev => ({ ...prev, ...patch }));

  // ── Role detection (driven by separate intents state) ───────────────────────
  const isRenter = intents.includes('rent') || intents.includes('buy');
  const isLandlord = intents.includes('renting_out') || intents.includes('selling');

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
                  <p className="text-slate-300 text-sm">{user.email}</p>
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
                {/* ── Basic Info ────────────────────────────────────────── */}
                <BasicInfoSection
                  email={user.email ?? ''}
                  data={formData}
                  onUpdate={update}
                />

                {/* ── Role Switcher ────────────────────────────────────── */}
                <RoleSwitcher
                  userId={user.id}
                  intents={intents}
                  onIntentsChange={(newIntents) => {
                    setIntents(newIntents);
                    setProfile(prev => prev ? { ...prev, user_intents: newIntents } : prev);
                  }}
                />

                {/* ── Renter Sections ───────────────────────────────────── */}
                {isRenter && (
                  <>
                    <RenterDetailsSection data={formData} onUpdate={update} />
                    <OptionalDetailsSection data={formData} onUpdate={update} />
                    <ReferencesSection data={formData} onUpdate={update} />
                    <CoverLetterSection data={formData} onUpdate={update} />
                  </>
                )}

                {/* ── Landlord Sections ─────────────────────────────────── */}
                {isLandlord && (
                  <LandlordDetailsSection data={formData} onUpdate={update} />
                )}

                {/* ── Save ─────────────────────────────────────────────── */}
                <div className="border-b border-gray-100" />
                <Button
                  onClick={handleSave}
                  variant="gradient"
                  disabled={saving}
                  className="h-12 text-base font-semibold rounded-xl w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* ── Account ──────────────────────────────────────────── */}
                <AccountSection onSignOut={handleSignOut} />
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
