"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Github, Linkedin, Mail, Twitter, Gamepad2, BookOpen, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation"
import { useInView } from "react-intersection-observer"
import Particles from "react-particles"
import { loadSlim } from "tsparticles-slim"
import type { Engine } from "tsparticles-engine"
import { withBasePath } from "@/lib/utils"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("hacker")
  const [particlesContainer, setParticlesContainer] = useState<Engine | null>(null)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine)
    setParticlesContainer(engine)
  }

  const tabs = [
    {
      id: "hacker",
      label: "Hacker",
      icon: <Shield className="w-5 h-5" />,
      color: "neon-text-green",
    },
    {
      id: "gamer",
      label: "Gamer",
      icon: <Gamepad2 className="w-5 h-5" />,
      color: "neon-text-blue",
    },
    {
      id: "manga",
      label: "Manga Reader",
      icon: <BookOpen className="w-5 h-5" />,
      color: "neon-text-pink",
    },
  ]

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
        { label: "Gaming Hours", value: "IDK" },
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
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black to-background py-24"
      ref={containerRef}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: ["#9c27b0", "#2196f3", "#ff5722"],
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: true,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      <motion.div style={{ opacity, y }} className="container relative z-10 px-4 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 mb-4 text-sm font-medium rounded-full bg-primary/20 text-primary">
                <TypeAnimation
                  sequence={["CTF Player", 1000, "Security Researcher", 1000, "Gamer", 1000, "Manga Reader", 1000]}
                  wrapper="span"
                  speed={50}
                  repeat={Number.POSITIVE_INFINITY}
                />
              </div>

              <h1
                className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl glitch"
                data-text="Dimas Maulana"
              >
                <span
                  className={`${activeTab === "hacker" ? "neon-text-green" : ""} ${activeTab === "gamer" ? "neon-text-blue" : ""} ${activeTab === "manga" ? "neon-text-pink" : ""}`}
                >
                  Dimas Maulana
                </span>
              </h1>

              <h2 className="text-2xl font-medium text-muted-foreground">
                {tabContent[activeTab as keyof typeof tabContent].subtitle}
              </h2>
            </div>

            <p className="text-xl text-muted-foreground">
              {tabContent[activeTab as keyof typeof tabContent].description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex p-1 space-x-1 rounded-full bg-muted">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full ${
                      activeTab === tab.id
                        ? "bg-background text-primary shadow-lg"
                        : "hover:bg-background/50 text-muted-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {tabContent[activeTab as keyof typeof tabContent].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-4 text-center rounded-lg bg-background/50 backdrop-blur-sm"
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="#projects">
                <Button
                  size="lg"
                  className="gap-2 transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
                >
                  View Projects
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#blog">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                  Read My Blog
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Link href="https://github.com/dimasma0305" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="GitHub"
                  className="transition-transform hover:text-primary hover:scale-110"
                >
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://www.linkedin.com/in/solderet/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="LinkedIn"
                  className="transition-transform hover:text-primary hover:scale-110"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://twitter.com/dimasma__" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Twitter"
                  className="transition-transform hover:text-primary hover:scale-110"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="mailto:dimasmaulana0305@gmail.com">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Email"
                  className="transition-transform hover:text-primary hover:scale-110"
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative h-[500px] w-full rounded-lg overflow-hidden"
              >
                {activeTab === "hacker" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md p-6 rounded-lg retro-terminal scanlines">
                      <div className="mb-4 text-sm">
                        <span className="text-green-400">root@dimasma:~#</span>{" "}
                        <span className="cursor-blink">whoami</span>
                      </div>
                      <div className="mb-4">
                        <pre className="text-sm">
                          {`
 ____  _                     __  __            _                 
|  _ \\(_)_ __ ___   __ _ ___| \\/  | __ _ _   _| | __ _ _ __   __ _ 
| | | | | '_ \` _ \\ / _\` / __| |\\/| |/ _\` | | | | |/ _\` | '_ \\ / _\` |
| |_| | | | | | | | (_| \\__ \\ |  | | (_| | |_| | | (_| | | | | (_| |
|____/|_|_| |_| |_|\\__,_|___/_|  |_|\\__,_|\\__,_|_|\\__,_|_| |_|\\__,_|
                                                                  
CTF Player | Security Researcher | Bug Hunter
`}
                        </pre>
                      </div>
                      <div className="mb-4 text-sm">
                        <span className="text-green-400">root@dimasma:~#</span> ls -la skills/
                      </div>
                      <div className="mb-4 text-sm">
                        <pre>
                          {`
total 42
drwxr-xr-x  2 dimas dimas 4096 May 22 06:23 .
drwxr-xr-x 10 dimas dimas 4096 May 22 06:23 ..
-rwxr-xr-x  1 dimas dimas 8192 May 22 06:23 web_security.sh
-rwxr-xr-x  1 dimas dimas 6144 May 22 06:23 reverse_engineering.py
-rwxr-xr-x  1 dimas dimas 5120 May 22 06:23 binary_exploitation.c
-rwxr-xr-x  1 dimas dimas 4096 May 22 06:23 cryptography.rb
-rwxr-xr-x  1 dimas dimas 3072 May 22 06:23 forensics.go
`}
                        </pre>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-400">root@dimasma:~#</span>{" "}
                        <span className="cursor-blink">./start_hacking.sh</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "gamer" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                    <div className="w-full max-w-md p-4 game-card">
                      <div className="mb-4 text-center">
                        <h3 className="mb-2 text-xl font-bold text-blue-400">PLAYER STATS</h3>
                        <div className="w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full">
                          <Image
                            src="https://avatars.githubusercontent.com/u/92920739"
                            alt="Dimas Maulana Avatar"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <p className="text-lg font-semibold">DimasMa</p>
                        <p className="text-xs text-blue-300">Level 42 Cyber Mage</p>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">HP</span>
                          <span className="text-xs">420/420</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300" 
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">MP</span>
                          <span className="text-xs">340/340</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300" 
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">XP</span>
                          <span className="text-xs">8,742 / 10,000</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300" 
                            style={{ width: "87%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-2 text-center rounded-lg bg-blue-900/50">
                          <div className="text-lg font-bold text-blue-400">STR</div>
                          <div className="text-base">85</div>
                        </div>
                        <div className="p-2 text-center rounded-lg bg-blue-900/50">
                          <div className="text-lg font-bold text-blue-400">INT</div>
                          <div className="text-base">95</div>
                        </div>
                        <div className="p-2 text-center rounded-lg bg-blue-900/50">
                          <div className="text-lg font-bold text-blue-400">DEX</div>
                          <div className="text-base">78</div>
                        </div>
                        <div className="p-2 text-center rounded-lg bg-blue-900/50">
                          <div className="text-lg font-bold text-blue-400">LCK</div>
                          <div className="text-base">42</div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <div className="p-1.5 text-center rounded-full achievement-badge">
                          <Gamepad2 className="w-5 h-5 text-black" />
                        </div>
                        <div className="p-1.5 text-center rounded-full achievement-badge">
                          <Shield className="w-5 h-5 text-black" />
                        </div>
                        <div className="p-1.5 text-center rounded-full achievement-badge">
                          <BookOpen className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "manga" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-900/50 to-purple-900/50">
                    <div className="w-full max-w-md manga-panel bg-white">
                      <div className="p-6">
                        <div className="mb-4 text-center">
                          <h3 className="mb-2 text-2xl font-bold text-black">MANGA COLLECTION</h3>
                        </div>

                        <div className="mb-6 speech-bubble">
                          <p className="text-black">
                            "In the world of manga, I find it interesting to see how the characters and stories are created."
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="relative h-24 overflow-hidden bg-gray-200 rounded-md shadow-md">
                              <Image
                                src={withBasePath(`/placeholder.svg?height=96&width=64&text=Manga ${i}`)}
                                alt={`Manga ${i}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="pixel-divider"></div>

                        <div className="mt-4 text-center">
                          <p className="text-sm text-black">Favorite Genres:</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-2">
                            <span className="px-2 py-1 text-xs text-white bg-pink-500 rounded-full">Shonen</span>
                            <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Action</span>
                            <span className="px-2 py-1 text-xs text-white bg-purple-500 rounded-full">Fantasy</span>
                            <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Comedy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link href="#about">
            <Button variant="ghost" className="mb-8 animate-bounce" aria-label="Scroll down">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
