"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { siteNavigation, isSiteSectionActive } from "@/lib/site-brand.mjs";
import "@/lib/site-header.css";

// The room owns its in-page navigation. Content pages share four clear site
// destinations, visible at every screen size without opening a menu.
export function Header() {
  const pathname = usePathname() || "/";
  return (
    <header className="site-global-header">
      <div className="site-header-inner">
        <Link
          href="/"
          prefetch={false}
          className="site-brand"
          aria-label="dimasc.tf — home"
        >
          <LogoMark size={36} />
          <span className="site-wordmark">
            dimasc<span>.tf</span>
          </span>
        </Link>
        <nav className="site-primary-nav" aria-label="Main navigation">
          {siteNavigation.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              prefetch={false}
              aria-current={
                isSiteSectionActive(pathname, item.path) ? "page" : undefined
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <Link
          href="/search/"
          prefetch={false}
          className="site-search"
          aria-label="Search the site"
        >
          <Search size={19} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
