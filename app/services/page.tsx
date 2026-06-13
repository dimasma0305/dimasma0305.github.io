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
    "AI-assisted source code security review by Dimas Maulana. I read your code line by line, find the bugs an attacker could use, and hand you back ready-to-merge fixes with a plain-English PDF and Markdown report. Starting at $99 per project.",
  alternates: {
    canonical: servicesUrl,
  },
  openGraph: {
    title: "Source Code Security Review | Dimas Maulana",
    description:
      "Deep manual + AI source code review. Real exploitable bugs, ready-to-merge fixes, plain-English report. Starting at $99 per project.",
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
        subtitle="I read your code line by line, find the bugs an attacker could actually use, and hand you back working fixes."
      />
      <ServicesDetail />
    </div>
  );
}
