"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Trophy, Users, Award, ChevronDown, Star, Zap, ExternalLink, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useInView } from "react-intersection-observer"
import confetti from "canvas-confetti"
import Image from "next/image"

const achievements = [
  {
    title: "1st Place",
    event: "idekCTF 2024",
    team: "P1G SEKAI",
    date: "August 2024",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    points: 5000,
    difficulty: "Legendary",
  },
  {
    title: "1st Place",
    event: "Backdoor CTF 2024",
    team: "Ada Indonesia Coy",
    date: "December 2024",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    points: 4800,
    difficulty: "Legendary",
  },
  {
    title: "1st Place",
    event: "Cyber Jawara International 2024",
    team: "TCP1P x SNI x MAGER",
    date: "October 2024",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    points: 4750,
    difficulty: "Legendary",
  },
  {
    title: "1st Place",
    event: "Seleknas Cyber Security 2024",
    team: "Team",
    date: "November 2024",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    issuer: "KEMNAKER",
    points: 4500,
    difficulty: "Epic",
  },
  {
    title: "1st Place",
    event: "Patchstack February 2025 Bug Bounty Program",
    team: "Individual",
    date: "February 2025",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    issuer: "Patchstack",
    points: 4200,
    difficulty: "Epic",
  },
  {
    title: "1st Place",
    event: "NCW 2023",
    team: "TEAM",
    date: "December 2023",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    issuer: "PETIR Cyber Security",
    points: 4000,
    difficulty: "Epic",
  },
  {
    title: "2nd Place",
    event: "TPCTF 2025",
    team: "Project Sekai",
    date: "March 2025",
    icon: <Award className="w-6 h-6 text-gray-400" />,
    points: 3800,
    difficulty: "Rare",
  },
  {
    title: "2nd Place",
    event: "ISITDTU CTF 2024 Finals Attack & Defense",
    team: "Project Sekai",
    date: "December 2024",
    icon: <Award className="w-6 h-6 text-gray-400" />,
    issuer: "ISITDTU",
    points: 3700,
    difficulty: "Rare",
  },
  {
    title: "2nd Place",
    event: "Patchstack Alliance CTF S02E01 - WordCamp Asia",
    team: "Individual",
    date: "February 2025",
    icon: <Award className="w-6 h-6 text-gray-400" />,
    issuer: "Patchstack",
    points: 3600,
    difficulty: "Rare",
  },
  {
    title: "2nd Place",
    event: "THE SAS CON CTF 2024",
    team: "P1G SEKAI",
    date: "October 2024",
    icon: <Award className="w-6 h-6 text-gray-400" />,
    issuer: "KASPERSKY",
    points: 3500,
    difficulty: "Rare",
  },
]

const teams = [
  {
    name: "P1G SEKAI",
    role: "Member",
    description: "A merging of Project Sekai and r3kapig",
    link: "https://ctftime.org/team/58979/",
    level: "80",
    members: "-",
    specialties: ["Web Security", "Binary Exploitation", "Cryptography", "Forensics", "Reverse Engineering", "Blockchain", "OSINT", "Mobile Security"],
  },
  {
    name: "Project Sekai",
    role: "Member",
    description: "SEKAI{I5_A_CTF_t3Am_w/_38+_mbRs,_p4r71CiP4t1ng_in_164+_c0nt3Stz}",
    link: "https://ctftime.org/team/58979/",
    level: "75",
    members: "-",
    specialties: ["Web Security", "Binary Exploitation", "Cryptography", "Forensics", "Reverse Engineering", "Blockchain", "OSINT", "Mobile Security"],
  },
  {
    name: "TCP1P",
    role: "Founder",
    description: "TCP1P is Indonesian CTF community dedicated to organizing engaging Capture The Flag events and collaborating with local competitions. Our mission is to elevate the quality of CTF challenges in Indonesia and foster a thriving cybersecurity ecosystem through knowledge sharing.",
    link: "https://github.com/TCP1P",
    level: "25",
    members: "-",
    specialties: ["Web Security", "Binary Exploitation", "Cryptography", "Forensics", "Reverse Engineering", "Blockchain", "OSINT", "Mobile Security"],
  },
  {
    name: "SKSD",
    role: "Member",
    description: "Indonesian CTF Team that rarely participate in CTF competitions in 2025",
    link: "https://ctftime.org/team/211952/",
    level: "70",
    members: "-",
    specialties: ["Web Security", "Binary Exploitation", "Cryptography", "Forensics", "Reverse Engineering", "Blockchain", "OSINT", "Mobile Security"],
  },
  {
    name: "HCS",
    role: "Member", 
    description: "CTF Team from ITS, often participate in CTF competitions on CTFTime",
    link: "https://ctftime.org/team/70159/",
    level: "40",
    members: "-",
    specialties: ["Web Security", "Binary Exploitation", "Cryptography", "Forensics", "Reverse Engineering", "Blockchain", "OSINT", "Mobile Security"],
  },
]

