/** Editorial summaries of public project documentation, checked 2026-09-07.
 * Outcomes describe shipped functionality, not unmeasured impact or adoption. */
export const projectStories = {
  CTFIFY: {
    label: "CLI tooling · personal project",
    takeaway: "Find, download, and organize challenges from the terminal.",
    problem:
      "Competition files and challenge discovery can interrupt the work itself.",
    contribution:
      "A Go command-line tool with challenge search by name, category, or tag, plus local downloads.",
    outcome:
      "An open-source workflow for finding and managing CTF challenges in one place.",
    image: "/portfolio/ctfify-readme.png",
    width: 658,
    height: 479,
    caption:
      "Repository README preview — documentation, not a running terminal session.",
  },
  "VWA-Wazuh (Mini Lab SOC)": {
    label: "Security monitoring · personal project",
    takeaway:
      "A practice lab that connects web applications with security monitoring.",
    problem:
      "Learning an application and learning its monitoring stack often happen separately.",
    contribution:
      "A containerized lab integrating four practice web apps with Wazuh and Discord alerts.",
    outcome:
      "A reusable local environment for exploring applications alongside a monitoring dashboard.",
    image: "/portfolio/vwa-wazuh-dashboard.png",
    width: 1370,
    height: 707,
    caption: "Wazuh dashboard screenshot from the project README.",
  },
  "TCP1P Theme": {
    label: "Competition UI · TCP1P team project",
    takeaway: "A recognizable front door for a community-run competition.",
    problem:
      "A CTF platform needs an identity that feels like the community running it.",
    contribution:
      "CTFd theme work within TCP1P, extending the existing core-beta theme.",
    outcome:
      "An open-source TCP1P-branded interface. This is team work built on CTFd, not a platform built from scratch.",
    image: "/room/assets/portfolio/tcp1p-theme.png",
    width: 1242,
    height: 653,
    caption: "TCP1P Theme homepage preview from the project repository.",
  },
};

export const researchEvidence = {
  profile:
    "https://patchstack.com/database/researchers/1ca635c5-9810-4bb5-a410-a651905ea23c",
  advisory:
    "https://patchstack.com/database/wordpress/plugin/hide-my-wp/vulnerability/wordpress-hide-my-wp-ghost-plugin-5-4-01-local-file-inclusion-to-rce-vulnerability",
};

/** Team scoreboards establish the team result, not individual attendance. */
export const resultEvidence: Record<string, { href: string; label: string }> = {
  "idekCTF 2024": {
    href: "https://r3kapig.com/",
    label: "Team results archive",
  },
  "TPCTF 2025": {
    href: "https://ctftime.org/event/2645/",
    label: "CTFtime team scoreboard",
  },
  "ISITDTU CTF 2024 Finals Attack & Defense": {
    href: "https://ctftime.org/event/2510/",
    label: "CTFtime team scoreboard",
  },
  "THE SAS CON CTF 2024": {
    href: "https://r3kapig.com/",
    label: "Team results archive",
  },
};
