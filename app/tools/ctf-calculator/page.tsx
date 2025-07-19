import { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, Star, Users, Clock } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold">CTF Challenge Difficulty Calculator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Calculate the difficulty rating of CTF challenges based on various factors like solve rate, category, and complexity. 
          This tool is used to rate all challenges in my <Link href="https://github.com/dimasma0305/My-CTF-Challenges" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">CTF challenge collection</Link>.
        </p>
      </div>



      {/* Difficulty Scale */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Difficulty Scale</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">★</div>
            <div className="font-medium">Baby</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">1.0-2.0</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">★★</div>
            <div className="font-medium">Easy</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">2.0-3.0</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">★★★</div>
            <div className="font-medium">Medium</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">3.0-4.0</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">★★★★</div>
            <div className="font-medium">Hard</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">4.0-5.0</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">★★★★★</div>
            <div className="font-medium">Insane</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">5.0+</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Unfilled stars (☆) indicate challenges that were easier than expected due to unintended solutions.
        </p>
      </div>

      {/* Calculator */}
      <div className="mb-8">
        <CTFCalculator />
      </div>


    </div>
  )
} 