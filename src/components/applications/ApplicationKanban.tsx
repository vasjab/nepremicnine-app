'use client';

import { useState } from 'react';
import { useUpdateApplicationStatus } from '@/hooks/useApplications';
import { APPLICATION_STATUS_CONFIG, APPLICATION_STATUSES } from '@/types/application';
import type { Application, ApplicationStatus } from '@/types/application';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { cn } from '@/lib/utils';
import { Clock, User, ChevronDown, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  applications: Application[];
}

function ApplicationCard({
  app,
  onSelect,
}: {
  app: Application;
  onSelect: () => void;
}) {
  const updateStatus = useUpdateApplicationStatus();
  const [changing, setChanging] = useState(false);

  const handleStatusChange = async (status: ApplicationStatus) => {
    setChanging(true);
    try {
      await updateStatus.mutateAsync({ applicationId: app.id, status });
    } finally {
      setChanging(false);
    }
  };

  const snap = app.renter_snapshot;

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-3 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start gap-2.5">
        {app.renter?.avatar_url ? (
          <img src={app.renter.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {snap?.full_name || app.renter?.full_name || 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {app.listing?.title || 'Listing'}
          </p>
        </div>
      </div>

      {/* Quick info chips */}
      <div className="flex flex-wrap gap-1 mt-2">
        {snap?.employment_status && (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-muted-foreground capitalize">
            {snap.employment_status.replace('_', '-')}
          </span>
        )}
        {snap?.household_size && (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-muted-foreground">
            {snap.household_size}p
          </span>
        )}
        {snap?.has_pets && (
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 rounded text-amber-700">pets</span>
        )}
        {snap?.is_smoker && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-50 rounded text-red-600">smoker</span>
        )}
      </div>

      {/* Viewing date */}
      {app.viewing_date && app.status === 'viewing_scheduled' && (
        <p className="text-[10px] text-amber-700 mt-1.5 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {new Date(app.viewing_date).toLocaleString()}
        </p>
      )}

      {/* Status dropdown */}
      <div className="mt-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Select value={app.status} onValueChange={(v) => handleStatusChange(v as ApplicationStatus)} disabled={changing}>
          <SelectTrigger className="h-7 text-[11px] w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => {
              const cfg = APPLICATION_STATUS_CONFIG[s];
              return (
                <SelectItem key={s} value={s} className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', cfg.bgColor)} />
                    {cfg.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {changing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
      </div>

      <p className="text-[10px] text-muted-foreground mt-1.5">
        {new Date(app.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export function ApplicationKanban({ applications }: Props) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const columns: { status: ApplicationStatus; label: string }[] = [
    { status: 'applied', label: 'Applied' },
    { status: 'viewing_scheduled', label: 'Viewing' },
    { status: 'under_review', label: 'Review' },
    { status: 'accepted', label: 'Accepted' },
    { status: 'declined', label: 'Declined' },
  ];

  return (
    <>
      {/* Desktop: horizontal columns */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {columns.map(({ status, label }) => {
          const cfg = APPLICATION_STATUS_CONFIG[status];
          const items = applications.filter((a) => a.status === status);
          return (
            <div key={status} className="min-w-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={cn('w-2.5 h-2.5 rounded-full', cfg.bgColor)} />
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((app) => (
                  <ApplicationCard key={app.id} app={app} onSelect={() => setSelectedApp(app)} />
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center">
                    <p className="text-[10px] text-muted-foreground">No applications</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/tablet: stacked list */}
      <div className="lg:hidden space-y-4">
        {columns.map(({ status, label }) => {
          const cfg = APPLICATION_STATUS_CONFIG[status];
          const items = applications.filter((a) => a.status === status);
          if (items.length === 0) return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={cn('w-2.5 h-2.5 rounded-full', cfg.bgColor)} />
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((app) => (
                  <ApplicationCard key={app.id} app={app} onSelect={() => setSelectedApp(app)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </>
  );
}
