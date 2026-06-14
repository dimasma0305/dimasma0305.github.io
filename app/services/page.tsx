import { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { ServicesDetail } from "@/components/services-detail";
import { ServicesStructuredData } from "@/components/seo";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
// trailingSlash:true — keep the canonical, og:url, and JSON-LD URLs in the
// /services/ form the page is actually served and indexed at.
const servicesUrl = `${baseUrl}${basePath}/services/`;
const ogImage = `${baseUrl}${basePath}/og-image.jpg`;

export const metadata: Metadata = {
  // The layout template appends " | Dimas Maulana", so keep this keyword-first
  // and single-segment: renders "Source Code Security Review | Dimas Maulana".
  title: "Source Code Security Review",
  description:
    "AI-automated source code security review. An AI agent finds potential vulnerabilities, I triage the real ones, run the program to confirm it works, and ship ready-to-merge fixes. From $99.",
  alternates: {
    canonical: servicesUrl,
  },
  openGraph: {
    title: "Source Code Security Review | Dimas Maulana",
    description:
      "AI-automated source code review plus dynamic checks that the program works. Potential vulnerabilities triaged for real exploitability, suggested ready-to-merge fixes, plain-English report. Starting at $99 per project.",
    type: "website",
    url: servicesUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Source Code Security Review by Dimas Maulana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Source Code Security Review | Dimas Maulana",
    description:
      "AI-automated source code review plus dynamic checks. Vulnerabilities triaged for real exploitability, ready-to-merge fixes, plain report. From $99 per project.",
    creator: "@dimasma__",
    images: [ogImage],
  },
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <ServicesStructuredData />
      <SectionHeader
        titleAs="h1"
        eyebrow="Services"
        title="Source Code Security Review"
        subtitle="An AI agent reviews your code for potential vulnerabilities. I triage what's actually exploitable, run the program to check it works correctly, and hand you back suggested fixes."
      />
      <ServicesDetail />
    </div>
  );
}
