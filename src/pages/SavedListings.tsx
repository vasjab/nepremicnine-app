import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedListings } from '@/hooks/useSavedListings';
import { Header } from '@/components/Header';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedListings() {
  const { user } = useAuth();
  const { data: savedListings, isLoading } = useSavedListings(user?.id);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Save your favorites</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to save listings and access them from any device.
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
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Saved Listings
          </h1>
          <p className="text-muted-foreground mb-8">
            Homes you've saved for later
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
                  onClick={() => navigate(`/listing/${saved.listing.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No saved listings yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                When you find a home you love, click the heart icon to save it here.
              </p>
              <Link to="/">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Browse listings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
