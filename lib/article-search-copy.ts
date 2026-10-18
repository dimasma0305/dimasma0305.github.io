/** Curated search summaries for posts whose imported first paragraph is a poor snippet. */
const articleSearchCopy: Record<string, { title: string; description: string }> = {
  "wiki-world": {
    title: "Wiki World: DOM Clobbering CTF Writeup",
    description:
      "A Wiki World CTF walkthrough showing how DOM clobbering changes a browser extension's configuration to reveal the challenge flag.",
  },
  "x-et-et": {
    title: "X Et Et: Electron RCE | TETCTF 2024 Writeup",
    description:
      "A TETCTF 2024 walkthrough chaining an admin-session bypass with Electron context manipulation and prototype pollution to achieve RCE.",
  },
  "spurdo-enbinling": {
    title: "Spurdo Enbinling: WebSocket Game CTF Writeup",
    description:
      "Analyze a WebSocket game's Protocol Buffer messages and server-side achievement checks to solve the Spurdo Enbinling CTF challenge.",
  },
  "read-the-file-with-lxml-etree-that-vulnerable-to-x": {
    title: "lxml XXE via Local DTD | Cyber Jawara 2025 Writeup",
    description:
      "Exploit error-based XXE in lxml.etree using a local DTD to read files in the Cyber Jawara National 2025 SVG Validator challenge.",
  },
  "patchstack-alliance-ctf-s02e01-wordcamp-asia": {
    title: "Patchstack Alliance CTF S02E01 - WordCamp Asia",
    description:
      "Solutions to all ten WordPress challenges in Patchstack Alliance CTF S02E01 at WordCamp Asia 2025, with vulnerability analysis and solver scripts.",
  },
};

export function getArticleSearchCopy(slug: string) {
  return articleSearchCopy[slug];
}
