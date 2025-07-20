"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, RotateCcw, Star, HelpCircle, Copy, Check, AlertTriangle, Shield, Zap } from "lucide-react"

interface RangeValues {
  [key: string]: number
}

interface CVSSMetrics {
  [key: string]: string
}

// CVSS-like severity levels
const cvssSeverityLevels = [
  { name: "None", min: 0, max: 0.1, color: "text-gray-500", bgColor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { name: "Low", min: 0.1, max: 3.9, color: "text-blue-500", bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { name: "Medium", min: 4.0, max: 6.9, color: "text-yellow-500", bgColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { name: "High", min: 7.0, max: 8.9, color: "text-orange-500", bgColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { name: "Critical", min: 9.0, max: 10.0, color: "text-red-500", bgColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
]

const criteriaData = [
  {
    name: 'Multifaceted Skills Needed',
    shortName: 'MSN',
    description: (
      <div>
        <h3 className="font-bold text-lg mb-4">Multifaceted Skills Needed</h3>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li><strong>Baby:</strong> Designed for beginners, focusing on fundamental concepts in a single domain.</li>
          <li><strong>Easy:</strong> Requires a basic understanding of a specific skill set.</li>
          <li><strong>Medium:</strong> Involves challenges that primarily focus on a single skill set but may touch on others.</li>
          <li><strong>Hard:</strong> Demands proficiency in one or two specialized areas or a high level of skill in a broader domain.</li>
          <li><strong>Insane:</strong> Requires a broad range of skills from various domains, demanding expertise in multiple areas (e.g., reverse engineering, cryptography, binary exploitation, web exploitation).</li>
        </ol>
      </div>
    ),
  },
  {
    name: 'Complex Code/Payload/Bypass',
    shortName: 'CCP',
    description: (
      <div>
        <h3 className="font-bold text-lg mb-4">Complex Code/Payload/Bypass</h3>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li><strong>Baby:</strong> Code or payload is simple and easily understandable.</li>
          <li><strong>Easy:</strong> Code or payload is relatively straightforward, with minimal obfuscation.</li>
          <li><strong>Medium:</strong> Involves code or payload complexities that may require intermediate-level analysis skills.</li>
          <li><strong>Hard:</strong> Utilizes complex code or obfuscation techniques, demanding a careful analysis of the code or payload.</li>
          <li><strong>Insane:</strong> Involves highly complex, obfuscated, or unconventional code/payload/bypass mechanisms, requiring advanced analysis and understanding.</li>
        </ol>
      </div>
    ),
  },
  {
    name: 'Multiple Steps of Complexity',
    shortName: 'MSC',
    description: (
      <div>
        <h3 className="font-bold text-lg mb-4">Multiple Steps of Complexity</h3>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li><strong>Baby:</strong> Requires only a single step for completion.</li>
          <li><strong>Easy:</strong> Involves a few simple steps with a straightforward progression.</li>
          <li><strong>Medium:</strong> Requires several steps to complete, with a moderate level of complexity in the process.</li>
          <li><strong>Hard:</strong> Involves multiple steps, each demanding careful consideration and execution.</li>
          <li><strong>Insane:</strong> Requires a series of highly intricate and interdependent steps for successful completion.</li>
        </ol>
      </div>
    ),
  },
  {
    name: 'Dynamic Elements and Updates',
    shortName: 'DEU',
    description: (
      <div>
        <h3 className="font-bold text-lg mb-4">Dynamic Elements and Updates</h3>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li><strong>Baby:</strong> Completely static challenge, requiring no adaptation.</li>
          <li><strong>Easy:</strong> Challenges remain static throughout, with no dynamic elements or updates.</li>
          <li><strong>Medium:</strong> Introduces some dynamic elements or updates, influencing the challenge&apos;s progression.</li>
          <li><strong>Hard:</strong> Includes dynamic elements that may change during the challenge but are less frequent or predictable.</li>
          <li><strong>Insane:</strong> Involves dynamic elements that change over time, requiring participants to adapt and update their approach.</li>
        </ol>
      </div>
    ),
  },
  {
    name: 'Hidden Attack Vectors or Non-Traditional Attack Vectors',
    shortName: 'HAV',
    description: (
      <div>
        <h3 className="font-bold text-lg mb-4">Hidden Attack Vectors or Non-Traditional Attack Vectors</h3>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          <li><strong>Baby:</strong> Relies on widely recognized and easily identifiable attack vectors.</li>
          <li><strong>Easy:</strong> Attack vectors are straightforward and well-known.</li>
          <li><strong>Medium:</strong> Challenges participants with attack vectors that may not be immediately obvious but fall within standard practices.</li>
          <li><strong>Hard:</strong> Includes attack vectors that are less apparent or follow less common paths.</li>
          <li><strong>Insane:</strong> Incorporates hidden or non-traditional attack vectors, challenging participants to think beyond conventional methods.</li>
        </ol>
      </div>
    ),
  },
]

const difficulties = [
  { name: "baby", color: "text-blue-400", bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { name: "easy", color: "text-green-400", bgColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { name: "medium", color: "text-yellow-400", bgColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { name: "hard", color: "text-red-400", bgColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { name: "insane", color: "text-red-600", bgColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
]

// CVSS-like scoring function
function calculateCVSSScore(rangeValues: RangeValues): number {
  const values = Object.values(rangeValues)
  if (values.length === 0) return 0
  
  // Convert 1-5 scale to 0-10 scale (CVSS-like)
  const cvssValues = values.map(v => (v - 1) * 2.5)
  
  // Calculate weighted average (similar to CVSS)
  const weights = [0.25, 0.25, 0.2, 0.15, 0.15] // Weighted importance
  let weightedSum = 0
  
  cvssValues.forEach((value, index) => {
    weightedSum += value * (weights[index] || 0.2)
  })
  
  return Math.min(10, Math.max(0, weightedSum))
}

// Get CVSS severity level
function getCVSSSeverity(score: number) {
  return cvssSeverityLevels.find(level => score >= level.min && score <= level.max) || cvssSeverityLevels[0]
}

// Generate CVSS-like vector string
function generateVectorString(rangeValues: RangeValues): string {
  const vectorParts = criteriaData.map(criteria => {
    const value = rangeValues[criteria.name] || 1
    const level = value === 1 ? 'L' : value === 2 ? 'L' : value === 3 ? 'M' : value === 4 ? 'H' : 'C'
    return `${criteria.shortName}:${level}`
  })
  
  return `CTF:1.0/${vectorParts.join('/')}`
}

function RangeInput({ 
  label, 
  name, 
  description, 
  onRangeChange, 
  value 
}: { 
  label: string
  name: string 
  description: React.ReactNode
  onRangeChange: (name: string, value: number) => void
  value: number
}) {
  const handleValueChange = (values: number[]) => {
    onRangeChange(name, values[0])
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Challenge Difficulty Criteria</DialogTitle>
            </DialogHeader>
            <div className="text-sm">{description}</div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          max={5}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <span key={num}>{num}</span>
          ))}
        </div>
      </div>
      <div className="text-sm text-center">
        <Badge variant="outline" className="px-2 py-1">
          {value}/5
        </Badge>
      </div>
    </div>
  )
}

function renderStars(count: number) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

function renderSmallStars(count: number) {
  return (
    <div className="flex justify-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

function ProgressCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  )
}

export function CTFCalculator() {
  const [rangeValues, setRangeValues] = useState<RangeValues>({})
  const [resultValue, setResultValue] = useState(1)
  const [resultPercentage, setResultPercentage] = useState(20)
  const [resultStars, setResultStars] = useState(1)
  const [copied, setCopied] = useState(false)
  
  // CVSS-like calculations
  const cvssScore = calculateCVSSScore(rangeValues)
  const cvssSeverity = getCVSSSeverity(cvssScore)
  const vectorString = generateVectorString(rangeValues)

  // Parse vector parameter from URL
  const parseVectorFromURL = (vectorStr: string): RangeValues => {
    const parsedValues: RangeValues = {}
    
    try {
      // URL decode the vector string first
      const decodedVector = decodeURIComponent(vectorStr)
      console.log('Decoded vector:', decodedVector)
      
      // Remove CTF:1.0/ prefix if present
      const cleanVector = decodedVector.replace(/^CTF:1\.0\//, '')
      console.log('Clean vector:', cleanVector)
      
      // Split by / and parse each metric
      const metrics = cleanVector.split('/')
      console.log('Metrics:', metrics)
      
      metrics.forEach(metric => {
        const [shortName, level] = metric.split(':')
        console.log('Parsing metric:', shortName, level)
        
        // Find the criteria by short name
        const criteria = criteriaData.find(c => c.shortName === shortName)
        if (criteria) {
          // Convert level back to 1-5 scale
          let value = 1
          switch (level) {
            case 'L':
              value = 1 // or 2, but we'll use 1 for Low
              break
            case 'M':
              value = 3
              break
            case 'H':
              value = 4
              break
            case 'C':
              value = 5
              break
            default:
              value = 1
          }
          parsedValues[criteria.name] = value
          console.log('Set', criteria.name, 'to', value)
        } else {
          console.log('Criteria not found for shortName:', shortName)
        }
      })
    } catch (error) {
      console.error('Error parsing vector string:', error)
    }
    
    console.log('Final parsed values:', parsedValues)
    return parsedValues
  }

  // Initialize default values first
  useEffect(() => {
    const initialValues: RangeValues = {}
    criteriaData.forEach(criteria => {
      initialValues[criteria.name] = 1
    })
    setRangeValues(initialValues)
  }, [])

  // Then check for URL parameters after component mounts
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return

    // Check for vector parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const vectorParam = urlParams.get('vector')
    console.log('Vector param from URL:', vectorParam)
    
    if (vectorParam) {
      // Parse vector and set values
      const parsedValues = parseVectorFromURL(vectorParam)
      console.log('Parsed values:', parsedValues)
      if (Object.keys(parsedValues).length > 0) {
        console.log('Setting range values to:', parsedValues)
        setRangeValues(parsedValues)
      }
    }
  }, [])

  useEffect(() => {
    let resultval = 0
    const keys = Object.keys(rangeValues)
    
    if (keys.length === 0) return

    keys.forEach((key) => {
      resultval += rangeValues[key]
    })
    
    const mean = resultval / keys.length
    setResultPercentage((mean / 5) * 100)
    setResultValue(mean)
    setResultStars(Math.round(mean))
  }, [rangeValues])

  const handleRangeChange = (name: string, value: number) => {
    setRangeValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReset = () => {
    const resetValues: RangeValues = {}
    criteriaData.forEach(criteria => {
      resetValues[criteria.name] = 1
    })
    setRangeValues(resetValues)
  }

  const difficultyIndex = Math.min(Math.round(resultValue) - 1, 4)
  const currentDifficulty = difficulties[difficultyIndex]

  const handleCopyResult = async () => {
    const stars = "★".repeat(resultStars)
    
    // Generate text-based table
    const tableHeader = "| Criteria                                    | Rating | Stars   |"
    const tableSeparator = "|---------------------------------------------|--------|---------|"
    
    const tableRows = criteriaData.map(criteria => {
      const rating = rangeValues[criteria.name] || 1
      const criteriaStars = "★".repeat(rating) + "☆".repeat(5 - rating)
      const paddedCriteria = criteria.name.padEnd(43)
      const paddedRating = `${rating}/5`.padEnd(6)
      return `| ${paddedCriteria} | ${paddedRating} | ${criteriaStars} |`
    }).join('\n')
    
    const resultText = `# CTF Challenge Difficulty Rating

## Summary
- **Score:** ${resultValue.toFixed(2)}/5.0
- **Rating:** ${stars} (${currentDifficulty.name.toUpperCase()})
- **Percentage:** ${resultPercentage.toFixed(1)}%

## CVSS-like Scoring
- **CVSS Score:** ${cvssScore.toFixed(1)}/10.0
- **Severity:** ${cvssSeverity.name}
- **Vector String:** ${vectorString}

## Criteria Breakdown
${tableHeader}
${tableSeparator}
${tableRows}

Calculated using: https://dimasma0305.github.io/tools/ctf-calculator?vector=${encodeURIComponent(vectorString)}`

    try {
      await navigator.clipboard.writeText(resultText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Calculator Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Criteria */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Challenge Difficulty Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteriaData.map((criteria, index) => (
                <RangeInput
                  key={index}
                  label={criteria.name}
                  name={criteria.name}
                  description={criteria.description}
                  onRangeChange={handleRangeChange}
                  value={rangeValues[criteria.name] || 1}
                />
              ))}
              <div className="pt-4">
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Values
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Progress Circle */}
                <div className="flex justify-center">
                  <ProgressCircle value={resultPercentage} />
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      Points: {resultValue.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Badge className={currentDifficulty.bgColor}>
                      {currentDifficulty.name.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {renderStars(resultStars)}
                </div>
                
                {/* Copy Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleCopyResult}
                    variant="outline"
                    className="w-full"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Result
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Calculation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Formula:</strong> Average of all criteria ratings
                </div>
                
                {/* Vector String */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Vector String:</div>
                  <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                    {vectorString}
                  </div>
                </div>
                
                {/* Criteria Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criteria</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Stars</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteriaData.map((criteria) => {
                      const value = rangeValues[criteria.name] || 1
                      
                      return (
                        <TableRow key={criteria.name}>
                          <TableCell className="font-medium">
                            <div className="max-w-xs">
                              <div className="font-semibold text-sm">{criteria.name}</div>
                              <div className="text-xs text-muted-foreground">{criteria.shortName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {value}/5
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {renderSmallStars(value)}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                
                {/* Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Final Average:</span>
                    <Badge className={currentDifficulty.bgColor}>
                      {resultValue.toFixed(2)}/5
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Difficulty Level:</span>
                    <Badge className={currentDifficulty.bgColor}>
                      {currentDifficulty.name.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Percentage:</span>
                    <span className="font-mono text-lg">{resultPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
} 