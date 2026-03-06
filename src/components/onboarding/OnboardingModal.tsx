'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSaveOnboarding, type OnboardingData } from '@/hooks/useOnboarding';
import {
  Home, Key, ShoppingCart, Search,
  Briefcase, GraduationCap, Clock, Users, PawPrint, Cigarette,
  Building2, User, ChevronRight, ChevronLeft, Check, Loader2,
} from 'lucide-react';

const INTENT_OPTIONS = [
  { value: 'rent', label: 'I want to rent', description: 'Looking for a place to rent', icon: Key },
  { value: 'buy', label: 'I want to buy', description: 'Looking to purchase property', icon: ShoppingCart },
  { value: 'renting_out', label: 'I\'m renting out', description: 'I have property to rent', icon: Home },
  { value: 'selling', label: 'I\'m selling', description: 'I have property to sell', icon: Building2 },
] as const;

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed', icon: Briefcase },
  { value: 'self_employed', label: 'Self-employed', icon: User },
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'retired', label: 'Retired', icon: Clock },
  { value: 'other', label: 'Other', icon: Users },
] as const;

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '2_3_months', label: '2-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: 'flexible', label: 'Flexible' },
] as const;

const MANAGEMENT_OPTIONS = [
  { value: 'private', label: 'Private owner' },
  { value: 'company', label: 'Management company' },
] as const;

const RESPONSE_TIME_OPTIONS = [
  { value: 'within_hour', label: 'Within an hour' },
  { value: 'same_day', label: 'Same day' },
  { value: 'next_day', label: 'Next business day' },
] as const;

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [intents, setIntents] = useState<string[]>([]);
  const [renterData, setRenterData] = useState({
    employment_status: '',
    move_in_timeline: '',
    household_size: 1,
    has_pets: false,
    is_smoker: false,
  });
  const [landlordData, setLandlordData] = useState({
    num_properties: 1,
    management_type: '',
    response_time: '',
  });

  const saveOnboarding = useSaveOnboarding();

  const isRenter = intents.includes('rent') || intents.includes('buy');
  const isLandlord = intents.includes('renting_out') || intents.includes('selling');

  const toggleIntent = (value: string) => {
    setIntents(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  // Calculate steps dynamically
  const steps: string[] = ['intent'];
  if (isRenter) steps.push('renter');
  if (isLandlord) steps.push('landlord');
  steps.push('done');

  const currentStepName = steps[step] || 'intent';
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 ? intents.length > 0 : true;

  const handleNext = () => {
    if (isLastStep) {
      handleSave();
    } else {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSave = async () => {
    const data: OnboardingData = {
      user_intents: intents,
      ...(isRenter ? {
        employment_status: renterData.employment_status || undefined,
        move_in_timeline: renterData.move_in_timeline || undefined,
        household_size: renterData.household_size,
        has_pets: renterData.has_pets,
        is_smoker: renterData.is_smoker,
      } : {}),
      ...(isLandlord ? {
        num_properties: landlordData.num_properties,
        management_type: landlordData.management_type || undefined,
        response_time: landlordData.response_time || undefined,
      } : {}),
    };

    try {
      await saveOnboarding.mutateAsync(data);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleSkip(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-900 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Step: Intent */}
          {currentStepName === 'intent' && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Welcome to hemma</h2>
              <p className="text-sm text-muted-foreground mb-6">What brings you here? Select all that apply.</p>
              <div className="grid grid-cols-2 gap-3">
                {INTENT_OPTIONS.map(opt => {
                  const selected = intents.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleIntent(opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                        selected
                          ? 'border-slate-900 bg-slate-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
                        selected ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'
                      )}>
                        <opt.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.description}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-slate-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Renter Profile */}
          {currentStepName === 'renter' && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">About you</h2>
              <p className="text-sm text-muted-foreground mb-6">Help landlords understand your situation. All fields are optional.</p>

              <div className="space-y-5">
                {/* Employment */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Employment</label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRenterData(d => ({ ...d, employment_status: d.employment_status === opt.value ? '' : opt.value }))}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                          renterData.employment_status === opt.value
                            ? 'border-slate-900 bg-slate-50 text-foreground'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        )}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Move-in timeline */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Move-in timeline</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRenterData(d => ({ ...d, move_in_timeline: d.move_in_timeline === opt.value ? '' : opt.value }))}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                          renterData.move_in_timeline === opt.value
                            ? 'border-slate-900 bg-slate-50 text-foreground'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Household size */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    <Users className="h-3.5 w-3.5 inline mr-1" />
                    Household size
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRenterData(d => ({ ...d, household_size: Math.max(1, d.household_size - 1) }))}
                      className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-muted-foreground hover:bg-gray-50"
                    >-</button>
                    <span className="text-lg font-semibold text-foreground w-8 text-center">{renterData.household_size}</span>
                    <button
                      onClick={() => setRenterData(d => ({ ...d, household_size: Math.min(10, d.household_size + 1) }))}
                      className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-muted-foreground hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>

                {/* Pets & Smoker */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setRenterData(d => ({ ...d, has_pets: !d.has_pets }))}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex-1',
                      renterData.has_pets
                        ? 'border-slate-900 bg-slate-50 text-foreground'
                        : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                    )}
                  >
                    <PawPrint className="h-4 w-4" />
                    I have pets
                  </button>
                  <button
                    onClick={() => setRenterData(d => ({ ...d, is_smoker: !d.is_smoker }))}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex-1',
                      renterData.is_smoker
                        ? 'border-slate-900 bg-slate-50 text-foreground'
                        : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                    )}
                  >
                    <Cigarette className="h-4 w-4" />
                    I smoke
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Landlord Profile */}
          {currentStepName === 'landlord' && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Property management</h2>
              <p className="text-sm text-muted-foreground mb-6">Tell renters a bit about how you manage your properties.</p>

              <div className="space-y-5">
                {/* Management type */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">I manage as</label>
                  <div className="flex gap-3">
                    {MANAGEMENT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setLandlordData(d => ({ ...d, management_type: d.management_type === opt.value ? '' : opt.value }))}
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center',
                          landlordData.management_type === opt.value
                            ? 'border-slate-900 bg-slate-50 text-foreground'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of properties */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    <Building2 className="h-3.5 w-3.5 inline mr-1" />
                    Number of properties
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setLandlordData(d => ({ ...d, num_properties: Math.max(1, d.num_properties - 1) }))}
                      className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-muted-foreground hover:bg-gray-50"
                    >-</button>
                    <span className="text-lg font-semibold text-foreground w-8 text-center">{landlordData.num_properties}</span>
                    <button
                      onClick={() => setLandlordData(d => ({ ...d, num_properties: d.num_properties + 1 }))}
                      className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-muted-foreground hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>

                {/* Response time */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    Typical response time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_TIME_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setLandlordData(d => ({ ...d, response_time: d.response_time === opt.value ? '' : opt.value }))}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                          landlordData.response_time === opt.value
                            ? 'border-slate-900 bg-slate-50 text-foreground'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {currentStepName === 'done' && (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">You're all set!</h2>
              <p className="text-sm text-muted-foreground">Your profile is ready. You can always update it later in settings.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed || saveOnboarding.isPending}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              isLastStep
                ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950 shadow-sm'
                : 'bg-slate-900 text-white hover:bg-slate-800',
              (!canProceed || saveOnboarding.isPending) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saveOnboarding.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastStep ? (
              'Save & Continue'
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
