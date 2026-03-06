'use client';

import { Briefcase, PawPrint, Cigarette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CollapsibleProfileCard } from './CollapsibleProfileCard';
import { EMPLOYMENT_OPTIONS, TIMELINE_OPTIONS, LOOKING_DURATION_OPTIONS } from '@/lib/profile-constants';
import type { ProfileFormData } from './types';

interface RenterDetailsSectionProps {
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function RenterDetailsSection({ data, onUpdate }: RenterDetailsSectionProps) {
  return (
    <CollapsibleProfileCard title="Renter Details" icon={Briefcase} defaultOpen>
      <div className="space-y-5">
        {/* Employment */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Employment
          </label>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ employment_status: data.employment_status === opt.value ? '' : opt.value })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  data.employment_status === opt.value
                    ? 'border-slate-900 bg-slate-50 text-foreground'
                    : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {data.employment_status === 'other' && (
            <Input
              placeholder="Tell us what you do"
              value={data.employment_other}
              onChange={(e) => onUpdate({ employment_other: e.target.value })}
              className="mt-2 max-w-xs text-sm"
            />
          )}
        </div>

        {/* Move-in timeline */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Move-in timeline
          </label>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ move_in_timeline: data.move_in_timeline === opt.value ? '' : opt.value })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  data.move_in_timeline === opt.value
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
            Household size
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdate({ household_size: Math.max(1, data.household_size - 1) })}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-sm font-semibold w-6 text-center">{data.household_size}</span>
            <button
              onClick={() => onUpdate({ household_size: Math.min(10, data.household_size + 1) })}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Pets & Smoker */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ has_pets: !data.has_pets })}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
              data.has_pets
                ? 'border-slate-900 bg-slate-50 text-foreground'
                : 'border-gray-200 text-muted-foreground hover:border-gray-300'
            )}
          >
            <PawPrint className="h-4 w-4" /> I have pets
          </button>
          <button
            onClick={() => onUpdate({ is_smoker: !data.is_smoker })}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
              data.is_smoker
                ? 'border-slate-900 bg-slate-50 text-foreground'
                : 'border-gray-200 text-muted-foreground hover:border-gray-300'
            )}
          >
            <Cigarette className="h-4 w-4" /> I smoke
          </button>
        </div>
        {data.has_pets && (
          <Input
            placeholder="What pets do you have? (e.g. 1 small dog)"
            value={data.pet_details}
            onChange={(e) => onUpdate({ pet_details: e.target.value })}
            className="text-sm"
          />
        )}

        {/* Looking duration */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            How long are you looking to stay?
          </label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_DURATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ looking_duration: data.looking_duration === opt.value ? '' : opt.value })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  data.looking_duration === opt.value
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
    </CollapsibleProfileCard>
  );
}
