import { Metadata } from "next";
import { HomepageStructuredData } from "@/components/seo";
import { RoomHome } from "@/components/room-home";
import { siteSocial, socialImage } from "@/lib/social-metadata";
import { siteUrls } from "@/lib/site-seo";

// Environment variables with fallbacks
const fullUrl = siteUrls.page();

export const metadata: Metadata = {
  title: { absolute: "Dimas Maulana — Security Researcher | dimasc.tf" },
  description: siteSocial.description,
  keywords: [
    "cybersecurity",
    "CTF",
    "capture the flag",
    "security research",
    "vulnerability",
    "bug bounty",
    "hacking",
    "Indonesia",
    "Dimas Maulana",
  ],
  authors: [{ name: "Dimas Maulana", url: fullUrl }],
  creator: "Dimas Maulana",
  publisher: "Dimas Maulana",
  alternates: {
    canonical: fullUrl,
    types: { "application/rss+xml": siteUrls.asset("/rss.xml") },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: fullUrl,
    siteName: "dimasc.tf",
    title: siteSocial.title,
    description: siteSocial.description,
    images: [socialImage(fullUrl)],
  },
  twitter: {
    card: "summary_large_image",
    site: "@dimasma__",
    creator: "@dimasma__",
    title: siteSocial.title,
    description: siteSocial.description,
    images: [socialImage(fullUrl)],
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
};

export default function HomePage() {
  return (
    <>
      <HomepageStructuredData />
      <RoomHome />
    </>
  );
}
