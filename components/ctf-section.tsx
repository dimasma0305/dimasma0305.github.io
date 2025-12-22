"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Users, Award, ChevronDown, Star, Zap, ExternalLink, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useInView } from "react-intersection-observer"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const achievements = [
  {
    title: "1st Place",
    event: "XCTF 2025 Professional Division",
    team: "Individual",
    date: "November 2025",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    issuer: "XCTF",
    points: 5000,
    difficulty: "Legendary",
  },
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

  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  const handleAchievementClick = (index: number) => {
    if (selectedAchievement === index) {
      setSelectedAchievement(null)
    } else {
      setSelectedAchievement(index)
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
    <motion.section
      id="ctf"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-black to-background overflow-x-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYgMzBoLTZsMyAxMHoiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTMwIDMwaC02bDMgMTB6Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=')]"></div>
      </div>

      <div className="max-w-[90rem] mx-auto">
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            ref={titleRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight neon-text-pink">CTF Achievements</h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground">Battle-tested in the digital arena</p>
          </motion.div>

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-primary" />
                <h3 className="text-xl sm:text-2xl font-semibold neon-text">Achievement Board</h3>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {achievements.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={index}
                    onClick={() => handleAchievementClick(index)}
                    className="cursor-pointer w-full"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
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

                        <AnimatePresence initial={false}>
                          {selectedAchievement === index && (
                            <motion.div
                              key="details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="pt-2 mt-2 border-t border-muted overflow-hidden"
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
                        </AnimatePresence>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {teams.slice(0, 4).map((team, index) => (
                  <motion.div
                    key={index}
                    className="w-full"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
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
                          {team.specialties.slice(0, 6).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {team.specialties.length > 6 && (
                            <Badge variant="outline" className="text-xs">+{team.specialties.length - 6} more</Badge>
                          )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                    {teams.slice(4).map((team, index) => (
                      <motion.div
                        key={index + 4}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
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
                              {team.specialties.slice(0, 6).map((specialty) => (
                                <Badge
                                  key={specialty}
                                  variant="secondary"
                                  className="bg-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                              {team.specialties.length > 6 && (
                                <Badge variant="outline" className="text-xs">+{team.specialties.length - 6} more</Badge>
                              )}
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
                </details>
              </div>
            </div>
          </div>

          <motion.div
            className="p-4 sm:p-6 mt-16 text-center rounded-lg bg-primary/5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative max-w-md mx-auto">
              <motion.div className="relative w-16 h-16 mx-auto mb-4" whileHover={{ rotate: 2, scale: 1.03 }}>
                <Image
                  src="https://avatars.githubusercontent.com/u/92920739"
                  alt="Dimas Maulana Profile"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-2 border-primary/50 shadow-lg"
                />
                <motion.div className="absolute -top-1 -right-1" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </motion.div>
              <h3 className="mb-2 text-xl font-semibold">Join My CTF Adventure!</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                I'm always looking for new friends and opportunities.
              </p>
              <a className="inline-flex items-center text-primary hover:underline text-sm">
                Send a message to me on discord @dimasmaulana
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

