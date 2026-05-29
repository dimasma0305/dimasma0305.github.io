import { Skeleton } from "@/components/ui/skeleton"

/** Content-shaped skeleton matching PostCard's footprint. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-[var(--elevation-1)]">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** Full listing-page skeleton: header row + responsive card grid. */
export function ListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-full rounded-md sm:w-64" />
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
