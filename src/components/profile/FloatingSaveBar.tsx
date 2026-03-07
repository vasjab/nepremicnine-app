'use client';

import { Save, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingSaveBarProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function FloatingSaveBar({ isDirty, saving, onSave, onDiscard }: FloatingSaveBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ease-out',
        isDirty ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/60 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500 font-medium">Unsaved changes</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscard}
                disabled={saving}
                className="h-9 rounded-lg"
              >
                <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                Discard
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={onSave}
                disabled={saving}
                className="h-9 rounded-lg font-semibold"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
