import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Desk-local coordinates. The reading surfaces remain in their original places.
export const gamingLayout = {
  tower: [1.66, 1.608, -0.38],
  quest: [1.03, 1.608, -0.36],
  keyboard: [-0.16, 1.627, 0.36],
};

// A complete compact keyboard, including the alphabet's previously missing row.
export function gamingKeys() {
  const rows = [
    "ESC 1 2 3 4 5 6 7 8 9 0 - DEL",
    "TAB Q W E R T Y U I O P [ ]",
    "CAP A S D F G H J K L ; ' RET",
    "SHIFT Z X C V B N M , . / ↑ FN",
    "CTRL WIN ALT _ _ _ _ _ _ ALT ← ↓ →",
  ];
  const keys = [];
  rows.forEach((row, r) =>
    row.split(" ").forEach((label, c) => {
      if (label === "_") {
        return;
      }
      keys.push({
        label,
        x: -0.516 + c * 0.086,
        z: -0.158 + r * 0.079,
        width: 0.072,
      });
    }),
  );
  keys.push({ label: "", x: -0.043, z: 0.158, width: 0.502 });
  return keys;
}

export function buildGamingSetup({
  desk,
  computer,
  world,
  craft,
  material,
  group,
  box,
  mesh,
  cylinder,
  sphere,
  bar,
  pipe,
  screw,
  detailTexture,
  texturedPlane,
  reflectionMap,
}) {
  const metal = material(0x242a2d, {
    metalness: 0.65,
    roughness: 0.36,
    envMap: reflectionMap,
    envMapIntensity: 0.4,
  });
  const graphite = material(0x252a30, { roughness: 0.59 });
  const keycap = material(0x42494d, { roughness: 0.66 });
  const white = material(0xe5e4df, { roughness: 0.38 });
  const softWhite = material(0xd1d1c9, {
    roughness: 0.94,
    bumpMap: craft.weave,
    bumpScale: 0.0015,
  });
  const pcb = material(0x1e3030, { roughness: 0.66, metalness: 0.2 });
  const cyan = material(0x68c9d0, {
    emissive: 0x42b7cc,
    emissiveIntensity: 0.95,
    roughness: 0.4,
  });
  const violet = material(0x8c92d7, {
    emissive: 0x787fd0,
    emissiveIntensity: 0.75,
    roughness: 0.4,
  });
  const amber = material(0xdbac73, {
    emissive: 0xd1904e,
    emissiveIntensity: 0.65,
  });
  const glass = material(0x78898b, {
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    roughness: 0.12,
    metalness: 0.15,
    envMap: reflectionMap,
    envMapIntensity: 0.32,
    side: THREE.DoubleSide,
  });
  const lens = material(0x10212b, {
    metalness: 0.65,
    roughness: 0.09,
    envMap: reflectionMap,
    envMapIntensity: 0.8,
  });
  const ring = (radius, tube, mat, pos, parent, segments = 32) =>
    mesh(new THREE.TorusGeometry(radius, tube, 6, segments), mat, pos, parent);
  const disc = (r, depth, mat, pos, parent) => {
    const object = cylinder(r, r, depth, mat, pos, parent, 24);
    object.rotation.x = Math.PI / 2;
    return object;
  };

  // Slim articulated VESA support and a quiet monitor bias-light strip.
  const arm = group(computer);
  bar([0, 0.18, -0.1], [0.24, 0.55, -0.24], 0.032, metal, arm);
  bar([0.24, 0.55, -0.24], [0, 0.91, -0.18], 0.032, metal, arm);
  for (const p of [
    [0, 0.18, -0.1],
    [0.24, 0.55, -0.24],
    [0, 0.91, -0.18],
  ]) {
    disc(0.048, 0.063, metal, p, arm);
  }
  box(0.26, 0.26, 0.033, metal, [0, 0.91, -0.158], arm, 0.012);
  box(1.44, 0.006, 0.008, cyan, [0, 0.373, -0.016], computer, 0.002);
  pipe(
    [
      [0, 0.88, -0.2],
      [0.2, 0.56, -0.29],
      [0.03, 0.16, -0.17],
      [0.33, 0.03, -0.37],
    ],
    0.009,
    craft.rubber,
    arm,
  );

  // Extended cloth deskpad, individually raised keys, switch-light seams.
  box(1.77, 0.01, 0.5, craft.rubber, [0.105, 1.619, 0.35], desk, 0.035);
  box(1.73, 0.002, 0.46, craft.leather, [0.105, 1.625, 0.35], desk, 0.03);
  const keyboard = group(desk, gamingLayout.keyboard);
  keyboard.name = "Mechanical gaming keyboard";
  box(1.18, 0.06, 0.444, metal, [0, 0.027, 0], keyboard, 0.024);
  box(1.135, 0.008, 0.408, cyan, [0, 0.059, 0], keyboard, 0.014);
  box(1.125, 0.008, 0.399, graphite, [0, 0.064, 0], keyboard, 0.012);
  const keys = gamingKeys();
  for (const key of keys) {
    box(
      key.width,
      0.031,
      0.065,
      key.label === "ESC"
        ? amber
        : ["W", "A", "S", "D"].includes(key.label)
          ? metal
          : keycap,
      [key.x, 0.081, key.z],
      keyboard,
      0.007,
    );
    box(
      key.width - 0.009,
      0.003,
      0.052,
      key.label === "ESC" ? amber : keycap,
      [key.x, 0.098, key.z + 0.001],
      keyboard,
      0.006,
    );
  }
  const legends = detailTexture(1440, 520, (ctx, w, h) => {
    ctx.fillStyle = "#ecf1e9";
    ctx.font = "500 17px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    keys.forEach((key) =>
      ctx.fillText(
        key.label,
        (key.x / 1.16 + 0.5) * w,
        (key.z / 0.419 + 0.5) * h,
      ),
    );
  });
  const labels = texturedPlane(
    1.16,
    0.419,
    legends,
    [0, 0.1, 0],
    keyboard,
    true,
  );
  labels.rotation.x = -Math.PI / 2;
  labels.material.transparent = true;
  labels.material.depthWrite = false;
  for (const x of [-0.55, 0.55]) {
    screw([x, 0.032, 0.225], keyboard, 0.005);
  }
  box(0.054, 0.019, 0.026, craft.rubber, [-0.43, 0.03, -0.23], keyboard, 0.004);
  pipe(
    [
      [-0.43, 0.03, -0.244],
      [-0.43, 0.025, -0.33],
      [-0.25, 0.022, -0.43],
      [0.19, 0.022, -0.45],
    ],
    0.006,
    craft.rubber,
    keyboard,
    20,
  );

  const mouse = group(desk, [0.68, 1.635, 0.33]);
  mouse.name = "Gaming mouse";
  sphere(1, graphite, [0, 0.014, 0], mouse).scale.set(0.077, 0.012, 0.126);
  sphere(1, cyan, [0, 0.025, 0], mouse).scale.set(0.074, 0.006, 0.12);
  const shell = sphere(0.12, graphite, [0, 0.03, 0.01], mouse);
  shell.scale.set(0.64, 0.42, 1.02);
  for (const x of [-0.036, 0.036]) {
    const button = box(
      0.062,
      0.017,
      0.092,
      keycap,
      [x, 0.068, -0.055],
      mouse,
      0.014,
    );
    button.rotation.x = -0.09;
  }
  const wheel = cylinder(
    0.018,
    0.018,
    0.022,
    craft.rubber,
    [0, 0.079, -0.06],
    mouse,
    24,
  );
  wheel.rotation.z = Math.PI / 2;
  for (const x of [-0.007, 0.007]) {
    const edge = ring(0.0185, 0.0018, cyan, [x, 0.079, -0.06], mouse, 20);
    edge.rotation.y = Math.PI / 2;
  }
  for (const z of [-0.005, 0.043]) {
    box(0.009, 0.013, 0.035, metal, [-0.073, 0.039, z], mouse, 0.004);
  }
  box(0.013, 0.008, 0.024, metal, [0, 0.081, -0.007], mouse, 0.004);

  // Open chassis: the glass really reveals components, not an opaque cube.
  const tower = group(desk, gamingLayout.tower);
  tower.name = "Desktop gaming PC";
  const width = 0.54,
    depth = 0.76,
    height = 1.04;
  for (const x of [-0.207, 0.207]) {
    for (const z of [-0.29, 0.29]) {
      cylinder(0.041, 0.038, 0.037, craft.rubber, [x, 0.02, z], tower, 16);
    }
  }
  box(width, 0.035, depth, metal, [0, 0.057, 0], tower, 0.008);
  box(width, 0.033, depth, metal, [0, height, 0], tower, 0.008);
  box(0.018, 0.965, depth, graphite, [-0.26, 0.55, 0], tower, 0.004);
  box(width, 0.95, 0.018, metal, [0, 0.55, -0.371], tower, 0.003);
  for (const x of [-0.258, 0.258]) {
    for (const z of [-0.365, 0.365]) {
      box(0.024, 0.966, 0.025, metal, [x, 0.549, z], tower, 0.003);
    }
  }
  box(0.49, 0.163, 0.697, graphite, [0, 0.152, 0], tower, 0.006);
  box(0.008, 0.575, 0.448, pcb, [-0.239, 0.618, -0.065], tower, 0.003);
  // Board heatsinks, power stages, RAM and the cooled processor.
  for (let i = 0; i < 9; i++) {
    box(
      0.056,
      0.008,
      0.14,
      craft.aluminum,
      [-0.195, 0.82 + i * 0.012, -0.19],
      tower,
      0.001,
    );
  }
  for (let i = 0; i < 2; i++) {
    box(
      0.032,
      0.32,
      0.025,
      graphite,
      [-0.193, 0.676, 0.074 + i * 0.055],
      tower,
      0.003,
    );
    box(
      0.012,
      0.299,
      0.018,
      i ? violet : cyan,
      [-0.172, 0.68, 0.074 + i * 0.055],
      tower,
      0.003,
    );
  }
  const block = disc(0.078, 0.066, metal, [-0.184, 0.721, -0.065], tower);
  block.rotation.set(0, 0, Math.PI / 2);
  const blockLight = ring(0.061, 0.006, cyan, [-0.147, 0.721, -0.065], tower);
  blockLight.rotation.y = Math.PI / 2;
  box(0.4, 0.045, 0.61, graphite, [0, 0.982, -0.01], tower, 0.005);
  for (let i = 0; i < 16; i++) {
    box(
      0.352,
      0.016,
      0.009,
      craft.aluminum,
      [0, 0.951, -0.26 + i * 0.034],
      tower,
      0,
    );
  }
  for (const dz of [-0.035, 0.035]) {
    pipe(
      [
        [-0.13, 0.723, -0.065 + dz],
        [0.04, 0.76, -0.1 + dz],
        [0.075, 0.85, -0.22 + dz],
        [-0.035, 0.945, -0.26 + dz],
      ],
      0.013,
      craft.rubber,
      tower,
      24,
    );
  }
  // Horizontally seated graphics card, exposed fins and sleeved power leads.
  box(0.316, 0.085, 0.533, metal, [-0.052, 0.37, -0.046], tower, 0.01);
  box(0.323, 0.011, 0.537, graphite, [-0.052, 0.419, -0.046], tower, 0.003);
  for (let i = 0; i < 21; i++) {
    box(
      0.012,
      0.055,
      0.008,
      craft.aluminum,
      [0.111, 0.37, -0.289 + i * 0.024],
      tower,
      0,
    );
  }
  box(0.006, 0.008, 0.377, violet, [0.124, 0.41, -0.045], tower, 0.002);
  for (let i = 0; i < 5; i++) {
    pipe(
      [
        [0.09, 0.37, 0.12 + i * 0.014],
        [0.178, 0.318, 0.115 + i * 0.014],
        [0.147, 0.248, 0.09 + i * 0.014],
      ],
      0.005,
      craft.rubber,
      tower,
      12,
    );
  }

  function fan(parent, position, color, size = 0.109) {
    const assembly = group(parent, position);
    assembly.name = "Cooling fan";
    box(size * 2.3, size * 2.3, 0.031, graphite, [0, 0, 0], assembly, 0.012);
    disc(size * 0.97, 0.034, craft.rubber, [0, 0, 0.018], assembly);
    ring(size, 0.008, color, [0, 0, 0.04], assembly);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const blade = box(
        size * 0.45,
        size * 0.75,
        0.006,
        keycap,
        [Math.sin(a) * size * 0.49, Math.cos(a) * size * 0.49, 0.04],
        assembly,
        0.012,
      );
      blade.rotation.z = -a - 0.51;
    }
    disc(size * 0.25, 0.015, metal, [0, 0, 0.048], assembly);
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        screw([x * size, y * size, 0.023], assembly, 0.005);
      }
    }
    return assembly;
  }
  [cyan, violet, cyan].forEach((color, i) =>
    fan(tower, [0, 0.318 + i * 0.261, 0.31], color),
  );
  const rearFan = fan(tower, [0.006, 0.793, -0.34], amber, 0.088);
  rearFan.rotation.y = Math.PI;
  for (const z of [-0.175, 0.1]) {
    const top = fan(tower, [0.015, 0.926, z], cyan, 0.09);
    top.rotation.x = Math.PI / 2;
  }
  const side = mesh(
    new THREE.PlaneGeometry(0.716, 0.934),
    glass,
    [0.271, 0.548, 0],
    tower,
    false,
  );
  side.rotation.y = Math.PI / 2;
  mesh(
    new THREE.PlaneGeometry(0.467, 0.82),
    glass,
    [0, 0.59, 0.382],
    tower,
    false,
  );
  for (const y of [0.087, 1.005]) {
    for (const z of [-0.339, 0.339]) {
      const fastener = disc(0.011, 0.008, metal, [0.276, y, z], tower);
      fastener.rotation.set(0, 0, Math.PI / 2);
    }
  }
  for (let i = 0; i < 16; i++) {
    box(
      0.355,
      0.002,
      0.008,
      craft.rubber,
      [0, 1.058, -0.275 + i * 0.033],
      tower,
      0,
    );
  }
  cylinder(0.019, 0.019, 0.005, metal, [0.17, 1.061, 0.283], tower, 24);
  const powerRing = ring(0.011, 0.0018, cyan, [0.17, 1.064, 0.283], tower, 20);
  powerRing.rotation.x = -Math.PI / 2;
  for (const x of [-0.16, -0.085]) {
    box(0.041, 0.004, 0.015, craft.rubber, [x, 1.06, 0.285], tower, 0.002);
  }
  pipe(
    [
      [0.18, 0.14, -0.396],
      [0.22, -0.1, -0.5],
      [0.17, -1.43, -0.63],
      [-0.68, -1.338, -1.638],
    ],
    0.011,
    craft.rubber,
    tower,
    24,
  );

  // Quest 3: white curved visor, three sensor pills, fabric straps and a
  // ring-free Touch Plus pair. A representative hand-built model, not a CAD scan.
  const quest = group(desk, gamingLayout.quest);
  quest.name = "Meta Quest 3 with two Touch Plus controllers";
  box(0.49, 0.026, 0.57, graphite, [0, 0.014, 0], quest, 0.065);
  bar([0, 0.028, -0.05], [0, 0.275, -0.05], 0.016, metal, quest);
  box(0.185, 0.024, 0.11, craft.rubber, [0, 0.281, -0.01], quest, 0.027);
  const headset = group(quest, [0, 0.366, 0.057]);
  headset.name = "Quest 3 headset";
  mesh(
    new RoundedBoxGeometry(0.431, 0.211, 0.116, 4, 0.051),
    graphite,
    [0, 0, -0.032],
    headset,
  );
  mesh(
    new RoundedBoxGeometry(0.443, 0.205, 0.165, 4, 0.065),
    white,
    [0, 0.002, 0.017],
    headset,
  );
  const aperture = new THREE.Shape();
  aperture.moveTo(-0.018, -0.03);
  aperture.lineTo(-0.018, 0.03);
  aperture.absarc(0, 0.03, 0.018, Math.PI, 0, true);
  aperture.lineTo(0.018, -0.03);
  aperture.absarc(0, -0.03, 0.018, 0, -Math.PI, true);
  aperture.closePath();
  const apertureGeometry = new THREE.ExtrudeGeometry(aperture, {
    depth: 0.007,
    bevelEnabled: false,
    curveSegments: 12,
    steps: 1,
  });
  // Three discrete vertical apertures, not the Quest 3S's clustered circles.
  for (const x of [-0.139, 0, 0.139]) {
    const pod = group(headset, [x, 0.01, 0.098]);
    pod.name = "Quest 3 sensor pill";
    mesh(apertureGeometry, graphite, [0, 0, 0], pod);
    for (const y of x === 0 ? [0] : [-0.027, 0.027]) {
      disc(0.012, 0.004, craft.rubber, [0, y, 0.008], pod);
      disc(0.008, 0.002, lens, [0, y, 0.011], pod);
      disc(0.002, 0.001, white, [-0.002, y + 0.003, 0.0125], pod);
    }
  }
  for (const x of [-0.215, 0.215]) {
    box(0.021, 0.044, 0.108, white, [x, 0.022, -0.06], headset, 0.013);
    const port = box(
      0.003,
      0.011,
      0.028,
      graphite,
      [x * 1.051, 0.022, -0.026],
      headset,
      0.004,
    );
    port.name = x < 0 ? "USB-C port" : "Power button";
  }
  box(0.053, 0.009, 0.018, white, [0.057, -0.102, 0.015], headset, 0.005);
  for (const x of [-0.074, 0.074]) {
    disc(0.0025, 0.003, craft.rubber, [x, -0.047, 0.088], headset);
  }

  // Flat ribbon geometry keeps the fabric straps soft and open, not solid tubes.
  function strap(points, width, across) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const positions = [],
      indices = [],
      uvs = [];
    for (let i = 0; i <= 28; i++) {
      const p = curve.getPoint(i / 28);
      const axis =
        across === "x"
          ? new THREE.Vector3(1, 0, 0)
          : new THREE.Vector3(0, 1, 0);
      for (const sign of [-1, 1]) {
        const v = p.clone().addScaledVector(axis, (sign * width) / 2);
        positions.push(v.x, v.y, v.z);
        uvs.push((sign + 1) / 2, i / 28);
      }
      if (i < 28) {
        const n = i * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    mesh(geometry, softWhite, [0, 0, 0], headset);
  }
  softWhite.side = THREE.DoubleSide;
  strap(
    [
      [-0.209, 0.022, -0.08],
      [-0.191, 0.014, -0.188],
      [0, 0.006, -0.237],
      [0.191, 0.014, -0.188],
      [0.209, 0.022, -0.08],
    ],
    0.045,
    "y",
  );
  strap(
    [
      [0, 0.098, -0.014],
      [0, 0.163, -0.084],
      [0, 0.124, -0.185],
      [0, 0.012, -0.239],
    ],
    0.044,
    "x",
  );
  for (const x of [-0.068, 0.068]) {
    box(0.043, 0.053, 0.009, white, [x, 0.008, -0.237], headset, 0.007);
  }

  const controllerLabels = detailTexture(512, 256, (ctx) => {
    ctx.font = "600 74px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#dddddc";
    ["X", "Y", "A", "B"].forEach((key, i) =>
      ctx.fillText(key, 64 + i * 128, 128),
    );
  });
  for (const [i, sign] of [-1, 1].entries()) {
    const controller = group(quest, [sign * 0.135, 0.157, 0.183]);
    controller.name = `${sign < 0 ? "Left" : "Right"} Touch Plus controller`;
    controller.rotation.set(-0.48, sign * -0.15, sign * -0.18);
    const handle = sphere(1, white, [0, -0.026, 0.006], controller);
    handle.scale.set(0.039, 0.103, 0.044);
    const crown = sphere(1, white, [0, 0.063, -0.007], controller);
    crown.scale.set(0.064, 0.027, 0.063);
    cylinder(0.055, 0.057, 0.009, graphite, [0, 0.084, -0.007], controller, 32);
    cylinder(
      0.013,
      0.011,
      0.018,
      craft.rubber,
      [-sign * 0.023, 0.098, -0.019],
      controller,
      20,
    );
    cylinder(
      0.018,
      0.016,
      0.007,
      graphite,
      [-sign * 0.023, 0.109, -0.019],
      controller,
      24,
    );
    for (let j = 0; j < 2; j++) {
      const pos = [sign * 0.02, 0.093, -0.028 + j * 0.031];
      cylinder(0.01, 0.011, 0.006, keycap, pos, controller, 20);
      const geometry = new THREE.PlaneGeometry(0.014, 0.014);
      const uv = geometry.attributes.uv;
      for (let v = 0; v < uv.count; v++) {
        uv.setX(v, (uv.getX(v) + i * 2 + (1 - j)) / 4);
      }
      const labelMaterial = material(0xffffff, {
        map: controllerLabels,
        transparent: true,
        depthWrite: false,
      });
      const label = mesh(
        geometry,
        labelMaterial,
        [pos[0], 0.097, pos[2]],
        controller,
        false,
      );
      label.rotation.x = -Math.PI / 2;
    }
    cylinder(
      0.006,
      0.006,
      0.003,
      keycap,
      [-sign * 0.017, 0.092, 0.019],
      controller,
      16,
    );
    box(0.041, 0.03, 0.024, softWhite, [0, 0.054, -0.057], controller, 0.01);
    box(
      0.012,
      0.045,
      0.022,
      softWhite,
      [-sign * 0.036, 0.005, -0.008],
      controller,
      0.006,
    );
    pipe(
      [
        [0, -0.121, 0.005],
        [sign * 0.027, -0.133, 0.03],
        [sign * 0.039, -0.097, 0.059],
        [0, -0.121, 0.005],
      ],
      0.0025,
      softWhite,
      controller,
      18,
    );
    box(
      0.082,
      0.023,
      0.084,
      craft.rubber,
      [sign * 0.135, 0.039, 0.207],
      quest,
      0.024,
    );
  }
  const nameplate = detailTexture(512, 96, (ctx, w, h) => {
    ctx.fillStyle = "#c9d1cd";
    ctx.font = "500 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Meta Quest 3", w / 2, h * 0.67);
  });
  const name = texturedPlane(
    0.22,
    0.04,
    nameplate,
    [0, 0.036, 0.257],
    quest,
    true,
  );
  name.rotation.x = -Math.PI / 2;
  name.material.transparent = true;
  name.material.depthWrite = false;

  // The power cable terminates at the existing room outlet.
  box(0.2, 0.23, 0.024, white, [0.38, 0.28, -2.66], world, 0.013);
  for (const x of [0.34, 0.42]) {
    disc(0.012, 0.004, craft.rubber, [x, 0.31, -2.644], world);
  }
  screw([0.38, 0.195, -2.642], world, 0.007);

  return {
    tower,
    quest,
    keyboard,
    coolingFans: 6,
    controllers: 2,
    keys: keys.length,
  };
}
