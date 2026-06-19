import { Skeleton } from "@/components/ui/skeleton"

/**
 * Content-shaped skeleton for an individual post. Mirrors the real post layout
 * (hero → cover → article + sidebar) so there is no shape-shift when content
 * arrives. Shared by the route-level loading.tsx and the client load branch.
 */
export function PostSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 pt-20 lg:pt-24">
        <div className="max-w-4xl space-y-5">
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-2/3" />
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-[220px] w-full rounded-2xl sm:h-[360px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="space-y-4 lg:w-[70%]">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
              />
            ))}
          </div>
          <div className="lg:w-[30%]">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
