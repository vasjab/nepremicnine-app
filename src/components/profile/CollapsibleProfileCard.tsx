'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleProfileCardProps {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleProfileCard({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: CollapsibleProfileCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Icon className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
