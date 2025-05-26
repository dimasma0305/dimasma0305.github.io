import { Metadata } from "next"
import { HomepageStructuredData } from "@/components/seo"
import HomePageClient from "@/components/home-page-client"

// Environment variables with fallbacks
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const fullUrl = `${baseUrl}${basePath}`

export const metadata: Metadata = {
  title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
  description: "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
  keywords: ["cybersecurity", "CTF", "capture the flag", "security research", "vulnerability", "bug bounty", "hacking", "Indonesia", "Dimas Maulana"],
  authors: [{ name: "Dimas Maulana", url: fullUrl }],
  creator: "Dimas Maulana",
  publisher: "Dimas Maulana",
  alternates: {
    canonical: fullUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: fullUrl,
    siteName: "Dimas Maulana",
    title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    description: "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
    images: [
      {
        url: `${fullUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Dimas Maulana - Cybersecurity Researcher & CTF Player",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@dimasma__",
    creator: "@dimasma__",
    title: "Dimas Maulana | Cybersecurity Researcher & CTF Player",
    description: "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, gamer, and manga enthusiast from Indonesia.",
    images: [`${fullUrl}/og-image.jpg`],
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
}

export default function HomePage() {
  return (
    <>
      <HomepageStructuredData />
      <HomePageClient />
    </>
  )
}
