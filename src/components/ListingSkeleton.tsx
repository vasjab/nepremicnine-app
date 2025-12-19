import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ListingSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ListingSkeleton({ className, style }: ListingSkeletonProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-card animate-pulse",
        className
      )}
      style={style}
    >
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-[4/3] bg-muted skeleton-shimmer">
        {/* Type badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        {/* Save button skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        {/* Carousel dots skeleton */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-1.5 w-6 rounded-full" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 rounded-md" />
        
        {/* Location */}
        <Skeleton className="h-4 w-1/2 rounded-md" />
        
        {/* Features row */}
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        
        {/* Price */}
        <div className="pt-2">
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

interface ListingSkeletonGridProps {
  count?: number;
  className?: string;
}

export function ListingSkeletonGrid({ count = 4, className }: ListingSkeletonGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4", className)}>
      {[...Array(count)].map((_, i) => (
        <ListingSkeleton 
          key={i} 
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

// My Listings page skeleton (horizontal card style)
export function MyListingSkeleton({ className, style }: ListingSkeletonProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-card animate-pulse",
        className
      )}
      style={style}
    >
      {/* Image skeleton */}
      <div className="w-full sm:w-40 h-32 rounded-lg bg-muted skeleton-shimmer flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>

        <Skeleton className="h-6 w-24 rounded-md" />

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function MyListingSkeletonGrid({ count = 3, className }: ListingSkeletonGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(count)].map((_, i) => (
        <MyListingSkeleton 
          key={i} 
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
