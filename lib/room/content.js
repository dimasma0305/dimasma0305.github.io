import { roomAsset } from "./assets.js";

export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHTML;
const tags = (items) =>
  `<ul class="tour-chips" role="list">${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`;
const paragraphs = (items) => items.map((item) => `<p>${e(item)}</p>`).join("");
const list = (items) =>
  `<ul class="tour-checklist">${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`;
const more = (label, content, id = "") =>
  `<details class="tour-expandable"${id ? ` id="${e(id)}"` : ""}><summary>${e(label)}<span aria-hidden="true">+</span></summary><div class="tour-expansion">${content}</div></details>`;
const stats = (items) =>
  `<div class="tour-stats">${items.map((s) => `<span><strong>${e(s.value)}</strong>${e(s.label)}</span>`).join("")}</div>`;
const entry = (title, subtitle, body, marker, className) =>
  `<details class="tour-expandable tour-entry ${className}" data-portfolio-${marker}><summary><span><strong>${e(title)}</strong><small>${e(subtitle)}</small></span><span aria-hidden="true">+</span></summary><div class="tour-expansion">${body}</div></details>`;
const project = (item, assetBase) =>
  entry(
    item.title,
    item.tags.slice(0, 2).join(" · "),
    `<h3>${e(item.title)}</h3><p>${e(item.description)}</p>${tags(item.tags)}<p class="tour-item-date">${e(item.date)}${item.team ? ` · ${e(item.team)}` : ""}</p>${item.title === "TCP1P Theme" ? `<a class="tour-project-preview" href="${e(item.github)}"><img src="${e(roomAsset(assetBase, "assets/portfolio/tcp1p-theme.png"))}" width="1242" height="653" loading="lazy" decoding="async" alt="TCP1P Theme homepage preview"/></a>` : ""}<a class="tour-link" href="${e(item.github)}">Explore ${e(item.title)} on GitHub ↗</a>`,
    "project",
    "tour-project-entry",
  );
const date = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const writing = (item, kind = "Post") =>
  `<article data-library-item data-search="${e([item.title, kind, ...item.categories].join(" ").toLowerCase())}"><a href="${e(item.href)}"><div><p class="tour-meta">${e(kind)} · ${e(date(item.date))}${item.minutes ? ` · ${e(item.minutes)} min` : ""}</p><h3>${e(item.title)}</h3></div><span aria-hidden="true">↗</span></a></article>`;
const photo = (item, index) =>
  `<figure data-portfolio-photo id="tour-photo-${index}"${index ? " hidden" : ""}><a href="${e(item.original)}" aria-label="View full photo: ${e(item.alt)}"><img src="${e(item.src)}" width="1200" height="800" loading="lazy" decoding="async" alt="${e(item.alt)}"/></a><figcaption>${item.chip ? `<strong>${e(item.chip)}</strong> ` : ""}${e(item.caption || item.alt)}</figcaption></figure>`;
const achievement = (item) =>
  `<li data-portfolio-achievement><span class="tour-place">${e(item.title)}</span><div><h3>${e(item.event)}</h3><p>${e(item.team)} · ${e(item.date)}</p>${item.issuer ? `<p class="tour-meta">${e(item.issuer)}</p>` : ""}<p class="tour-meta">${e(item.difficulty)} · ${e(item.points)} XP</p></div></li>`;
const experience = (item) =>
  entry(
    item.company,
    `${item.period} · ${item.title}`,
    `<h3>${e(item.title)}</h3><p class="tour-meta">${e(item.period)} · ${e(item.location)}${item.type ? ` · ${e(item.type)}` : ""}</p><p>${e(item.description)}</p>${tags(item.skills)}${item.link ? `<a class="tour-link" href="${e(item.link)}">Visit ${e(item.company)} ↗</a>` : ""}`,
    "experience",
    "tour-role-entry",
  );

export function createSceneSummary(p) {
  return {
    projectCount: p.projects.length,
    postCount: p.posts.length,
    noteCount: p.notes.length,
    // The room and the reading column share one source of truth. These are visual
    // keepsakes, not a second (and eventually out-of-date) portfolio database.
    projects: p.projects.map(({ title, tags }) => ({ title, tags })),
    writing: { posts: p.posts.slice(0, 2), notes: p.notes.slice(0, 3) },
    photos: p.photos,
    teams: p.teams.map(({ name, role }) => ({ name, role })),
    skills: p.skills,
    experience: p.experience.map(({ company, title, period }) => ({
      company,
      title,
      period,
    })),
    results: {
      total: p.achievements.length,
      items: p.achievements.map(({ title, event, team, date, issuer }) => ({
        title,
        event,
        team,
        date,
        issuer,
      })),
      podiums: ["1st Place", "2nd Place", "3rd Place"].map((place) => ({
        place,
        count: p.achievements.filter((item) => item.title === place).length,
      })),
      examples: [
        p.achievements.find((item) => item.team === "Individual"),
        p.achievements.find((item) => /Finals/.test(item.event)),
        p.achievements.find((item) => /Bug Bounty/.test(item.event)),
      ].filter(Boolean),
    },
    services: p.services,
  };
}

