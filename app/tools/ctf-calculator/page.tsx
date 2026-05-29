import { Metadata } from 'next'
import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { CTFCalculator } from '@/components/ui/ctf-calculator'

export const metadata: Metadata = {
  title: 'CTF Challenge Difficulty Calculator',
  description: 'Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.',
  openGraph: {
    title: 'CTF Challenge Difficulty Calculator | Dimas Maulana',
    description: 'Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.',
    type: 'website',
  },
}

export default function CTFCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">CTF Challenge Difficulty Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-6">
          Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity.
          This tool is used to rate all challenges in my <Link href="https://github.com/dimasma0305/My-CTF-Challenges" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CTF challenge collection</Link>.
        </p>
      </div>





      {/* Calculator */}
      <div className="mb-8">
        <CTFCalculator />
      </div>


    </div>
  )
} 