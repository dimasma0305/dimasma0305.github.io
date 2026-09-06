import { siteSocial } from "@/lib/social-metadata";
import { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { ServicesDetail } from "@/components/services-detail";
import { ServicesStructuredData } from "@/components/seo";
import portfolio from "@/lib/portfolio-data.json";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dimasc.tf";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
// trailingSlash:true — keep the canonical, og:url, and JSON-LD URLs in the
// /services/ form the page is actually served and indexed at.
const servicesUrl = `${baseUrl}${basePath}/services/`;
const ogImage = `${baseUrl}${basePath}${siteSocial.image}`;

export const metadata: Metadata = {
  // The layout template appends " | dimasc.tf", so keep this keyword-first
  // and single-segment: renders "Source Code Security Review | dimasc.tf".
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
        alt: siteSocial.imageAlt,
        type: "image/jpeg",
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
    <div className="services-page container mx-auto px-4 py-12 max-w-7xl">
      <ServicesStructuredData />
      <SectionHeader
        titleAs="h1"
        index="04"
        eyebrow="The review desk"
        title="Source Code Security Review"
        subtitle="An AI agent reviews your code for potential vulnerabilities. I triage what's actually exploitable, run the program to check it works correctly, and hand you back suggested fixes."
        action={
          <div className="flex flex-col gap-3 sm:items-end">
            <p className="text-sm text-muted-foreground">
              From{" "}
              <span className="text-foreground">
                {portfolio.services.price}
              </span>{" "}
              per project
            </p>
            <a
              href="#start-a-review"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Let’s discuss your project ↗
            </a>
          </div>
        }
      />
      <ServicesDetail />
    </div>
  );
}
