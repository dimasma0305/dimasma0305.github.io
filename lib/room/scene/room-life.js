import * as THREE from "three";
import { textLines } from "./room-surfaces.js";

export function createCurtainGeometry() {
  const geometry = new THREE.PlaneGeometry(0.4, 2.15, 32, 32);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      u = (x + 0.2) / 0.4;
    const gathered = 1 - 0.38 * Math.exp(-Math.pow((y + 0.3) / 0.24, 2));
    p.setXYZ(
      i,
      x * gathered,
      y - 0.013 * Math.cos(u * Math.PI * 8),
      0.045 * Math.cos(u * Math.PI * 10) + 0.018 * Math.sin(y * 2.5 + u),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function libraryPlan(skills) {
  return [
    ...skills
      .filter((s) => s.category !== "Certifications")
      .map((s) => ({ title: s.category, kind: "FIELD NOTES" })),
    ...(skills.find((s) => s.category === "Programming")?.items || []).map(
      (title) => ({ title, kind: "REFERENCE" }),
    ),
  ].map((book, i) => ({
    ...book,
    index: i,
    width: [0.064, 0.07, 0.06, 0.068][i % 4],
    height: 0.291 + (i % 4) * 0.01,
  }));
}

const covers = [
  "#364a3e",
  "#8b5136",
  "#3c565b",
  "#554b42",
  "#6c6549",
  "#714746",
];
export function paintBookAtlas(ctx, w, h, books) {
  const cell = w / books.length;
  books.forEach((book, i) => {
    const x = i * cell;
    ctx.fillStyle = covers[i % covers.length];
    ctx.fillRect(x, 0, cell, h);
    // Cloth-bound buckram with a rounded spine's falloff, not a flat UI tile.
    ctx.fillStyle = "#ffffff0a";
    for (let j = 0; j < 900; j++) {
      ctx.fillRect(x + ((j * 73.17) % cell), (j * 39.79) % h, 0.7, 1.5);
    }
    const shade = ctx.createLinearGradient(x, 0, x + cell, 0);
    shade.addColorStop(0, "#00000060");
    shade.addColorStop(0.22, "#ffffff10");
    shade.addColorStop(0.72, "#00000000");
    shade.addColorStop(1, "#00000050");
    ctx.fillStyle = shade;
    ctx.fillRect(x, 0, cell, h);
    ctx.strokeStyle = "#ddcaa07a";
    ctx.lineWidth = 2;
    for (const y of [45, 57, h - 91, h - 80]) {
      ctx.beginPath();
      ctx.moveTo(x + 18, y);
      ctx.lineTo(x + cell - 18, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(x + cell / 2, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#f0dfb9";
    ctx.textAlign = "center";
    let size = 36;
    do {
      ctx.font = `500 ${size}px Georgia`;
      if (ctx.measureText(book.title).width < h - 170) {
        break;
      }
      size--;
    } while (size > 12);
    ctx.fillText(book.title, 0, 10);
    ctx.restore();
    ctx.textAlign = "center";
    ctx.fillStyle = "#dbc69c";
    ctx.font = "22px serif";
    ctx.fillText("D.M.", x + cell / 2, h - 31);
  });
}

export function makeBoundBook({
  parent,
  position = [0, 0, 0],
  width,
  height,
  depth = 0.27,
  cover,
  craft,
  group,
  box,
  mesh,
  spineMaterial,
  spineIndex = 0,
  spineCount = 1,
}) {
  const book = group(parent, position);
  box(
    width - 0.01,
    height - 0.017,
    depth - 0.029,
    craft.paperEdge,
    [0, 0, -0.004],
    book,
    0.002,
  );
  for (const x of [-width / 2, width / 2]) {
    box(0.004, height, depth, cover, [x, 0, 0], book, 0.002);
  }
  box(
    width + 0.006,
    height,
    0.018,
    cover,
    [0, 0, depth / 2 - 0.006],
    book,
    0.005,
  );
  for (let j = 0; j < 12; j++) {
    box(
      width - 0.013,
      0.0008,
      0.002,
      craft.thread,
      [0, -height / 2 + 0.014 + (j * (height - 0.029)) / 12, -depth / 2 + 0.01],
      book,
      0,
    );
  }
  for (const y of [-height / 2 + 0.025, height / 2 - 0.025]) {
    box(width, 0.002, 0.002, craft.thread, [0, y, depth / 2 + 0.004], book, 0);
  }
  if (spineMaterial) {
    const geometry = new THREE.PlaneGeometry(width, height - 0.01, 8, 1);
    const p = geometry.attributes.position,
      uv = geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      p.setZ(i, 0.003 * (1 - Math.pow(p.getX(i) / (width / 2), 2)));
      uv.setX(i, (spineIndex + uv.getX(i)) / spineCount);
    }
    geometry.computeVertexNormals();
    mesh(geometry, spineMaterial, [0, 0, depth / 2 + 0.005], book, false);
  }
  return book;
}

export function buildLibrary({
  skills,
  bookcase,
  craft,
  palette,
  material,
  textureCanvas,
  group,
  box,
  mesh,
  bar,
  screw,
}) {
  const books = libraryPlan(skills);
  const atlas = textureCanvas(books.length * 192, 768, (ctx, w, h) =>
    paintBookAtlas(ctx, w, h, books),
  );
  const spineMaterial = material(0xffffff, {
    map: atlas,
    roughness: 0.87,
    bumpMap: craft.weave,
    bumpScale: 0.001,
  });
  const coverMaterials = covers.map((c) =>
    material(c, { roughness: 0.89, bumpMap: craft.weave, bumpScale: 0.002 }),
  );
  let x = -0.47;
  books.forEach((book, i) => {
    const volume = makeBoundBook({
      parent: bookcase,
      position: [
        x + book.width / 2,
        0.465 + book.height / 2,
        0.021 + (i % 3) * 0.009,
      ],
      ...book,
      cover: coverMaterials[i % 6],
      craft,
      group,
      box,
      mesh,
      spineMaterial,
      spineIndex: i,
      spineCount: books.length,
    });
    if (i === books.length - 1) {
      volume.rotation.z = -0.07;
    }
    x += book.width + 0.008;
  });
  for (const end of [-0.495, x + 0.02]) {
    box(0.009, 0.23, 0.22, craft.aluminum, [end, 0.58, 0.025], bookcase, 0.003);
    box(
      0.07,
      0.006,
      0.22,
      craft.aluminum,
      [end + (end < 0 ? 0.032 : -0.032), 0.464, 0.025],
      bookcase,
      0.003,
    );
  }
  for (const end of [-0.515, 0.515]) {
    for (let y = 0.15; y < 0.8; y += 0.12) {
      const pin = box(
        0.003,
        0.009,
        0.009,
        craft.aluminum,
        [end, y, 0.125],
        bookcase,
        0.002,
      );
    }
    screw([end, 0.845, 0.246], bookcase, 0.007);
  }
  for (const end of [-0.47, 0.47]) {
    for (const z of [-0.16, 0.16]) {
      box(0.085, 0.045, 0.085, palette.wood, [end, -0.022, z], bookcase, 0.004);
    }
  }
  for (let i = 0; i < 3; i++) {
    const volume = makeBoundBook({
      parent: bookcase,
      position: [0.25, 0.092 + i * 0.071, 0.032],
      width: 0.06,
      height: 0.35 - i * 0.012,
      depth: 0.275,
      cover: coverMaterials[(i + 1) % 6],
      craft,
      group,
      box,
      mesh,
      spineMaterial,
      spineIndex: [0, 2, 3][i],
      spineCount: books.length,
    });
    volume.rotation.z = -Math.PI / 2;
    volume.rotation.y = (i - 1) * 0.045;
  }
  return { books, spineMaterial, coverMaterials };
}

export function paintStoryAtlas(ctx, w, h, experience) {
  const columns = 2,
    rows = Math.ceil(experience.length / columns),
    cw = w / columns,
    ch = h / rows;
  experience.forEach((role, i) => {
    const x = (i % 2) * cw,
      y = Math.floor(i / 2) * ch;
    ctx.fillStyle =
      i % 3 === 0 ? "#eee2c8" : i % 3 === 1 ? "#e3ddcc" : "#ead7bb";
    ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = "#71604414";
    for (let j = 0; j < 600; j++) {
      ctx.fillRect(x + ((j * 31.43) % cw), y + ((j * 63.17) % ch), 1, 0.7);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#856847";
    ctx.font = "22px monospace";
    ctx.fillText(`${String(i + 1).padStart(2, "0")} / MY WORK`, x + 28, y + 45);
    let size = 34,
      lines;
    do {
      ctx.font = `600 ${size}px Georgia`;
      lines = textLines(ctx, role.company, cw - 56);
      if (lines.length <= 3) {
        break;
      }
      size--;
    } while (size > 12);
    ctx.fillStyle = "#2d4138";
    lines.forEach((line, j) =>
      ctx.fillText(line, x + 28, y + 99 + j * size * 1.16),
    );
    size = 32;
    do {
      ctx.font = `400 ${size}px sans-serif`;
      lines = textLines(ctx, role.title, cw - 56);
      if (lines.length <= 3) {
        break;
      }
      size--;
    } while (size > 12);
    lines.forEach((line, j) =>
      ctx.fillText(line, x + 28, y + 246 + j * size * 1.25),
    );
    ctx.fillStyle = "#866346";
    ctx.font = "26px monospace";
    ctx.fillText(role.period, x + 28, y + ch - 35);
  });
}

export function buildStoryRecord({
  record,
  experience,
  craft,
  palette,
  textureCanvas,
  material,
  group,
  mesh,
  box,
  bar,
  screw,
}) {
  // A shadow-box of separate archival career cards; all roles stay source-backed.
  box(0.81, 1.22, 0.055, palette.wood, [0, 0, 0], record, 0.01);
  const backing = material(0x9b937c, {
    roughness: 0.98,
    bumpMap: craft.weave,
    bumpScale: 0.006,
  });
  box(0.752, 1.157, 0.009, backing, [0, 0, 0.032], record, 0.001);
  const atlas = textureCanvas(1024, 1536, (ctx, w, h) =>
    paintStoryAtlas(ctx, w, h, experience),
  );
  const paper = material(0xffffff, { map: atlas, roughness: 0.91 });
  const rows = Math.ceil(experience.length / 2);
  experience.forEach((role, i) => {
    const card = group(record, [
      i % 2 === 0 ? -0.18 : 0.18,
      0.373 - Math.floor(i / 2) * 0.373,
      0.043 + (i % 2) * 0.002,
    ]);
    card.rotation.z = [-0.017, 0.012, -0.011, 0.008, 0.009, -0.015][i % 6];
    box(0.329, 0.343, 0.003, craft.paperEdge, [0, 0, 0], card, 0.001);
    const geometry = new THREE.PlaneGeometry(0.325, 0.337, 4, 8);
    const p = geometry.attributes.position,
      uv = geometry.attributes.uv;
    for (let j = 0; j < p.count; j++) {
      p.setZ(j, 0.004 * Math.pow(Math.max(0, -p.getY(j) / 0.168), 3));
      uv.setXY(
        j,
        ((i % 2) + uv.getX(j)) / 2,
        1 - (Math.floor(i / 2) + 1 - uv.getY(j)) / rows,
      );
    }
    geometry.computeVertexNormals();
    mesh(geometry, paper, [0, 0, 0.002], card, false);
    // Archival photo corners hold the notes without fake signatures or seals.
    for (const x of [-0.156, 0.156]) {
      for (const y of [-0.161, 0.161]) {
        box(0.02, 0.013, 0.004, palette.paper, [x, y, 0.006], card, 0.001);
      }
    }
  });
  for (const x of [-0.391, 0.391]) {
    box(0.024, 1.2, 0.045, palette.lightWood, [x, 0, 0.047], record, 0.004);
  }
  for (const y of [-0.592, 0.592]) {
    box(0.805, 0.024, 0.045, palette.lightWood, [0, y, 0.047], record, 0.004);
  }
  const glazing = mesh(
    new THREE.PlaneGeometry(0.75, 1.155),
    craft.glass,
    [0, 0, 0.072],
    record,
    false,
  );
  glazing.raycast = () => {};
  // Picture wire and two D-ring fasteners are visible above the shadow box.
  bar([-0.21, 0.612, 0], [0, 0.69, -0.01], 0.003, craft.aluminum, record);
  bar([0, 0.69, -0.01], [0.21, 0.612, 0], 0.003, craft.aluminum, record);
  screw([0, 0.69, 0.001], record, 0.009);
}
