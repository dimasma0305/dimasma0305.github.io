export default function LoadingNote() {
  return (
    <div className="container px-4 py-10 mx-auto max-w-5xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-5 w-1/3 bg-muted rounded" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}


