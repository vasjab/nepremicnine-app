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
        "listing-card animate-pulse",
        className
      )}
      style={style}
    >
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-[4/3] bg-muted skeleton-shimmer">
        {/* Type badge skeleton */}
        <div className="absolute top-2.5 left-2.5">
          <Skeleton className="h-[22px] w-12 rounded-full" />
        </div>
        {/* Save button skeleton */}
        <div className="absolute top-2.5 right-2.5">
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        {/* Carousel dots skeleton */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[5px] w-5 rounded-full" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 pt-3.5 pb-4 space-y-2.5">
        {/* Location label */}
        <Skeleton className="h-3 w-24 rounded" />

        {/* Title */}
        <Skeleton className="h-[17px] w-3/4 rounded" />

        {/* Specs row */}
        <div className="flex gap-3">
          <Skeleton className="h-3.5 w-10 rounded" />
          <Skeleton className="h-3.5 w-10 rounded" />
          <Skeleton className="h-3.5 w-14 rounded" />
        </div>

        {/* Price */}
        <div className="pt-1">
          <Skeleton className="h-5 w-24 rounded" />
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
    <div className={cn("grid grid-cols-1 @[600px]:grid-cols-2 @[900px]:grid-cols-3 gap-3 sm:gap-4", className)}>
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
