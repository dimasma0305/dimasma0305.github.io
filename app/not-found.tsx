import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, FileText, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4 mx-auto text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Blog
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </Link>
      </div>
    </div>
  )
}
