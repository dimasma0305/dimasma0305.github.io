"use client";

import { Calendar, MapPin, ExternalLink, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { SectionHeader } from "@/components/section-header";

const experiences = [
  {
    title: "Security Researcher · Bug Bounty",
    company: "Patchstack Alliance",
    location: "Remote",
    period: "2024 - Present",
    description:
      "Reported 170+ validated WordPress CVEs across plugins and themes, including CVE-2025-26909 (CVSS 9.6), a critical LFI-to-RCE flaw in WP Ghost affecting 200,000+ sites. Built AI-assisted tooling to accelerate CVE hunting across large plugin codebases.",
    skills: [
      "Vulnerability Research",
      "WordPress Security",
      "CVE Discovery",
      "AI Tooling",
    ],
    type: "Freelance",
    highlight: true,
  },
  {
    title: "Content Creator",
    company: "HackTheBox",
    location: "Remote",
    period: "2025 - Present",
    description:
      "Develop original security training content and challenges for the HackTheBox platform.",
    skills: ["Challenge Design", "Training Content", "Web Security"],
    type: "Contract",
  },
  {
    title: "DevSecOps Intern",
    company: "ArchonLabs SSD",
    location: "Jakarta · Remote",
    period: "Aug 2025 - Jan 2026",
    description:
      "Built container automation with HashiCorp Nomad to orchestrate containerized workflows, and helped secure and harden container-based deployments.",
    skills: ["HashiCorp Nomad", "Container Security", "DevSecOps"],
  },
  {
    title: "Founder & Infrastructure Engineer",
    company: "TCP1P",
    location: "Indonesia",
    period: "Aug 2022 - Present",
    description:
      "Founded and lead TCP1P, Indonesia's #1 nationally ranked CTF team on CTFtime (top 6 every year since 2022). Organized TCP1P CTF 2023 and 2024, internationally rated events sponsored by OffSec, Ottersec, and Google SecLab Indonesia.",
    skills: ["Leadership", "CTF Infrastructure", "Community", "Event Organizing"],
    link: "https://github.com/TCP1P",
  },
  {
    title: "Cloud Engineer & Challenge Author",
    company: "C2C & Cyber Jawara",
    location: "Indonesia",
    period: "Dec 2025 - Feb 2026",
    description:
      "Engineered and operated cloud-based CTF infrastructure and authored challenges for two of Indonesia's national cybersecurity competitions.",
    skills: ["Cloud Infrastructure", "Challenge Design", "CTF"],
    type: "Contract",
  },
  {
    title: "Challenge Author & Infrastructure Engineer",
    company: "Project Sekai · IntechFest · TECHCOMFEST · HOLOGY",
    location: "Remote",
    period: "2022 - 2026",
    description:
      "Authored web exploitation challenges for Project Sekai CTF, an internationally recognized competition, and designed challenges and deployment infrastructure for national events across multiple annual editions.",
    skills: ["Web Security", "Challenge Design", "Infrastructure"],
    type: "Freelance",
  },
];

export function ExperienceSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20" id="experience">
      <div className="max-w-4xl mx-auto">
        <div className="ml-4 pl-8">
          <SectionHeader
            eyebrow="Journey"
            title="Professional Experience"
            subtitle="My journey in the cybersecurity realm."
          />
        </div>
        <div className="relative border-l-2 border-muted pl-8 ml-4">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="mb-12 last:mb-0 relative"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[41px] top-1" />
              <Card
                className={`glass-card transition-all duration-300 ${experience.highlight ? "border-primary/40 ring-1 ring-primary/30" : ""}`}
              >
                <CardHeader className="pb-3 sm:pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">
                        {experience.title}
                      </CardTitle>
                      {experience.highlight && hoveredCard === index && (
                        <Sparkles className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardDescription className="text-lg font-medium">
                        {experience.company}
                        {experience.type && (
                          <span className="ml-2 text-sm">
                            · {experience.type}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {experience.link && (
                      <Link
                        href={experience.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit
                        </Badge>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{experience.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{experience.location}</span>
                    </div>
                  </div>

                  <p>{experience.description}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {experience.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-primary/20 hover:bg-primary/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
