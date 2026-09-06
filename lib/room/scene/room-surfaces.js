// Baked, content-backed paper and screen surfaces. No animation or DOM work.
// All long text remains available in the accessible HTML reading column.
const ink = "#344c40",
  paper = "#eee4ca",
  rust = "#995c38";

export function textLines(ctx, value, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(value).split(/\s+/)) {
    if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
      lines.push(line);
      line = "";
    }
    // Repository names can contain no spaces; wrap them without clipping.
    for (const char of `${line ? " " : ""}${word}`) {
      if (line && ctx.measureText(line + char).width > maxWidth) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

function block(ctx, value, x, y, width, size, maxLines = 3, color = ink) {
  let lines;
  do {
    ctx.font = `600 ${size}px sans-serif`;
    lines = textLines(ctx, value, width);
    if (lines.length <= maxLines || size <= 12) {
      break;
    }
    size -= 1;
  } while (true);
  ctx.fillStyle = color;
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * size * 1.22));
  return lines.length * size * 1.22;
}

function label(ctx, value, x, y, size = 20, color = rust) {
  ctx.font = `600 ${size}px monospace`;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function sheet(ctx, w, h) {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  // Subtle paper fibres remain baked beneath the type, never an overlay on it.
  ctx.fillStyle = "rgba(89,70,43,.045)";
  for (let i = 0; i < 800; i++) {
    ctx.fillRect((i * 73.17) % w, (i * 37.43) % h, 1 + (i % 3), 0.7);
  }
  ctx.strokeStyle = "#c5b798";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, w - 36, h - 36);
}

export function paintWorkbench(ctx, w, h, data) {
  ctx.fillStyle = "#14251f";
  ctx.fillRect(0, 47, w, h - 47);
  label(ctx, "THE WORKBENCH", 32, 94, 36, "#f2e5cb");
  label(
    ctx,
    `${data.projectCount} PROJECTS / OPEN SOURCE`,
    34,
    121,
    17,
    "#b6cdb4",
  );
  const columns = 3,
    rows = Math.ceil(data.projects.length / columns);
  const cellW = (w - 80) / columns,
    cellH = (h - 162) / rows;
  data.projects.forEach((project, i) => {
    const x = 32 + (i % columns) * (cellW + 8);
    const y = 141 + Math.floor(i / columns) * cellH;
    const accent = ["#b1c99b", "#e5af84", "#98c5c8"][i % 3];
    ctx.fillStyle = "#253b31";
    ctx.fillRect(x, y, cellW, cellH - 8);
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, 3, cellH - 8);
    label(ctx, String(i + 1).padStart(2, "0"), x + 12, y + 23, 16, accent);
    block(ctx, project.title, x + 46, y + 23, cellW - 57, 21, 3, "#f1ead7");
    label(
      ctx,
      project.tags[0].toUpperCase(),
      x + 13,
      y + cellH - 21,
      14,
      accent,
    );
  });
}

export function paintNotebook(ctx, w, h, data) {
  sheet(ctx, w, h);
  const gutter = ctx.createLinearGradient(w / 2 - 32, 0, w / 2 + 32, 0);
  gutter.addColorStop(0, "rgba(93,75,49,0)");
  gutter.addColorStop(0.46, "rgba(93,75,49,.16)");
  gutter.addColorStop(0.52, "rgba(255,253,235,.45)");
  gutter.addColorStop(1, "rgba(93,75,49,0)");
  ctx.fillStyle = gutter;
  ctx.fillRect(w / 2 - 32, 20, 64, h - 40);
  ctx.fillStyle = "#d6c5a5";
  ctx.fillRect(w / 2 - 4, 20, 8, h - 40);
  label(ctx, "FIELD NOTES", 34, 61, 29, ink);
  label(ctx, `${data.postCount} POSTS`, 34, 100);
  data.writing.posts.forEach((post, i) => {
    const y = 145 + i * 165;
    label(ctx, post.date.slice(0, 10), 35, y, 18);
    block(ctx, post.title, 35, y + 39, w / 2 - 75, 29, 3);
  });
  label(ctx, "ON MY DESK", w / 2 + 30, 61, 28, ink);
  label(ctx, `${data.noteCount} RESEARCH NOTES`, w / 2 + 30, 100, 19);
  data.writing.notes.forEach((note, i) => {
    const y = 155 + i * 110;
    label(ctx, `0${i + 1} / ${note.date.slice(0, 10)}`, w / 2 + 30, y, 17);
    block(ctx, note.title, w / 2 + 30, y + 40, w / 2 - 65, 34, 2);
    ctx.fillStyle = "#ccbea0";
    ctx.fillRect(w / 2 + 30, y + 72, w / 2 - 65, 2);
  });
  label(ctx, "D. MAULANA / LEARNING OUT LOUD", 35, h - 37, 18, ink);
}

