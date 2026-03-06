'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications';
import { APPLICATION_STATUS_CONFIG } from '@/types/application';
import type { Application } from '@/types/application';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StatusBadge({ status }: { status: Application['status'] }) {
  const config = APPLICATION_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border', config.bgColor, config.color)}>
      {config.label}
    </span>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: applications = [], isLoading } = useMyApplications();
  const withdrawApplication = useWithdrawApplication();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to view your rental applications.</p>
            <Button onClick={() => router.push('/auth')}>Sign In</Button>
          </div>
        </main>
      </div>
    );
  }

  const handleWithdraw = async (id: string) => {
    if (!confirm('Withdraw this application? This cannot be undone.')) return;
    setWithdrawingId(id);
    try {
      await withdrawApplication.mutateAsync(id);
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">My Applications</h1>
              <p className="text-sm text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No applications yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Browse rental listings and apply to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    {app.listing?.images?.[0] ? (
                      <img src={app.listing.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/listing/${app.listing_id}`} className="text-sm font-medium text-foreground hover:underline truncate block">
                        {app.listing?.title || 'Listing'}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.listing?.city} &middot; {app.listing?.price} {app.listing?.currency}/mo
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={app.status} />
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {app.viewing_date && app.status === 'viewing_scheduled' && (
                        <p className="text-xs text-amber-700 mt-1.5">
                          Viewing: {new Date(app.viewing_date).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(app.status === 'applied' || app.status === 'viewing_scheduled') && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawingId === app.id}
                          className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Withdraw"
                        >
                          {withdrawingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      )}
                      <Link href={`/listing/${app.listing_id}`} className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
