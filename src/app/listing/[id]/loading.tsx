import { Skeleton } from '@/components/ui/skeleton';

export default function ListingLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Image skeleton */}
      <div className="relative h-[45vh] sm:h-[55vh] lg:h-[60vh] skeleton-shimmer bg-muted" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 py-8 sm:py-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-9 w-3/4 rounded-md" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-28 rounded-[10px]" />
                <Skeleton className="h-9 w-28 rounded-[10px]" />
                <Skeleton className="h-9 w-28 rounded-[10px]" />
                <Skeleton className="h-9 w-28 rounded-[10px]" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>

            {/* Mobile price card skeleton */}
            <div className="lg:hidden rounded-2xl border border-black/[0.06] p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-36 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <Skeleton className="h-11 w-28 rounded-xl" />
              </div>
            </div>

            {/* Description card skeleton */}
            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <Skeleton className="h-9 w-9 rounded-[10px]" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <div className="px-5 py-5 space-y-3">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
            </div>

            {/* Property details card skeleton */}
            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <Skeleton className="h-9 w-9 rounded-[10px]" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <div className="px-5 py-4 space-y-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Map card skeleton */}
            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                <Skeleton className="h-9 w-9 rounded-[10px]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <div className="h-[300px] sm:h-[360px] skeleton-shimmer" />
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
                <div className="p-6 space-y-3">
                  <Skeleton className="h-3 w-32 rounded-md" />
                  <Skeleton className="h-10 w-48 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <div className="p-6 pt-0 space-y-3">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
