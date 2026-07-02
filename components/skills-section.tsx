"use client";

import { Shield, Terminal, Server, Code, Database, Globe } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

const skills = [
  {
    category: "Cybersecurity",
    icon: <Shield className="w-4 h-4" />,
    items: [
      "Penetration Testing",
      "Vulnerability Assessment",
      "CTF Competitions",
      "Security Research",
    ],
  },
  {
    category: "Operating Systems",
    icon: <Terminal className="w-4 h-4" />,
    items: ["Linux", "Windows", "Kali Linux", "Ubuntu"],
  },
  {
    category: "Infrastructure",
    icon: <Server className="w-4 h-4" />,
    items: ["Docker", "Kubernetes", "AWS", "Networking"],
  },
  {
    category: "Programming",
    icon: <Code className="w-4 h-4" />,
    items: ["Python", "JavaScript", "PHP", "Bash", "Go"],
  },
  {
    category: "Databases",
    icon: <Database className="w-4 h-4" />,
    items: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
  },
  {
    category: "Web Technologies",
    icon: <Globe className="w-4 h-4" />,
    items: ["HTML/CSS", "React", "Node.js", "Web Security"],
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
