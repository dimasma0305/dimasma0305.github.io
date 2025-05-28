"use client"

import { useEffect, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Core components first
import 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markup-templating'

// Then language-specific components
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'

// Plugins
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'bash', showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <pre className={`notion-code-block enhanced relative rounded-xl border shadow-sm bg-muted/50 my-6 overflow-x-auto ${showLineNumbers ? 'line-numbers' : ''}`}>
      <div className="sticky top-0 left-0 right-0 flex justify-between items-start p-2 bg-transparent pointer-events-none z-10">
        <div>
          <button 
            onClick={handleCopy}
            className="copy-button px-3 py-1 text-xs bg-background/90 backdrop-blur-sm border rounded hover:bg-muted transition-colors pointer-events-auto"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="language-label px-2 py-1 text-xs bg-background/90 backdrop-blur-sm rounded border text-muted-foreground pointer-events-auto">
          {language.toUpperCase()}
        </div>
      </div>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  )
} 