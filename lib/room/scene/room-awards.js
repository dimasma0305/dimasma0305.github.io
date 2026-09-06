import * as THREE from "three";
import { textLines } from "./room-surfaces.js";

// Representative display objects, never claimed to be official event replicas.
// One object per source record: no multiplied cups or invented achievements.
export function awardDisplayPlan(items) {
  const columns = 7;
  const rows = Math.max(1, Math.ceil(items.length / columns));
  return {
    columns,
    rows,
    width: 2.2,
    height: 0.16 + rows * 0.52,
    awards: items.map((item, index) => ({
      ...item,
      index,
      row: Math.floor(index / columns),
      column: index % columns,
      finish: /^1st/.test(item.title)
        ? "gold"
        : /^2nd/.test(item.title)
          ? "silver"
          : "bronze",
      form: /Bug Bounty/i.test(item.event)
        ? "plaque"
        : ["chalice", "fluted", "classic"][index % 3],
      scale: 0.39 + (index % 3) * 0.018,
    })),
  };
}

export function createAwardBowl(form) {
  const profiles = {
    chalice: [
      [0.055, 0.36],
      [0.075, 0.4],
      [0.09, 0.46],
      [0.135, 0.54],
      [0.188, 0.66],
      [0.217, 0.79],
      [0.224, 0.9],
      [0.216, 0.915],
      [0.204, 0.903],
      [0.202, 0.79],
      [0.172, 0.66],
      [0.12, 0.54],
      [0.073, 0.46],
      [0.054, 0.42],
    ],
    fluted: [
      [0.065, 0.38],
      [0.09, 0.41],
      [0.14, 0.47],
      [0.21, 0.6],
      [0.244, 0.75],
      [0.25, 0.88],
      [0.243, 0.895],
      [0.232, 0.884],
      [0.229, 0.75],
      [0.196, 0.6],
      [0.127, 0.48],
      [0.08, 0.43],
      [0.063, 0.42],
    ],
    classic: [
      [0.064, 0.36],
      [0.08, 0.4],
      [0.136, 0.45],
      [0.22, 0.54],
      [0.27, 0.65],
      [0.283, 0.76],
      [0.28, 0.83],
      [0.27, 0.84],
      [0.26, 0.828],
      [0.262, 0.76],
      [0.252, 0.65],
      [0.2, 0.55],
      [0.117, 0.47],
      [0.064, 0.43],
    ],
  };
  const profile = profiles[form] || profiles.classic;
  const geometry = new THREE.LatheGeometry(
    profile.map((p) => new THREE.Vector2(...p)),
    48,
  );
  if (form === "fluted") {
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i),
        z = position.getZ(i),
        y = position.getY(i);
      const radius = Math.hypot(x, z);
      const rib =
        0.004 *
        Math.sin(Math.atan2(x, z) * 16) *
        Math.sin(Math.PI * Math.max(0, Math.min(1, (y - 0.42) / 0.47)));
      position.setXYZ(i, x * (1 + rib / radius), y, z * (1 + rib / radius));
    }
    geometry.computeVertexNormals();
  }
  return geometry;
}

function fitLines(ctx, value, width, lines, size) {
  let wrapped;
  do {
    ctx.font = `600 ${size}px sans-serif`;
    wrapped = textLines(ctx, value, width);
    if (wrapped.length <= lines || size <= 10) {
      return { wrapped, size };
    }
    size--;
  } while (true);
}

