"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initCornerTour } from "@/lib/room/tour.js";
import type { createSceneSummary } from "@/lib/room/content.js";

/** The content is server-rendered. Only the camera and UI are enhanced here. */
export function RoomEnhancer({
  sceneSummary,
  assetBase,
}: {
  sceneSummary: ReturnType<typeof createSceneSummary>;
  assetBase: string;
}) {
  const router = useRouter();
  useEffect(() => {
    const dispose = initCornerTour({
      sceneSummary,
      assetBase,
      // A separate Next.js chunk: still/reduced-motion visitors never load Three.
      loadScene: () => import("@/lib/room/scene/corner-scene.js"),
    });
    const page = document.querySelector(".tour-page");
    const navigate = (event: Event) => {
      const click = event as MouseEvent;
      if (
        click.defaultPrevented ||
        click.button !== 0 ||
        click.metaKey ||
        click.ctrlKey ||
        click.shiftKey ||
        click.altKey
      )
        return;
      const link = (click.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href, location.href);
      if (
        destination.origin !== location.origin ||
        destination.pathname === location.pathname
      )
        return;
      const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(
        /\/$/,
        "",
      );
      const pathname =
        basePath && destination.pathname.startsWith(`${basePath}/`)
          ? destination.pathname.slice(basePath.length)
          : destination.pathname;
      if (
        !/^\/(blog|notes|posts|categories|tags|services|tools|search|reading-list|privacy)(\/|$)/.test(
          pathname,
        )
      )
        return;
      event.preventDefault();
      router.push(`${pathname}${destination.search}${destination.hash}`);
    };
    page?.addEventListener("click", navigate);
    return () => {
      page?.removeEventListener("click", navigate);
      dispose();
    };
  }, [sceneSummary, assetBase, router]);
  return null;
}
