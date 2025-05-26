"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, ExternalLink, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useRef } from "react"

const experiences = [
  {
    title: "Founder",
    company: "TCP1P",
    location: "Indonesia · Remote",
    period: "Aug 2022 - Present",
    description: "Founded and lead TCP1P, a cybersecurity team focused on CTF competitions and security research.",
    skills: ["Communication", "Leadership", "Team Management", "CTF"],
    link: "https://github.com/TCP1P",
    highlight: true,
  },
  {
    title: "Challenge Author",
    company: "Information and Technology Festival (IntechFest)",
    location: "Remote",
    period: "Aug 2024 - Sep 2024",
    description: "Created and designed CTF challenges for the Information and Technology Festival.",
    skills: ["Web Security", "Challenge Design", "CTF"],
    type: "Freelance",
  },
  {
    title: "Challenge Author",
    company: "TECHCOMFEST",
    location: "Remote",
    period: "Dec 2023 - Jan 2024",
    description: "Developed CTF challenges for TECHCOMFEST competition.",
    skills: ["Web Security", "Challenge Design", "CTF"],
    type: "Freelance",
  },
  {
    title: "Challenge Author",
    company: "CTF IT Festival",
    location: "Remote",
    period: "Dec 2023",
    description: "Created security challenges for the CTF IT Festival competition.",
    skills: ["Web Security", "Challenge Design", "CTF"],
    type: "Freelance",
  },
  {
    title: "Challenge Author",
    company: "HOLOGY UB",
    location: "Remote",
    period: "Sep 2023",
    description: "Designed and developed CTF challenges for HOLOGY 6.0 competition at Universitas Brawijaya.",
    skills: ["Web Security", "Challenge Design", "CTF", "Jury"],
    type: "Freelance",
  },
]

export function ExperienceSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="container px-4 py-16 mx-auto max-w-7xl" id="experience" ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <h2 className="text-5xl font-bold tracking-tight neon-text-green">Professional Experience</h2>
        <p className="mt-4 text-xl text-muted-foreground">My journey in the cybersecurity realm</p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <div className="relative border-l-2 border-muted pl-8 ml-4">
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="mb-12 relative"
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[41px] top-1" />
              <Card className={`transition-all duration-300 ${experience.highlight ? "border-primary/30" : ""}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{experience.title}</CardTitle>
                      {experience.highlight && hoveredCard === index && (
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
                    <div>
                      <CardDescription className="text-lg font-medium">
                        {experience.company}
                        {experience.type && <span className="ml-2 text-sm">· {experience.type}</span>}
                      </CardDescription>
                    </div>
                    {experience.link && (
                      <Link href={experience.link} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Visit
                        </Badge>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{experience.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{experience.location}</span>
                    </div>
                  </div>

                  <p>{experience.description}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {experience.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/20 hover:bg-primary/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
