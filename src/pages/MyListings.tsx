import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings, useUpdateListing, useDeleteListing } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { MyListingSkeletonGrid } from '@/components/ListingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { cn } from '@/lib/utils';
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
            <div className="space-y-4">
              {listings.map((listing, index) => {
                const isDraft = (listing as any).is_draft;
                return (
                <div
                  key={listing.id}
                  className={cn(
                    "bg-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-card",
                    "opacity-0 animate-slide-up-spring",
                    "hover:shadow-elevated transition-all duration-300",
                    isDraft && "border-2 border-dashed border-amber-400/50"
                  )}
                  style={{ 
                    animationDelay: `${index * 0.08}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {/* Image */}
                  <div className="w-full sm:w-40 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <span className="text-xs text-muted-foreground">{t('listing.noImage')}</span>
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
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDraft
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : listing.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isDraft ? t('myListings.draft') || 'Draft' : listing.is_active ? t('myListings.active') : t('myListings.inactive')}
                      </span>
                    </div>

                    <p className="text-lg font-bold text-foreground mt-2">
                      {formatPrice(listing.price, listing.currency, { isRental: listing.listing_type === 'rent', showPeriod: listing.listing_type === 'rent' })}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {isDraft ? (
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
              })}
            </div>
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
    </div>
  );
}
