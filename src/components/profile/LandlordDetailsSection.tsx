'use client';

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollapsibleProfileCard } from './CollapsibleProfileCard';
import { MANAGEMENT_OPTIONS, RESPONSE_TIME_OPTIONS } from '@/lib/profile-constants';
import type { ProfileFormData } from './types';

interface LandlordDetailsSectionProps {
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function LandlordDetailsSection({ data, onUpdate }: LandlordDetailsSectionProps) {
  return (
    <CollapsibleProfileCard title="Landlord Details" icon={Building2} defaultOpen>
      <div className="space-y-5">
        {/* Management type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            I manage as
          </label>
          <div className="flex flex-wrap gap-2">
            {MANAGEMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ management_type: data.management_type === opt.value ? '' : opt.value })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  data.management_type === opt.value
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
            Number of properties
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdate({ num_properties: Math.max(1, data.num_properties - 1) })}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-sm font-semibold w-6 text-center">{data.num_properties}</span>
            <button
              onClick={() => onUpdate({ num_properties: Math.min(100, data.num_properties + 1) })}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Response time */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Typical response time
          </label>
          <div className="flex flex-wrap gap-2">
            {RESPONSE_TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ response_time: data.response_time === opt.value ? '' : opt.value })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                  data.response_time === opt.value
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
