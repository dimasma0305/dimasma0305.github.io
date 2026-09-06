import { ServicesDetail } from "@/components/services-detail";
import { ServicesStructuredData } from "@/components/seo";
import { pageMetadata } from "@/lib/site-seo";

export const metadata = pageMetadata({
  title: "Source Code Security Review",
  path: "/services/",
  description:
    "Source code security reviews by Dimas Maulana. AI-assisted analysis, personal triage, suggested fixes, PDF/Markdown reports, and one free re-test. From $99.",
});

export default function ServicesPage() {
  return (
    <div className="services-page container mx-auto px-4 py-12 max-w-7xl">
      <ServicesStructuredData />
      <ServicesDetail />
    </div>
  );
}
