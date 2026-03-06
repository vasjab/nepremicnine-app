'use client';

import { cn } from '@/lib/utils';
import { INTENT_OPTIONS } from '@/lib/profile-constants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleSwitcherProps {
  userId: string;
  intents: string[];
  onIntentsChange: (intents: string[]) => void;
}

export function RoleSwitcher({ userId, intents, onIntentsChange }: RoleSwitcherProps) {
  const { toast } = useToast();

  const toggleIntent = async (value: string) => {
    const newIntents = intents.includes(value)
      ? intents.filter(i => i !== value)
      : [...intents, value];

    // Optimistic update
    onIntentsChange(newIntents);

    // Persist to DB
    const { error } = await supabase
      .from('profiles')
      .update({ user_intents: newIntents })
      .eq('user_id', userId);

    if (error) {
      // Rollback on failure
      onIntentsChange(intents);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update roles.',
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
                className={cn(
                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                  active
                    ? 'border-slate-900 bg-slate-50 text-foreground shadow-sm'
                    : 'border-gray-200 text-muted-foreground hover:border-gray-300 hover:bg-gray-50/50'
                )}
              >
                <opt.icon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-gray-400')} />
                <span className="text-left leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
