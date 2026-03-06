'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useLandlordApplications } from '@/hooks/useApplications';
import { useListings } from '@/hooks/useListings';
import { ApplicationKanban } from '@/components/applications/ApplicationKanban';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LandlordApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [listingFilter, setListingFilter] = useState<string>('all');
  const { data: applications = [], isLoading } = useLandlordApplications(
    listingFilter === 'all' ? undefined : listingFilter
  );
  const { data: myListings = [] } = useListings(undefined, user?.id);

  // Only rental listings
  const rentalListings = myListings.filter((l) => l.listing_type === 'rent');

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-6xl mx-auto px-4 py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Rental Applications</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to manage rental applications.</p>
            <Button onClick={() => router.push('/auth')}>Sign In</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Rental Applications</h1>
                <p className="text-sm text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Listing filter */}
            {rentalListings.length > 0 && (
              <Select value={listingFilter} onValueChange={setListingFilter}>
                <SelectTrigger className="w-48 h-9 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="All listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All listings</SelectItem>
                  {rentalListings.map((l) => (
                    <SelectItem key={l.id} value={l.id} className="text-xs">
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
              <p className="text-xs text-muted-foreground mt-1">Applications will appear here when renters apply to your listings.</p>
            </div>
          ) : (
            <ApplicationKanban applications={applications} />
          )}
        </div>
      </main>
    </div>
  );
}
