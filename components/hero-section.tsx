"use client";

import { useState } from "react";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Gamepad2,
  BookOpen,
  Shield,
  ChevronDown,
  Sunrise,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/parallax";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("hacker");

  const tabs = [
    { id: "hacker", label: "Hacker", icon: <Shield className="w-5 h-5" /> },
    { id: "gamer", label: "Gamer", icon: <Gamepad2 className="w-5 h-5" /> },
    { id: "manga", label: "Manga Reader", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const tabContent = {
    hacker: {
      title: "Cybersecurity Expert",
      subtitle: "CTF Player & Security Researcher",
      description:
        "Exploring the world of cybersecurity, Linux, and CTF competitions. Creating tools and resources to help secure the digital world.",
      stats: [
        { label: "Years of Experience", value: "3+" },
        { label: "Security Tools", value: "10+" },
        { label: "CVEs", value: "172+" },
      ],
    },
    gamer: {
      title: "Passionate Gamer",
      subtitle: "Strategy & RPG Enthusiast",
      description:
        "When I'm not hacking systems, I'm conquering virtual worlds. Gaming is not just a hobby, it's a way to sharpen strategic thinking and problem-solving skills.",
      stats: [
        { label: "Games Completed", value: "30+" },
        { label: "Achievement Score", value: "300+" },
        { label: "Gaming Hours", value: "1k+" },
      ],
    },
    manga: {
      title: "Manga Aficionado",
      subtitle: "Collector & Reader",
      description:
        "A manga enjoyer. I appreciate the artistry and storytelling that brings characters and worlds to life through this unique medium.",
      stats: [
        { label: "Manga Read", value: "100+" },
        { label: "Hours Spent", value: "100+" },
        { label: "Favorite Series", value: "10+" },
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
                className="text-xl sm:text-2xl text-muted-foreground font-light animate-in fade-in duration-200"
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
              {activeTab === "hacker" && (
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

              {activeTab === "gamer" && (
                <div className="relative w-full max-w-md bg-card rounded-2xl p-1 border border-primary/30 shadow-[var(--elevation-2)]">
                  <div className="bg-background rounded-xl p-6 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-primary opacity-10">
                      <Gamepad2 className="w-32 h-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-xl bg-primary p-0.5 shadow-lg overflow-hidden">
                        <Image
                          src="https://avatars.githubusercontent.com/u/92920739"
                          width={80}
                          height={80}
                          alt="Avatar"
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">DimasMa</h3>
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">
                          LVL 99
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                          <span>HP</span>
                          <span>2500/2500</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary w-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                          <span>MP</span>
                          <span>850/850</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary/70 w-[85%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                          <span>EXP</span>
                          <span>98.5%</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary/50 w-[98.5%]" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
                        <div className="text-xs text-muted-foreground">Class</div>
                        <div className="font-bold text-primary">Cyber Mage</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
                        <div className="text-xs text-muted-foreground">Guild</div>
                        <div className="font-bold text-primary">Sekai</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "manga" && (
                <div className="w-full max-w-md bg-card text-foreground p-6 rounded-lg shadow-[8px_8px_0px_hsl(var(--primary)/0.18)] border border-border rotate-1 relative">
                  <div className="absolute -top-6 -right-6 bg-primary text-primary-foreground border-2 border-primary/50 px-4 py-2 font-bold transform rotate-6 shadow-[3px_3px_0px_hsl(var(--primary)/0.3)]">
                    OTAKU MODE
                  </div>

                  <h3 className="text-3xl font-black italic tracking-tighter mb-4 border-b-2 border-border pb-2">
                    MY COLLECTION
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {["Action", "Sci-Fi", "Seinen", "Mystery"].map((genre) => (
                      <div
                        key={genre}
                        className="flex h-16 items-center justify-center rounded-md border border-border bg-muted/60 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {genre}
                      </div>
                    ))}
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
