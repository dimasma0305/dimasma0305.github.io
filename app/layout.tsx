import type React from "react";
import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@/components/analytics";
import { Suspense } from "react";
import { BackgroundPreloader } from "@/components/background-preloader";
import NavigationLoader from "@/components/navigation-loader";
import { RouteAnnouncer } from "@/components/route-announcer";

// Two curated families: Inter for UI/body, JetBrains Mono for code.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  // Only code-heavy pages need the mono face; don't race it against Inter/LCP on
  // every page. display:swap covers the brief fallback on the pages that use it.
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

// Dark-only site: a single theme color.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080d1a",
};

const baseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://dimasc.tf") +
  (process.env.NEXT_PUBLIC_BASE_PATH || "");
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "dimasc.tf — Dimas Maulana",
    template: "%s | dimasc.tf",
  },
  description:
    "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, source code pentester, and open source developer from Indonesia.",
  keywords: [
    "cybersecurity",
    "CTF",
    "capture the flag",
    "security research",
    "vulnerability",
    "bug bounty",
    "hacking",
    "Indonesia",
  ],
  authors: [{ name: "Dimas Maulana", url: baseUrl }],
  creator: "Dimas Maulana",
  // NOTE: icons are intentionally NOT set here. metadata.icons resolves URLs
  // against metadataBase (the production origin), which makes the favicon load
  // from the live site even in dev. Icons are declared as relative <link> tags
  // in <head> below so they resolve against the current origin.
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "dimasc.tf",
    title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    description:
      "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, source code pentester, and open source developer from Indonesia.",
    images: [
      {
        url: baseUrl + "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dimas Maulana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    description:
      "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, source code pentester, and open source developer from Indonesia.",
    creator: "@dimasma__",
    images: [baseUrl + "/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* next/font self-hosts Inter & JetBrains Mono at build time, so there
            are no runtime requests to Google Fonts — no preconnect needed. Warm
            the origins we actually hit at runtime instead: the photo-gallery CDN
            and GitHub avatars. */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />

        {/* Favicon and icons — relative so they resolve against the current
            origin (localhost in dev, the site domain in prod), not a hardcoded
            absolute URL. */}
        {/* Version the approved artwork so returning visitors refresh cached icons. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=dm2" />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96.png?v=dm2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32.png?v=dm2"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16.png?v=dm2"
        />
        <link rel="icon" href="/favicon.ico?v=dm2" sizes="16x16 32x32 48x48" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon.png?v=dm2"
        />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Theme and PWA meta tags */}
        <meta name="theme-color" content="#080d1a" />
        <meta name="application-name" content="dimasc.tf" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="dimasc.tf" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <RouteAnnouncer />
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <SiteShell>{children}</SiteShell>
        <Toaster />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <BackgroundPreloader />
      </body>
    </html>
  );
}
