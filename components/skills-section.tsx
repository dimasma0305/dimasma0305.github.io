"use client"

import { motion } from "framer-motion"
import { Shield, Terminal, Server, Code, Database, Globe } from "lucide-react"

const skills = [
  {
    category: "Cybersecurity",
    icon: <Shield className="w-6 h-6" />,
    items: ["Penetration Testing", "Vulnerability Assessment", "CTF Competitions", "Security Research"],
  },
  {
    category: "Operating Systems",
    icon: <Terminal className="w-6 h-6" />,
    items: ["Linux", "Windows", "Kali Linux", "Ubuntu"],
  },
  {
    category: "Infrastructure",
    icon: <Server className="w-6 h-6" />,
    items: ["Docker", "Kubernetes", "AWS", "Networking"],
  },
  {
    category: "Programming",
    icon: <Code className="w-6 h-6" />,
    items: ["Python", "JavaScript", "PHP", "Bash", "Go"],
  },
  {
    category: "Databases",
    icon: <Database className="w-6 h-6" />,
    items: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
  },
  {
    category: "Web Technologies",
    icon: <Globe className="w-6 h-6" />,
    items: ["HTML/CSS", "React", "Node.js", "Web Security"],
  },
]

export function SkillsSection() {
  return (
    <div className="container px-4 py-16 mx-auto max-w-7xl" id="skills">
      <h2 className="mb-12 text-3xl font-bold tracking-tight text-center">Skills & Expertise</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="p-6 rounded-lg bg-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">{skill.icon}</div>
              <h3 className="text-xl font-semibold">{skill.category}</h3>
            </div>

            <ul className="space-y-2">
              {skill.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
