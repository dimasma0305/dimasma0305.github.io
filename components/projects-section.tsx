"use client";

import { useState, useEffect } from "react";
import {
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const projects = [
  {
    title: "CTF-XSS-BOT",
    description:
      "Craft engaging XSS challenges effortlessly with CTF-XSS-BOT. This template simplifies setting up an environment for Capture The Flag competitions.",
    tags: ["CTF", "XSS", "Puppeteer", "Containerization"],
    github: "https://github.com/dimasma0305/CTF-XSS-BOT",
    demo: null,
    date: "Aug 2023 - Present",
  },
  {
    title: "VWA-Wazuh (Mini Lab SOC)",
    description:
      "An application consisting of several vulnerable web applications that are integrated with Wazuh.",
    tags: ["Security", "Wazuh", "IDS", "Database Security"],
    github: "https://github.com/dimasma0305/VWA-Wazuh",
    demo: null,
    date: "Mar 2023 - Present",
  },
  {
    title: "Dockerized Wordpress Debug Setup",
    description:
      "A Dockerized WordPress development environment with two configurations, one using Nginx and the other using Apache. Includes Xdebug for debugging.",
    tags: ["Docker", "Containerization", "PHP", "WordPress"],
    github: "https://github.com/dimasma0305/dockerized-wordpress-debug-setup",
    demo: null,
    date: "Dec 2023 - Present",
  },
  {
    title: "CTF Challenge Difficulty Calculator",
    description:
      "A Next.js program designed to assess the difficulty of a Capture The Flag (CTF) challenge more efficiently.",
    tags: ["CTF", "Next.js", "JavaScript"],
    github:
      "https://github.com/dimasma0305/ctf-challenge-difficulty-calculator",
    demo: null,
    date: "Nov 2023 - Present",
  },
  {
    title: "CTFIFY",
    description:
      "A command-line tool designed to simplify the process of downloading and managing Capture The Flag (CTF) challenges.",
    tags: ["CTF", "Go", "CLI"],
    github: "https://github.com/dimasma0305/ctfify",
    demo: null,
    date: "Jan 2023 - Present",
  },
  {
    title: "CTF Assistant",
    description:
      "Discord bot for managing CTF written in Bun programming language.",
    tags: ["JavaScript", "Discord", "TypeScript", "Databases"],
    github: "https://github.com/dimasma0305/ctf-assistant",
    demo: null,
    date: "Oct 2022 - Present",
  },
  {
    title: "Paradigmctf BlockChain Infra Extended",
    description:
      "Setup from Paradigm CTF blockchain challenges with new features, including a web interface and additional challenge setup.",
    tags: ["Solidity", "Python", "Blockchain"],
    github: "https://github.com/TCP1P/Paradigmctf-BlockChain-Infra-Extended",
    demo: null,
    date: "Nov 2023 - Present",
    team: "TCP1P",
  },
  {
    title: "TCP1P Theme",
    description:
      "The TCP1P Theme is a CTFd theme built based on the CTFd core-beta theme.",
    tags: ["HTML", "Python", "Jinja", "Bootstrap"],
    github: "https://github.com/TCP1P/tcp1p-theme",
    demo: null,
    date: "Nov 2023 - Present",
    team: "TCP1P",
  },
  {
    title: "Cyber-Security-Learning-Resources",
    description: "Material untuk belajar Cyber Security.",
    tags: ["Learning", "Cybersecurity", "Resources"],
    github: "https://github.com/dimasma0305/Cyber-Security-Learning-Resources",
    demo: null,
    date: "Mar 2022 - Present",
  },
];

export function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visibleProjects, setVisibleProjects] = useState(1); // Start with 1 for mobile

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < maxIndex) {
      nextSlide();
    }
    if (isRightSwipe && currentIndex > 0) {
      prevSlide();
    }
  };

  // Responsive visible projects calculation
  useEffect(() => {
    const updateVisibleProjects = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleProjects(3); // lg: 3 projects
      } else if (width >= 768) {
        setVisibleProjects(2); // md: 2 projects
      } else {
        setVisibleProjects(1); // sm: 1 project
      }
    };

    updateVisibleProjects();
    window.addEventListener("resize", updateVisibleProjects);
    return () => window.removeEventListener("resize", updateVisibleProjects);
  }, []);

  // Reset currentIndex when visibleProjects changes to prevent out-of-bounds
  useEffect(() => {
    const maxIndex = Math.max(0, projects.length - visibleProjects);
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleProjects, currentIndex]);

  const maxIndex = Math.max(0, projects.length - visibleProjects);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <section id="projects" className="section-y scroll-mt-20">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Featured Projects</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Open-source tools and projects I&apos;ve built
          </p>
        </div>

        <div className="relative projects-slider">
          <div
            className="overflow-hidden touch-pan-y projects-slider-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex projects-slider-container"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleProjects)}%)`,
                transition: "transform 400ms ease-out",
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 px-3 projects-card ${
                    visibleProjects === 1
                      ? "w-full"
                      : visibleProjects === 2
                        ? "w-1/2"
                        : "w-1/3"
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="h-full">
                    <Card className="h-full overflow-hidden glass-card transition-all duration-300 ease-out flex flex-col">
                      <CardHeader className="relative pb-2 border-b border-muted flex-shrink-0">
                        <CardTitle className="text-xl">
                          <div className="flex items-center gap-2">
                            {project.title}
                            {hoveredCard === index && (
                              <span>
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                              </span>
                            )}
                          </div>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 flex-grow flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-primary/15 hover:bg-primary/25 transition-colors duration-200 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm text-muted-foreground mt-auto">
                          <p>{project.date}</p>
                          {project.team && (
                            <p className="mt-1">
                              Associated with {project.team}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 border-t border-muted flex-shrink-0 mt-auto">
                        <Link
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                          >
                            <Github className="w-4 h-4" />
                            GitHub
                          </Button>
                        </Link>
                        {project.demo && (
                          <Link
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1 border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Demo
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Improved mobile positioning */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-0 z-10 transform -translate-y-1/2 bg-background/80 top-1/2 hover:bg-background backdrop-blur-sm projects-nav-button transition-all duration-200 ease-out"
              onClick={prevSlide}
              aria-label="Previous project"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {currentIndex < maxIndex && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-0 z-10 transform -translate-y-1/2 bg-background/80 top-1/2 hover:bg-background backdrop-blur-sm projects-nav-button transition-all duration-200 ease-out"
              onClick={nextSlide}
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Pagination Dots - Updated calculation */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({
            length: Math.ceil(projects.length / visibleProjects),
          }).map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-2 h-2 md:w-3 md:h-3 p-0 rounded-full transition-all duration-300 ease-out projects-pagination-dot ${
                index === Math.floor(currentIndex / visibleProjects)
                  ? "bg-primary scale-110 shadow-lg shadow-primary/30"
                  : "bg-muted hover:bg-primary/50 hover:scale-105"
              }`}
              onClick={() =>
                setCurrentIndex(Math.min(index * visibleProjects, maxIndex))
              }
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile swipe hint */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm text-muted-foreground">Swipe to navigate</p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="https://github.com/dimasma0305?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="gap-2 border-2 border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              View All Projects
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
