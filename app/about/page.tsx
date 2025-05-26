import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "About the Interactive Blog",
}

export default function AboutPage() {
  return (
    <div className="container px-4 py-12 mx-auto max-w-4xl">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">About</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          Welcome to the Interactive Blog, a modern platform for sharing knowledge, experiences, and insights. Our blog
          is designed to provide an engaging and interactive reading experience.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to create a space where people can share their knowledge and experiences in a way that is
          accessible, engaging, and interactive. We believe that knowledge should be shared freely and that everyone has
          something valuable to contribute.
        </p>

        <div className="relative w-full my-8 overflow-hidden rounded-lg aspect-video">
          <Image src="/placeholder.svg?height=600&width=1200" alt="Team collaboration" fill className="object-cover" />
        </div>

        <h2>How It Works</h2>
        <p>Our blog uses a unique system to parse README.md files from a specific folder structure:</p>
        <ul>
          <li>
            <strong>posts/[folder]/README.md</strong> - Contains the blog content with frontmatter metadata
          </li>
          <li>
            <strong>posts/[folder]/imgs/[image]</strong> - Contains images for the blog post
          </li>
        </ul>

        <p>This structure allows for easy organization and management of blog posts and their associated media.</p>

        <h2>Features</h2>
        <ul>
          <li>Dynamic README parsing</li>
          <li>Beautiful and responsive UI</li>
          <li>Dark mode support</li>
          <li>Search functionality</li>
          <li>Category filtering</li>
          <li>Interactive animations</li>
          <li>Social sharing</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions, suggestions, or feedback, please don't hesitate to reach out to us. We'd love to
          hear from you!
        </p>
        <p>
          Email: <a href="mailto:contact@interactiveblog.com">contact@interactiveblog.com</a>
        </p>
      </div>
    </div>
  )
}
