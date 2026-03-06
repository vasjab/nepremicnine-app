'use client';

import { User, Heart, Baby, Globe, GraduationCap, Briefcase, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CollapsibleProfileCard } from './CollapsibleProfileCard';
import { AGE_BRACKET_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_OPTIONS } from '@/lib/profile-constants';
import type { ProfileFormData } from './types';

interface OptionalDetailsSectionProps {
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function OptionalDetailsSection({ data, onUpdate }: OptionalDetailsSectionProps) {
  return (
    <>
      {/* About You */}
      <CollapsibleProfileCard title="About You" icon={User} defaultOpen={false}>
        <div className="space-y-5">
          {/* Age bracket */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Age range
            </label>
            <div className="flex flex-wrap gap-2">
              {AGE_BRACKET_OPTIONS.map(age => (
                <button
                  key={age}
                  onClick={() => onUpdate({ age_bracket: data.age_bracket === age ? '' : age })}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                    data.age_bracket === age
                      ? 'border-slate-900 bg-slate-50 text-foreground'
                      : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                  )}
                >
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
              {MARITAL_STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ marital_status: data.marital_status === opt.value ? '' : opt.value })}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                    data.marital_status === opt.value
                      ? 'border-slate-900 bg-slate-50 text-foreground'
                      : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kids */}
          <div className="space-y-2">
            <button
              onClick={() => onUpdate({ has_kids: !data.has_kids, kids_count: data.has_kids ? 0 : data.kids_count || 1 })}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                data.has_kids
                  ? 'border-slate-900 bg-slate-50 text-foreground'
                  : 'border-gray-200 text-muted-foreground hover:border-gray-300'
              )}
            >
              <Baby className="h-4 w-4" /> I have children
            </button>
            {data.has_kids && (
              <div className="flex items-center gap-3 pl-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">How many:</label>
                  <button
                    onClick={() => onUpdate({ kids_count: Math.max(1, (data.kids_count || 1) - 1) })}
                    className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{data.kids_count || 1}</span>
                  <button
                    onClick={() => onUpdate({ kids_count: Math.min(10, (data.kids_count || 1) + 1) })}
                    className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <Input
                  placeholder="Ages (e.g. 3, 7)"
                  value={data.kids_ages}
                  onChange={(e) => onUpdate({ kids_ages: e.target.value })}
                  className="max-w-[140px] h-8 text-sm"
                />
              </div>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              <Globe className="h-3.5 w-3.5 inline mr-1" /> Nationality
            </label>
            <Input
              placeholder="e.g. Slovenian"
              value={data.nationality}
              onChange={(e) => onUpdate({ nationality: e.target.value })}
              className="max-w-xs"
            />
          </div>

          {/* Education & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                <GraduationCap className="h-3.5 w-3.5 inline mr-1" /> Education
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EDUCATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdate({ education_level: data.education_level === opt.value ? '' : opt.value })}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border',
                      data.education_level === opt.value
                        ? 'border-slate-900 bg-slate-50 text-foreground'
                        : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                <Briefcase className="h-3.5 w-3.5 inline mr-1" /> Occupation
              </label>
              <Input
                placeholder="e.g. Software engineer"
                value={data.occupation}
                onChange={(e) => onUpdate({ occupation: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </CollapsibleProfileCard>

      {/* Social Profiles */}
      <CollapsibleProfileCard title="Social Profiles" icon={LinkIcon} defaultOpen={false}>
        <div className="space-y-3">
          <Input
            placeholder="LinkedIn URL"
            value={data.social_links.linkedin}
            onChange={(e) => onUpdate({ social_links: { ...data.social_links, linkedin: e.target.value } })}
            className="text-sm"
          />
          <Input
            placeholder="Facebook URL"
            value={data.social_links.facebook}
            onChange={(e) => onUpdate({ social_links: { ...data.social_links, facebook: e.target.value } })}
            className="text-sm"
          />
          <Input
            placeholder="Instagram URL"
            value={data.social_links.instagram}
            onChange={(e) => onUpdate({ social_links: { ...data.social_links, instagram: e.target.value } })}
            className="text-sm"
          />
        </div>
      </CollapsibleProfileCard>
    </>
  );
}
