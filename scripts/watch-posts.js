const fs = require('fs')
const path = require('path')
const { generateIndex } = require('./generate-index')

const POSTS_DIR = path.join(process.cwd(), 'public', 'posts')

let timeout = null
let isGenerating = false

function debounceGenerate() {
  // Don't start a new generation if one is already in progress
  if (isGenerating) {
    return
  }
  
  // Clear existing timeout
  if (timeout) {
    clearTimeout(timeout)
  }
  
  // Set new timeout to avoid regenerating too frequently
  timeout = setTimeout(async () => {
    if (isGenerating) return
    
    isGenerating = true
    console.log('\n🔄 Posts changed, regenerating index...')
    try {
      await generateIndex()
      console.log('✅ Index regenerated successfully')
    } catch (error) {
      console.error('❌ Error regenerating index:', error.message)
    } finally {
      isGenerating = false
    }
  }, 3000) // Wait 3 seconds after last change (increased from 1 second)
}

function watchPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('❌ Posts directory not found:', POSTS_DIR)
    process.exit(1)
  }

  console.log('👀 Watching posts directory for changes...')
  console.log('📁 Directory:', POSTS_DIR)
  console.log('🔄 Index will regenerate automatically when posts change')
  console.log('⏱️  Changes are debounced for 3 seconds to avoid rapid rebuilds\n')

  // Watch the posts directory recursively
  const watcher = fs.watch(POSTS_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return
    
    // Only watch for README.md files and ignore temporary files
    if (filename.includes('README.md') && !filename.includes('.tmp') && !filename.includes('.swp')) {
      console.log(`📝 Detected ${eventType}: ${filename}`)
      debounceGenerate()
    }
  })

  // Generate initial index only if it doesn't exist
  const indexPath = path.join(POSTS_DIR, 'index.json')
  if (!fs.existsSync(indexPath)) {
    console.log('📋 Generating initial index...')
    generateIndex()
  } else {
    console.log('📋 Index already exists, skipping initial generation')
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping file watcher...')
    watcher.close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Stopping file watcher...')
    watcher.close()
    process.exit(0)
  })
}

// Run the watcher
if (require.main === module) {
  watchPosts()
}

module.exports = { watchPosts }
