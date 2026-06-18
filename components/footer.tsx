import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, MapPin, FileText, Wrench, ShieldCheck } from "lucide-react"
import { withBasePath } from "@/lib/utils"

export function Footer() {
  // Transparent on the homepage so the page ends in the night landscape
  // (hills, fireflies, stars); on other routes the body background shows
  // through identically to before, minus the slab.
  return (
    <footer className="py-12 border-t border-border/60 bg-transparent">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Dimas Maulana</h3>
            <p className="text-sm text-muted-foreground">
              Cybersecurity researcher, CTF player, and source code pentester based in Denpasar, Bali, Indonesia.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#about" className="text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#projects" className="text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/#experience" className="text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  Experience
                </Link>
              </li>
              <li>
                <Link href={"/services"} className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  Services
                </Link>
              </li>
              <li>
                <Link href={"/blog"} className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  <FileText className="w-4 h-4" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href={"/tools"} className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground">
                  <Wrench className="w-4 h-4" />
                  Tools
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Connect
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="https://github.com/dimasma0305"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </Link>
              <Link
                href="https://twitter.com/dimasma__"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </Link>
              <Link
                href="https://www.linkedin.com/in/solderet/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </Link>
              <Link
                href="mailto:dimasmaulana0305@gmail.com"
                className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              CTF Teams
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://github.com/TCP1P"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  TCP1P
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/project-sekai-ctf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  Project Sekai CTF
                </Link>
              </li>
              <li>
                <Link
                  href="https://ctftime.org/team/58979/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  P1G SEKAI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dimas Maulana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
