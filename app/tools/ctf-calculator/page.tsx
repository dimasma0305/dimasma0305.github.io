import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { CTFCalculator } from "@/components/ui/ctf-calculator";
import { pageMetadata } from "@/lib/site-seo";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = pageMetadata({
  title: "CTF Challenge Difficulty Calculator",
  path: "/tools/ctf-calculator/",
  description:
    "Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.",
});

export default function CTFCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <BreadcrumbStructuredData
        items={[
          { name: "Tools", path: "/tools/" },
          { name: "CTF Difficulty Calculator", path: "/tools/ctf-calculator/" },
        ]}
      />
      <SectionHeader
        titleAs="h1"
        eyebrow="On the workbench"
        title="CTF difficulty calculator"
        subtitle={
          <>
            A consistent way to rate a challenge’s skills, complexity and moving
            parts. Used in my{" "}
            <Link
              href="https://github.com/dimasma0305/My-CTF-Challenges"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CTF challenge collection
            </Link>
            .
          </>
        }
        action={
          <Link
            href="/tools/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All tools
          </Link>
        }
      />

      {/* Calculator */}
      <div className="mb-8">
        <CTFCalculator />
      </div>
    </div>
  );
}
