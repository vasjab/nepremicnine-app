import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { Listing } from '@/types/listing';
import { format } from 'date-fns';

function useCompletedListings(status: 'sold' | 'rented') {
  return useQuery({
    queryKey: ['completed-listings', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', status)
        .eq('is_draft', false)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Listing[];
    },
  });
}

function CompletedListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();
  const isRental = listing.listing_type === 'rent';
  const isSold = listing.status === 'sold';

  const hasFinalPrice = listing.final_price && listing.final_price > 0;
  const priceDiff = hasFinalPrice ? listing.final_price! - listing.price : 0;
  const priceDiffPercent = listing.price > 0 ? ((priceDiff / listing.price) * 100).toFixed(1) : '0';

  const completedDate = listing.completed_at 
    ? format(new Date(listing.completed_at), 'MMM d, yyyy')
    : null;

  return (
    <div className="relative">
      <ListingCard listing={listing} onClick={onClick} />
      
      {/* Status overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${
            isSold 
              ? 'bg-amber-500/90 text-white' 
              : 'bg-emerald-500/90 text-white'
          }`}>
            {isSold ? t('listing.sold') : t('listing.rented')}
          </span>
        </div>

        {/* Price comparison badge */}
        {hasFinalPrice && (
          <div className="absolute bottom-20 left-3 right-3 z-20">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border/50">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">
                    {isSold ? t('listing.soldFor') : t('listing.rentedFor')}
                  </p>
                  <p className="font-bold text-foreground">
                    {formatPrice(listing.final_price!, listing.currency, { isRental, showPeriod: isRental })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {priceDiff > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : priceDiff < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={`text-xs font-medium ${
                      priceDiff > 0 ? 'text-emerald-500' : priceDiff < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {priceDiff > 0 ? '+' : ''}{priceDiffPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    vs {formatPrice(listing.price, listing.currency, { isRental, showPeriod: false })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completed date */}
      {completedDate && (
        <div className="absolute top-3 right-14 z-20">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg glass text-xs font-medium">
            <Calendar className="h-3 w-3" />
            {completedDate}
          </span>
        </div>
      )}
    </div>
  );
}

export default function SoldRentedListings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sold' | 'rented'>('sold');
  
  const { data: soldListings, isLoading: isSoldLoading } = useCompletedListings('sold');
  const { data: rentedListings, isLoading: isRentedLoading } = useCompletedListings('rented');

  const isLoading = activeTab === 'sold' ? isSoldLoading : isRentedLoading;
  const listings = activeTab === 'sold' ? soldListings : rentedListings;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t('soldRented.title')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('soldRented.subtitle')}
          </p>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sold' | 'rented')}>
            <TabsList className="mb-6">
              <TabsTrigger value="sold" className="gap-2">
                {t('soldRented.recentlySold')}
                {soldListings && <span className="text-xs opacity-70">({soldListings.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="rented" className="gap-2">
                {t('soldRented.recentlyRented')}
                {rentedListings && <span className="text-xs opacity-70">({rentedListings.length})</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sold" className="mt-0">
              {renderListings()}
            </TabsContent>
            <TabsContent value="rented" className="mt-0">
              {renderListings()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );

  function renderListings() {
    if (isLoading) {
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (!listings || listings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {activeTab === 'sold' ? t('soldRented.noSoldYet') : t('soldRented.noRentedYet')}
          </h2>
          <p className="text-muted-foreground max-w-sm">
            {t('soldRented.noListingsDesc')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <CompletedListingCard
            key={listing.id}
            listing={listing}
            onClick={() => navigate(`/listing/${listing.id}`)}
          />
        ))}
      </div>
    );
  }
}
