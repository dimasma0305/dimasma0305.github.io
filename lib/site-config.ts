export const siteConfig = {
  name: "Dimas Maulana's Blog",
  description: "Personal blog about technology, programming, and insights",
  url: "https://your-domain.com", // Update this with your actual domain
  author: {
    name: "Dimas Maulana",
    twitter: "@dimasmaulana", // Update with your actual Twitter handle
    linkedin: "dimasmaulana", // Update with your actual LinkedIn username
    github: "dimasmaulana", // Update with your actual GitHub username
    email: "dimas@example.com", // Update with your actual email
  },
  social: {
    twitter: "https://twitter.com/dimasmaulana", // Update with your actual Twitter URL
    linkedin: "https://linkedin.com/in/dimasmaulana", // Update with your actual LinkedIn URL
    github: "https://github.com/dimasmaulana", // Update with your actual GitHub URL
  }
} as const

export type SiteConfig = typeof siteConfig
