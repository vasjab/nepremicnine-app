import { 
  Sofa, 
  Dog, 
  Sun, 
  Flower2, 
  Trees, 
  Car, 
  Warehouse, 
  ArrowUp, 
  Wind, 
  Package, 
  Dumbbell, 
  Droplets, 
  Flame,
  Zap,
  Waves,
  Eye
} from 'lucide-react';
import { Listing } from '@/types/listing';
import { cn } from '@/lib/utils';

interface FeatureHighlightBadgesProps {
  listing: Listing;
  maxBadges?: number;
  className?: string;
}

interface FeatureBadge {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  condition: boolean;
}

export function FeatureHighlightBadges({ listing, maxBadges = 8, className }: FeatureHighlightBadgesProps) {
  // Define all possible feature badges with their conditions
  const allBadges: FeatureBadge[] = [
    { key: 'furnished', label: 'Furnished', icon: Sofa, condition: !!listing.is_furnished },
    { key: 'pets', label: 'Pets OK', icon: Dog, condition: !!listing.allows_pets },
    { key: 'balcony', label: 'Balcony', icon: Sun, condition: !!listing.has_balcony },
    { key: 'terrace', label: 'Terrace', icon: Trees, condition: !!listing.has_terrace },
    { key: 'garden', label: 'Garden', icon: Flower2, condition: !!listing.has_garden },
    { key: 'parking', label: 'Parking', icon: Car, condition: !!listing.has_parking },
    { key: 'garage', label: 'Garage', icon: Warehouse, condition: !!listing.has_garage },
    { key: 'elevator', label: 'Elevator', icon: ArrowUp, condition: !!listing.has_elevator },
    { key: 'ac', label: 'A/C', icon: Wind, condition: !!listing.has_air_conditioning },
    { key: 'storage', label: 'Storage', icon: Package, condition: !!listing.has_storage },
    { key: 'gym', label: 'Gym', icon: Dumbbell, condition: !!listing.has_gym },
    { key: 'pool', label: 'Pool', icon: Droplets, condition: !!listing.has_pool },
    { key: 'fireplace', label: 'Fireplace', icon: Flame, condition: !!listing.has_fireplace },
    { key: 'ev', label: 'EV Charging', icon: Zap, condition: !!listing.has_ev_charging },
    { key: 'waterfront', label: 'Waterfront', icon: Waves, condition: !!listing.has_waterfront },
    { key: 'view', label: 'Great View', icon: Eye, condition: !!listing.has_view },
  ];

  // Filter to only badges that are true
  const activeBadges = allBadges.filter(badge => badge.condition);

  if (activeBadges.length === 0) return null;

  // Show up to maxBadges, with "+X more" if there are more
  const visibleBadges = activeBadges.slice(0, maxBadges);
  const remainingCount = activeBadges.length - maxBadges;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.key}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/50 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>{badge.label}</span>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
