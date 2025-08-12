import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, Roboto, Merriweather, Fira_Code } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { Suspense, lazy } from "react"

// Lazy load Footer for better initial page load
const Footer = lazy(() => import("@/components/footer").then(m => ({ default: m.Footer })))

// Optimized font loading with preload
const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-inter",
  preload: true,
  fallback: ['system-ui', 'arial']
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  preload: true,
  fallback: ['system-ui', 'arial']
})

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
  preload: false, // Only preload most critical fonts
  fallback: ['Georgia', 'serif']
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
  preload: false,
  fallback: ['Consolas', 'Monaco', 'monospace']
})

// Optimized viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://dimasma0305.github.io') + (process.env.NEXT_PUBLIC_BASE_PATH || '')
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    template: "%s | Dimas Maulana",
  },
  description:
    "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
  keywords: ["cybersecurity", "CTF", "capture the flag", "security research", "vulnerability", "bug bounty", "hacking", "Indonesia"],
  authors: [{ name: "Dimas Maulana", url: baseUrl }],
  creator: "Dimas Maulana",
  icons: {
    icon: [
      { url: baseUrl+"/favicon.svg", type: 'image/svg+xml' },
    ],
    apple: baseUrl+"/apple-icon.svg",
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: baseUrl+"/favicon.svg",
      },
    ],
  },
  manifest: baseUrl+"/manifest.webmanifest",
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
        url: baseUrl+"/og-image.jpg",
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
    images: [baseUrl+"/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        
        {/* Favicon and icons */}
        <link rel="icon" type="image/svg+xml" href={baseUrl+"/favicon.svg"} />
        <link rel="apple-touch-icon" href={baseUrl+"/favicon.svg"} />
        <link rel="manifest" href={baseUrl+"/manifest.webmanifest"} />
        
        {/* Theme and PWA meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="application-name" content="Dimas Maulana" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dimas Maulana" />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${merriweather.variable} ${firaCode.variable} font-roboto antialiased`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
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
        </ThemeProvider>
      </body>
    </html>
  )
}
