"use client";

import portfolio from "@/lib/portfolio-data.json";
import { Shield, Code, Bot, Server, BadgeCheck } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

const skillIcons = [Shield, Code, Bot, Server, BadgeCheck];
const skills = portfolio.skills.map((item, i) => {
  const Icon = skillIcons[i];
  return { ...item, icon: <Icon className="w-4 h-4" /> };
});

export function SkillsSection() {
  return (
    <div className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20" id="skills">
      <SectionHeader
        index="02"
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
                    {/* No whitespace-nowrap: the long certification chip must
                        be able to wrap at 320px instead of widening the page. */}
                    <Badge
                      variant="secondary"
                      className="max-w-full bg-primary/15 hover:bg-primary/25 text-xs"
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
