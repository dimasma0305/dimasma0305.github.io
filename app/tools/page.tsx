import Link from 'next/link'
import { Metadata } from 'next'
import { Calculator, Shield, Wrench } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Wrench className="w-8 h-8" />
          Tools
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          A collection of useful cybersecurity and CTF tools I&apos;ve built to help the community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                    {tool.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {tool.description}
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tool.category}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">More Tools Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400">
          I&apos;m actively working on more tools to help the cybersecurity community. 
          Check back regularly or follow me on social media for updates.
        </p>
      </div>
    </div>
  )
} 