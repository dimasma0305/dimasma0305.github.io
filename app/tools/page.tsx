import Link from 'next/link'
import { Metadata } from 'next'
import { Calculator, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/section-header'

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Collection of useful cybersecurity and CTF tools built by Dimas Maulana',
  openGraph: {
    title: 'Tools | Dimas Maulana',
    description: 'Collection of useful cybersecurity and CTF tools',
    type: 'website',
  },
}

const tools = [
  {
    title: 'CTF Challenge Difficulty Calculator',
    description: 'Calculate the difficulty rating of CTF challenges based on various factors like solvers, category, and complexity.',
    icon: Calculator,
    href: '/tools/ctf-calculator',
    category: 'CTF',
    status: 'Live',
  },
  // Add more tools here as you create them
]

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SectionHeader
        titleAs="h1"
        eyebrow="Toolbox"
        title="Tools"
        subtitle="A collection of useful cybersecurity and CTF tools I've built to help the community."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block">
            <Card className="h-full p-6 transition-colors hover:border-primary/40">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold transition-colors group-hover:text-primary">
                      {tool.title}
                    </h2>
                    <Badge variant="secondary">{tool.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-12 p-6 bg-muted/40">
        <h2 className="text-xl font-semibold mb-2">More Tools Coming Soon</h2>
        <p className="text-muted-foreground">
          I&apos;m actively working on more tools to help the cybersecurity community.
          Check back regularly or follow me on social media for updates.
        </p>
      </Card>
    </div>
  )
}