export function CTFSection() {
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null)
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  useEffect(() => {
    if (titleInView) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const colors = ["#9c27b0", "#2196f3", "#ff5722"]

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const frame = () => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) return

        confetti({
          particleCount: 2,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.2, 0.8), y: randomInRange(0.2, 0.4) },
          colors: [colors[Math.floor(Math.random() * colors.length)]],
          zIndex: 100,
          disableForReducedMotion: true,
        })

        requestAnimationFrame(frame)
      }

      frame()
    }
  }, [titleInView])

  const handleAchievementClick = (index: number) => {
    if (selectedAchievement === index) {
      setSelectedAchievement(null)
    } else {
      setSelectedAchievement(index)

      // Trigger confetti for the selected achievement
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF4500"],
        zIndex: 100,
        disableForReducedMotion: true,
      })
    }
  }

  const difficultyColors = {
    Legendary: "text-yellow-500 bg-yellow-500/20",
    Epic: "text-purple-500 bg-purple-500/20",
    Rare: "text-blue-500 bg-blue-500/20",
    Uncommon: "text-green-500 bg-green-500/20",
    Common: "text-gray-500 bg-gray-500/20",
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-black to-background overflow-x-hidden" id="ctf" ref={sectionRef}>
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYgMzBoLTZsMyAxMHoiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTMwIDMwaC02bDMgMTB6Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-[90rem] mx-auto">
        <motion.div 
          style={{ opacity, y }} 
          className="relative z-10 w-full px-4 sm:px-6 lg:px-8"
        >
          <div className="mb-16 text-center" ref={titleRef}>
            <motion.h2
              initial={{ opacity: 0, y: -15 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight neon-text-pink"
            >
              CTF Achievements
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-lg sm:text-xl text-muted-foreground"
            >
              Battle-tested in the digital arena
            </motion.p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold neon-text">Achievement Board</h3>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {achievements.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAchievementClick(index)}
                    className="cursor-pointer w-full"
                  >
                    <Card className={`relative overflow-hidden ${selectedAchievement === index ? "ring-2 ring-primary" : ""}`}>
                      <CardHeader className="space-y-1 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="shrink-0">{achievement.icon}</div>
                            <CardTitle className="text-base sm:text-lg truncate">
                              {achievement.title}
                            </CardTitle>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${difficultyColors[achievement.difficulty as keyof typeof difficultyColors]} shrink-0 text-xs whitespace-nowrap`}
                          >
                            {achievement.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1 text-sm">
                          <div className="truncate">
                            <strong className="text-muted-foreground">Event:</strong>{" "}
                            {achievement.event}
                          </div>
                          <div className="truncate">
                            <strong className="text-muted-foreground">Team:</strong>{" "}
                            {achievement.team}
                          </div>
                        </div>

                        {selectedAchievement === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pt-2 mt-2 border-t border-muted"
                          >
                            <div className="space-y-1 text-sm">
                              <div className="truncate">
                                <strong className="text-muted-foreground">Date:</strong>{" "}
                                {achievement.date}
                              </div>
                              {achievement.issuer && (
                                <div className="truncate">
                                  <strong className="text-muted-foreground">Issued by:</strong>{" "}
                                  {achievement.issuer}
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-2">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span className="text-yellow-500 text-xs">
                                  {achievement.points} XP
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <details className="group">
                  <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-primary hover:underline bg-primary/10 rounded-lg">
                    <span>View more achievements</span>
                    <span className="transition-transform group-open:rotate-180">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </summary>
                  <div className="grid gap-3 mt-4 grid-cols-1 sm:grid-cols-2 w-full">
                    {achievements.slice(6).map((achievement, index) => (
                      <Card key={index + 6} className="relative overflow-hidden">
                        <CardHeader className="space-y-1 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="shrink-0">{achievement.icon}</div>
                              <CardTitle className="text-base sm:text-lg truncate">
                                {achievement.title}
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${difficultyColors[achievement.difficulty as keyof typeof difficultyColors]} shrink-0 text-xs whitespace-nowrap`}
                            >
                              {achievement.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="space-y-1 text-sm">
                            <div className="truncate">
                              <strong className="text-muted-foreground">Event:</strong>{" "}
                              {achievement.event}
                            </div>
                            <div className="truncate">
                              <strong className="text-muted-foreground">Team:</strong>{" "}
                              {achievement.team}
                            </div>
                            <div className="truncate">
                              <strong className="text-muted-foreground">Date:</strong>{" "}
                              {achievement.date}
                            </div>
                            {achievement.issuer && (
                              <div className="truncate">
                                <strong className="text-muted-foreground">Issued by:</strong>{" "}
                                {achievement.issuer}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-500 text-xs">
                                {achievement.points} XP
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold neon-text">CTF Guilds</h3>
              </div>

              <div className="space-y-4">
                {teams.slice(0, 3).map((team, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="w-full"
                  >
                    <Card className="relative overflow-hidden">
                      <CardHeader className="space-y-1 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 shrink-0">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base sm:text-lg truncate">{team.name}</CardTitle>
                              <CardDescription className="text-sm truncate">{team.role}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-primary/20 shrink-0">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="whitespace-nowrap">LVL {team.level}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm line-clamp-2 mb-3">{team.description}</p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 text-center rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground">Members</div>
                            <div className="text-sm font-bold">{team.members}</div>
                          </div>
                          <div className="p-2 text-center rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground">Specialties</div>
                            <div className="text-sm font-bold">{team.specialties.length}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {team.specialties.map((specialty) => (
                            <Badge 
                              key={specialty} 
                              variant="secondary" 
                              className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <a href={team.link} target="_blank" rel="noopener noreferrer" className="mt-3 block w-full">
                          <Button
                            variant="outline"
                            className="w-full gap-2 text-sm border-primary/50 hover:border-primary hover:bg-primary/10"
                          >
                            View Guild
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <details className="group">
                  <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-primary hover:underline bg-primary/10 rounded-lg">
                    <span>View more guilds</span>
                    <span className="transition-transform group-open:rotate-180">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </summary>
                  <div className="space-y-4 mt-4">
                    {teams.slice(3).map((team, index) => (
                      <Card key={index + 3} className="relative overflow-hidden">
                        <CardHeader className="space-y-1 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 shrink-0">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg truncate">{team.name}</CardTitle>
                                <CardDescription className="text-sm truncate">{team.role}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-primary/20 shrink-0">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="whitespace-nowrap">LVL {team.level}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <p className="text-sm line-clamp-2 mb-3">{team.description}</p>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="p-2 text-center rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground">Members</div>
                              <div className="text-sm font-bold">{team.members}</div>
                            </div>
                            <div className="p-2 text-center rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground">Specialties</div>
                              <div className="text-sm font-bold">{team.specialties.length}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {team.specialties.map((specialty) => (
                              <Badge 
                                key={specialty} 
                                variant="secondary" 
                                className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <a href={team.link} target="_blank" rel="noopener noreferrer" className="mt-3 block w-full">
                            <Button
                              variant="outline"
                              className="w-full gap-2 text-sm border-primary/50 hover:border-primary hover:bg-primary/10"
                            >
                              View Guild
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>

          <motion.div
            className="p-4 sm:p-6 mt-16 text-center rounded-lg bg-primary/5"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative max-w-md mx-auto">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image 
                  src="https://avatars.githubusercontent.com/u/92920739" 
                  alt="Dimas Maulana Profile" 
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-2 border-primary/50 shadow-lg"
                />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Join My CTF Adventure!</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                I'm always looking for new friends and opportunities.
              </p>
              <a className="inline-flex items-center text-primary hover:underline text-sm">
                Send a message to me on discord @dimasmaulana
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
