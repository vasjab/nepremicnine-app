'use client';

import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CollapsibleProfileCard } from './CollapsibleProfileCard';
import type { ProfileFormData } from './types';

interface CoverLetterSectionProps {
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function CoverLetterSection({ data, onUpdate }: CoverLetterSectionProps) {
  return (
    <CollapsibleProfileCard title="Default Cover Letter" icon={FileText} defaultOpen={false}>
      <div className="space-y-2">
        <Textarea
          placeholder="Hi, I'm looking for a comfortable place to call home. I work as..."
          rows={5}
          value={data.default_cover_letter}
          onChange={(e) => {
            if (e.target.value.length <= 2000) onUpdate({ default_cover_letter: e.target.value });
          }}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Pre-filled when you apply to listings.</p>
          <span
            className={cn(
              'text-xs',
              data.default_cover_letter.length > 1800 ? 'text-orange-500' : 'text-muted-foreground'
            )}
          >
            {data.default_cover_letter.length}/2000
          </span>
        </div>
      </div>
    </CollapsibleProfileCard>
  );
}
