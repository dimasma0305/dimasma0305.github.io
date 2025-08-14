export default function Loading() {
  return (
    <div className="container px-4 py-12 mx-auto max-w-4xl">
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />

        <div className="relative w-full h-60 rounded bg-muted" />

        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-10/12 rounded bg-muted" />
          <div className="h-4 w-9/12 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>

        <div className="flex gap-2 mt-6">
          <div className="h-6 w-20 rounded bg-muted" />
          <div className="h-6 w-16 rounded bg-muted" />
          <div className="h-6 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}


