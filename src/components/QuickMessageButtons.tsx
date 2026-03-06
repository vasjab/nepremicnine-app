'use client';

import { MessageCircle, CalendarDays, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  { label: 'Is this still available?', icon: HelpCircle },
  { label: 'Can I schedule a viewing?', icon: CalendarDays },
  { label: "I'm interested, tell me more", icon: MessageCircle },
] as const;

interface QuickMessageButtonsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function QuickMessageButtons({ onSelect, disabled, className }: QuickMessageButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {TEMPLATES.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
