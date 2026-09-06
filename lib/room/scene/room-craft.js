import * as THREE from "three";

// Small deterministic procedural maps: no remote assets and no per-frame work.
export function seededNoise(seed = 7) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function paintOak(ctx, w, h) {
  const random = seededNoise(29);
  const pixels = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w,
        ny = y / h;
      const knot = Math.hypot((nx - 0.68) * 3.2, (ny - 0.47) * 2.6);
      const bend =
        Math.sin(nx * 8 + ny * 3) * 7 +
        Math.sin(nx * 21 + ny * 13) * 1.7 +
        Math.exp(-knot * 5) * 17;
      const grain =
        Math.sin(y * 0.52 + bend) * 8 + Math.sin(y * 1.7 + bend * 1.8) * 3;
      const value = 221 + grain + (random() - 0.5) * 12;
      const i = (y * w + x) * 4;
      pixels.data.set([value, value - 8, value - 20, 255], i);
    }
  }
  ctx.putImageData(pixels, 0, 0);
}

export function paintWeave(ctx, w, h) {
  const random = seededNoise(41);
  const pixels = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const warp = Math.sin((x * Math.PI) / 3),
        weft = Math.sin((y * Math.PI) / 3);
      const value = 182 + warp * 22 + weft * 17 + (random() - 0.5) * 18;
      const i = (y * w + x) * 4;
      pixels.data.set([value, value, value, 255], i);
    }
  }
  ctx.putImageData(pixels, 0, 0);
}

export function paintCork(ctx, w, h) {
  const random = seededNoise(23);
  ctx.fillStyle = "#c9ad84";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 30000; i++) {
    const value = Math.floor(166 + random() * 45);
    ctx.fillStyle = `rgba(${value + 30},${value + 12},${value - 13},.45)`;
    ctx.fillRect(
      random() * w,
      random() * h,
      0.6 + random() * 2,
      0.6 + random() * 1.3,
    );
  }
}

export function createRoomMaterials({ textureCanvas, material }) {
  const oak = textureCanvas(512, 256, paintOak);
  const weave = textureCanvas(256, 256, paintWeave);
  weave.colorSpace = THREE.NoColorSpace;
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(3, 3);
  const cork = textureCanvas(512, 512, paintCork);
  const pores = textureCanvas(256, 256, (ctx, w, h) => {
    const random = seededNoise(59);
    ctx.fillStyle = "#bcbcbc";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10000; i++) {
      const value = 130 + Math.floor(random() * 105);
      ctx.fillStyle = `rgb(${value},${value},${value})`;
      ctx.fillRect(random() * w, random() * h, 1, 1);
    }
  });
  pores.colorSpace = THREE.NoColorSpace;
  pores.wrapS = pores.wrapT = THREE.RepeatWrapping;
  pores.repeat.set(3, 3);
  const brushed = textureCanvas(256, 256, (ctx, w, h) => {
    const random = seededNoise(77);
    for (let y = 0; y < h; y++) {
      const value = 125 + Math.floor(random() * 85);
      ctx.fillStyle = `rgb(${value},${value},${value})`;
      ctx.fillRect(0, y, w, 1);
    }
  });
  brushed.colorSpace = THREE.NoColorSpace;
  const leafMap = textureCanvas(256, 512, (ctx, w, h) => {
    ctx.fillStyle = "#b4c5a0";
    ctx.fillRect(0, 0, w, h);
    const shade = ctx.createLinearGradient(0, 0, w, 0);
    shade.addColorStop(0, "#56723b");
    shade.addColorStop(0.46, "#c0d19c");
    shade.addColorStop(0.51, "#77914f");
    shade.addColorStop(1, "#647f49");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e0dcaa60";
    ctx.lineWidth = 2;
    for (let y = 32; y < h; y += 40) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(w / 2, y);
        ctx.quadraticCurveTo(
          w / 2 + side * 65,
          y + 25,
          w / 2 + side * 110,
          y + 70,
        );
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#d6d5a1";
    ctx.fillRect(w / 2 - 1, 0, 2, h);
  });
  const pages = textureCanvas(128, 512, (ctx, w, h) => {
    const random = seededNoise(121);
    ctx.fillStyle = "#ede6d7";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2 + Math.floor(random() * 3)) {
      ctx.fillStyle = `rgba(111,102,79,${0.06 + random() * 0.18})`;
      ctx.fillRect(0, y, w, 0.55 + random() * 0.4);
    }
  });
  return {
    oak,
    cork,
    weave,
    pores,
    brushed,
    shell: material(0x242b2b, {
      roughness: 0.46,
      bumpMap: pores,
      bumpScale: 0.0015,
    }),
    rubber: material(0x1a211f, { roughness: 0.94 }),
    aluminum: material(0xa6ada7, {
      metalness: 0.88,
      roughness: 0.38,
      roughnessMap: brushed,
    }),
    ceramic: material(0xe9e5d6, { roughness: 0.21 }),
    coffee: material(0x24140b, { roughness: 0.16 }),
    leather: material(0x855237, {
      roughness: 0.67,
      bumpMap: pores,
      bumpScale: 0.007,
    }),
    fabric: material(0xa06f53, {
      roughness: 0.98,
      bumpMap: weave,
      bumpScale: 0.008,
    }),
    thread: material(0xd6bb91, { roughness: 1 }),
    paperEdge: material(0xe3d8bc, {
      map: pages,
      roughness: 0.93,
      bumpMap: pores,
      bumpScale: 0.001,
    }),
    stone: material(0x29302e, {
      roughness: 0.31,
      bumpMap: pores,
      bumpScale: 0.004,
    }),
    // The atlas already supplies green pigment; a second dark green tint
    // would crush the veins and shaded faces to black in evening lighting.
    leaf: material(0xc0ca9e, {
      map: leafMap,
      roughness: 0.54,
      side: THREE.DoubleSide,
    }),
    leafLight: material(0xe1dfb6, {
      map: leafMap,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
    glass: material(0xd6e4dc, {
      metalness: 0.15,
      roughness: 0.14,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
    }),
  };
}

// Revolved cross-sections include the inner wall: cups are not solid cones.
export const mugProfile = [
  [0.001, -0.109],
  [0.07, -0.109],
  [0.085, -0.101],
  [0.099, -0.086],
  [0.112, 0.085],
  [0.114, 0.106],
  [0.11, 0.116],
  [0.1, 0.116],
  [0.097, 0.106],
  [0.092, -0.069],
  [0.075, -0.085],
  [0.001, -0.085],
];
export const trophyProfile = [
  [0.052, 0.278],
  [0.077, 0.292],
  [0.108, 0.328],
  [0.152, 0.391],
  [0.18, 0.47],
  [0.189, 0.521],
  [0.188, 0.541],
  [0.177, 0.541],
  [0.17, 0.516],
  [0.161, 0.465],
  [0.136, 0.395],
  [0.095, 0.332],
  [0.054, 0.31],
];

export function createLeafGeometry() {
  const positions = [],
    uv = [],
    indices = [];
  const rows = 14,
    columns = 8;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const width = 0.245 * Math.pow(Math.sin(t * Math.PI), 0.8);
    for (let col = 0; col <= columns; col++) {
      const u = col / columns,
        side = u * 2 - 1;
      positions.push(
        side * width,
        t,
        0.1 * Math.sin(t * Math.PI) +
          side * side * 0.045 * Math.sin(t * Math.PI),
      );
      uv.push(u, t);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col,
          b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
