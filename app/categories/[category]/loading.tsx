export default function Loading() {
  return (
    <div className="container px-4 py-10 mx-auto max-w-6xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/2 bg-muted rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded border bg-card">
              <div className="h-40 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
