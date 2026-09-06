import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { CTFCalculator } from "@/components/ui/ctf-calculator";

export const metadata: Metadata = {
  title: "CTF Challenge Difficulty Calculator",
  description:
    "Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.",
  openGraph: {
    title: "CTF Challenge Difficulty Calculator | Dimas Maulana",
    description:
      "Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.",
    type: "website",
  },
};

export default function CTFCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
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
