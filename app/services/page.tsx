import { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { ServicesDetail } from "@/components/services-detail";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const servicesUrl = `${baseUrl}${basePath}/services`;
const ogImage = `${baseUrl}${basePath}/og-image.jpg`;

export const metadata: Metadata = {
  title: "Services | Source Code Security Review",
  description:
    "AI-automated source code security review by Dimas Maulana. An AI agent reviews your codebase for potential vulnerabilities; I triage what's actually exploitable and hand back suggested, ready-to-merge fixes with a plain-English PDF and Markdown report. Starting at $99 per project.",
  alternates: {
    canonical: servicesUrl,
  },
  openGraph: {
    title: "Source Code Security Review | Dimas Maulana",
    description:
      "AI-automated source code review. Potential vulnerabilities triaged for real exploitability, suggested ready-to-merge fixes, plain-English report. Starting at $99 per project.",
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
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <SectionHeader
        titleAs="h1"
        eyebrow="Services"
        title="Source Code Security Review"
        subtitle="An AI agent reviews your code for potential vulnerabilities. I triage what's actually exploitable and hand you back suggested fixes."
      />
      <ServicesDetail />
    </div>
  );
}
