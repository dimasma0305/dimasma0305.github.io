import type React from "react";
import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@/components/analytics";
import { Suspense, lazy } from "react";
import { BackgroundPreloader } from "@/components/background-preloader";
import NavigationLoader from "@/components/navigation-loader";

// Lazy load Footer for better initial page load
const Footer = lazy(() =>
  import("@/components/footer").then((m) => ({ default: m.Footer })),
);

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
  preload: true,
  fallback: ["ui-monospace", "monospace"],
});

// Dark-only site: a single theme color.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080d1a",
};

const baseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io") +
  (process.env.NEXT_PUBLIC_BASE_PATH || "");
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    template: "%s | Dimas Maulana",
  },
  description:
    "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
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
  icons: {
    icon: [{ url: baseUrl + "/favicon.svg", type: "image/svg+xml" }],
    apple: baseUrl + "/apple-icon.svg",
    other: [
      {
        rel: "icon",
        type: "image/svg+xml",
        url: baseUrl + "/favicon.svg",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Dimas Maulana",
    title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    description:
      "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
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
      "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
    creator: "dimasma__",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />

        {/* Favicon and icons */}
        <link rel="icon" type="image/svg+xml" href={baseUrl + "/favicon.svg"} />
        <link rel="apple-touch-icon" href={baseUrl + "/favicon.svg"} />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Theme and PWA meta tags */}
        <meta name="theme-color" content="#080d1a" />
        <meta name="application-name" content="Dimas Maulana" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Dimas Maulana" />
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
        <div className="flex flex-col min-h-screen">
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
        <Toaster />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <BackgroundPreloader />
      </body>
    </html>
  );
}
