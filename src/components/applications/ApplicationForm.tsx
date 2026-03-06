'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateApplication } from '@/hooks/useApplications';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Briefcase, Users, PawPrint, Cigarette, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { RenterSnapshot } from '@/types/application';
import type { Listing } from '@/types/listing';

interface ApplicationFormProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onNeedOnboarding: () => void;
}

export function ApplicationForm({ listing, isOpen, onClose, onNeedOnboarding }: ApplicationFormProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const createApplication = useCreateApplication();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');

  // Prefill cover letter from profile default
  useEffect(() => {
    if (profile?.default_cover_letter && !coverLetter) {
      setCoverLetter(profile.default_cover_letter);
    }
  }, [profile?.default_cover_letter]);

  const isOnboarded = profile?.onboarding_completed;

  const handleSubmit = async () => {
    if (!user || !profile || !listing.user_id) return;

    if (!isOnboarded) {
      onNeedOnboarding();
      return;
    }

    const snapshot: RenterSnapshot = {
      full_name: profile.full_name,
      email: user.email || null,
      phone: profile.phone,
      employment_status: profile.employment_status,
      employment_other: profile.employment_other,
      monthly_income_range: profile.monthly_income_range,
      move_in_timeline: profile.move_in_timeline,
      household_size: profile.household_size,
      has_pets: profile.has_pets,
      pet_details: profile.pet_details,
      is_smoker: profile.is_smoker,
      looking_duration: profile.looking_duration,
      age_bracket: profile.age_bracket,
      nationality: profile.nationality,
      occupation: profile.occupation,
      bio: profile.bio,
      default_cover_letter: profile.default_cover_letter,
    };

    try {
      await createApplication.mutateAsync({
        listingId: listing.id,
        landlordId: listing.user_id,
        coverLetter: coverLetter.trim() || undefined,
        renterSnapshot: snapshot,
      });
      toast({ title: 'Application submitted', description: 'The landlord will review your application.' });
      onClose();
    } catch (e: any) {
      const msg = e?.message?.includes('duplicate') ? 'You have already applied to this listing.' : 'Failed to submit application.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Apply for this rental
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Listing info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            {listing.images?.[0] && (
              <img src={listing.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{listing.title}</p>
              <p className="text-xs text-muted-foreground">{listing.city} &middot; {listing.price} {listing.currency}/mo</p>
            </div>
          </div>

          {/* Profile check */}
          {!isOnboarded && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Complete your profile first</p>
                <p className="text-xs text-amber-700 mt-0.5">Landlords need to know about you before reviewing your application.</p>
                <Button size="sm" variant="outline" className="mt-2 h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-100" onClick={onNeedOnboarding}>
                  Complete profile
                </Button>
              </div>
            </div>
          )}

          {/* Profile summary (auto-filled) */}
          {isOnboarded && profile && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your profile (included with application)</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {profile.full_name && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    {profile.full_name}
                  </div>
                )}
                {profile.employment_status && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span className="capitalize">{profile.employment_status.replace('_', '-')}</span>
                  </div>
                )}
                {profile.household_size && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {profile.household_size} {profile.household_size === 1 ? 'person' : 'people'}
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
                    Has pets
                  </div>
                )}
                {profile.is_smoker && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Cigarette className="h-3 w-3" />
                    Smoker
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cover letter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Cover letter (optional)
            </label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the landlord why you'd be a great tenant..."
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{coverLetter.length}/2000</p>
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!isOnboarded || createApplication.isPending}
            className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950"
          >
            {createApplication.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
