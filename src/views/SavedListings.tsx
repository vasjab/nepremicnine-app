'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Plus } from 'lucide-react';
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
        <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">{t('saved.saveYourFavorites')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('saved.signInToSave')}
            </p>
            <Link href="/auth">
              <Button variant="accent">
                {t('common.signIn')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('saved.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('saved.subtitle')}
          </p>

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
              {savedListings.map((saved) => (
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
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('saved.noSavedYet')}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('saved.noSavedYetDesc')}
              </p>
              <Link href="/">
                <Button variant="accent">
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
