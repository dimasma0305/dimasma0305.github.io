"use client"

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  )
}
