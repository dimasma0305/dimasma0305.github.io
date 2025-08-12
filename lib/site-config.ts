export const siteConfig = {
  name: "Dimas Maulana's Blog",
  description: "Personal blog about technology, programming, and insights",
  url: "https://dimasma0305.github.io", // Update this with your actual domain
  author: {
    name: "Dimas Maulana",
    twitter: "@dimasma__",
    linkedin: "solderet",
    github: "dimasma0305",
    email: "dimasmaulana0305@gmail.com",
  },
  social: {
    twitter: "https://twitter.com/dimasma__",
    linkedin: "https://linkedin.com/in/solderet",
    github: "https://github.com/dimasma0305",
  }
} as const

export type SiteConfig = typeof siteConfig
