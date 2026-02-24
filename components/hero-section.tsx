"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Github, Linkedin, Mail, Twitter, Gamepad2, BookOpen, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { TypeAnimation } from "react-type-animation"

const Particles = dynamic(() => import("react-particles"), { ssr: false })
import { loadSlim } from "tsparticles-slim"
import type { Engine } from "tsparticles-engine"
import { withBasePath } from "@/lib/utils"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("hacker")
  const [isParticlesLoaded, setIsParticlesLoaded] = useState(false)

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine)
    setIsParticlesLoaded(true)
  }

  const tabs = [
    {
      id: "hacker",
      label: "Hacker",
      icon: <Shield className="w-5 h-5" />,
      color: "text-green-500",
      borderColor: "border-green-500/50"
    },
    {
      id: "gamer",
      label: "Gamer",
      icon: <Gamepad2 className="w-5 h-5" />,
      color: "text-blue-500",
      borderColor: "border-blue-500/50"
    },
    {
      id: "manga",
      label: "Manga Reader",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-pink-500",
      borderColor: "border-pink-500/50"
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-background to-background pt-20"
      id="home"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" },
                onClick: { enable: true, mode: "push" },
                resize: true,
              },
              modes: {
                grab: { distance: 140, links: { opacity: 0.5 } },
                push: { quantity: 4 },
              },
            },
            particles: {
              color: { value: ["#22c55e", "#3b82f6", "#ec4899"] },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 1,
                straight: false,
              },
              number: {
                density: { enable: true, area: 800 },
                value: 60,
              },
              opacity: { value: 0.3 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          className={`absolute inset-0 transition-opacity duration-1000 ${isParticlesLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0 pointer-events-none" />
      </div>

      <div className="container relative z-10 px-4 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-secondary/50 backdrop-blur-sm border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <TypeAnimation
                  sequence={[
                    "CTF Player", 1500,
                    "Security Researcher", 1500,
                    "Gamer", 1500,
                    "Manga Reader", 1500
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="text-foreground"
                />
              </div>

              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                <span className="block" data-text="Dimas Maulana">
                  Dimas Maulana
                </span>
              </h1>

              <motion.p
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl sm:text-2xl text-muted-foreground font-light"
              >
                {tabContent[activeTab as keyof typeof tabContent].subtitle}
              </motion.p>
            </motion.div>

            <motion.p
              key={`${activeTab}-desc`}
              variants={fadeIn}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed glass p-4 rounded-xl"
            >
              {tabContent[activeTab as keyof typeof tabContent].description}
            </motion.p>

            {/* Tabs */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-full border
                    ${activeTab === tab.id
                      ? `${tab.borderColor} bg-background/80 shadow-lg`
                      : "border-transparent bg-secondary/50 hover:bg-secondary hover:scale-105"
                    }
                  `}
                >
                  <span className={activeTab === tab.id ? tab.color : "text-muted-foreground"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-3 gap-4"
            >
              <AnimatePresence mode="wait">
                {tabContent[activeTab as keyof typeof tabContent].stats.map((stat, index) => (
                  <motion.div
                    key={`${activeTab}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass p-4 rounded-xl text-center hover:bg-white/5 transition-colors"
                  >
                    <div className={`text-2xl font-bold mb-1 ${tabs.find(t => t.id === activeTab)?.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="#projects" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                  View Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/blog" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full group glass hover:bg-white/10 border-white/20">
                  Read My Blog
                  <BookOpen className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-4 text-muted-foreground">
              <Link href="https://github.com/dimasma0305" target="_blank">
                <Button variant="ghost" size="icon" className="hover:text-white hover:bg-white/10 hover:scale-110 transition-all rounded-full">
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://www.linkedin.com/in/solderet/" target="_blank">
                <Button variant="ghost" size="icon" className="hover:text-blue-400 hover:bg-blue-400/10 hover:scale-110 transition-all rounded-full">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://twitter.com/dimasma__" target="_blank">
                <Button variant="ghost" size="icon" className="hover:text-sky-400 hover:bg-sky-400/10 hover:scale-110 transition-all rounded-full">
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="mailto:dimasmaulana0305@gmail.com">
                <Button variant="ghost" size="icon" className="hover:text-red-400 hover:bg-red-400/10 hover:scale-110 transition-all rounded-full">
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Visuals */}
          <div className="relative hidden lg:block h-[600px] perspective-1000">
            <AnimatePresence mode="wait">
              {activeTab === "hacker" && (
                <motion.div
                  key="hacker"
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <div className="w-full h-full retro-terminal scanlines rounded-xl shadow-2xl p-6 font-mono text-sm leading-relaxed overflow-hidden border border-green-500/30">
                    <div className="flex items-center justify-between mb-4 border-b border-green-500/30 pb-2">
                      <span className="text-xs text-green-700">TERMINAL SESSION: ROOT</span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                    </div>
                    <div className="h-full overflow-hidden">
                      <p><span className="text-green-300">dimas@sys:~$</span> init_sequence --cyber-security</p>
                      <p className="text-gray-500 my-1">[INFO] Loading modules...</p>
                      <p className="text-gray-500">[INFO] Connecting to secure server...</p>
                      <p className="my-1"><span className="text-green-300">dimas@sys:~$</span> whoami</p>
                      <p className="text-emerald-400 font-bold mb-4">root</p>

                      <p><span className="text-green-300">dimas@sys:~$</span> cat talents.txt</p>
                      <div className="pl-4 border-l-2 border-green-500/20 my-2 text-green-200/80">
                        <p>• Web Exploitation</p>
                        <p>• Reverse Engineering</p>
                        <p>• Cryptography</p>
                        <p>• OSINT</p>
                      </div>

                      <p className="mt-4"><span className="text-green-300">dimas@sys:~$</span> ./run_exploits.sh</p>
                      <p className="text-yellow-400 animate-pulse">Running analysis on target...</p>

                      <div className="mt-8 p-4 border border-green-500/20 bg-green-500/5 rounded">
                        <p className="text-xs text-green-600 mb-2">SYSTEM STATUS</p>
                        <div className="w-full bg-green-900/30 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "loop" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "gamer" && (
                <motion.div
                  key="gamer"
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 2 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 5, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative w-full max-w-md bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-1 border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                    <div className="bg-slate-950 rounded-xl p-6 h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Gamepad2 className="w-32 h-32" />
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-blue-600 p-0.5 shadow-lg overflow-hidden">
                          <Image
                            src="https://avatars.githubusercontent.com/u/92920739"
                            width={80}
                            height={80}
                            alt="Avatar"
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">DimasMa</h3>
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-500 text-black">
                            LVL 99
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                            <span>HP</span>
                            <span>2500/2500</span>
                          </div>
                          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-full" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                            <span>MP</span>
                            <span>850/850</span>
                          </div>
                          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 w-[85%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                            <span>EXP</span>
                            <span>98.5%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 w-[98.5%] animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                          <div className="text-xs text-gray-400">Class</div>
                          <div className="font-bold text-blue-300">Cyber Mage</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                          <div className="text-xs text-gray-400">Guild</div>
                          <div className="font-bold text-purple-300">Sekai</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "manga" && (
                <motion.div
                  key="manga"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-full max-w-md bg-white text-black p-6 rounded-sm shadow-[15px_15px_0px_rgba(0,0,0,1)] border-4 border-black rotate-2 relative">
                    <div className="absolute -top-6 -right-6 bg-yellow-400 border-4 border-black px-4 py-2 font-bold transform rotate-6 shadow-[4px_4px_0px_rgba(0,0,255,1)]">
                      OTAKU MODE
                    </div>

                    <h3 className="text-3xl font-black italic tracking-tighter mb-4 border-b-4 border-black pb-2">
                      MY COLLECTION
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-32 bg-gray-200 border-2 border-black relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl uppercase opacity-20 group-hover:opacity-100 transition-opacity z-10">Action</div>
                        <div className="absolute inset-0 bg-blue-500 mix-blend-multiply opacity-0 group-hover:opacity-40 transition-opacity"></div>
                        <Image
                          src={withBasePath("/placeholder.svg?height=150&width=200&text=ACTION")}
                          width={200}
                          height={150}
                          alt="Manga"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                      <div className="h-32 bg-gray-200 border-2 border-black relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl uppercase opacity-20 group-hover:opacity-100 transition-opacity z-10">Sci-Fi</div>
                        <div className="absolute inset-0 bg-purple-500 mix-blend-multiply opacity-0 group-hover:opacity-40 transition-opacity"></div>
                        <Image
                          src={withBasePath("/placeholder.svg?height=150&width=200&text=SCI-FI")}
                          width={200}
                          height={150}
                          alt="Manga"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-black text-white p-4 font-bold rounded-sm bubble relative">
                      "I read over 100+ chapters a week! It's not an addiction, it's a lifestyle!"
                      <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-black border-r-[10px] border-r-transparent"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <Link href="#about">
            <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 bg-current rounded-full"
                />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
