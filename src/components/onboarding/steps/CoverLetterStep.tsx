'use client';

import { FileText } from 'lucide-react';

export interface CoverLetterData {
  default_cover_letter: string;
}

interface CoverLetterStepProps {
  data: CoverLetterData;
  onChange: (data: CoverLetterData) => void;
}

const MAX_CHARS = 2000;

export function CoverLetterStep({ data, onChange }: CoverLetterStepProps) {
  const charCount = data.default_cover_letter.length;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1">Default cover letter</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Write a short introduction about yourself. This will be pre-filled when you apply to listings — you can always customise it per application.
      </p>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          Your message to landlords
        </label>
        <textarea
          value={data.default_cover_letter}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onChange({ default_cover_letter: e.target.value });
            }
          }}
          placeholder="Hi, I'm looking for a comfortable place to call home. I work as... and am a reliable, tidy tenant..."
          rows={8}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            This is optional — you can always add it later.
          </p>
          <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
