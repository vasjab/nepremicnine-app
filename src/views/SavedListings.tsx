'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Home, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedListings } from '@/hooks/useSavedListings';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';

export default function SavedListings() {
  const { user } = useAuth();
  const { data: savedListings, isLoading } = useSavedListings(user?.id);
  const router = useRouter();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center h-[80vh] relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gray-400/[0.03] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gray-400/[0.03] blur-3xl" />

          <div className="text-center max-w-md relative z-10">
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-slate-500/10 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">{t('saved.saveYourFavorites')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('saved.signInToSave')}
            </p>
            <Link href="/auth">
              <Button variant="gradient">
                {t('common.signIn')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const validSaved = savedListings?.filter((s) => s.listing != null);
  const savedCount = validSaved?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 relative overflow-hidden">
        {/* Decorative ambient blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gray-400/[0.03] blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-32 h-60 w-60 rounded-full bg-gray-400/[0.03] blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in relative z-10">
          {/* Page heading */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t('saved.title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-5 ml-[52px]">
            {t('saved.subtitle')}
          </p>

          {/* Divider */}
          <div className="border-b border-gray-100 mb-6" />

          {/* Stats bar */}
          {!isLoading && savedCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gray-50 border border-gray-100 rounded-xl">
              <Heart className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-foreground">
                {savedCount} {savedCount === 1 ? 'saved listing' : 'saved listings'}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : savedListings && savedListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedListings
                .filter((saved) => saved.listing != null)
                .map((saved) => (
                  <ListingCard
                    key={saved.id}
                    listing={saved.listing}
                    onClick={() => router.push(`/listing/${saved.listing.id}`)}
                    showStatusOverlay={saved.listing.status === 'sold' || saved.listing.status === 'rented'}
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-slate-500/10 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
                  <Home className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('saved.noSavedYet')}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('saved.noSavedYetDesc')}
              </p>
              <Link href="/">
                <Button variant="gradient">
                  <Search className="h-4 w-4 mr-2" />
                  {t('saved.browseListings')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