export function paintAwardAtlas(ctx, w, h, plan) {
  const cellW = w / plan.columns,
    cellH = h / plan.rows;
  ctx.fillStyle = "#241f18";
  ctx.fillRect(0, 0, w, h);
  plan.awards.forEach((award) => {
    const x = award.column * cellW,
      y = award.row * cellH;
    const base = {
      gold: ["#e0ca94", "#a88848"],
      silver: ["#dae0dc", "#949f9e"],
      bronze: ["#d2ad8a", "#89664d"],
    }[award.finish];
    const gradient = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
    gradient.addColorStop(0, base[1]);
    gradient.addColorStop(0.35, base[0]);
    gradient.addColorStop(1, base[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);
    ctx.strokeStyle = "#594d3670";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 12, y + 12, cellW - 24, cellH - 24);
    ctx.textAlign = "center";
    ctx.fillStyle = "#29281f";
    ctx.font = "600 23px sans-serif";
    ctx.fillText(award.title.toUpperCase(), x + cellW / 2, y + 43);
    const { wrapped, size } = fitLines(ctx, award.event, cellW - 40, 3, 24);
    wrapped.forEach((line, i) =>
      ctx.fillText(line, x + cellW / 2, y + 79 + i * size * 1.17),
    );
    ctx.font = "500 17px sans-serif";
    ctx.fillText(award.date, x + cellW / 2, y + 174);
    const team = fitLines(ctx, award.team, cellW - 40, 1, 17);
    team.wrapped.forEach((line, i) =>
      ctx.fillText(line, x + cellW / 2, y + 202 + i * team.size * 1.12),
    );
  });
}

