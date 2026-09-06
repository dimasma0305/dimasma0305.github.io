"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "@/lib/content-theme.css";

// Home has its own header, main landmark and footer. Content routes retain the
// existing reading shell; no duplicate navigation or competing scroll-spy.
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return (
    <div className="content-shell flex min-h-screen flex-col">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pt-[var(--site-header-height)] outline-none"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
