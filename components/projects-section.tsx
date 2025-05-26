"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Github, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const projects = [
  {
    title: "CTF-XSS-BOT",
    description:
      "Craft engaging XSS challenges effortlessly with CTF-XSS-BOT. This template simplifies setting up an environment for Capture The Flag competitions.",
    tags: ["CTF", "XSS", "Puppeteer", "Containerization"],
    github: "https://github.com/dimasma0305/CTF-XSS-BOT",
    demo: null,
    date: "Aug 2023 - Present",
    level: 42,
    xp: 8500,
  },
  {
    title: "VWA-Wazuh (Mini Lab SOC)",
    description: "An application consisting of several vulnerable web applications that are integrated with Wazuh.",
    tags: ["Security", "Wazuh", "IDS", "Database Security"],
    github: "https://github.com/dimasma0305/VWA-Wazuh",
    demo: null,
    date: "Mar 2023 - Present",
    level: 38,
    xp: 7600,
  },
  {
    title: "Dockerized Wordpress Debug Setup",
    description:
      "A Dockerized WordPress development environment with two configurations, one using Nginx and the other using Apache. Includes Xdebug for debugging.",
    tags: ["Docker", "Containerization", "PHP", "WordPress"],
    github: "https://github.com/dimasma0305/dockerized-wordpress-debug-setup",
    demo: null,
    date: "Dec 2023 - Present",
    level: 35,
    xp: 7000,
  },
  {
    title: "CTF Challenge Difficulty Calculator",
    description:
      "A Next.js program designed to assess the difficulty of a Capture The Flag (CTF) challenge more efficiently.",
    tags: ["CTF", "Next.js", "JavaScript"],
    github: "https://github.com/dimasma0305/ctf-challenge-difficulty-calculator",
    demo: null,
    date: "Nov 2023 - Present",
    level: 31,
    xp: 6200,
  },
  {
    title: "CTFIFY",
    description:
      "A command-line tool designed to simplify the process of downloading and managing Capture The Flag (CTF) challenges.",
    tags: ["CTF", "Go", "CLI"],
    github: "https://github.com/dimasma0305/ctfify",
    demo: null,
    date: "Jan 2023 - Present",
    level: 45,
    xp: 9000,
  },
  {
    title: "CTF Assistant",
    description: "Discord bot for managing CTF written in Bun programming language.",
    tags: ["JavaScript", "Discord", "TypeScript", "Databases"],
    github: "https://github.com/dimasma0305/ctf-assistant",
    demo: null,
    date: "Oct 2022 - Present",
    level: 39,
    xp: 7800,
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
    level: 36,
    xp: 7200,
  },
  {
    title: "TCP1P Theme",
    description: "The TCP1P Theme is a CTFd theme built based on the CTFd core-beta theme.",
    tags: ["HTML", "Python", "Jinja", "Bootstrap"],
    github: "https://github.com/TCP1P/tcp1p-theme",
    demo: null,
    date: "Nov 2023 - Present",
    team: "TCP1P",
    level: 33,
    xp: 6600,
  },
  {
    title: "Cyber-Security-Learning-Resources",
    description: "Material untuk belajar Cyber Security.",
    tags: ["Learning", "Cybersecurity", "Resources"],
    github: "https://github.com/dimasma0305/Cyber-Security-Learning-Resources",
    demo: null,
    date: "Mar 2022 - Present",
    level: 47,
    xp: 9400,
  },
]

export function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: carouselRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  const visibleProjects = 3
  const maxIndex = Math.max(0, projects.length - visibleProjects)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (hoveredCard === null) {
        // Only auto-scroll if no card is being hovered
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= maxIndex) {
            return 0
          }
          return prevIndex + 1
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [maxIndex, hoveredCard])

  return (
    <div className="py-20 bg-gradient-to-b from-background to-black" id="projects">
      <motion.div ref={carouselRef} style={{ opacity, scale }} className="container px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tight neon-text-blue">Featured Projects</h2>
            <p className="mt-4 text-xl text-muted-foreground">Level up your knowledge with my latest creations</p>
          </motion.div>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-all duration-500 ease-in-out"
              initial={{ x: 0 }}
              animate={{ x: `-${currentIndex * (100 / visibleProjects)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  className={`w-full px-3 md:w-1/2 lg:w-1/3 flex-shrink-0`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <Card className="h-full overflow-hidden game-card">
                    <CardHeader className="relative pb-2 border-b border-muted">
                      <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                        LVL {project.level}
                      </div>
                      <CardTitle className="text-xl neon-text">
                        <div className="flex items-center gap-2">
                          {project.title}
                          {hoveredCard === index && (
                            <motion.div
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "loop",
                              }}
                            >
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            </motion.div>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">XP</span>
                          <span className="text-xs">{project.xp} / 10000</span>
                        </div>
                        <div className="xp-bar">
                          <div className="xp-bar-fill" style={{ width: `${(project.xp / 10000) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-primary/20 hover:bg-primary/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{project.date}</p>
                        {project.team && <p className="mt-1">Associated with {project.team}</p>}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 border-t border-muted">
                      <Link href={project.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1 border-primary/50 hover:border-primary hover:bg-primary/10"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </Button>
                      </Link>
                      {project.demo && (
                        <Link href={project.demo} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 border-secondary/50 hover:border-secondary hover:bg-secondary/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Demo
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 transform -translate-y-1/2 bg-background/80 top-1/2 hover:bg-background"
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
              className="absolute right-0 z-10 transform -translate-y-1/2 bg-background/80 top-1/2 hover:bg-background"
              onClick={nextSlide}
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.ceil(projects.length / visibleProjects) }).map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-3 h-3 p-0 mx-1 rounded-full ${
                index === Math.floor(currentIndex / visibleProjects) ? "bg-primary" : "bg-muted hover:bg-primary/50"
              }`}
              onClick={() => setCurrentIndex(index * visibleProjects)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="https://github.com/dimasma0305?tab=repositories" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="gap-2 border-2 border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              View All Projects
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
