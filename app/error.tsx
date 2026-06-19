"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. The site renders most content client-side, so an
 * uncaught render/fetch error would otherwise drop visitors to Next's unstyled
 * default. This keeps them inside the dark/blue brand with a way to recover.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        An unexpected error interrupted this page. You can try again, or head
        back to safer ground.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw aria-hidden className="h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Back home
          </Link>
        </Button>
      </div>
    </div>
  );
}
