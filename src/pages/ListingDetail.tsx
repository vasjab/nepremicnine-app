import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Bed, Bath, Square, Calendar, Images, ChevronLeft, ChevronRight, LayoutGrid, ExternalLink, Eye, Clock, MessageCircle, Flame, User } from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveListing, useUnsaveListing, useIsListingSaved } from '@/hooks/useSavedListings';
import { useTrackListingView, useTrackLocalListingView } from '@/hooks/useRecentlyViewed';
import { useGetOrCreateConversation } from '@/hooks/useMessaging';
import { useSwipe } from '@/hooks/useSwipe';
import { useListingStats } from '@/hooks/useListingStats';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { ListingLocationMap } from '@/components/ListingLocationMap';
import { SimilarListings } from '@/components/SimilarListings';
import { RecentlyViewedListings } from '@/components/RecentlyViewedListings';
import { PropertyFeatures } from '@/components/PropertyFeatures';
import { FeatureHighlightBadges } from '@/components/FeatureHighlightBadges';
import { cn } from '@/lib/utils';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const { data: isSaved } = useIsListingSaved(user?.id, id);
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  const trackView = useTrackListingView();
  const { trackView: trackLocalView } = useTrackLocalListingView();
  const getOrCreateConversation = useGetOrCreateConversation();
  const { formatPrice, formatArea, areaUnit } = useFormattedPrice();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { data: listingStats } = useListingStats(id, listing?.created_at);
  const { trigger: haptic } = useHapticFeedback();
  const isMobile = useIsMobile();
  const [showGallery, setShowGallery] = useState(false);
  const [scrollToFloorPlan, setScrollToFloorPlan] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Track listing view for both authenticated and non-authenticated users
  useEffect(() => {
    if (id && listing) {
      if (user) {
        trackView.mutate({ userId: user.id, listingId: id });
      } else {
        trackLocalView(id);
      }
    }
  }, [user, id, listing?.id]);

  const goToPrevImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
      );
    }
  }, [listing?.images]);

  const goToNextImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  }, [listing?.images]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextImage,
    onSwipeRight: goToPrevImage,
    minSwipeDistance: 50,
  });

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGallery) return; // Don't interfere when gallery modal is open
      
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevImage, goToNextImage, showGallery]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevImage();
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextImage();
  };

  const handleSaveClick = () => {
    if (!user || !id) return;

    haptic(isSaved ? 'light' : 'success');
    
    if (isSaved) {
      unsaveListing.mutate({ userId: user.id, listingId: id });
    } else {
      saveListing.mutate({ userId: user.id, listingId: id });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('listing.flexible');
    return new Date(dateString).toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const propertyTypeLabels: Record<string, string> = {
    apartment: t('propertyTypes.apartment'),
    house: t('propertyTypes.house'),
    room: t('propertyTypes.room'),
    studio: t('propertyTypes.studio'),
    villa: t('propertyTypes.villa'),
    other: t('propertyTypes.other'),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <Skeleton className="h-[50vh] w-full" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
      <main className="pt-16 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">{t('listing.listingNotFound')}</h1>
            <p className="text-muted-foreground mb-4">{t('listing.listingNotFoundDesc')}</p>
            <Button onClick={() => navigate('/')}>{t('listing.backToListings')}</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Fixed back button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-40 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <main className="pt-16">
        {/* Image gallery preview */}
        <div 
          className={cn(
            "relative h-[40vh] sm:h-[50vh] bg-muted group select-none",
            listing.images && listing.images.length > 0 && "cursor-pointer"
          )}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            if (listing.images && listing.images.length > 0) {
              setShowGallery(true);
            }
          }}
          {...(listing.images && listing.images.length > 1 ? swipeHandlers : {})}
        >
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={`${listing.title} - Photo ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              {/* Navigation arrows - only show when more than 1 image */}
              {listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md z-10"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md z-10"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Image indicator dots */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all",
                          index === currentImageIndex ? "bg-white w-5" : "bg-white/60 hover:bg-white/80"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Image count overlay */}
              <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                <Images className="h-4 w-4" />
                <span>
                  {currentImageIndex + 1} / {listing.images.length}
                  {((listing as any).floor_plan_urls?.length > 0 || (listing as any).floor_plan_url) && ` • ${t('listing.floorPlan')}`}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground">{t('listing.noImagesAvailable')}</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-4 left-16">
            <span className="px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-sm font-medium">
              {listing.listing_type === 'rent' ? t('listingTypes.rent') : t('listingTypes.sale')}
            </span>
          </div>
        </div>

        {/* Quick action buttons - Floor plan & All images */}
        {listing.images && listing.images.length > 0 && (
          <div className="container mx-auto px-4 -mt-6 relative z-10">
            <div className="flex gap-3">
              {((listing as any).floor_plan_urls?.length > 0 || listing.floor_plan_url) && (
                <button
                  onClick={() => {
                    setScrollToFloorPlan(true);
                    setShowGallery(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  <LayoutGrid className="h-4 w-4" />
                  {t('listing.floorPlan')}
                </button>
              )}
              {listing.images.length > 1 && (
                <button
                  onClick={() => {
                    setScrollToFloorPlan(false);
                    setShowGallery(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  {listing.images.length} {t('listing.images')}
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-12">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10 sm:space-y-12">
              {/* Header */}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{listing.address}, {listing.city}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30 hover:bg-secondary/70 transition-colors">
                  <Bed className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.bedrooms')}</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bedrooms}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30 hover:bg-secondary/70 transition-colors">
                  <Bath className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.bathrooms')}</p>
                  <p className="text-lg font-semibold text-foreground">{listing.bathrooms}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30 hover:bg-secondary/70 transition-colors">
                  <Square className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.area')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatArea(listing.area_sqm)}</p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/30 hover:bg-secondary/70 transition-colors">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">{t('listing.available')}</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(listing.available_from)}</p>
                </div>
              </div>

              {/* Feature Highlight Badges */}
              <FeatureHighlightBadges listing={listing} maxBadges={8} />

              {/* Description */}
              {listing.description && (
                <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50">
                  <h2 className="text-xl font-semibold text-foreground mb-5 pb-4 border-b border-border/50">{t('listing.description')}</h2>
                  {listing.description.length > 500 ? (
                    <>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">
                        {listing.description.slice(0, 500)}...
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto mt-2 text-primary"
                        onClick={() => setShowFullDescription(true)}
                      >
                        {t('listing.readMore') || 'Read more'}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">{listing.description}</p>
                  )}
                </div>
              )}

              {/* Mobile-only: Sidebar content shown here (after description) */}
              <div className="lg:hidden">
                <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/50">
                  {/* Price section */}
                  <div className="mb-6 pb-6 border-b border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      {propertyTypeLabels[listing.property_type]}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatPrice(listing.price, listing.currency, { 
                        isRental: listing.listing_type === 'rent',
                        showPeriod: listing.listing_type === 'rent'
                      })}
                    </p>
                    {listing.area_sqm && listing.area_sqm > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                      </p>
                    )}
                  </div>

                  {/* Listing Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="text-center bg-secondary/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-base">{listingStats?.viewCount ?? 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{t('listing.views')}</p>
                    </div>
                    <div className="text-center bg-secondary/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-base">{listingStats?.daysListed ?? 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{t('listing.daysListed')}</p>
                    </div>
                    <div className="text-center bg-secondary/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <MessageCircle className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-base">{listingStats?.contactCount ?? 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{t('listing.inquiries')}</p>
                    </div>
                  </div>

                  {/* Hot listing badge */}
                  {listingStats?.isHotListing && (
                    <div className="flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-xl px-4 py-2.5 mb-6">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('listing.hotListing')}</span>
                    </div>
                  )}

                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3"
                    disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                    onClick={async () => {
                      if (!user) {
                        navigate('/auth');
                        return;
                      }
                      if (!listing.user_id) {
                        toast({ variant: 'destructive', title: 'Unable to contact', description: 'This listing has no owner' });
                        return;
                      }
                      try {
                        const data = await getOrCreateConversation.mutateAsync({
                          listingId: listing.id,
                          renterId: user.id,
                          landlordId: listing.user_id,
                        });
                        navigate('/messages', { state: { conversationId: data.id } });
                      } catch (error) {
                        toast({ variant: 'destructive', title: 'Error', description: 'Failed to start conversation' });
                      }
                    }}
                  >
                    {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
                  </Button>

                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full mb-3"
                      onClick={handleSaveClick}
                    >
                      <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                      {isSaved ? t('common.saved') : t('listing.saveListing')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mb-3"
                      onClick={() => navigate('/auth')}
                    >
                      {t('listing.signInToSave')}
                    </Button>
                  )}

                  {listing.user_id && (
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/landlord/${listing.user_id}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View landlord profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Property Features */}
              <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50">
                <PropertyFeatures listing={listing} />
              </div>

              {/* Location Map */}
              <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/50">
                <h2 className="text-xl font-semibold text-foreground mb-5 pb-4 border-b border-border/50">{t('listing.location')}</h2>
                <ListingLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  address={listing.address}
                />
                <p className="text-sm text-muted-foreground mt-3">
                  {listing.address}, {listing.city}
                </p>
              </div>
            </div>

            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-3xl p-6 sm:p-8 shadow-lg border border-border/50">
                {/* Price section */}
                <div className="mb-6 pb-6 border-b border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">
                    {propertyTypeLabels[listing.property_type]}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(listing.price, listing.currency, { 
                      isRental: listing.listing_type === 'rent',
                      showPeriod: listing.listing_type === 'rent'
                    })}
                  </p>
                {listing.area_sqm && listing.area_sqm > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(listing.price / listing.area_sqm, listing.currency, { roundedFull: true })}/{areaUnit === 'sqft' ? 'ft²' : 'm²'}
                    </p>
                  )}
                </div>

                {/* Listing Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-bold text-base sm:text-lg">{listingStats?.viewCount ?? 0}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.views')}</p>
                  </div>
                  <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-bold text-base sm:text-lg">{listingStats?.daysListed ?? 0}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.daysListed')}</p>
                  </div>
                  <div className="text-center bg-secondary/50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-bold text-base sm:text-lg">{listingStats?.contactCount ?? 0}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('listing.inquiries')}</p>
                  </div>
                </div>

                {/* Hot listing badge */}
                {listingStats?.isHotListing && (
                  <div className="flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-xl px-4 py-2.5 mb-6">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('listing.hotListing')}</span>
                  </div>
                )}

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3"
                  disabled={getOrCreateConversation.isPending || listing.user_id === user?.id}
                  onClick={async () => {
                    if (!user) {
                      navigate('/auth');
                      return;
                    }
                    if (!listing.user_id) {
                      toast({ variant: 'destructive', title: 'Unable to contact', description: 'This listing has no owner' });
                      return;
                    }
                    try {
                      const data = await getOrCreateConversation.mutateAsync({
                        listingId: listing.id,
                        renterId: user.id,
                        landlordId: listing.user_id,
                      });
                      navigate('/messages', { state: { conversationId: data.id } });
                    } catch (error) {
                      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start conversation' });
                    }
                  }}
                >
                  {getOrCreateConversation.isPending ? 'Starting chat...' : t('listing.contactLandlord')}
                </Button>

                {user ? (
                  <Button
                    variant="outline"
                    className="w-full mb-3"
                    onClick={handleSaveClick}
                  >
                    <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current text-accent')} />
                    {isSaved ? t('common.saved') : t('listing.saveListing')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mb-3"
                    onClick={() => navigate('/auth')}
                  >
                    {t('listing.signInToSave')}
                  </Button>
                )}

                {listing.user_id && (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/landlord/${listing.user_id}`)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View landlord profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          <div className="lg:col-span-3 mt-8 pt-8 border-t border-border">
            <SimilarListings listing={listing} />
          </div>

          {/* Recently Viewed */}
          <div className="lg:col-span-3 mt-8 pt-8 border-t border-border">
            <RecentlyViewedListings excludeListingId={listing.id} limit={6} />
          </div>
        </div>
      </main>

      {/* Full image gallery modal */}
      <ImageGalleryModal
        images={listing.images || []}
        floorPlanUrl={listing.floor_plan_url}
        floorPlanUrls={(listing as any).floor_plan_urls || []}
        isOpen={showGallery}
        onClose={() => {
          setShowGallery(false);
          setScrollToFloorPlan(false);
        }}
        title={listing.title}
        initialScrollToFloorPlan={scrollToFloorPlan}
      />

      {/* Full description modal */}
      <Dialog open={showFullDescription} onOpenChange={setShowFullDescription}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('listing.description')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">
            {listing.description}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
