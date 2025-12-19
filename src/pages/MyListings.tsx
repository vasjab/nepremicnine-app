import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyListings, useUpdateListing, useDeleteListing } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
  const { data: listings, isLoading } = useMyListings(user?.id);
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateListing.mutate(
      { id, is_active: !isActive },
      {
        onSuccess: () => {
          toast({
            title: isActive ? 'Listing deactivated' : 'Listing activated',
            description: isActive
              ? 'Your listing is now hidden from search results.'
              : 'Your listing is now visible to everyone.',
          });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteListing.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Listing deleted',
          description: 'Your listing has been permanently removed.',
        });
      },
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
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
            <h1 className="text-2xl font-semibold text-foreground mb-2">List your property</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to create and manage your listings.
            </p>
            <Link to="/auth">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Sign in
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
                My Listings
              </h1>
              <p className="text-muted-foreground">
                Manage your property listings
              </p>
            </div>
            <Link to="/create-listing">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-card"
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
                        <span className="text-xs text-muted-foreground">No image</span>
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
                        listing.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-lg font-bold text-foreground mt-2">
                      {formatPrice(listing.price, listing.currency)}
                      {listing.listing_type === 'rent' && (
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(listing.id, listing.is_active)}
                      >
                        {listing.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your listing.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first listing to start reaching potential tenants or buyers.
              </p>
              <Link to="/create-listing">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first listing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
