'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { INTENT_OPTIONS } from '@/lib/profile-constants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface RoleSwitcherProps {
  userId: string;
  intents: string[];
  onIntentsChange: (intents: string[]) => void;
}

export function RoleSwitcher({ userId, intents, onIntentsChange }: RoleSwitcherProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleIntent = async (value: string) => {
    const prevIntents = [...intents];
    const newIntents = intents.includes(value)
      ? intents.filter(i => i !== value)
      : [...intents, value];

    setSaving(value);
    setError(null);

    // Optimistic update
    onIntentsChange(newIntents);

    // Persist to DB — use .select() to verify the row was actually updated
    const { data: updated, error: dbError } = await supabase
      .from('profiles')
      .update({ user_intents: newIntents })
      .eq('user_id', userId)
      .select('user_intents')
      .maybeSingle();

    setSaving(null);

    if (dbError || !updated) {
      console.error('RoleSwitcher update failed:', dbError || 'No rows updated');
      // Rollback on failure
      onIntentsChange(prevIntents);
      const msg = dbError?.message?.includes('does not exist')
        ? 'Database migration needed. Run the enhanced_profiles migration in Supabase SQL editor.'
        : dbError
          ? `Failed to update roles: ${dbError.message}`
          : 'Failed to save — please try signing out and back in.';
      setError(msg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: msg,
      });
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          I am...
        </span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-2">
          {INTENT_OPTIONS.map(opt => {
            const active = intents.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleIntent(opt.value)}
                disabled={saving !== null}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                  active
                    ? 'border-slate-900 bg-slate-50 text-foreground shadow-sm'
                    : 'border-gray-200 text-muted-foreground hover:border-gray-300 hover:bg-gray-50/50',
                  saving === opt.value && 'opacity-60',
                  saving !== null && saving !== opt.value && 'pointer-events-none'
                )}
              >
                <opt.icon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-gray-400')} />
                <span className="text-left leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {error && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