export function paintReview(ctx, w, h, data) {
  sheet(ctx, w, h);
  label(ctx, "D. MAULANA / APPSEC", 40, 64, 25, ink);
  label(ctx, "SOURCE CODE", 40, 137, 54, ink);
  label(ctx, "REVIEW", 40, 199, 54, ink);
  label(ctx, data.services.price, w - 167, 192, 55);
  ctx.fillStyle = rust;
  ctx.fillRect(40, 222, w - 80, 3);
  data.services.steps.forEach((step, i) => {
    label(ctx, step.title, 42, 271 + i * 47, 29, ink);
  });
  label(ctx, "AI-ASSISTED / HUMAN-TRIAGED", 42, 434, 25);
  label(ctx, "PDF + MARKDOWN  /  1 FREE RE-TEST", 42, 481, 23, ink);
  label(ctx, "NDA ON REQUEST", 42, 522, 22);
}

export function paintExperience(ctx, w, h, data) {
  sheet(ctx, w, h);
  label(ctx, "WORK / FIELD RECORD", 34, 61, 30, ink);
  label(ctx, `${data.experience.length} ROLES / DIFFERENT HATS`, 34, 99, 20);
  data.experience.forEach((role, i) => {
    const y = 148 + i * 133;
    label(ctx, String(i + 1).padStart(2, "0"), 34, y, 22);
    block(ctx, role.company, 82, y, w - 119, 32, 2);
    block(ctx, role.title, 82, y + 66, w - 119, 21, 1);
    label(ctx, role.period, 82, y + 95, 19);
    ctx.fillStyle = "#c6b89a";
    ctx.fillRect(34, y + 111, w - 68, 2);
  });
}

export function paintResults(ctx, w, h, data) {
  sheet(ctx, w, h);
  label(ctx, "THE RECORD", 33, 58, 37, ink);
  label(ctx, `${data.results.total} FINISHES / MANY TEAMS`, 33, 94, 19);
  data.results.examples.forEach((result, i) => {
    const y = 128 + i * 138;
    label(ctx, ["INDIVIDUAL", "TEAM FINALS", "BUG BOUNTY"][i], 33, y, 19);
    block(ctx, result.event, 33, y + 36, w - 66, 29, 2);
    label(ctx, result.title, 33, y + 110, 21, ink);
  });
}

export function paintTeamStubs(ctx, w, h, data) {
  const cell = w / data.teams.length;
  data.teams.forEach((team, i) => {
    const x = i * cell;
    ctx.fillStyle = ["#e7d5af", "#c1d0b7", "#ddb897", "#b6cdca", "#e5cead"][
      i % 5
    ];
    ctx.fillRect(x + 3, 0, cell - 6, h);
    block(ctx, team.name, x + 15, 48, cell - 30, 35, 2);
    label(ctx, team.role.toUpperCase(), x + 15, h - 20, 21);
  });
}

export function paintSkillSpines(ctx, w, h, data) {
  const groups = data.skills.filter(
    (skill) => skill.category !== "Certifications",
  );
  const cell = w / groups.length;
  groups.forEach((skill, i) => {
    const x = i * cell;
    ctx.fillStyle = ["#496551", "#a5673f", "#56777a", "#665b79"][i % 4];
    ctx.fillRect(x, 0, cell, h);
    for (let j = 0; j < 18; j++) {
      ctx.fillStyle = `rgba(12,18,14,${0.24 - j * 0.012})`;
      ctx.fillRect(x + j, 0, 1, h);
    }
    label(ctx, `VOL. 0${i + 1}`, x + 20, 40, 18, "#f2e5cb");
    block(ctx, skill.category, x + 20, 92, cell - 40, 28, 3, "#fff1d6");
    ctx.fillStyle = "#cfb28a";
    ctx.fillRect(x + 20, 198, cell - 40, 3);
    skill.items
      .slice(0, 3)
      .forEach((item, j) =>
        block(ctx, item, x + 20, 237 + j * 61, cell - 40, 18, 2, "#f2e5cb"),
      );
  });
}
