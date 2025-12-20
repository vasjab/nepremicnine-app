import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Check, RotateCcw, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings, useUpdateListing, useDeleteListing } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { MyListingSkeletonGrid } from '@/components/ListingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkCompletedModal } from '@/components/MarkCompletedModal';
import { Listing } from '@/types/listing';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();
  const { data: listings, isLoading } = useMyListings(user?.id);
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const [markCompletedListing, setMarkCompletedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Split listings into active and completed
  const { activeListings, completedListings } = useMemo(() => {
    if (!listings) return { activeListings: [], completedListings: [] };
    
    const active = listings.filter(l => !l.status || l.status === 'active');
    const completed = listings.filter(l => l.status === 'sold' || l.status === 'rented');
    
    return { activeListings: active, completedListings: completed };
  }, [listings]);

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateListing.mutate(
      { id, is_active: !isActive },
      {
        onSuccess: () => {
          toast({
            title: isActive ? t('myListings.listingDeactivated') : t('myListings.listingActivated'),
            description: isActive
              ? t('myListings.listingDeactivatedDesc')
              : t('myListings.listingActivatedDesc'),
          });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteListing.mutate(id, {
      onSuccess: () => {
        toast({
          title: t('myListings.listingDeleted'),
          description: t('myListings.listingDeletedDesc'),
        });
      },
    });
  };

  const handleMarkCompleted = (finalPrice: number | null) => {
    if (!markCompletedListing) return;

    const status = markCompletedListing.listing_type === 'sale' ? 'sold' : 'rented';
    
    updateListing.mutate(
      {
        id: markCompletedListing.id,
        status,
        final_price: finalPrice,
        completed_at: new Date().toISOString(),
        is_active: false,
      },
      {
        onSuccess: () => {
          toast({
            title: status === 'sold' ? t('myListings.markedAsSold') : t('myListings.markedAsRented'),
            description: t('myListings.markedAsCompletedDesc'),
          });
          setMarkCompletedListing(null);
        },
      }
    );
  };

  const handleReactivate = (listing: Listing) => {
    updateListing.mutate(
      {
        id: listing.id,
        status: 'active',
        final_price: null,
        completed_at: null,
        is_active: true,
      },
      {
        onSuccess: () => {
          toast({
            title: t('myListings.listingReactivated'),
            description: t('myListings.listingReactivatedDesc'),
          });
        },
      }
    );
  };

  const getPriceComparison = (listing: Listing) => {
    if (!listing.final_price) return null;
    
    const diff = listing.final_price - listing.price;
    const percent = ((diff / listing.price) * 100).toFixed(1);
    
    return { diff, percent };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">{t('myListings.listYourProperty')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('myListings.signInToManage')}
            </p>
            <Link to="/auth">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                {t('common.signIn')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const renderListingCard = (listing: Listing, index: number, isCompleted: boolean = false) => {
    const isDraft = listing.is_draft;
    const priceComparison = isCompleted ? getPriceComparison(listing) : null;

    return (
      <div
        key={listing.id}
        className={cn(
          "bg-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-card",
          "opacity-0 animate-slide-up-spring",
          "hover:shadow-elevated transition-all duration-300",
          isDraft && "border-2 border-dashed border-amber-400/50",
          isCompleted && "border border-success/20 bg-success/5"
        )}
        style={{ 
          animationDelay: `${index * 0.08}s`,
          animationFillMode: 'forwards'
        }}
      >
        {/* Image */}
        <div className="w-full sm:w-40 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className={cn("w-full h-full object-cover", isCompleted && "opacity-80")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-xs text-muted-foreground">{t('listing.noImage')}</span>
            </div>
          )}
          {isCompleted && (
            <div className={cn(
              "absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1",
              listing.status === 'sold' 
                ? "bg-success text-success-foreground" 
                : "bg-primary text-primary-foreground"
            )}>
              <Check className="h-3 w-3" />
              {listing.status === 'sold' ? t('myListings.sold') : t('myListings.rented')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {listing.address}, {listing.city}
              </p>
            </div>
            {!isCompleted && (
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                isDraft
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : listing.is_active
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isDraft ? t('myListings.draft') || 'Draft' : listing.is_active ? t('myListings.active') : t('myListings.inactive')}
              </span>
            )}
          </div>

          {/* Price section */}
          <div className="mt-2">
            {isCompleted && listing.final_price ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(listing.final_price, listing.currency, { 
                      isRental: listing.listing_type === 'rent', 
                      showPeriod: listing.listing_type === 'rent' 
                    })}
                  </p>
                  {priceComparison && (
                    <span className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      priceComparison.diff > 0 ? "text-success" : priceComparison.diff < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {priceComparison.diff > 0 ? <TrendingUp className="h-4 w-4" /> : 
                       priceComparison.diff < 0 ? <TrendingDown className="h-4 w-4" /> : 
                       <Minus className="h-4 w-4" />}
                      {priceComparison.diff > 0 ? '+' : ''}{priceComparison.percent}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-through">
                  {t('myListings.asking')}: {formatPrice(listing.price, listing.currency, { 
                    isRental: listing.listing_type === 'rent', 
                    showPeriod: false 
                  })}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-foreground">
                {formatPrice(listing.price, listing.currency, { 
                  isRental: listing.listing_type === 'rent', 
                  showPeriod: listing.listing_type === 'rent' 
                })}
              </p>
            )}
          </div>

          {/* Completed date */}
          {isCompleted && listing.completed_at && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(listing.completed_at), 'MMM d, yyyy')}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {isCompleted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {t('common.view')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReactivate(listing)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {t('myListings.reactivate')}
                </Button>
              </>
            ) : isDraft ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/create-listing?resume=${listing.id}`)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t('myListings.continueDraft') || 'Continue Editing'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {t('common.view')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/edit-listing/${listing.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(listing.id, listing.is_active)}
                >
                  {listing.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      {t('myListings.hide')}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('myListings.show')}
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setMarkCompletedListing(listing)}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {listing.listing_type === 'sale' ? t('myListings.markAsSold') : t('myListings.markAsRented')}
                </Button>
              </>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('myListings.deleteDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('myListings.deleteDialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(listing.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {t('myListings.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('myListings.subtitle')}
              </p>
            </div>
            <Link to="/create-listing">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                {t('common.createListing')}
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <MyListingSkeletonGrid count={3} />
          ) : listings && listings.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="active" className="gap-2">
                  {t('myListings.activeTab')}
                  {activeListings.length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {activeListings.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  {t('myListings.completedTab')}
                  {completedListings.length > 0 && (
                    <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full">
                      {completedListings.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeListings.length > 0 ? (
                  activeListings.map((listing, index) => renderListingCard(listing, index, false))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('myListings.noActiveListings')}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedListings.length > 0 ? (
                  completedListings.map((listing, index) => renderListingCard(listing, index, true))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t('myListings.noCompletedListings')}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('myListings.noListingsYet')}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('myListings.noListingsYetDesc')}
              </p>
              <Link to="/create-listing">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('myListings.createFirstListing')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Mark as Sold/Rented Modal */}
      {markCompletedListing && (
        <MarkCompletedModal
          open={!!markCompletedListing}
          onOpenChange={(open) => !open && setMarkCompletedListing(null)}
          listingType={markCompletedListing.listing_type}
          askingPrice={markCompletedListing.price}
          currency={markCompletedListing.currency}
          onConfirm={handleMarkCompleted}
          isLoading={updateListing.isPending}
        />
      )}
    </div>
  );
}