export function buildAwardDisplay({
  items,
  world,
  craft,
  palette,
  reflection,
  material,
  textureCanvas,
  group,
  mesh,
  box,
  cylinder,
  bar,
  pipe,
  screw,
}) {
  const plan = awardDisplayPlan(items);
  const cabinet = group(world, [2.04, 0.11, -2.31]);
  cabinet.name = "achievement-display";
  const oak = material(0x66442e, {
    map: craft.oak,
    roughness: 0.43,
    bumpMap: craft.pores,
    bumpScale: 0.001,
  });
  const backing = material(0x29231d, { map: craft.oak, roughness: 0.78 });
  const brass = material(0xb0955e, {
    metalness: 0.87,
    roughness: 0.26,
    envMap: reflection,
    envMapIntensity: 0.65,
  });
  const metals = Object.fromEntries(
    Object.entries({ gold: 0xe9c36e, silver: 0xe1e4e4, bronze: 0xc4875b }).map(
      ([name, color]) => [
        name,
        material(color, {
          metalness: 0.98,
          roughness: 0.2,
          roughnessMap: craft.brushed,
          envMap: reflection,
          envMapIntensity: 0.95,
        }),
      ],
    ),
  );
  const marbleMap = textureCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#34393a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 22; i++) {
      ctx.strokeStyle = i % 3 ? "#77827a30" : "#d5d5bb55";
      ctx.lineWidth = i % 3 ? 0.5 : 1.5;
      ctx.beginPath();
      for (let y = 0; y <= h; y += 4) {
        const x =
          i * 27 -
          170 +
          y * 0.65 +
          Math.sin(y * 0.026 + i * 1.3) * 13 +
          Math.sin(y * 0.12 + i) * 2;
        if (y === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  });
  const marble = material(0xc2c5be, {
    map: marbleMap,
    roughness: 0.24,
    metalness: 0.05,
    envMap: reflection,
    envMapIntensity: 0.45,
  });
  const felt = material(0x193029, {
    roughness: 1,
    bumpMap: craft.weave,
    bumpScale: 0.002,
  });
  const labelAtlas = textureCanvas(3584, 256 * plan.rows, (ctx, w, h) =>
    paintAwardAtlas(ctx, w, h, plan),
  );
  const labelMaterial = material(0xffffff, {
    map: labelAtlas,
    roughness: 0.44,
    metalness: 0.32,
    envMap: reflection,
    envMapIntensity: 0.3,
  });
  const height = plan.height;
  // Solid joinery, a recessed back, raised feet, brass pegs and edge banding.
  box(
    2.12,
    height - 0.12,
    0.035,
    backing,
    [0, height / 2, -0.24],
    cabinet,
    0.005,
  );
  for (const x of [-1.065, 1.065]) {
    box(0.07, height, 0.59, oak, [x, height / 2, 0.015], cabinet, 0.012);
    box(
      0.011,
      height - 0.08,
      0.01,
      brass,
      [x, height / 2, 0.316],
      cabinet,
      0.002,
    );
    for (let y = 0.28; y < height - 0.1; y += 0.1) {
      for (const z of [-0.12, 0.19]) {
        const peg = cylinder(
          0.007,
          0.007,
          0.002,
          brass,
          [x - Math.sign(x) * 0.036, y, z],
          cabinet,
          8,
        );
        peg.rotation.z = Math.PI / 2;
      }
    }
  }
  for (const x of [-0.91, 0.91]) {
    for (const z of [-0.18, 0.23]) {
      box(0.13, 0.12, 0.13, oak, [x, 0.03, z], cabinet, 0.012);
    }
  }
  for (const y of [0.1, height]) {
    box(
      2.23,
      0.075,
      y === 0.1 ? 0.58 : 0.64,
      oak,
      [0, y, 0.025],
      cabinet,
      0.012,
    );
    box(
      2.1,
      0.008,
      0.012,
      brass,
      [0, y - 0.02, y === 0.1 ? 0.315 : 0.35],
      cabinet,
      0.002,
    );
  }
  // Shelf lighting is a static reflection cue, not an extra shadow-casting light.
  const diffuser = material(0xf6dba4, {
    emissive: 0xf8c778,
    emissiveIntensity: 0.65,
    roughness: 0.7,
  });
  const washTexture = textureCanvas(64, 128, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "rgba(255,208,130,.16)");
    gradient.addColorStop(1, "rgba(255,208,130,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
  const washMaterial = material(0xffdeaf, {
    map: washTexture,
    transparent: true,
    depthWrite: false,
    emissive: 0x806033,
    emissiveIntensity: 0.3,
  });
  for (let row = 0; row < plan.rows; row++) {
    const y = 0.16 + (plan.rows - 1 - row) * 0.52;
    box(2.1, 0.05, 0.57, oak, [0, y - 0.025, 0.025], cabinet, 0.007);
    box(2.1, 0.105, 0.025, oak, [0, y - 0.05, 0.319], cabinet, 0.004);
    box(2, 0.003, 0.46, felt, [0, y + 0.002, 0.01], cabinet, 0.001);
    box(2.02, 0.006, 0.008, brass, [0, y - 0.02, 0.317], cabinet, 0.001);
    box(1.99, 0.012, 0.028, diffuser, [0, y + 0.457, -0.167], cabinet, 0.004);
    const wash = mesh(
      new THREE.PlaneGeometry(2.01, 0.4),
      washMaterial,
      [0, y + 0.23, -0.219],
      cabinet,
      false,
    );
    wash.raycast = () => {};
    for (const x of [-0.96, 0.96]) {
      screw([x, y - 0.024, 0.316], cabinet, 0.007);
    }
  }
  const bowls = Object.fromEntries(
    ["chalice", "fluted", "classic"].map((form) => [
      form,
      createAwardBowl(form),
    ]),
  );
  const footGeometry = new THREE.LatheGeometry(
    [
      [0.15, 0.1],
      [0.15, 0.122],
      [0.12, 0.145],
      [0.082, 0.165],
      [0.054, 0.23],
      [0.04, 0.29],
      [0.055, 0.34],
      [0.078, 0.36],
      [0.078, 0.385],
    ].map((p) => new THREE.Vector2(...p)),
    32,
  );
  // A shared engraved-label atlas lets all 21 distinct inscriptions batch.
  function label(award, parent, width, height, pos) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        (award.column + uv.getX(i)) / plan.columns,
        1 - (award.row + 1 - uv.getY(i)) / plan.rows,
      );
    }
    mesh(geometry, labelMaterial, pos, parent, false);
  }
  plan.awards.forEach((award) => {
    const x = (award.column - 3) * 0.289;
    const floor = 0.16 + (plan.rows - 1 - award.row) * 0.52;
    const trophy = group(cabinet, [
      x,
      floor + 0.004,
      0.19 + (award.column % 2) * 0.012,
    ]);
    trophy.name = `award-${award.index + 1}`;
    trophy.userData.achievement = {
      event: award.event,
      title: award.title,
      date: award.date,
      team: award.team,
    };
    trophy.scale.setScalar(award.scale);
    trophy.rotation.y = ((award.column % 3) - 1) * 0.025;
    const metal = metals[award.finish];
    // Actual mass: chamfered stone, a felt underside and a mechanically mounted plaque.
    box(0.46, 0.09, 0.34, marble, [0, 0.053, 0], trophy, 0.016);
    box(0.425, 0.01, 0.31, felt, [0, 0.004, 0], trophy, 0.003);
    box(0.39, 0.012, 0.29, metal, [0, 0.104, 0], trophy, 0.004);
    if (award.form === "plaque") {
      const recognition = group(trophy, [0, 0.47, -0.025]);
      recognition.rotation.x = -0.065;
      box(0.47, 0.71, 0.065, marble, [0, 0, 0], recognition, 0.013);
      box(0.424, 0.659, 0.012, metal, [0, 0, 0.037], recognition, 0.009);
      label(award, recognition, 0.396, 0.613, [0, 0, 0.044]);
      bar([-0.16, 0.11, -0.1], [-0.16, 0.43, -0.07], 0.014, brass, trophy);
      bar([0.16, 0.11, -0.1], [0.16, 0.43, -0.07], 0.014, brass, trophy);
    } else {
      mesh(footGeometry, metal, [0, 0, 0], trophy);
      mesh(bowls[award.form], metal, [0, 0, 0], trophy);
      const rimY =
        award.form === "chalice"
          ? 0.907
          : award.form === "fluted"
            ? 0.889
            : 0.835;
      const radius =
        award.form === "chalice"
          ? 0.214
          : award.form === "fluted"
            ? 0.24
            : 0.269;
      const rim = mesh(
        new THREE.TorusGeometry(radius, 0.006, 6, 48),
        metal,
        [0, rimY, 0],
        trophy,
      );
      rim.rotation.x = Math.PI / 2;
      cylinder(0.05, 0.053, 0.008, metal, [0, 0.323, 0], trophy, 24);
      for (const side of [-1, 1]) {
        // Open cast-scroll handles attach to bowl + neck, never floating rings.
        pipe(
          [
            [side * radius * 0.91, rimY - 0.08, 0],
            [side * 0.31, rimY - 0.025, 0],
            [side * 0.322, rimY - 0.17, 0],
            [side * 0.254, rimY - 0.32, 0],
            [side * 0.083, 0.386, 0],
          ],
          0.013,
          metal,
          trophy,
          18,
        );
      }
      box(0.375, 0.085, 0.009, metal, [0, 0.053, 0.174], trophy, 0.006);
      // Full inscription sits on the physical shelf edge; base carries placement.
      const geometry = new THREE.PlaneGeometry(0.35, 0.065);
      const uv = geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(
          i,
          (award.column + 0.05 + uv.getX(i) * 0.9) / plan.columns,
          1 - (award.row + 0.04 + (1 - uv.getY(i)) * 0.19) / plan.rows,
        );
      }
      mesh(geometry, labelMaterial, [0, 0.053, 0.18], trophy, false);
    }
    // Slim removable museum-style brass card for every object, with full provenance.
    const card = group(cabinet, [x, floor - 0.051, 0.336]);
    box(0.266, 0.118, 0.007, brass, [0, 0, 0], card, 0.003);
    label(award, card, 0.256, 0.111, [0, 0, 0.004]);
  });
  return { cabinet, plan };
}