export function tourContent({ email, site, portfolio: p, assetBase = "./" }) {
  // These examples cover different kinds of work; they are not a ranking.
  const resultExamples = [
    ...new Set(
      [
        p.achievements.find((item) => item.team === "Individual"),
        p.achievements.find((item) => /Finals/.test(item.event)),
        p.achievements.find((item) => /Bug Bounty/.test(item.event)),
      ].filter(Boolean),
    ),
  ];
  return {
    work: `<p class="tour-section-intro">${e(p.personas.builder.description)}</p>
      ${stats(p.personas.builder.stats)}
      <p class="tour-collection-count">${p.projects.length} projects · Tools, labs & community</p>
      <p class="tour-index-help">The whole workbench. Open any project for details.</p>
      <div class="tour-project-index">${p.projects.map((item) => project(item, assetBase)).join("")}</div>
      <a class="tour-link" href="https://github.com/dimasma0305">Everything on GitHub ↗</a>`,
    writing: `<p class="tour-section-intro">Competition writeups, research observations, and the notes I keep within reach.</p>
      <div class="tour-library-search"><label for="tour-library-query">Find something in the notebook</label><input id="tour-library-query" type="search" placeholder="Search ${p.posts.length} posts & ${p.notes.length} notes…" autocomplete="off" aria-describedby="tour-library-count" aria-controls="tour-library"/><p id="tour-library-count" role="status">${p.posts.length} posts · ${p.notes.length} notes. Search or open the archive.</p></div>
      <div class="tour-notebook-page tour-notebook-index"><h3 class="tour-notebook-label">RECENT POSTS / ${p.posts.length} IN THE LIBRARY</h3><div class="tour-writing-list">${p.posts
        .slice(0, 2)
        .map((item) => writing(item))
        .join(
          "",
        )}</div><h3 class="tour-notebook-label">RECENT FIELD NOTES / ${p.notes.length} IN THE LIBRARY</h3><div class="tour-writing-list">${p.notes
        .slice(0, 2)
        .map((item) => writing(item, "Note"))
        .join("")}</div></div>
      ${more("Browse the complete writing library", `<div class="tour-library-group"><h3>Blog posts</h3><div class="tour-writing-list">${p.posts.map((item) => writing(item)).join("")}</div></div><div class="tour-library-group"><h3>Field notes</h3><div class="tour-writing-list">${p.notes.map((item) => writing(item, "Note")).join("")}</div></div>`, "tour-library")}
      <div class="tour-link-row"><a class="tour-link" href="${site}/blog/">Blog archive ↗</a><a class="tour-link" href="${site}/notes/">Notes archive ↗</a></div>`,
    about: `<p class="tour-section-intro">A photo album from international finals in Bali, Vietnam, and China, alongside the teams I’m part of. Choose a moment to see it up close.</p>
      <div class="tour-photo-feature tour-album"><div class="tour-album-stage">${p.photos.map(photo).join("")}</div><div class="tour-album-controls" role="group" aria-label="Choose a photo from the album">${p.photos.map((item, i) => `<button type="button" data-tour-photo="${i}" aria-pressed="${i === 0}" aria-controls="tour-photo-${i}" aria-label="Photo ${i + 1}: ${e(item.chip || item.alt)}"><img src="${e(item.src)}" width="160" height="100" loading="lazy" decoding="async" alt=""/><span>${e(item.chip || `Moment ${i + 1}`)}</span></button>`).join("")}</div><p class="tour-album-count" id="tour-album-status" role="status">1 / ${p.photos.length} · ${e(p.photos[0].chip || p.photos[0].alt)}</p></div>
      <p class="tour-photo-location">${p.photos.length} MOMENTS / ${p.teams.length} TEAMS</p>
      <h3 class="tour-subheading">The teams behind the memories</h3>
      <div class="tour-team-summary">${p.teams.map((team) => `<a href="${e(team.link)}">${e(team.name)} <span>${e(team.role)} ↗</span></a>`).join("")}</div>
      ${more("Meet all five teams", `<div class="tour-team-list">${p.teams.map((team) => `<article data-portfolio-team><h3><a href="${e(team.link)}">${e(team.name)} ↗</a></h3><p class="tour-meta">${e(team.role)} · Level ${e(team.level)}</p><p>${e(team.description)}</p>${tags(team.specialties)}</article>`).join("")}</div>`)}`,
    achievements: `<p class="tour-section-intro">Individual competition, team finals, and research recognition. Different parts of the same journey.</p>
      ${stats(p.personas.researcher.stats.filter((s) => s.label !== "Validated CVEs"))}
      <p class="tour-collection-count">${p.achievements.length} recorded results</p><p class="tour-index-help">A cross-section of the record, not a ranking.</p>
      <ol class="tour-achievement-list tour-result-examples" role="list">${resultExamples.map(achievement).join("")}</ol>
      ${more(
        `The rest of the record · ${p.achievements.length - resultExamples.length} results`,
        `<ol class="tour-achievement-list" role="list">${p.achievements
          .filter((item) => !resultExamples.includes(item))
          .map(achievement)
          .join("")}</ol>`,
      )}
      <a class="tour-link" href="#about">Meet the teams ↗</a>`,
    skills: `<p class="tour-section-intro">The stack behind the research, tools, and writeups. A shelf of things learned by doing.</p>
      <div class="tour-skill-list tour-skill-index">${p.skills.map((skill) => `<article data-portfolio-skill><h3>${e(skill.category)}</h3>${tags(skill.items.slice(0, 3))}${skill.items.length > 3 ? more(`${skill.items.length - 3} more in ${skill.category.toLowerCase()}`, tags(skill.items.slice(3))) : ""}</article>`).join("")}</div>`,
    experience: `<p class="tour-section-intro">Based in Denpasar, Bali. I build communities, research software security, and turn what I learn into tools and training.</p>
      <p class="tour-collection-count">${p.experience.length} roles · Research, engineering, training & community</p>
      <div class="tour-role-index">${p.experience.map(experience).join("")}</div>
      ${more("More about me & my research", `<div class="tour-bio">${paragraphs(p.bio)}</div><div class="tour-research-callout"><span class="tour-meta">ONE EXAMPLE FROM MY RESEARCH</span><strong>CVE-2025-26909</strong><p>WP Ghost · CVSS 9.6 · 200,000+ sites affected</p></div>`)}
      <p class="tour-section-intro">Open to security research roles, source code reviews, and CTF collaborations.</p>`,
    services: `<p class="tour-section-intro">${e(p.personas.pentester.description)}</p>
      <div class="tour-service-price"><span>Starting at</span><strong>${e(p.services.price)}</strong><span>per project · ${e(p.services.localPrice)}</span></div>
      ${list(p.services.highlights)}
      <p class="tour-service-note">Usually 1–2 days when available · One free re-test</p>
      <a class="tour-action" href="mailto:${email}?subject=Source%20code%20review">Let’s scope a review ↗</a>
      ${more("What’s included, process & common questions", `<h3 class="tour-subheading">How it works</h3><div class="tour-service-steps">${p.services.steps.map((step) => `<article><h3>${e(step.title)}</h3><p>${e(step.text)}</p></article>`).join("")}</div><h3 class="tour-subheading">What you get</h3>${list(p.services.included)}<h3 class="tour-subheading">Scope and limits</h3>${list(p.services.limits)}<h3 class="tour-subheading">Your code stays private</h3><p>I review your code in an isolated workspace, never share it, and delete it after delivery on request. NDA available on request. Send a private repository invite or a zip over email.</p><h3 class="tour-subheading">Questions</h3><dl class="tour-faqs">${p.services.faqs.map((faq) => `<dt>${e(faq.q)}</dt><dd>${e(faq.a)}</dd>`).join("")}</dl>`)}
      <div class="tour-link-row"><a class="tour-link" href="${site}/sample-report/source-code-pentest-sample-report.pdf">Sample report · PDF ↗</a><a class="tour-link" href="${site}/sample-report/source-code-pentest-sample-report.md">Markdown ↗</a></div>
      <a class="tour-link" href="${site}/services/">Service details & demo ↗</a>`,
    contact: `<p class="tour-section-intro">Research, open source, or a simple hello. I’m open to security research roles, source code reviews, and CTF collaborations.</p>
      <a class="tour-email" href="mailto:${email}">${email} ↗</a><button class="tour-link" data-copy-email>Copy email</button>
      <div class="tour-contact-socials">${p.socials
        .filter((s) => s.name !== "Email")
        .map(
          (s) => `<a class="tour-link" href="${e(s.href)}">${e(s.name)} ↗</a>`,
        )
        .join(
          "",
        )}<a class="tour-link" href="${e(p.services.whatsapp)}">WhatsApp ↗</a><a class="tour-link" href="${e(p.services.discord)}">Discord ↗</a></div>
      <a class="tour-link" href="#services">Services & pricing ↑</a><p class="tour-goodbye">Thanks for stopping by.</p>`,
  };
}
