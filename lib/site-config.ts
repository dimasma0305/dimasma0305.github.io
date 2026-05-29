export const siteConfig = {
  name: "Dimas Maulana",
  description:
    "Personal website of Dimas Maulana — cybersecurity researcher and CTF player.",
  url: "https://dimasma0305.github.io",
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
