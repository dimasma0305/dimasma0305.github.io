"use client";

import { Shield, Code, Bot, Server, BadgeCheck } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

const skills = [
  {
    category: "Offensive Security",
    icon: <Shield className="w-4 h-4" />,
    items: [
      "Penetration Testing",
      "Web Exploitation",
      "Vulnerability Research",
      "Exploit Development",
      "Reverse Engineering",
      "Binary Exploitation",
      "Cryptography",
      "CVE Discovery",
      "Secure Code Review",
      "SAST & DAST",
    ],
  },
  {
    category: "Programming",
    icon: <Code className="w-4 h-4" />,
    items: ["Python", "Go", "JavaScript", "TypeScript", "PHP", "Solidity", "Bash"],
  },
  {
    category: "Security Automation",
    icon: <Bot className="w-4 h-4" />,
    items: [
      "AI-assisted Vulnerability Triage",
      "CVE-hunting Tooling",
      "Custom Exploit Scripts",
    ],
  },
  {
    category: "Cloud & Infrastructure",
    icon: <Server className="w-4 h-4" />,
    items: [
      "AWS",
      "Docker",
      "Kubernetes",
      "HashiCorp Nomad",
      "CI/CD",
      "Linux Administration",
      "Wazuh (SIEM/IDS)",
    ],
  },
  {
    category: "Certifications",
    icon: <BadgeCheck className="w-4 h-4" />,
    items: ["Certified AppSec Pentester (CAPen) · with Merit", "CompTIA Linux+ ce"],
  },
];

export function SkillsSection() {
  return (
    <div className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20" id="skills">
      <SectionHeader
        eyebrow="Toolkit"
        title="Skills & Expertise"
        subtitle="The stack behind the research, tools, and writeups below."
      />

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.category}
              className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex items-center gap-2 sm:w-56 shrink-0">
                <span className="text-primary">{skill.icon}</span>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {skill.category}
                </h3>
              </div>

              {/* role="list" restores list semantics that list-style removal
                  strips in some screen readers. */}
              <ul role="list" className="flex flex-wrap gap-2">
                {skill.items.map((item) => (
                  <li key={item}>
                    <Badge
                      variant="secondary"
                      className="bg-primary/15 hover:bg-primary/25 text-xs whitespace-nowrap"
                    >
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
