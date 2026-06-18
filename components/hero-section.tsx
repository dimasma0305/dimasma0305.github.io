"use client";

import { useState } from "react";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Code2,
  ScanSearch,
  Check,
  BookOpen,
  Shield,
  ChevronDown,
  Sunrise,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/parallax";
import Link from "next/link";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("researcher");

  const tabs = [
    { id: "researcher", label: "Researcher", icon: <Shield className="w-5 h-5" /> },
    { id: "builder", label: "Builder", icon: <Code2 className="w-5 h-5" /> },
    { id: "pentester", label: "Pentester", icon: <ScanSearch className="w-5 h-5" /> },
  ];

  const tabContent = {
    researcher: {
      title: "Cybersecurity Researcher",
      subtitle: "CTF Player & Source Code Pentester",
      description:
        "I break things to understand how to secure them. I hunt vulnerabilities across web and Linux, then turn what I find into shippable fixes.",
      stats: [
        { label: "Years of Experience", value: "3+" },
        { label: "Security Tools", value: "10+" },
        { label: "CVEs", value: "172+" },
      ],
    },
    builder: {
      title: "Open Source Builder",
      subtitle: "Security tooling in Go and Python",
      description:
        "I ship command-line tools and scanners the security community actually uses, from CTF tooling to a WordPress taint-analysis engine.",
      stats: [
        { label: "Public Repos", value: "35+" },
        { label: "Stars Earned", value: "220+" },
        { label: "Followers", value: "320+" },
      ],
    },
    pentester: {
      title: "Source Code Pentester",
      subtitle: "AI-assisted source code review",
      description:
        "I run AI-assisted reviews over real codebases, triage the bugs that are actually exploitable, and hand back ready-to-merge fixes with a plain-English report.",
      stats: [
        { label: "Per Project", value: "$99" },
        { label: "Turnaround", value: "1-2d" },
        { label: "Free Re-test", value: "1" },
      ],
    },
  };

  const active = tabContent[activeTab as keyof typeof tabContent];

  return (
    // No own background: the fixed <ScrollSky /> behind the page provides the
    // morning sky here (and turns to night as the visitor scrolls).
    <section
      className="relative min-h-[auto] lg:min-h-screen flex items-start lg:items-center justify-center overflow-hidden pt-28 pb-16 lg:py-20"
      id="home"
    >
      <div className="container relative z-10 px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-secondary/50 backdrop-blur-sm border border-border">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-foreground">{active.title}</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block text-gradient-neon">Dimas Maulana</span>
              </h1>

              <p
                key={activeTab}
                className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-light animate-in fade-in duration-200"
              >
                {active.subtitle}
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {active.description}
            </p>

            {/* Persona tabs */}
            <div
              className="flex flex-wrap gap-3"
              role="group"
              aria-label="Choose a persona"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 min-h-11 text-sm font-medium transition-colors duration-[var(--dur-base)] rounded-full border
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    ${
                      activeTab === tab.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <span className={activeTab === tab.id ? "text-primary" : ""}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {active.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card p-3 sm:p-4 rounded-lg text-center"
                >
                  <div className="text-xl sm:text-2xl font-bold mb-1 font-mono text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground font-mono font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="#projects" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-colors"
                >
                  View Projects
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/blog" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 group glass border-border hover:bg-card/90"
                >
                  Read My Blog
                  <BookOpen className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Open to security research roles &amp; CTF collaborations —{" "}
              <a
                href="mailto:dimasmaulana0305@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                get in touch
              </a>
              .
            </p>

            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
              <Link
                href="https://github.com/dimasma0305"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="GitHub"
                  className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                href="https://www.linkedin.com/in/solderet/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="LinkedIn"
                  className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                href="https://twitter.com/dimasma__"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Twitter"
                  className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="mailto:dimasmaulana0305@gmail.com">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Email"
                  className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content — persona visual (single active card, light CSS fade).
              Shown on mobile too (below the left column) so the personas have a payoff. */}
          <Parallax
            speed={0.12}
            className="relative h-[440px] sm:h-[520px] lg:h-[600px]"
          >
            <div
              key={activeTab}
              className="absolute inset-0 flex items-center justify-center p-8 animate-in fade-in duration-200"
            >
              {activeTab === "researcher" && (
                <div className="w-full h-full retro-terminal scanlines rounded-xl shadow-2xl p-6 font-mono text-sm leading-relaxed overflow-hidden border border-green-500/30">
                  <div className="flex items-center justify-between mb-4 border-b border-green-500/30 pb-2">
                    <span className="text-xs text-green-400">
                      TERMINAL SESSION: ROOT
                    </span>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                  </div>
                  <div className="h-full overflow-hidden">
                    <p>
                      <span className="text-green-300">dimas@sys:~$</span>{" "}
                      init_sequence --cyber-security
                    </p>
                    <p className="text-gray-400 my-1">[INFO] Loading modules...</p>
                    <p className="text-gray-400">
                      [INFO] Connecting to secure server...
                    </p>
                    <p className="my-1">
                      <span className="text-green-300">dimas@sys:~$</span> whoami
                    </p>
                    <p className="text-emerald-400 font-bold mb-4">root</p>

                    <p>
                      <span className="text-green-300">dimas@sys:~$</span> cat
                      talents.txt
                    </p>
                    <div className="pl-4 border-l-2 border-green-500/20 my-2 text-green-200/80">
                      <p>• Web Exploitation</p>
                      <p>• Reverse Engineering</p>
                      <p>• Cryptography</p>
                      <p>• OSINT</p>
                    </div>

                    <p className="mt-4">
                      <span className="text-green-300">dimas@sys:~$</span>{" "}
                      ./run_exploits.sh
                    </p>
                    <p className="text-yellow-400">Analysis complete.</p>

                    <div className="mt-8 p-4 border border-green-500/20 bg-green-500/5 rounded">
                      <p className="text-xs text-green-400 mb-2">SYSTEM STATUS</p>
                      <div className="w-full bg-green-900/30 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[82%]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "builder" && (
                <div className="relative w-full max-w-md bg-card rounded-2xl p-1 border border-primary/30 shadow-[var(--elevation-2)]">
                  <div className="bg-background rounded-xl p-6 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-primary opacity-10">
                      <Github className="w-32 h-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Github className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          @dimasma0305
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Open source security tooling
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { v: "35+", l: "Repos" },
                        { v: "220+", l: "Stars" },
                        { v: "320+", l: "Followers" },
                      ].map((m) => (
                        <div
                          key={m.l}
                          className="rounded-lg border border-border bg-muted/40 p-3 text-center"
                        >
                          <div className="font-mono text-xl font-bold text-foreground">
                            {m.v}
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {m.l}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Top languages
                      </div>
                      {[
                        { n: "Python", w: "92%", c: "bg-primary" },
                        { n: "Go", w: "64%", c: "bg-primary/80" },
                        { n: "PHP", w: "46%", c: "bg-primary/60" },
                        { n: "TypeScript", w: "34%", c: "bg-primary/45" },
                      ].map((lng) => (
                        <div key={lng.n} className="flex items-center gap-3">
                          <span className="w-20 shrink-0 text-xs text-muted-foreground">
                            {lng.n}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${lng.c}`}
                              style={{ width: lng.w }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pentester" && (
                <div className="w-full max-w-md bg-card rounded-2xl p-1 border border-primary/30 shadow-[var(--elevation-2)]">
                  <div className="bg-background rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-primary opacity-10">
                      <ScanSearch className="w-32 h-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ScanSearch className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Source Code Review
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          AI-assisted, exploitable-first
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {[
                        "Whole codebase reviewed by an AI agent",
                        "Only the genuinely exploitable bugs flagged",
                        "A ready-to-merge fix for every finding",
                        "Plain-English report in PDF and Markdown",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm text-foreground"
                        >
                          <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-muted-foreground">
                        From{" "}
                        <span className="font-bold text-foreground">$99</span> /
                        project
                      </span>
                      <Link
                        href="/services"
                        className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                      >
                        See the service
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Parallax>
        </div>

      </div>

      {/* Scroll hint — seated above the hill silhouette; static, no
          perpetual animation. Positioned against the full-height section so
          it sits on the horizon instead of crowding the social icons. */}
      <Link
        href="#about"
        className="group absolute bottom-[7vh] left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Scroll to content"
      >
        <span className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <Sunrise aria-hidden className="h-3.5 w-3.5" />
          Scroll through the day
          <Moon aria-hidden className="h-3 w-3" />
        </span>
        <ChevronDown className="w-5 h-5 transition-transform duration-[var(--dur-base)] group-hover:translate-y-0.5" />
      </Link>
    </section>
  );
}
