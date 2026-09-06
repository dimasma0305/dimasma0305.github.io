import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildAwardDisplay } from "./room-awards.js";
import { buildGamingSetup } from "./room-gaming.js";
import {
  createCurtainGeometry,
  buildLibrary,
  buildStoryRecord,
  makeBoundBook,
} from "./room-life.js";
import {
  createRoomMaterials,
  createLeafGeometry,
  mugProfile,
  trophyProfile,
} from "./room-craft.js";
import {
  createFrameBudget,
  boundedPixelRatio,
  settledPixelRatio,
} from "./frame-budget.js";
import {
  paintWorkbench,
  paintNotebook,
  paintReview,
  paintExperience,
  paintResults,
  paintTeamStubs,
  paintSkillSpines,
} from "./room-surfaces.js";

// A purpose-built diorama. All geometry is local; the images belong to the portfolio.
export function createCornerScene({
  host,
  reducedMotion,
  onSelect,
  onError,
  onCinematicChange = () => {},
  theme = "room",
  enableInteractions = true,
  pixelRatioCap = 1.65,
  maxRenderPixels = Infinity,
  refineWhenIdle = false,
  maxDetailPixels = 4000000,
  minimumPixelRatio = 0.65,
  adaptiveRender = false,
  onPerformanceFallback,
  onTourFrame = () => {},
  hotspotAnchors = {},
  hideOffscreenHotspots = false,
  hotspotPadding = 72,
  readableSurfaces = false,
  portfolioDetails = false,
  portfolioSummary = {},
  assetBase = new URL("./", location.href).href,
}) {
  const canvas = document.createElement("canvas");
  canvas.className = "corner-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !adaptiveRender,
      powerPreference: adaptiveRender ? "default" : "low-power",
    });
  } catch {
    onError();
    return null;
  }
  host.prepend(canvas);
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, pixelRatioCap, innerWidth < 700 ? 1.4 : 1.65),
  );
  let requestedPixelRatio = renderer.getPixelRatio();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (theme === "midnight") {
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.setClearColor(0x000000, 0);
  const frameBudget = adaptiveRender
    ? createFrameBudget({
        gl: renderer.getContext(),
        pixelRatio: renderer.getPixelRatio(),
        minimumPixelRatio,
        onPixelRatio: (ratio) => {
          requestedPixelRatio = ratio;
          // Apply a resolution change only together with its replacement frame.
          // Never clear a held canvas while an earlier GPU frame is pending.
          invalidate();
        },
        onOverBudget: onPerformanceFallback,
      })
    : null;
  host.dataset.pixelRatio = renderer.getPixelRatio().toFixed(2);

  const scene = new THREE.Scene();
  const world = new THREE.Group();
  scene.add(world);
  const camera = new THREE.OrthographicCamera(-6, 6, 5, -5, 0.1, 60);
  const center = new THREE.Vector3(0, 1.98, -0.15);
  const look = center.clone();
  const goalLook = center.clone();
  const viewOffset = new THREE.Vector2();
  const goalViewOffset = new THREE.Vector2();
  let goalElevation = 8.8,
    tourControlled = false;
  let angle = 0.69,
    goalAngle = 0.69,
    zoom = 1,
    goalZoom = 1;
  let width = 0,
    height = 0,
    frameId = 0,
    disposed = false,
    visible = true,
    paused = false,
    renderRequested = true;
  let evening = false,
    selected = null,
    renderCount = 0;
  let cinematic = null,
    elevation = 8.8,
    accentBulbMaterial = null;
  let lastFrameTime = 0,
    lightingTween = null,
    lightReady = false;
  let detailTimer = 0,
    detailRequested = false,
    detailRendered = false;
  const curtains = [],
    steam = [],
    accentGlows = [];
  const materials = new Set(),
    geometries = new Set(),
    textures = new Set();
  const clickable = [];
  let reflectionTarget = null;
  const anchors = {
    work: new THREE.Vector3(-0.45, 2.65, -0.83),
    notes: new THREE.Vector3(-2.0, 1.6, 0.53),
    memories: new THREE.Vector3(2.5, 3.7, -2.38),
    community: new THREE.Vector3(0.27, 4.18, -2.46),
    about: new THREE.Vector3(-3.02, 2.67, 0.6),
  };
  for (const [id, point] of Object.entries(hotspotAnchors)) {
    anchors[id] = new THREE.Vector3(...point);
  }
  const hotspots = Object.entries(anchors)
    .map(([id, point]) => ({
      id,
      point,
      element: host.querySelector(`[data-corner-hotspot="${id}"]`),
    }))
    .filter(({ element }) => element);
  function material(color, extra = {}) {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.82,
      ...extra,
    });
    materials.add(m);
    return m;
  }
  const palette = {
    wall: material(0x9aac94),
    wallSide: material(0xadb99d),
    trim: material(0xe4dac3),
    floor: material(0xc8b28e),
    edge: material(0xb39971),
    wood: material(0x9c7350),
    lightWood: material(0xc49969),
    forest: material(0x496551),
    sage: material(0x78866b),
    dark: material(0x303a36),
    cream: material(0xf7ebd1),
    paper: material(0xf1e6c9),
    orange: material(0xc17141),
    terracotta: material(0xb46d4d),
    gold: material(0xc69f4d, { roughness: 0.35, metalness: 0.48 }),
    metal: material(0x56615a, { roughness: 0.4, metalness: 0.5 }),
    leaf: material(0x526d39),
    leafLight: material(0x779152),
    blue: material(0x69898b),
    pink: material(0xc99580),
    cork: material(0xaf8860),
    black: material(0x202f29),
  };
  if (theme === "slate") {
    const colors = {
      wall: 0x52647b,
      wallSide: 0x6a7d94,
      trim: 0xa6b7c9,
      forest: 0x345570,
      sage: 0x66859c,
      dark: 0x253346,
      cream: 0xc8d2d9,
      orange: 0xb1845d,
      metal: 0x3b5169,
      edge: 0x666b70,
      lightWood: 0x8e969f,
    };
    Object.entries(colors).forEach(([key, color]) =>
      palette[key].color.set(color),
    );
  }
  function group(parent = world, position = [0, 0, 0]) {
    const g = new THREE.Group();
    g.position.set(...position);
    parent.add(g);
    return g;
  }
  function mesh(
    geometry,
    mat,
    position = [0, 0, 0],
    parent = world,
    shadow = true,
  ) {
    geometries.add(geometry);
    const obj = new THREE.Mesh(geometry, mat);
    obj.position.set(...position);
    obj.castShadow = shadow;
    obj.receiveShadow = true;
    parent.add(obj);
    return obj;
  }
  function box(w, h, d, mat, pos, parent, radius = 0.025) {
    return mesh(
      radius
        ? new RoundedBoxGeometry(
            w,
            h,
            d,
            adaptiveRender && Math.min(w, h, d) < 0.1 ? 1 : 2,
            Math.min(radius, w / 4, h / 4, d / 4),
          )
        : new THREE.BoxGeometry(w, h, d),
      mat,
      pos,
      parent,
    );
  }
  function cylinder(top, bottom, h, mat, pos, parent, segments = 24) {
    return mesh(
      new THREE.CylinderGeometry(top, bottom, h, segments),
      mat,
      pos,
      parent,
    );
  }
  function sphere(r, mat, pos, parent) {
    return mesh(
      new THREE.SphereGeometry(
        r,
        portfolioDetails ? 24 : 16,
        portfolioDetails ? 16 : 10,
      ),
      mat,
      pos,
      parent,
    );
  }
  function bar(a, b, radius, mat, parent = world) {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    const obj = cylinder(
      radius,
      radius,
      start.distanceTo(end),
      mat,
      start.clone().add(end).multiplyScalar(0.5).toArray(),
      parent,
      12,
    );
    obj.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    );
    return obj;
  }
  function interactive(g, id) {
    g.traverse((obj) => {
      if (obj.isMesh) {
        obj.userData.destination = id;
        clickable.push(obj);
      }
    });
    return g;
  }
  function textureCanvas(w, h, paint, scale = 1) {
    const c = document.createElement("canvas");
    c.width = w * scale;
    c.height = h * scale;
    const ctx = c.getContext("2d");
    ctx.scale(scale, scale);
    paint(ctx, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.add(t);
    return t;
  }
  function detailTexture(w, h, paint) {
    return textureCanvas(w, h, paint, portfolioDetails ? 2 : 1);
  }
  const craft = portfolioDetails
    ? createRoomMaterials({ textureCanvas, material })
    : null;
  if (craft) {
    for (const key of ["wall", "wallSide", "trim", "sage"]) {
      palette[key].bumpMap = craft.pores;
      palette[key].bumpScale = key.startsWith("wall") ? 0.009 : 0.001;
      palette[key].roughness = key.startsWith("wall") ? 0.96 : 0.55;
    }
    for (const key of ["wood", "lightWood", "edge"]) {
      palette[key].map = craft.oak;
      palette[key].roughness = 0.57;
      palette[key].bumpMap = craft.pores;
      palette[key].bumpScale = 0.002;
    }
    palette.cork.map = craft.cork;
    palette.cork.bumpMap = craft.pores;
    palette.cork.bumpScale = 0.014;
    palette.cork.roughness = 1;
    palette.gold.metalness = 0.82;
    palette.gold.roughness = 0.27;
    palette.gold.roughnessMap = craft.brushed;
    palette.metal.metalness = 0.74;
    palette.metal.roughness = 0.32;
    palette.terracotta.bumpMap = craft.pores;
    palette.terracotta.bumpScale = 0.009;
    // One tiny prefiltered lighting environment, baked once. No reflection
    // probes or extra shadow passes during scrolling.
    const studio = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    reflectionTarget = generator.fromScene(studio, 0.04, 0.1, 100, {
      size: 128,
    });
    // Reflective objects get studio highlights; matte architecture keeps the
    // established dark-room lighting instead of receiving a global white wash.
    for (const mat of [
      palette.gold,
      palette.metal,
      craft.aluminum,
      craft.ceramic,
      craft.coffee,
      craft.shell,
      craft.glass,
      craft.stone,
    ]) {
      mat.envMap = reflectionTarget.texture;
      mat.envMapIntensity = 0.35;
    }
    studio.dispose();
    generator.dispose();
  }
  function turned(profile, mat, pos, parent) {
    return mesh(
      new THREE.LatheGeometry(
        profile.map(([r, y]) => new THREE.Vector2(r, y)),
        48,
      ),
      mat,
      pos,
      parent,
    );
  }
  function pipe(points, radius, mat, parent, segments = 24) {
    return mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        segments,
        radius,
        6,
        false,
      ),
      mat,
      [0, 0, 0],
      parent,
    );
  }
  function screw(pos, parent, radius = 0.009) {
    const head = cylinder(
      radius,
      radius,
      0.004,
      craft.aluminum,
      pos,
      parent,
      12,
    );
    head.rotation.x = Math.PI / 2;
    box(
      radius * 1.15,
      0.002,
      0.002,
      craft.rubber,
      [pos[0], pos[1], pos[2] + 0.003],
      parent,
      0,
    );
  }
  function frameMoulding(w, h, parent, z = 0.075) {
    for (const x of [-w / 2, w / 2]) {
      box(0.028, h, 0.032, palette.lightWood, [x, 0, z], parent, 0.006);
      box(
        0.008,
        h - 0.035,
        0.01,
        palette.gold,
        [x * 0.95, 0, z + 0.016],
        parent,
        0.002,
      );
    }
    for (const y of [-h / 2, h / 2]) {
      box(w + 0.028, 0.028, 0.032, palette.lightWood, [0, y, z], parent, 0.006);
      box(
        w - 0.05,
        0.008,
        0.01,
        palette.gold,
        [0, y * 0.96, z + 0.016],
        parent,
        0.002,
      );
    }
  }
  function texturedPlane(w, h, texture, pos, parent = world, emissive = false) {
    const mat = emissive
      ? new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
      : material(0xffffff, { map: texture, roughness: 0.94 });
    materials.add(mat);
    return mesh(new THREE.PlaneGeometry(w, h), mat, pos, parent, false);
  }
  const textureLoader = new THREE.TextureLoader();
  function photo(path, w, h, pos, parent) {
    const placeholder = textureCanvas(32, 32, (ctx) => {
      ctx.fillStyle = "#cbb893";
      ctx.fillRect(0, 0, 32, 32);
    });
    const plane = texturedPlane(
      w,
      h,
      placeholder,
      pos,
      parent,
      readableSurfaces,
    );
    textureLoader.load(
      new URL(path, assetBase).href,
      (t) => {
        if (disposed) {
          t.dispose();
          return;
        }
        textures.add(t);
        t.colorSpace = THREE.SRGBColorSpace;
        const imageAspect = t.image.width / t.image.height,
          targetAspect = w / h;
        if (imageAspect > targetAspect) {
          t.repeat.x = targetAspect / imageAspect;
          t.offset.x = (1 - t.repeat.x) / 2;
        } else {
          t.repeat.y = imageAspect / targetAspect;
          t.offset.y = (1 - t.repeat.y) / 2;
        }
        plane.material.map = t;
        plane.material.needsUpdate = true;
        invalidate();
      },
      undefined,
      () => {},
    );
    return plane;
  }

  const ambient = new THREE.HemisphereLight(0xfff5dc, 0x687758, 3.0);
  const sunlight = new THREE.DirectionalLight(0xffe4ad, 3.8);
  sunlight.position.set(-3, 8, 5);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(
    portfolioDetails ? 2048 : 1024,
    portfolioDetails ? 2048 : 1024,
  );
  sunlight.shadow.radius = portfolioDetails ? 2 : 1;
  Object.assign(sunlight.shadow.camera, {
    left: -6,
    right: 6,
    top: 7,
    bottom: -5,
    near: 0.1,
    far: 25,
  });
  sunlight.shadow.normalBias = 0.035;
  sunlight.shadow.bias = -0.0002;
  const fill = new THREE.DirectionalLight(0xe0f0ff, 2.0);
  fill.position.set(5, 5, -2);
  const lampLight = new THREE.PointLight(0xffc36c, 0, 5, 2);
  lampLight.position.set(-2.4, 2.25, -0.5);
  const screenLight = new THREE.PointLight(0xb6debf, 0.35, 3, 2);
  screenLight.position.set(-0.5, 2.1, -0.8);
  scene.add(ambient, sunlight, fill, lampLight, screenLight);

  // Raised model base, individually laid floorboards, and two open walls.
  box(6.85, 0.29, 5.7, palette.edge, [0, -0.2, 0], world, 0.12);
  box(6.77, 0.11, 5.61, palette.floor, [0, -0.015, 0], world, 0.065);
  const boardMaterials = [0xcfb995, 0xc6ad86, 0xcab18d, 0xd2bc9a].map((c) =>
    material(c),
  );
  for (let i = 0; i < 15; i++) {
    const z = -2.6 + i * 0.372;
    if (craft) {
      let x = -3.3,
        j = 0;
      while (x < 3.3) {
        const length = Math.min(j === 0 ? 1.08 + (i % 3) * 0.49 : 2.2, 3.3 - x);
        box(
          length - 0.012,
          0.026,
          0.354,
          boardMaterials[(i + j) % 4],
          [x + length / 2, 0.056, z],
          world,
          0.003,
        );
        x += length;
        j++;
      }
      continue;
    }
    for (let j = 0; j < 3; j++) {
      box(
        2.18,
        0.026,
        0.354,
        boardMaterials[(i + j) % 4],
        [-2.21 + j * 2.21, 0.056, z],
        world,
        0.006,
      );
    }
  }
  box(6.88, 4.45, 0.17, palette.wall, [0, 2.18, -2.77], world, 0.035);
  box(0.17, 4.45, 5.56, palette.wallSide, [-3.35, 2.18, -0.03], world, 0.035);
  box(6.85, 0.12, 0.22, palette.trim, [0, 4.38, -2.75], world, 0.022);
  box(0.22, 0.12, 5.6, palette.trim, [-3.34, 4.38, -0.04], world, 0.022);
  box(6.65, 0.19, 0.075, palette.trim, [0.03, 0.17, -2.65], world, 0.01);
  box(0.075, 0.19, 5.45, palette.trim, [-3.24, 0.17, 0.02], world, 0.01);
  // Low wall panelling gives the diorama some craft and scale.
  for (let i = 0; i < 12; i++) {
    box(
      0.034,
      0.73,
      0.035,
      palette.sage,
      [-3.08 + i * 0.55, 0.62, -2.66],
      world,
      0,
    );
  }
  box(6.62, 0.055, 0.065, palette.trim, [0.02, 1.04, -2.62], world, 0.006);

  // Window with an illustrated Bali horizon. This is canvas-native art, not a remote image.
  function skyTexture(night = false) {
    return textureCanvas(640, 700, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      const midnight = night && theme === "midnight";
      sky.addColorStop(0, midnight ? "#102532" : night ? "#283b59" : "#e3bea1");
      sky.addColorStop(
        0.65,
        midnight ? "#29434a" : night ? "#887b88" : "#f5ddae",
      );
      sky.addColorStop(1, midnight ? "#586659" : night ? "#b49984" : "#eed8ad");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = night ? "#f6e5b9" : "#fff1c1";
      ctx.beginPath();
      ctx.arc(410, 170, night ? 37 : 59, 0, Math.PI * 2);
      ctx.fill();
      if (night) {
        ctx.fillStyle = "#eee4c8";
        [
          [80, 90],
          [310, 77],
          [515, 56],
          [568, 211],
          [249, 229],
          [67, 297],
        ].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.fillStyle = night ? "#55676b" : "#a6b5a0";
      ctx.beginPath();
      ctx.moveTo(0, 477);
      ctx.lineTo(107, 425);
      ctx.lineTo(213, 439);
      ctx.lineTo(340, 294);
      ctx.lineTo(482, 459);
      ctx.lineTo(640, 424);
      ctx.lineTo(640, h);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = night ? "#3e5858" : "#6f947a";
      ctx.beginPath();
      ctx.moveTo(0, 563);
      ctx.bezierCurveTo(180, 471, 418, 572, 640, 500);
      ctx.lineTo(640, h);
      ctx.lineTo(0, h);
      ctx.fill();
      // A palm at the edge of the view.
      ctx.strokeStyle = night ? "#354b45" : "#496c51";
      ctx.lineWidth = 13;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(89, 700);
      ctx.quadraticCurveTo(123, 470, 134, 333);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.fillStyle = night ? "#354b45" : "#496c51";
      [
        [-94, -3],
        [-90, -77],
        [-35, -118],
        [61, -109],
        [119, -48],
        [133, 34],
        [60, 81],
        [-63, 66],
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(134, 333);
        ctx.quadraticCurveTo(134 + x * 0.75, 333 + y * 0.28, 134 + x, 333 + y);
        ctx.quadraticCurveTo(134 + x * 0.3, 333 + y * 0.9, 134, 333);
        ctx.fill();
      });
    });
  }
  const daySky = skyTexture(),
    nightSky = skyTexture(true);
  const windowGroup = group(world, [-3.23, 2.75, -1.08]);
  windowGroup.rotation.y = Math.PI / 2;
  box(1.83, 2.23, 0.1, palette.wood, [0, 0, 0], windowGroup, 0.035);
  const windowView = texturedPlane(
    1.61,
    2.02,
    daySky,
    [0, 0, 0.058],
    windowGroup,
    true,
  );
  const nightWindow =
    theme === "midnight"
      ? texturedPlane(1.61, 2.02, nightSky, [0, 0, 0.059], windowGroup, true)
      : null;
  if (nightWindow) {
    nightWindow.material.transparent = true;
    nightWindow.material.depthWrite = false;
    nightWindow.material.opacity = 0;
    nightWindow.raycast = () => {};
    if (craft) {
      textureLoader.load(
        new URL("./assets/bali-night-window.png", assetBase).href,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          textures.add(texture);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(
            4,
            renderer.capabilities.getMaxAnisotropy(),
          );
          nightWindow.material.map = texture;
          nightWindow.material.needsUpdate = true;
          host.dataset.windowBackdrop = "photographic";
          invalidate();
        },
        undefined,
        () => {},
      );
    }
  }
  for (const x of [-0.86, 0.86]) {
    box(0.075, 2.2, 0.17, palette.cream, [x, 0, 0.09], windowGroup, 0.01);
  }
  for (const y of [-1.06, 0, 1.06]) {
    box(1.8, 0.075, 0.17, palette.cream, [0, y, 0.09], windowGroup, 0.012);
  }
  box(0.055, 2.15, 0.13, palette.cream, [0, 0, 0.085], windowGroup, 0.008);
  box(2.02, 0.11, 0.44, palette.lightWood, [0, -1.14, 0.12], windowGroup);
  if (craft) {
    const glazing = mesh(
      new THREE.PlaneGeometry(1.6, 2.01),
      craft.glass,
      [0, 0, 0.068],
      windowGroup,
      false,
    );
    glazing.raycast = () => {};
    for (const y of [-0.73, 0.73]) {
      cylinder(
        0.014,
        0.014,
        0.095,
        craft.aluminum,
        [-0.78, y, 0.189],
        windowGroup,
        16,
      );
      screw([-0.765, y, 0.19], windowGroup, 0.009);
    }
    box(
      0.042,
      0.12,
      0.014,
      craft.aluminum,
      [0.105, 0.08, 0.183],
      windowGroup,
      0.005,
    );
    bar(
      [0.105, 0.08, 0.194],
      [0.105, -0.015, 0.217],
      0.011,
      craft.aluminum,
      windowGroup,
    );
  }
  // A rolled linen blind above the window.
  const blind = cylinder(
    0.11,
    0.11,
    1.99,
    palette.cream,
    [0, 1.18, 0.16],
    windowGroup,
  );
  blind.rotation.z = Math.PI / 2;
  bar([0.94, 1.18, 0.2], [0.94, 0.45, 0.2], 0.009, palette.wood, windowGroup);

  // Workstation, monitor, keyboard, mouse, small speakers and notebook.
  const desk = group(world, [-0.6, 0, -0.62]);
  box(3.95, 0.16, 1.58, palette.lightWood, [0, 1.49, 0], desk, 0.045);
  box(3.78, 0.035, 1.43, palette.forest, [0, 1.582, 0], desk, 0.045);
  if (craft) {
    // A fitted leather desk mat with a stitched edge, not a painted slab.
    box(3.68, 0.008, 1.33, craft.leather, [0, 1.604, 0], desk, 0.025);
    for (let i = 0; i < 66; i++) {
      for (const z of [-0.635, 0.635]) {
        box(
          0.022,
          0.0018,
          0.002,
          craft.thread,
          [-1.78 + i * 0.055, 1.609, z],
          desk,
          0,
        );
      }
    }
    for (let i = 0; i < 21; i++) {
      for (const x of [-1.8, 1.8]) {
        box(
          0.002,
          0.0018,
          0.021,
          craft.thread,
          [x, 1.609, -0.58 + i * 0.055],
          desk,
          0,
        );
      }
    }
    box(3.79, 0.018, 0.017, palette.wood, [0, 1.46, 0.79], desk, 0.004);
  }
  for (const x of [-1.7, 1.7]) {
    box(0.13, 1.42, 0.13, palette.forest, [x, 0.71, 0.53], desk);
    box(0.13, 1.42, 0.13, palette.forest, [x, 0.71, -0.56], desk);
    box(0.12, 0.12, 1.26, palette.forest, [x, 0.11, -0.01], desk);
  }
  box(1, 0.8, 1.14, palette.cream, [1.36, 1.01, -0.02], desk, 0.03);
  for (const y of [0.82, 1.18]) {
    box(0.91, 0.325, 0.045, palette.sage, [1.36, y, 0.577], desk, 0.012);
    box(0.29, 0.037, 0.035, palette.gold, [1.36, y + 0.035, 0.616], desk, 0.01);
    if (craft) {
      for (const x of [1.23, 1.49]) {
        cylinder(
          0.014,
          0.014,
          0.031,
          craft.aluminum,
          [x, y + 0.035, 0.601],
          desk,
          12,
        ).rotation.x = Math.PI / 2;
        screw([x, y + 0.035, 0.638], desk, 0.006);
      }
      box(0.88, 0.004, 0.004, craft.rubber, [1.36, y - 0.162, 0.601], desk, 0);
    }
  }
  const computer = group(desk, [-0.2, 1.59, -0.38]);
  box(0.67, 0.055, 0.44, palette.dark, [0, 0.036, 0], computer);
  if (!craft) {
    box(0.085, 0.36, 0.085, palette.metal, [0, 0.22, -0.07], computer);
  }
  box(
    1.75,
    1.07,
    0.115,
    craft?.shell || palette.dark,
    [0, 0.9, -0.08],
    computer,
    0.06,
  );
  if (craft) {
    // Recessed glass, gasket, lower chin, adjustment hinge and a braided lead.
    box(1.626, 0.974, 0.006, craft.rubber, [0, 0.905, -0.024], computer, 0.009);
    box(1.67, 0.023, 0.014, craft.aluminum, [0, 0.39, -0.005], computer, 0.004);
    for (const x of [-0.808, 0.808]) {
      screw([x, 0.392, 0.005], computer, 0.006);
    }
    for (let i = 0; i < 17; i++) {
      box(
        0.032,
        0.003,
        0.027,
        craft.rubber,
        [-0.57 + i * 0.071, 1.435, -0.065],
        computer,
        0.001,
      );
    }
    box(0.29, 0.052, 0.067, craft.aluminum, [0, 0.379, -0.08], computer, 0.013);
    box(0.65, 0.009, 0.39, craft.rubber, [0, 0.007, 0], computer, 0.023);
    pipe(
      [
        [0, 0.31, -0.13],
        [0.11, 0.14, -0.23],
        [0.32, 0.023, -0.33],
        [0.43, 0.015, -0.38],
      ],
      0.008,
      craft.rubber,
      computer,
    );
    const glass = mesh(
      new THREE.PlaneGeometry(1.59, 0.94),
      craft.glass,
      [0, 0.905, -0.016],
      computer,
      false,
    );
    glass.raycast = () => {};
  }
  const monitorTexture = detailTexture(880, 520, (ctx, w, h) => {
    ctx.fillStyle = "#1f332c";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#344d3c";
    ctx.fillRect(0, 0, w, 47);
    ["#dba482", "#dbc18c", "#9cb685"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(25 + i * 28, 24, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#ccd8b6";
    ctx.font = "19px monospace";
    ctx.fillText("dimas@corner: ~/workbench", 250, 30);
    if (portfolioDetails && portfolioSummary.projects) {
      paintWorkbench(ctx, w, h, portfolioSummary);
      return;
    }
    ctx.fillStyle = "#9db682";
    ctx.font = "24px monospace";
    ctx.fillText("$ hello, world", 48, 119);
    ctx.fillStyle = "#f0e4c4";
    ctx.font = "bold 58px monospace";
    ctx.fillText("MAKE. LEARN.", 47, 220);
    ctx.fillText("SHARE. REPEAT.", 47, 290);
    ctx.fillStyle = "#90aa88";
    ctx.font = "21px monospace";
    ctx.fillText("open_source / research / curiosity", 49, 368);
    ctx.fillStyle = "#d7b57b";
    ctx.font = "23px monospace";
    ctx.fillText("> explore the workbench", 49, 450);
  });
  const monitorSurface = texturedPlane(
    1.59,
    0.94,
    monitorTexture,
    [0, 0.905, -0.018],
    computer,
    true,
  );
  sphere(0.011, palette.gold, [0.7, 0.406, -0.015], computer);
  interactive(computer, "work");
  if (craft) {
    const gaming = buildGamingSetup({
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
      reflectionMap: reflectionTarget?.texture,
    });
    interactive(gaming.keyboard, "work");
    host.dataset.computerDetail = "gaming";
    host.dataset.coolingFans = String(gaming.coolingFans);
    host.dataset.vrHeadset = "meta-quest-3";
    host.dataset.vrControllers = String(gaming.controllers);
    host.dataset.keyboardKeys = String(gaming.keys);
  } else {
    const keyboard = group(desk, [-0.16, 1.627, 0.36]);
    box(1.17, 0.07, 0.43, palette.cream, [0, 0, 0], keyboard, 0.04);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 13; col++) {
        if (row === 3 && col > 3 && col < 9) {
          continue;
        }
        box(
          0.068,
          0.028,
          0.068,
          col === 0 || col === 12 ? palette.orange : palette.sage,
          [-0.519 + col * 0.086, 0.047, -0.142 + row * 0.087],
          keyboard,
          0.009,
        );
      }
    }
    box(
      0.405,
      0.028,
      0.068,
      palette.orange,
      [0.005, 0.047, 0.119],
      keyboard,
      0.008,
    );
    interactive(keyboard, "work");
    box(0.49, 0.012, 0.47, palette.cream, [0.67, 1.615, 0.35], desk, 0.05);
    const mouse = sphere(0.12, palette.orange, [0.67, 1.67, 0.33], desk);
    mouse.scale.set(0.68, 0.48, 1.05);
    box(0.013, 0.011, 0.033, palette.dark, [0.67, 1.724, 0.3], desk, 0.003);
  }
  for (const x of [-1.26, craft ? 0.63 : 0.91]) {
    const speaker = group(desk, [x, 1.72, -0.47]);
    box(0.23, 0.29, 0.2, palette.dark, [0, 0, 0], speaker, 0.025);
    const cone = cylinder(
      0.065,
      0.065,
      0.013,
      palette.sage,
      [0, 0, 0.108],
      speaker,
    );
    cone.rotation.x = Math.PI / 2;
    if (craft) {
      mesh(
        new THREE.TorusGeometry(0.069, 0.009, 6, 32),
        craft.rubber,
        [0, 0, 0.114],
        speaker,
      );
      const dome = sphere(0.037, craft.shell, [0, 0, 0.117], speaker);
      dome.scale.z = 0.28;
      const tweeter = cylinder(
        0.025,
        0.025,
        0.006,
        craft.rubber,
        [0, 0.104, 0.111],
        speaker,
        20,
      );
      tweeter.rotation.x = Math.PI / 2;
      for (const x of [-0.089, 0.089]) {
        for (const y of [-0.117, 0.117]) {
          screw([x, y, 0.108], speaker, 0.005);
        }
      }
    }
  }
  const notebook = group(desk, [-1.35, 1.63, 0.41]);
  notebook.rotation.y = -0.15;
  box(
    0.82,
    0.05,
    0.56,
    craft?.leather || palette.orange,
    [0, 0, 0],
    notebook,
    0.02,
  );
  box(0.78, 0.045, 0.52, palette.paper, [0, 0.032, 0], notebook, 0.013);
  const notebookTexture = detailTexture(800, 560, (ctx, w, h) => {
    if (portfolioDetails && portfolioSummary.writing) {
      paintNotebook(ctx, w, h, portfolioSummary);
      return;
    }
    // Preserve the original concept's illustration coordinates.
    ctx.scale(w / 640, h / 430);
    w = 640;
    h = 430;
    ctx.fillStyle = "#f4e7c7";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#bcad86";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.fillStyle = "#6c7756";
    ctx.font = "bold 31px monospace";
    ctx.fillText("FIELD", 30, 65);
    ctx.fillText("NOTES", 30, 104);
    ctx.font = "17px monospace";
    ctx.fillText("D. MAULANA", 29, 385);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i === 2 ? "#b27347" : "#bcb692";
      ctx.fillRect(352, 47 + i * 41, 190 - (i % 3) * 25, 5);
    }
    ctx.strokeStyle = "#7b8c67";
    ctx.strokeRect(35, 155, 222, 133);
    ctx.beginPath();
    ctx.moveTo(60, 256);
    ctx.lineTo(105, 209);
    ctx.lineTo(147, 243);
    ctx.lineTo(213, 185);
    ctx.stroke();
  });
  const notePaper = texturedPlane(
    0.76,
    0.5,
    notebookTexture,
    [0, 0.057, 0],
    notebook,
    readableSurfaces,
  );
  notePaper.rotation.x = -Math.PI / 2;
  if (craft) {
    // Slight page camber catches the light without changing the text origin.
    const curved = new THREE.PlaneGeometry(0.76, 0.5, 32, 8);
    const points = curved.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i);
      points.setZ(i, 0.005 * Math.sin((Math.abs(x) / 0.38) * Math.PI));
    }
    curved.computeVertexNormals();
    geometries.add(curved);
    notePaper.geometry = curved;
    for (let i = 0; i < 9; i++) {
      box(
        0.758,
        0.0012,
        0.003,
        craft.paperEdge,
        [0, 0.014 + i * 0.004, 0.259],
        notebook,
        0,
      );
    }
    for (let i = 0; i < 18; i++) {
      for (const z of [-0.271, 0.271]) {
        box(
          0.018,
          0.001,
          0.002,
          craft.thread,
          [-0.376 + i * 0.044, 0.027, z],
          notebook,
          0,
        );
      }
    }
    box(
      0.025,
      0.002,
      0.123,
      palette.forest,
      [-0.035, 0.018, 0.293],
      notebook,
      0.002,
    );
    bar(
      [0.447, 0.073, -0.16],
      [0.45, 0.073, -0.05],
      0.016,
      craft.aluminum,
      notebook,
    );
    bar(
      [0.441, 0.086, -0.21],
      [0.445, 0.086, -0.13],
      0.003,
      craft.aluminum,
      notebook,
    );
  }
  bar(
    portfolioDetails ? [0.445, 0.072, -0.24] : [0.18, 0.085, -0.25],
    portfolioDetails ? [0.46, 0.072, 0.23] : [0.42, 0.085, 0.2],
    0.014,
    palette.dark,
    notebook,
  );
  if (portfolioDetails) {
    // Page layers, stitched binding and index tabs, all static/batchable.
    for (let i = 0; i < 3; i++) {
      box(
        0.79,
        0.006,
        0.525,
        i % 2 ? palette.cream : palette.paper,
        [0.006 * i, 0.012 + i * 0.01, 0],
        notebook,
        0,
      );
      box(
        0.07,
        0.005,
        0.065,
        [palette.sage, palette.orange, palette.blue][i],
        [0.413, 0.046, -0.15 + i * 0.14],
        notebook,
        0.004,
      );
    }
    bar([0, 0.061, -0.255], [0, 0.061, 0.255], 0.004, palette.cream, notebook);
  }
  interactive(notebook, "notes");

  if (portfolioDetails) {
    // A review folio gives services a real place on the desk, beside the mouse.
    const folio = group(desk, [1.42, 1.655, 0.34]);
    folio.rotation.y = 0.08;
    box(0.76, 0.055, 0.54, craft.leather, [0, 0, 0], folio, 0.018);
    box(0.71, 0.025, 0.49, palette.paper, [0, 0.035, 0], folio, 0.009);
    const reviewTexture = detailTexture(800, 560, (ctx, w, h) => {
      if (portfolioSummary.services) {
        paintReview(ctx, w, h, portfolioSummary);
        return;
      }
      ctx.fillStyle = "#eee4ca";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#40513c";
      ctx.font = "bold 29px monospace";
      ctx.fillText("D. MAULANA / APPSEC", 55, 75);
      ctx.font = "bold 62px monospace";
      ctx.fillText("SOURCE CODE", 55, 186);
      ctx.fillText("REVIEW", 55, 257);
      ctx.fillStyle = "#9f6440";
      ctx.fillRect(55, 295, 680, 4);
      ctx.font = "27px monospace";
      [
        "01 / Agree on scope",
        "02 / Review & triage",
        "03 / Report & fixes",
      ].forEach((line, i) => ctx.fillText(line, 55, 359 + i * 54));
    });
    const paper = texturedPlane(
      0.69,
      0.47,
      reviewTexture,
      [0, 0.05, 0],
      folio,
      true,
    );
    paper.rotation.x = -Math.PI / 2;
    box(0.22, 0.035, 0.075, palette.metal, [0, 0.064, -0.25], folio, 0.01);
    for (const x of [-0.077, 0.077]) {
      cylinder(
        0.008,
        0.008,
        0.004,
        craft.aluminum,
        [x, 0.084, -0.25],
        folio,
        16,
      );
    }
    pipe(
      [
        [-0.086, 0.09, -0.264],
        [-0.083, 0.123, -0.287],
        [0.083, 0.123, -0.287],
        [0.086, 0.09, -0.264],
      ],
      0.006,
      craft.aluminum,
      folio,
      20,
    );
    for (let i = 0; i < 7; i++) {
      box(
        0.695,
        0.001,
        0.003,
        craft.paperEdge,
        [0, 0.027 + i * 0.003, 0.246],
        folio,
        0,
      );
    }
    for (let i = 0; i < 17; i++) {
      box(
        0.018,
        0.0015,
        0.002,
        craft.thread,
        [-0.34 + i * 0.042, 0.029, 0.26],
        folio,
        0,
      );
    }
    bar([0.4, 0.075, -0.2], [0.4, 0.075, -0.12], 0.015, craft.aluminum, folio);
    bar([0.4, 0.075, -0.22], [0.4, 0.075, 0.21], 0.013, palette.dark, folio);
    for (let i = 0; i < 3; i++) {
      box(
        0.08,
        0.007,
        0.072,
        [palette.sage, palette.blue, palette.orange][i],
        [0.379, 0.028 - i * 0.006, -0.14 + i * 0.14],
        folio,
        0.002,
      );
    }
  }

  // Mug, desk lamp, a headphone hook, and a small computer tower.
  const mug = group(desk, [-1.48, craft ? 1.732 : 1.71, -0.36]);
  if (craft) {
    turned(mugProfile, craft.ceramic, [0, 0, 0], mug);
    cylinder(0.096, 0.096, 0.002, craft.coffee, [0, 0.073, 0], mug, 48);
    cylinder(0.134, 0.13, 0.014, palette.wood, [0, -0.116, 0], mug, 40);
    const rim = mesh(
      new THREE.TorusGeometry(0.105, 0.006, 8, 48),
      craft.ceramic,
      [0, 0.11, 0],
      mug,
    );
    rim.rotation.x = Math.PI / 2;
  } else {
    cylinder(0.115, 0.093, 0.22, palette.cream, [0, 0, 0], mug);
    cylinder(0.095, 0.095, 0.004, palette.wood, [0, 0.113, 0], mug);
  }
  const mugHandle = mesh(
    new THREE.TorusGeometry(0.089, 0.022, craft ? 12 : 8, craft ? 48 : 20),
    craft?.ceramic || palette.cream,
    [0.129, 0, 0],
    mug,
  );
  mugHandle.rotation.y = craft ? 0 : Math.PI / 2;
  const lamp = group(desk, [-1.78, 1.61, -0.61]);
  cylinder(0.18, 0.18, 0.06, palette.orange, [0, 0.015, 0], lamp);
  bar([0, 0.05, 0], [0, 0.75, -0.06], 0.034, palette.orange, lamp);
  bar([0, 0.75, -0.06], [0.34, 1.02, 0.04], 0.032, palette.orange, lamp);
  sphere(0.052, palette.gold, [0, 0.75, -0.06], lamp);
  const shade = craft
    ? turned(
        [
          [0.22, -0.105],
          [0.215, -0.085],
          [0.09, 0.085],
          [0.092, 0.105],
          [0.08, 0.105],
          [0.08, 0.08],
          [0.203, -0.085],
          [0.205, -0.105],
        ],
        palette.orange,
        [0.35, 0.93, 0.06],
        lamp,
      )
    : cylinder(0.09, 0.22, 0.21, palette.orange, [0.35, 0.93, 0.06], lamp);
  shade.rotation.z = 0.2;
  if (craft) {
    const liner = turned(
      [
        [0.21, -0.1],
        [0.2, -0.083],
        [0.085, 0.092],
        [0.085, 0.103],
      ],
      craft.ceramic,
      [0.35, 0.93, 0.06],
      lamp,
    );
    liner.rotation.z = 0.2;
    const rim = mesh(
      new THREE.TorusGeometry(0.214, 0.008, 8, 40),
      craft.aluminum,
      [0.37, 0.827, 0.06],
      lamp,
    );
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = 0.2;
    screw([0, 0.75, -0.021], lamp, 0.028);
    screw([0.34, 1.02, 0.083], lamp, 0.022);
    pipe(
      [
        [0, 0.75, -0.08],
        [-0.045, 0.39, -0.09],
        [-0.036, 0.026, -0.12],
        [0.12, 0.006, -0.2],
        [0.28, -0.12, -0.24],
      ],
      0.009,
      craft.rubber,
      lamp,
    );
  }
  const bulbMaterial = material(0xffe9b5, {
    emissive: 0xffcc77,
    emissiveIntensity: 0.1,
  });
  const bulb = craft
    ? sphere(0.045, bulbMaterial, [0.36, 0.882, 0.06], lamp)
    : cylinder(0.19, 0.19, 0.012, bulbMaterial, [0.37, 0.828, 0.06], lamp);
  bulb.rotation.z = 0.2;
  if (!craft) {
    const tower = group(world, [0.26, 0.5, -1.38]);
    box(0.51, 0.94, 0.65, palette.dark, [0, 0, 0], tower, 0.05);
    box(0.46, 0.86, 0.022, palette.sage, [0, 0, 0.338], tower, 0.015);
    for (const y of [-0.23, 0.15]) {
      mesh(
        new THREE.TorusGeometry(0.125, 0.014, 8, 24),
        palette.orange,
        [0, y, 0.355],
        tower,
      );
    }
  }

  // Rug and a proper desk chair, pulled out just enough to invite you in.
  const rugTexture = textureCanvas(640, 480, (ctx, w, h) => {
    ctx.fillStyle = "#e4d9b9";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#9b775b";
    ctx.lineWidth = 9;
    ctx.strokeRect(21, 21, w - 42, h - 42);
    ctx.lineWidth = 2;
    ctx.strokeRect(39, 39, w - 78, h - 78);
    ctx.strokeStyle = "#b7ae87";
    for (let y = 65; y < h - 45; y += 18) {
      ctx.beginPath();
      ctx.moveTo(46, y);
      ctx.lineTo(w - 46, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#8b9477";
    ctx.lineWidth = 18;
    for (let x = 98; x < w - 60; x += 82) {
      ctx.beginPath();
      ctx.moveTo(x, 46);
      ctx.lineTo(x, h - 46);
      ctx.stroke();
    }
  });
  const rug = texturedPlane(3.5, 2.5, rugTexture, [-0.45, 0.093, 1.02]);
  if (craft) {
    rug.material.bumpMap = craft.weave;
    rug.material.bumpScale = 0.004;
  }
  rug.rotation.x = -Math.PI / 2;
  const chair = group(world, [-0.5, 0, 1.13]);
  chair.rotation.y = -0.2;
  cylinder(0.075, 0.08, 0.56, palette.metal, [0, 0.4, 0], chair);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const x = Math.cos(a) * 0.52,
      z = Math.sin(a) * 0.52;
    bar([0, 0.19, 0], [x, 0.16, z], 0.035, palette.dark, chair);
    const wheel = cylinder(
      0.065,
      0.065,
      0.055,
      palette.dark,
      [x, 0.105, z],
      chair,
      12,
    );
    wheel.rotation.z = Math.PI / 2;
  }
  box(
    0.95,
    0.19,
    0.89,
    craft?.fabric || palette.orange,
    [0, 0.75, 0],
    chair,
    0.085,
  );
  box(
    0.87,
    0.66,
    0.15,
    craft?.fabric || palette.orange,
    [0, 1.16, 0.35],
    chair,
    0.07,
  );
  box(
    0.83,
    0.1,
    0.14,
    craft?.fabric || palette.terracotta,
    [0, 1.47, 0.35],
    chair,
    0.04,
  );
  if (craft) {
    pipe(
      [
        [-0.42, 0.844, -0.35],
        [-0.45, 0.845, 0],
        [-0.4, 0.844, 0.38],
        [0.4, 0.844, 0.38],
        [0.45, 0.845, 0],
        [0.42, 0.844, -0.35],
        [-0.42, 0.844, -0.35],
      ],
      0.005,
      craft.thread,
      chair,
      36,
    );
    for (const x of [-0.37, 0.37]) {
      bar([x, 0.925, 0.269], [x, 1.395, 0.269], 0.004, craft.thread, chair);
    }
    for (const x of [-0.21, 0.21]) {
      const button = sphere(0.016, craft.leather, [x, 1.19, 0.273], chair);
      button.scale.z = 0.35;
    }
    bar([0.3, 0.55, 0.2], [0.58, 0.61, 0.12], 0.017, craft.aluminum, chair);
    box(0.14, 0.025, 0.05, craft.rubber, [0.59, 0.61, 0.12], chair, 0.013);
  }
  for (const x of [-0.52, 0.52]) {
    bar([x, 0.74, 0.2], [x, 1.04, 0.2], 0.036, palette.dark, chair);
    box(0.12, 0.075, 0.54, palette.dark, [x, 1.05, 0], chair, 0.03);
  }

  // Photo pinboard: real competition photos, ticket-like captions, and small pins.
  const board = group(world, [2.0, 2.93, -2.61]);
  if (craft) {
    frameMoulding(1.91, 1.9, board, 0.07);
  }
  box(
    portfolioDetails ? 1.99 : 1.83,
    portfolioDetails ? 1.98 : 1.4,
    0.11,
    palette.wood,
    [0, 0, 0],
    board,
    0.04,
  );
  box(
    portfolioDetails ? 1.86 : 1.7,
    portfolioDetails ? 1.85 : 1.27,
    0.028,
    palette.cork,
    [0, 0, 0.07],
    board,
    0.015,
  );
  function polaroid(path, x, y, rotation, caption) {
    const frame = group(board, [x, y, 0.105]);
    frame.rotation.z = rotation;
    box(0.78, 0.74, 0.018, palette.paper, [0, 0, 0], frame, 0.003);
    photo(path, 0.66, 0.49, [0, 0.054, 0.013], frame);
    if (portfolioDetails && caption) {
      const inscription = detailTexture(700, 110, (ctx, w, h) => {
        ctx.fillStyle = "#eee4ca";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#344c40";
        ctx.font = "bold 42px monospace";
        ctx.textAlign = "center";
        ctx.fillText(caption, w / 2, 71);
      });
      texturedPlane(0.66, 0.104, inscription, [0, -0.274, 0.013], frame, true);
    }
    const pin = sphere(0.024, palette.orange, [0, 0.346, 0.045], frame);
    pin.castShadow = false;
    return frame;
  }
  polaroid(
    "./assets/team-bali.jpg",
    -0.37,
    0.13,
    -0.08,
    portfolioSummary.photos?.[0]?.chip,
  );
  polaroid(
    "./assets/team-china.jpg",
    portfolioDetails ? 0.4 : 0.37,
    portfolioDetails ? 0.13 : -0.15,
    0.1,
    portfolioSummary.photos?.[1]?.chip,
  );
  if (portfolioDetails && portfolioSummary.photos) {
    // Keep both hero prints (and the album handoff origin) in the same place.
    // The remaining five moments become a physical contact strip below them.
    const strip = group(board, [0, -0.44, 0.11]);
    box(1.7, 0.27, 0.017, palette.paper, [0, 0, 0], strip, 0.002);
    // One small GPU atlas for the whole strip, not five full-resolution photo
    // textures. The original files remain available in the HTML album.
    const moments = portfolioSummary.photos.slice(2);
    const contactSheet = textureCanvas(1280, 204, (ctx, w, h) => {
      ctx.fillStyle = "#dcd7bf";
      ctx.fillRect(0, 0, w, h);
      moments.forEach((_, i) => {
        const x = (i * w) / moments.length;
        ctx.fillStyle = "#344c40";
        ctx.fillRect(x + 15, 6, 20, 8);
        ctx.fillRect(x + w / moments.length - 35, h - 14, 20, 8);
        ctx.fillStyle = "#afac96";
        ctx.fillRect(x + 10, 24, w / moments.length - 20, h - 48);
      });
    });
    texturedPlane(1.68, 0.255, contactSheet, [0, 0, 0.012], strip, true);
    const imageLoader = new THREE.ImageLoader();
    Promise.all(
      moments.map(
        (item) =>
          new Promise((resolve) => {
            imageLoader.load(
              new URL(item.src, assetBase).href,
              resolve,
              undefined,
              () => resolve(null),
            );
          }),
      ),
    ).then((images) => {
      if (disposed) {
        return;
      }
      const ctx = contactSheet.image.getContext("2d");
      const cell = contactSheet.image.width / images.length;
      const destW = cell - 20,
        destH = contactSheet.image.height - 48;
      images.forEach((image, i) => {
        if (!image) {
          return;
        }
        const scale = Math.max(destW / image.width, destH / image.height);
        const sourceW = destW / scale,
          sourceH = destH / scale;
        ctx.drawImage(
          image,
          (image.width - sourceW) / 2,
          (image.height - sourceH) / 2,
          sourceW,
          sourceH,
          i * cell + 10,
          24,
          destW,
          destH,
        );
      });
      contactSheet.needsUpdate = true;
      invalidate();
    });
    const stubs = detailTexture(1400, 160, (ctx, w, h) =>
      paintTeamStubs(ctx, w, h, portfolioSummary),
    );
    box(1.76, 0.22, 0.01, palette.paper, [0, 0.74, 0.105], board, 0);
    texturedPlane(1.76, 0.2, stubs, [0, 0.74, 0.113], board, true);
    for (const x of [-0.78, 0.78]) {
      sphere(0.014, palette.gold, [x, 0.843, 0.138], board);
    }
  }
  const memoryLabel = detailTexture(
    portfolioDetails ? 768 : 512,
    portfolioDetails ? 42 : 75,
    (ctx, w, h) => {
      ctx.fillStyle = "#e9d2a9";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#564a38";
      ctx.font = portfolioDetails
        ? "bold 24px monospace"
        : "bold 28px monospace";
      ctx.textAlign = portfolioDetails ? "center" : "left";
      ctx.fillText(
        portfolioDetails ? "BALI / VIETNAM / CHINA" : "BALI / CHINA / CTF",
        portfolioDetails ? w / 2 : 19,
        portfolioDetails ? 29 : 47,
      );
    },
  );
  texturedPlane(
    portfolioDetails ? 1.38 : 1.1,
    portfolioDetails ? 0.075 : 0.16,
    memoryLabel,
    [0, portfolioDetails ? 0.58 : -0.5, 0.12],
    board,
    readableSurfaces,
  );
  interactive(board, "memories");

  // Team pennant, sewn onto the rear wall.
  const team = group(world, [-0.23, 3.55, -2.62]);
  const pennantShape = new THREE.Shape();
  pennantShape.moveTo(-0.72, 0.48);
  pennantShape.lineTo(0.72, 0.48);
  pennantShape.lineTo(0.72, -0.25);
  pennantShape.lineTo(0, -0.58);
  pennantShape.lineTo(-0.72, -0.25);
  pennantShape.closePath();
  mesh(
    new THREE.ExtrudeGeometry(pennantShape, {
      depth: 0.024,
      bevelEnabled: false,
    }),
    palette.forest,
    [0, 0, 0],
    team,
  );
  bar([-0.83, 0.53, 0.04], [0.83, 0.53, 0.04], 0.025, palette.lightWood, team);
  bar([-0.75, 0.57, 0], [0, 0.78, -0.02], 0.011, palette.cream, team);
  bar([0.75, 0.57, 0], [0, 0.78, -0.02], 0.011, palette.cream, team);
  const teamTexture = textureCanvas(640, 290, (ctx, w, h) => {
    ctx.fillStyle = "#496551";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#eadcb5";
    ctx.textAlign = "center";
    ctx.font = "21px monospace";
    ctx.fillText("CAPTURE THE FLAG", w / 2, 50);
    ctx.font = "bold 114px sans-serif";
    ctx.fillText("TCP1P", w / 2, 179);
    ctx.font = "20px monospace";
    ctx.fillText("EST. 2022 · INDONESIA", w / 2, 244);
  });
  texturedPlane(1.25, 0.56, teamTexture, [0, 0.065, 0.03], team);
  interactive(team, "community");

  // Portrait on the side wall: the user's actual illustrated avatar.
  const portrait = group(world, [-3.23, 2.52, 1.04]);
  portrait.rotation.y = Math.PI / 2;
  const portraitFrame = group(
    portrait,
    portfolioDetails ? [-0.39, 0.16, 0] : [0, 0, 0],
  );
  if (portfolioDetails) {
    portraitFrame.scale.setScalar(0.68);
  }
  box(0.86, 1.06, 0.09, palette.wood, [0, 0, 0], portraitFrame, 0.02);
  box(0.73, 0.93, 0.04, palette.cream, [0, 0, 0.06], portraitFrame, 0.015);
  photo("./assets/dimas.jpg", 0.6, 0.65, [0, 0.07, 0.084], portraitFrame);
  if (craft) {
    frameMoulding(0.805, 1.005, portraitFrame, 0.065);
    const glass = mesh(
      new THREE.PlaneGeometry(0.6, 0.65),
      craft.glass,
      [0, 0.07, 0.087],
      portraitFrame,
      false,
    );
    glass.raycast = () => {};
  }
  const portraitLabel = detailTexture(320, 68, (ctx, w, h) => {
    ctx.fillStyle = "#f7ebd1";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#5a654a";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("hello, I’m Dimas", w / 2, 44);
  });
  texturedPlane(0.64, 0.136, portraitLabel, [0, -0.335, 0.084], portraitFrame);
  if (portfolioDetails && portfolioSummary.experience) {
    const record = group(portrait, [0.38, 0.025, 0.04]);
    if (craft) {
      buildStoryRecord({
        record,
        experience: portfolioSummary.experience,
        craft,
        palette,
        textureCanvas,
        material,
        group,
        mesh,
        box,
        bar,
        screw,
      });
      host.dataset.storyCards = String(portfolioSummary.experience.length);
    } else {
      box(0.76, 1.14, 0.034, palette.wood, [0, 0, 0], record, 0.008);
      const timeline = detailTexture(640, 970, (ctx, w, h) =>
        paintExperience(ctx, w, h, portfolioSummary),
      );
      texturedPlane(0.72, 1.09, timeline, [0, 0, 0.021], record, true);
      box(0.19, 0.034, 0.028, palette.metal, [0, 0.545, 0.044], record, 0.004);
    }
    const callingCard = detailTexture(600, 230, (ctx, w, h) => {
      ctx.fillStyle = "#304e40";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f1e3c5";
      ctx.font = "bold 63px monospace";
      ctx.fillText("dimasc.tf", 35, 86);
      ctx.font = "24px monospace";
      ctx.fillText("RESEARCH / BUILD / SHARE", 35, 139);
      ctx.fillText("D. MAULANA / INDONESIA", 35, 188);
    });
    const card = group(portrait, [-0.39, -0.395, 0.065]);
    card.rotation.z = -0.07;
    box(0.58, 0.235, 0.012, palette.forest, [0, 0, 0], card, 0.003);
    texturedPlane(0.565, 0.22, callingCard, [0, 0, 0.008], card, true);
    sphere(0.017, palette.gold, [0, 0.106, 0.024], card);
  }
  interactive(portrait, "about");

  // A real collection replaces the aggregate trophy in the full room tour.
  const hasAwardDisplay = Boolean(
    craft && portfolioSummary.results?.items?.length,
  );
  let shelf;
  if (hasAwardDisplay) {
    const { plan } = buildAwardDisplay({
      items: portfolioSummary.results.items,
      world,
      craft,
      palette,
      reflection: reflectionTarget.texture,
      material,
      textureCanvas,
      group,
      mesh,
      box,
      cylinder,
      bar,
      pipe,
      screw,
    });
    host.dataset.awardCount = String(plan.awards.length);
    host.dataset.awardRows = String(plan.rows);
  } else {
    // Keep the original Corner's floating shelf and raycast destinations intact.
    shelf = group(world, [1.85, 1.48, -2.34]);
    box(2.37, 0.12, 0.54, palette.lightWood, [0, 0, 0], shelf, 0.025);
    for (const x of [-0.84, 0.84]) {
      box(0.06, 0.31, 0.055, palette.metal, [x, -0.2, -0.17], shelf);
      bar([x, -0.33, -0.17], [x, -0.05, 0.17], 0.022, palette.metal, shelf);
    }
    const trophy = group(shelf, [-0.65, 0.1, 0]);
    box(0.43, 0.1, 0.35, craft?.stone || palette.dark, [0, 0, 0], trophy);
    box(0.33, 0.075, 0.26, palette.gold, [0, 0.085, 0], trophy);
    cylinder(0.042, 0.065, 0.2, palette.gold, [0, 0.21, 0], trophy);
    if (craft) {
      turned(trophyProfile, palette.gold, [0, 0, 0], trophy);
      for (const y of [0.114, 0.282]) {
        cylinder(0.079, 0.081, 0.012, palette.gold, [0, y, 0], trophy, 40);
      }
      const rim = mesh(
        new THREE.TorusGeometry(0.1825, 0.006, 8, 48),
        palette.gold,
        [0, 0.537, 0],
        trophy,
      );
      rim.rotation.x = Math.PI / 2;
      for (const x of [-0.18, 0.18]) {
        screw([x, -0.002, 0.179], trophy, 0.006);
      }
      box(0.39, 0.082, 0.007, craft.aluminum, [0, 0, 0.17], trophy, 0.006);
    } else {
      cylinder(0.19, 0.075, 0.26, palette.gold, [0, 0.41, 0], trophy);
    }
    for (const x of [-0.21, 0.21]) {
      const handle = mesh(
        new THREE.TorusGeometry(0.105, 0.025, craft ? 12 : 8, craft ? 48 : 20),
        palette.gold,
        [x, 0.425, 0],
        trophy,
      );
    }
    const trophyPlaque = detailTexture(256, 80, (ctx, w, h) => {
      ctx.fillStyle = "#303a36";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ebd09c";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.font = portfolioDetails
        ? "bold 17px monospace"
        : "bold 24px monospace";
      ctx.fillText(
        portfolioDetails && portfolioSummary.results
          ? `${portfolioSummary.results.podiums[0].count} WINS / ${portfolioSummary.results.total} PODIUMS`
          : "CTF MEMORIES",
        w / 2,
        50,
      );
    });
    texturedPlane(
      0.35,
      0.075,
      trophyPlaque,
      [0, 0.003, 0.178],
      trophy,
      readableSurfaces,
    );
    interactive(trophy, "memories");
    if (portfolioDetails && portfolioSummary.results) {
      // A small display stand keeps the last result above the medal ribbons.
      const ledger = group(shelf, [0.12, 0.54, 0.055]);
      for (const x of [-0.12, 0.36]) {
        bar([x, 0.07, 0.03], [x, 0.235, 0.06], 0.009, palette.metal, shelf);
        box(0.09, 0.012, 0.15, palette.metal, [x, 0.07, 0.04], shelf, 0.005);
      }
      ledger.rotation.x = -0.055;
      box(0.73, 0.66, 0.04, palette.forest, [0, 0, 0], ledger, 0.006);
      const record = detailTexture(600, 540, (ctx, w, h) =>
        paintResults(ctx, w, h, portfolioSummary),
      );
      texturedPlane(0.69, 0.62, record, [0, 0, 0.025], ledger, true);
      portfolioSummary.results.podiums.forEach((result, i) => {
        const medal = group(shelf, [-0.12 + i * 0.25, 0.11, 0.215]);
        box(
          0.065,
          0.11,
          0.008,
          [palette.orange, palette.blue, palette.sage][i],
          [0, 0.055, 0],
          medal,
          0,
        );
        const coin = cylinder(
          0.067,
          0.067,
          0.017,
          [palette.gold, palette.metal, palette.terracotta][i],
          [0, 0, 0.015],
          medal,
          16,
        );
        coin.rotation.x = Math.PI / 2;
        const face = detailTexture(128, 128, (ctx) => {
          ctx.fillStyle = ["#d0ae70", "#c9ceca", "#bd8964"][i];
          ctx.beginPath();
          ctx.arc(64, 64, 64, 0, Math.PI * 2);
          ctx.fill();
          ctx.textAlign = "center";
          ctx.fillStyle = "#253c32";
          ctx.font = "bold 46px monospace";
          ctx.fillText(String(result.count), 64, 61);
          ctx.font = "23px monospace";
          ctx.fillText(result.place.split(" ")[0], 64, 94);
        });
        const medalFace = texturedPlane(
          0.12,
          0.12,
          face,
          [0, 0, 0.026],
          medal,
          true,
        );
        medalFace.material.transparent = true;
      });
    }
    for (let i = 0; i < (portfolioDetails ? 0 : 6); i++) {
      const book = box(
        0.085,
        0.42 + (i % 3) * 0.07,
        0.28,
        [palette.orange, palette.cream, palette.forest, palette.blue][i % 4],
        [0.04 + i * 0.095, 0.28 + (i % 3) * 0.035, -0.02],
        shelf,
        0.007,
      );
      box(
        0.061,
        0.012,
        0.007,
        palette.cream,
        [0.04 + i * 0.095, 0.26, 0.125],
        shelf,
        0.002,
      );
    }
  }

  function plant(parent, pos, size = 1) {
    const pot = group(parent, pos);
    pot.scale.setScalar(size);
    cylinder(0.23, 0.16, 0.36, palette.terracotta, [0, 0.18, 0], pot);
    cylinder(0.245, 0.23, 0.065, palette.orange, [0, 0.335, 0], pot);
    cylinder(0.205, 0.205, 0.006, palette.wood, [0, 0.37, 0], pot);
    if (craft) {
      const leafGeometry = createLeafGeometry();
      for (let i = 0; i < 10; i++) {
        const a = i * 2.399,
          length = 0.43 + (i % 4) * 0.07;
        const base = [
          Math.cos(a) * 0.19,
          0.53 + (i % 3) * 0.09,
          Math.sin(a) * 0.19,
        ];
        pipe(
          [[0, 0.37, 0], [base[0] * 0.6, base[1] - 0.13, base[2] * 0.6], base],
          0.008,
          palette.leaf,
          pot,
          8,
        );
        const leaf = mesh(
          leafGeometry,
          i % 3 ? craft.leaf : craft.leafLight,
          base,
          pot,
        );
        leaf.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(
            Math.cos(a) * 0.72,
            0.7,
            Math.sin(a) * 0.72,
          ).normalize(),
        );
        leaf.scale.set(0.7, length, 0.7);
      }
      const pebbleGeometry = new THREE.IcosahedronGeometry(0.013, 0);
      for (let i = 0; i < 15; i++) {
        const a = i * 2.399,
          r = 0.035 + (i % 4) * 0.042;
        const pebble = mesh(
          pebbleGeometry,
          i % 2 ? palette.wood : palette.terracotta,
          [Math.cos(a) * r, 0.38, Math.sin(a) * r],
          pot,
        );
        pebble.scale.y = 0.35;
      }
      return pot;
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4,
        length = 0.52 + (i % 3) * 0.17;
      const x = Math.cos(a) * 0.32,
        z = Math.sin(a) * 0.32,
        y = 0.63 + length * 0.53;
      bar([0, 0.37, 0], [x, y, z], 0.011, palette.leaf, pot);
      const leaf = sphere(
        0.18,
        i % 2 ? palette.leaf : palette.leafLight,
        [x, y, z],
        pot,
      );
      leaf.scale.set(0.49, length * 1.15, 0.92);
      leaf.rotation.z = -Math.cos(a) * 0.8;
      leaf.rotation.x = Math.sin(a) * 0.7;
      leaf.rotation.y = a;
    }
    return pot;
  }
  if (shelf) {
    plant(shelf, [0.9, 0.07, 0], 0.48);
  }
  // The floor plant moves under the window, leaving a clear sightline into
  // the low display cabinet. It must not cover any of the individual awards.
  plant(
    world,
    hasAwardDisplay
      ? [-2.62, 0.08, -1.92]
      : craft
        ? [3, 0.08, 0.7]
        : [2.64, 0.08, 1.0],
    craft ? 1.65 : 1.8,
  );
  // A stack of books beside the plant, and a small linen stool.
  const stool = group(
    world,
    hasAwardDisplay ? [2.05, 0, 1.4] : [2.14, 0, -0.57],
  );
  for (const x of [-0.23, 0.23]) {
    for (const z of [-0.23, 0.23]) {
      bar([x, 0.05, z], [x * 0.76, 0.61, z * 0.76], 0.045, palette.wood, stool);
    }
  }
  cylinder(0.39, 0.37, 0.14, palette.cream, [0, 0.67, 0], stool);
  const books = group(stool, [0, 0.785, 0]);
  books.rotation.y = 0.18;
  if (craft) {
    for (let i = 0; i < 3; i++) {
      const volume = makeBoundBook({
        parent: books,
        position: [0.02 * (i % 2), i * 0.079, 0],
        width: 0.07,
        height: 0.48 - i * 0.025,
        depth: 0.32 - i * 0.008,
        cover: [palette.blue, palette.orange, palette.forest][i],
        craft,
        group,
        box,
        mesh,
      });
      volume.rotation.z = Math.PI / 2;
      volume.rotation.y = (i - 1) * 0.05;
    }
  } else {
    box(0.5, 0.09, 0.36, palette.blue, [0, 0, 0], books);
    box(0.43, 0.085, 0.32, palette.orange, [0.025, 0.085, 0.015], books);
    box(0.4, 0.055, 0.29, palette.cream, [-0.01, 0.151, -0.015], books);
  }
  // Floor-level book bag, beside the desk.
  const bag = group(world, [-2.65, 0.39, 0.84]);
  bag.rotation.y = 0.12;
  box(0.54, 0.59, 0.27, palette.forest, [0, 0, 0], bag, 0.08);
  box(0.4, 0.22, 0.07, palette.sage, [0, -0.13, 0.17], bag, 0.035);
  const bagHandle = mesh(
    new THREE.TorusGeometry(0.15, 0.025, 8, 20, Math.PI),
    palette.dark,
    [0, 0.28, 0],
    bag,
  );

  if (theme === "midnight") {
    // Material detail adds craft without turning every grain into geometry.
    const grain = textureCanvas(512, 128, (ctx, w, h) => {
      ctx.fillStyle = "#eee2c9";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#92734c38";
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const y = (i * 43) % h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(150, y + Math.sin(i) * 15, 350, y - 9, w, y + 2);
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(332, 51, 17 + i * 8, 2 + i * 1.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    boardMaterials.forEach((mat) => {
      mat.map = craft ? craft.oak : grain;
      if (craft) {
        mat.bumpMap = craft.pores;
        mat.bumpScale = 0.0015;
        mat.roughness = 0.48;
      }
      mat.needsUpdate = true;
    });

    // Layered crown moulding, corner post, and matching side-wall panelling.
    box(6.73, 0.055, 0.11, palette.lightWood, [0, 4.25, -2.61]);
    box(0.11, 0.055, 5.44, palette.lightWood, [-3.2, 4.25, 0]);
    box(0.14, 4.3, 0.14, palette.trim, [-3.2, 2.16, -2.61]);
    box(0.065, 0.055, 5.4, palette.trim, [-3.2, 1.04, 0]);
    for (let i = 0; i < 9; i++) {
      box(
        0.035,
        0.73,
        0.034,
        palette.sage,
        [-3.23, 0.62, -2.32 + i * 0.57],
        world,
        0,
      );
    }

    // Linen curtains and brass tiebacks frame the little Bali night view.
    const linen = material(
      0xd6cbb0,
      craft
        ? {
            side: THREE.DoubleSide,
            roughness: 1,
            bumpMap: craft.weave,
            bumpScale: 0.005,
          }
        : {},
    );
    bar(
      [-1.23, 1.23, 0.27],
      [1.23, 1.23, 0.27],
      0.022,
      palette.gold,
      windowGroup,
    );
    for (const side of [-1, 1]) {
      const curtain = group(windowGroup, [side * 1.03, 0, 0.2]);
      if (craft) {
        mesh(createCurtainGeometry(), linen, [0, 0, 0], curtain);
        for (let i = 0; i < 5; i++) {
          const ring = mesh(
            new THREE.TorusGeometry(0.023, 0.004, 6, 16),
            craft.aluminum,
            [-0.16 + i * 0.08, 1.1, 0.002],
            curtain,
          );
          ring.rotation.y = Math.PI / 2;
        }
        pipe(
          [
            [-0.13, -0.29, 0.03],
            [0, -0.31, 0.075],
            [0.13, -0.29, 0.03],
          ],
          0.009,
          craft.thread,
          curtain,
          12,
        );
      } else {
        for (let i = 0; i < 5; i++) {
          box(
            0.072,
            2.15 - Math.sin(i) * 0.03,
            0.073,
            linen,
            [-0.15 + i * 0.074, 0, Math.sin(i * 1.9) * 0.025],
            curtain,
            0.025,
          );
        }
        box(0.38, 0.055, 0.1, palette.gold, [0, -0.3, 0.018], curtain, 0.014);
      }
      curtains.push(curtain);
    }
    plant(windowGroup, [0.59, -1.07, 0.21], 0.25);

    // The clock is set to Bali time when the room opens.
    const clock = group(world, [-2.05, 3.42, -2.6]);
    const face = cylinder(
      0.36,
      0.36,
      0.07,
      palette.cream,
      [0, 0, 0],
      clock,
      craft ? 64 : 24,
    );
    face.rotation.x = Math.PI / 2;
    mesh(
      new THREE.TorusGeometry(0.365, 0.027, 8, 40),
      palette.gold,
      [0, 0, 0.04],
      clock,
    );
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const tick = box(
        0.018,
        i % 3 === 0 ? 0.062 : 0.034,
        0.012,
        palette.dark,
        [Math.sin(a) * 0.292, Math.cos(a) * 0.292, 0.043],
        clock,
        0,
      );
      tick.rotation.z = -a;
    }
    const clockParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const minute = Number(clockParts.find((p) => p.type === "minute").value);
    const hour = Number(clockParts.find((p) => p.type === "hour").value) % 12;
    for (const [a, length] of [
      [((hour + minute / 60) * Math.PI) / 6, 0.17],
      [(minute * Math.PI) / 30, 0.25],
    ]) {
      bar(
        [0, 0, 0.063],
        [Math.sin(a) * length, Math.cos(a) * length, 0.063],
        0.013,
        palette.dark,
        clock,
      );
    }
    sphere(0.026, palette.orange, [0, 0, 0.073], clock);
    if (craft) {
      for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) {
          continue;
        }
        const a = (i * Math.PI) / 30;
        const tick = box(
          0.003,
          0.009,
          0.002,
          palette.dark,
          [Math.sin(a) * 0.303, Math.cos(a) * 0.303, 0.038],
          clock,
          0,
        );
        tick.rotation.z = -a;
      }
      const glass = mesh(
        new THREE.CircleGeometry(0.342, 64),
        craft.glass,
        [0, 0, 0.089],
        clock,
        false,
      );
      glass.raycast = () => {};
    }

    // A low bookcase in the front corner, with labeled research volumes.
    const bookcase = group(world, [-2.92, 0.12, 1.88]);
    bookcase.rotation.y = Math.PI / 2;
    box(1.12, 0.045, 0.44, palette.lightWood, [0, 0.02, 0], bookcase);
    box(1.18, 0.075, 0.48, palette.lightWood, [0, 0.85, 0], bookcase);
    box(1.06, 0.045, 0.43, palette.lightWood, [0, 0.44, 0], bookcase);
    box(1.1, 0.8, 0.035, palette.wood, [0, 0.43, -0.205], bookcase);
    for (const x of [-0.55, 0.55]) {
      box(0.06, 0.82, 0.43, palette.wood, [x, 0.42, 0], bookcase);
    }
    if (craft && portfolioSummary.skills) {
      const library = buildLibrary({
        skills: portfolioSummary.skills,
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
      });
      host.dataset.libraryBooks = String(library.books.length + 3);
    } else if (portfolioDetails && portfolioSummary.skills) {
      // Four field volumes, plus the two credentials above: all five categories.
      // One atlas is shared by the four book spines.
      const spines = detailTexture(1200, 420, (ctx, w, h) =>
        paintSkillSpines(ctx, w, h, portfolioSummary),
      );
      for (let i = 0; i < 4; i++) {
        const book = group(bookcase, [-0.39 + i * 0.26, 0.65, 0.035]);
        const cover = [
          palette.forest,
          palette.orange,
          palette.blue,
          palette.dark,
        ][i];
        box(0.211, 0.325, 0.262, craft.paperEdge, [0, 0, -0.002], book, 0.003);
        for (const x of [-0.114, 0.114]) {
          box(0.008, 0.35, 0.29, cover, [x, 0, 0], book, 0.003);
        }
        box(0.235, 0.35, 0.019, cover, [0, 0, 0.137], book, 0.008);
        for (let j = 0; j < 7; j++) {
          box(
            0.203,
            0.0012,
            0.003,
            palette.cream,
            [0, -0.14 + j * 0.046, -0.134],
            book,
            0,
          );
        }
        const spine = texturedPlane(
          0.22,
          0.33,
          spines,
          [0, 0, 0.151],
          book,
          true,
        );
        const uv = spine.geometry.attributes.uv;
        for (let j = 0; j < uv.count; j++) {
          uv.setX(j, (uv.getX(j) + i) / 4);
        }
        uv.needsUpdate = true;
        for (const y of [-0.145, 0.145]) {
          box(0.216, 0.004, 0.004, craft.thread, [0, y, 0.153], book, 0.001);
        }
      }
    }
    (portfolioDetails
      ? []
      : ["NOTES", "BUILD", "CTF", "RESEARCH", "IDEAS", "FIELDWORK"]
    ).forEach((title, i) => {
      const h = 0.28 + (i % 3) * 0.03;
      const book = group(bookcase, [-0.43 + i * 0.15, 0.47 + h / 2, 0.035]);
      box(
        0.12,
        h,
        0.29,
        [palette.forest, palette.orange, palette.blue][i % 3],
        [0, 0, 0],
        book,
      );
      const spine = textureCanvas(64, 256, (ctx, w, h) => {
        ctx.fillStyle = ["#496551", "#a5673f", "#56777a"][i % 3];
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#f6e7c8";
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = "bold 20px monospace";
        ctx.fillText(title, 0, 7);
      });
      texturedPlane(
        0.1,
        h * 0.88,
        spine,
        [0, 0, 0.151],
        book,
        readableSurfaces,
      );
    });
    if (portfolioDetails && portfolioSummary.skills) {
      // A tiny infrastructure lab, not another anonymous storage box.
      const labels = portfolioSummary.skills
        .find((s) => s.category === "Cloud & Infrastructure")
        .items.slice(0, 3);
      labels.forEach((title, i) => {
        const server = group(bookcase, [-0.25, 0.105 + i * 0.093, 0.02]);
        box(0.46, 0.081, 0.31, palette.dark, [0, 0, 0], server, 0.006);
        const face = detailTexture(480, 80, (ctx, w, h) => {
          ctx.fillStyle = "#304a40";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#eddcba";
          ctx.font = "bold 33px monospace";
          ctx.fillText(title, 20, 51);
          ctx.fillStyle = "#a0c691";
          ctx.fillRect(w - 40, 32, 12, 12);
        });
        texturedPlane(0.42, 0.065, face, [0, 0, 0.158], server, true);
        for (const x of [-0.216, 0.216]) {
          box(0.009, 0.04, 0.006, palette.metal, [x, 0, 0.16], server, 0);
        }
        if (craft) {
          for (let j = 0; j < 5; j++) {
            box(
              0.025,
              0.016,
              0.003,
              craft.rubber,
              [-0.115 + j * 0.047, -0.024, 0.162],
              server,
              0.001,
            );
            box(
              0.018,
              0.002,
              0.003,
              craft.aluminum,
              [-0.115 + j * 0.047, -0.024, 0.165],
              server,
              0,
            );
          }
          pipe(
            [
              [-0.19, 0, -0.156],
              [-0.21, -0.04, -0.18],
              [-0.22, -0.08, -0.16],
            ],
            0.004,
            craft.rubber,
            server,
            8,
          );
        }
      });
    } else {
      box(0.46, 0.21, 0.31, palette.sage, [-0.25, 0.18, 0.02], bookcase, 0.014);
      box(0.18, 0.055, 0.012, palette.cream, [-0.25, 0.2, 0.181], bookcase);
    }
    for (let i = 0; i < (craft ? 0 : 3); i++) {
      box(
        0.36,
        0.06,
        0.28,
        i % 2 ? palette.orange : palette.paper,
        [0.24, 0.1 + i * 0.065, 0.035],
        bookcase,
      );
      if (portfolioDetails && portfolioSummary.skills) {
        const languages = portfolioSummary.skills.find(
          (s) => s.category === "Programming",
        ).items;
        const title = languages.filter((_, j) => j % 3 === i).join(" / ");
        const binding = detailTexture(640, 100, (ctx, w, h) => {
          ctx.fillStyle = i % 2 ? "#a5673f" : "#eee4ca";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = i % 2 ? "#fff0d6" : "#344c40";
          ctx.font = "bold 34px monospace";
          ctx.textAlign = "center";
          ctx.fillText(title, w / 2, 62);
        });
        texturedPlane(
          0.34,
          0.048,
          binding,
          [0.24, 0.1 + i * 0.065, 0.18],
          bookcase,
          true,
        );
      }
    }
    interactive(bookcase, "notes");
    if (craft && portfolioSummary.skills) {
      for (const [i, credential] of ["CAPen", "Linux+ ce"].entries()) {
        const frame = group(bookcase, [-0.285 + i * 0.55, 1.1, -0.04]);
        frame.rotation.x = -0.08;
        box(0.48, 0.36, 0.043, palette.wood, [0, 0, 0], frame, 0.006);
        box(0.444, 0.324, 0.008, palette.paper, [0, 0, 0.025], frame, 0.001);
        const print = detailTexture(650, 440, (ctx, w, h) => {
          ctx.fillStyle = "#eee5d2";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#aa946b";
          ctx.lineWidth = 2;
          ctx.strokeRect(27, 27, w - 54, h - 54);
          ctx.fillStyle = "#34463d";
          ctx.textAlign = "center";
          ctx.font = "23px serif";
          ctx.fillText("PROFESSIONAL CREDENTIAL", w / 2, 83);
          ctx.font = "48px Georgia";
          ctx.fillText(credential, w / 2, 189);
          ctx.font = "24px serif";
          ctx.fillText(
            i ? "CompTIA" : "Certified AppSec Pentester",
            w / 2,
            255,
          );
          ctx.font = "22px serif";
          ctx.fillText(
            i ? "D. Maulana" : "D. Maulana · with Merit",
            w / 2,
            338,
          );
        });
        texturedPlane(0.409, 0.283, print, [0, 0, 0.03], frame, true);
        const glass = mesh(
          new THREE.PlaneGeometry(0.434, 0.314),
          craft.glass,
          [0, 0, 0.034],
          frame,
          false,
        );
        glass.raycast = () => {};
        bar([0, -0.12, -0.01], [0, -0.2, -0.13], 0.008, palette.wood, frame);
      }
    } else if (portfolioDetails) {
      const certificate = group(bookcase, [-0.3, 1.1, -0.035]);
      certificate.rotation.x = -0.06;
      box(0.47, 0.38, 0.035, palette.wood, [0, 0, 0], certificate, 0.008);
      const credentials = detailTexture(600, 440, (ctx, w, h) => {
        ctx.fillStyle = "#eee4ca";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#9c7745";
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.textAlign = "center";
        ctx.fillStyle = "#354d3c";
        ctx.font = "bold 80px monospace";
        ctx.fillText("CAPen", w / 2, 135);
        ctx.font = "28px monospace";
        ctx.fillText("WITH MERIT", w / 2, 190);
        ctx.font = "bold 45px monospace";
        ctx.fillText("Linux+ ce", w / 2, 280);
        ctx.font = "25px monospace";
        ctx.fillText("D. MAULANA", w / 2, 365);
      });
      texturedPlane(0.43, 0.34, credentials, [0, 0, 0.025], certificate, true);
    }
    const postcard = group(
      craft ? portrait : bookcase,
      craft ? [-0.39, -0.72, 0.05] : [0.19, 1.065, -0.02],
    );
    postcard.rotation.x = -0.08;
    box(0.43, 0.33, 0.032, palette.wood, [0, 0, 0], postcard);
    const baliPostcard = textureCanvas(256, 180, (ctx, w, h) => {
      ctx.fillStyle = "#d0bb8c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4c6959";
      ctx.beginPath();
      ctx.moveTo(10, 140);
      ctx.lineTo(92, 48);
      ctx.lineTo(157, 132);
      ctx.lineTo(195, 83);
      ctx.lineTo(w, 140);
      ctx.fill();
      ctx.fillStyle = "#ffdf9d";
      ctx.beginPath();
      ctx.arc(196, 43, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#344c3c";
      ctx.font = "bold 22px monospace";
      ctx.fillText("BALI / HOME", 42, 168);
    });
    texturedPlane(0.39, 0.28, baliPostcard, [0, 0, 0.022], postcard);
    interactive(postcard, "about");

    // Desk details: headphones, a pencil cup, sticky notes, and cable routing.
    const headphones = group(
      desk,
      portfolioDetails ? [-1.85, 1.2, 0.74] : [1.45, 1.64, 0.12],
    );
    headphones.rotation.y = -0.35;
    const headband = mesh(
      new THREE.TorusGeometry(0.21, 0.034, 8, 24, Math.PI),
      palette.dark,
      [0, 0.12, 0],
      headphones,
    );
    for (const x of [-0.21, 0.21]) {
      box(0.095, 0.2, 0.15, palette.dark, [x, 0.055, 0], headphones, 0.035);
    }
    if (craft) {
      for (const x of [-0.21, 0.21]) {
        const pad = mesh(
          new THREE.TorusGeometry(0.061, 0.016, 10, 28),
          craft.rubber,
          [x - Math.sign(x) * 0.051, 0.055, 0],
          headphones,
        );
        pad.rotation.y = Math.PI / 2;
        pad.scale.y = 1.3;
        cylinder(
          0.015,
          0.015,
          0.087,
          craft.aluminum,
          [x, 0.17, 0],
          headphones,
          16,
        );
      }
      pipe(
        [
          [0.21, -0.045, 0],
          [0.25, -0.13, 0.03],
          [0.13, -0.29, 0.05],
          [-0.06, -0.31, 0.05],
        ],
        0.005,
        craft.rubber,
        headphones,
        16,
      );
      const pencilHolder = group(desk, [-2.69, 0, -0.2]);
      pencilHolder.name = "Pencils behind the left speaker";
      turned(
        [
          [0.001, -0.094],
          [0.063, -0.094],
          [0.077, -0.086],
          [0.09, 0.082],
          [0.09, 0.095],
          [0.081, 0.099],
          [0.078, 0.085],
          [0.065, -0.077],
          [0.001, -0.077],
        ],
        palette.terracotta,
        [1.51, 1.72, -0.52],
        pencilHolder,
      );
    } else {
      cylinder(
        0.09,
        0.075,
        0.19,
        palette.terracotta,
        [1.51, 1.72, -0.52],
        desk,
      );
    }
    for (let i = 0; i < 4; i++) {
      const pencilX = craft ? -2.69 : 0;
      const pencilZ = craft ? -0.2 : 0;
      bar(
        [pencilX + 1.48 + i * 0.02, 1.74, pencilZ - 0.54],
        [pencilX + 1.46 + i * 0.035, 2.02 - (i % 2) * 0.05, pencilZ - 0.53],
        0.009,
        i % 2 ? palette.gold : palette.dark,
        desk,
      );
      if (craft) {
        const x = pencilX + 1.46 + i * 0.035,
          y = 2.02 - (i % 2) * 0.05;
        cylinder(
          0.001,
          0.009,
          0.029,
          palette.lightWood,
          [x, y + 0.014, pencilZ - 0.53],
          desk,
          8,
        );
        cylinder(
          0.0005,
          0.003,
          0.012,
          craft.rubber,
          [x, y + 0.034, pencilZ - 0.53],
          desk,
          8,
        );
      }
    }
    const stickyTexture = textureCanvas(256, 160, (ctx, w, h) => {
      ctx.fillStyle = "#e3c583";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4a5438";
      ctx.font = "bold 28px monospace";
      ctx.fillText("stay curious.", 16, 59);
      ctx.font = "22px monospace";
      ctx.fillText("share the notes", 16, 111);
    });
    const sticky = texturedPlane(
      0.38,
      0.24,
      stickyTexture,
      [0.58, 0.36, 0.04],
      computer,
    );
    sticky.rotation.z = -0.09;
    if (craft) {
      const geometry = new THREE.PlaneGeometry(0.38, 0.24, 10, 10);
      const p = geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        p.setZ(i, 0.022 * Math.pow(Math.max(0, -p.getY(i) / 0.12), 2));
      }
      geometry.computeVertexNormals();
      geometries.add(geometry);
      sticky.geometry = geometry;
    }
    bar([-0.2, 1.55, -0.63], [-0.2, 0.55, -0.9], 0.014, palette.black, desk);
    bar([-0.2, 0.55, -0.9], [0.83, 0.39, -0.9], 0.014, palette.black, desk);
    box(0.45, 0.085, 0.14, palette.cream, [0.64, 0.13, -1.38]);
    for (let i = 0; i < 3; i++) {
      box(0.025, 0.012, 0.05, palette.dark, [0.5 + i * 0.13, 0.18, -1.38]);
    }

    // Warm string lights follow the wall, with cheap shared sprite halos.
    accentBulbMaterial = material(0xffe3a4, {
      emissive: 0xffc16e,
      emissiveIntensity: 0.15,
    });
    const haloTexture = textureCanvas(64, 64, (ctx, w, h) => {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "#ffc373aa");
      g.addColorStop(0.25, "#ffc37335");
      g.addColorStop(1, "#ffc37300");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      toneMapped: false,
    });
    materials.add(haloMaterial);
    let lastLight;
    for (let i = 0; i < 11; i++) {
      const p = [
        -3.02 + i * 0.59,
        4.14 - Math.sin((i * Math.PI) / 10) * 0.21,
        -2.48,
      ];
      if (lastLight) {
        bar(lastLight, p, 0.009, palette.dark);
      }
      bar(p, [p[0], p[1] - 0.1, p[2]], 0.009, palette.dark);
      sphere(0.037, accentBulbMaterial, [p[0], p[1] - 0.14, p[2]]);
      const glow = new THREE.Sprite(haloMaterial);
      // A transparent lighting effect must not intercept clicks on the pennant.
      glow.raycast = () => {};
      glow.position.set(p[0], p[1] - 0.14, p[2] + 0.015);
      glow.scale.set(0.39, 0.39, 1);
      world.add(glow);
      accentGlows.push(glow);
      lastLight = p;
    }
    // Coffee steam only moves during the finite reveal, never in an idle loop.
    const steamMaterial = material(0xe6e6d0, {
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    for (let i = 0; i < 4; i++) {
      const puff = sphere(0.043, steamMaterial, [0, 0.24 + i * 0.065, 0], mug);
      puff.scale.set(0.8, 1.5, 0.8);
      puff.castShadow = false;
      puff.raycast = () => {};
      puff.visible = false;
      steam.push(puff);
    }
    // Woven fringe along the visible edge of the rug.
    for (let i = 0; i < 28; i++) {
      bar(
        [-2.13 + i * 0.124, 0.094, 2.25],
        [-2.13 + i * 0.124, 0.094, 2.36],
        0.009,
        palette.cream,
      );
    }
  }

  if (craft) {
    // Reusable baked contact patches ground small objects without an AO pass.
    const contact = textureCanvas(128, 128, (ctx, w, h) => {
      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        8,
        w / 2,
        h / 2,
        w / 2,
      );
      gradient.addColorStop(0, "rgba(12,14,10,.3)");
      gradient.addColorStop(0.5, "rgba(12,14,10,.14)");
      gradient.addColorStop(1, "rgba(12,14,10,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    });
    const contactMat = new THREE.MeshBasicMaterial({
      map: contact,
      transparent: true,
      depthWrite: false,
    });
    materials.add(contactMat);
    for (const [w, h, pos] of [
      [1.3, 0.52, [-0.16, 1.61, 0.36]],
      [0.85, 0.63, [-0.2, 1.61, -0.38]],
      [0.36, 0.34, [-1.48, 1.61, -0.36]],
    ]) {
      const patch = mesh(
        new THREE.PlaneGeometry(w, h),
        contactMat,
        pos,
        desk,
        false,
      );
      patch.rotation.x = -Math.PI / 2;
      patch.raycast = () => {};
    }
    for (const [w, h, pos] of [
      [1.35, 1.2, [-0.5, 0.096, 1.13]],
      [2.34, 0.74, [2.04, 0.073, -2.28]],
      [0.84, 0.8, [2.05, 0.073, 1.4]],
      [0.58, 1.25, [-2.92, 0.073, 1.88]],
    ]) {
      const patch = mesh(
        new THREE.PlaneGeometry(w, h),
        contactMat,
        pos,
        world,
        false,
      );
      patch.rotation.x = -Math.PI / 2;
      patch.raycast = () => {};
    }
    host.dataset.objectDetail = "crafted";
  }

  // A soft contact shadow under the miniature rather than an infinite scene floor.
  const shadowTexture = textureCanvas(128, 128, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(
      w / 2,
      h / 2,
      10,
      w / 2,
      h / 2,
      w / 2,
    );
    gradient.addColorStop(0, "rgba(43,55,33,.28)");
    gradient.addColorStop(0.65, "rgba(43,55,33,.13)");
    gradient.addColorStop(1, "rgba(43,55,33,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  materials.add(shadowMat);
  const shadow = mesh(
    new THREE.PlaneGeometry(10, 8),
    shadowMat,
    [0, -0.365, 0.25],
    scene,
    false,
  );
  shadow.rotation.x = -Math.PI / 2;

  if (theme === "midnight") {
    // Batch static pieces by material and destination. Click targets stay distinct;
    // curtains, steam, transparent window layers, and sprites remain independent.
    const dynamic = new Set([...curtains, ...steam, nightWindow]);
    const batches = new Map();
    world.updateMatrixWorld(true);
    world.traverse((object) => {
      if (!object.isMesh || object.material.transparent) {
        return;
      }
      for (
        let parent = object;
        parent && parent !== world;
        parent = parent.parent
      ) {
        if (dynamic.has(parent)) {
          return;
        }
      }
      const key = `${object.material.uuid}/${object.userData.destination || ""}/${object.castShadow}/${object.receiveShadow}`;
      if (!batches.has(key)) {
        batches.set(key, []);
      }
      batches.get(key).push(object);
    });
    for (const objects of batches.values()) {
      if (objects.length < 2) {
        continue;
      }
      const parts = objects.map((object) => {
        const geometry = object.geometry.index
          ? object.geometry.toNonIndexed()
          : object.geometry.clone();
        return geometry.applyMatrix4(object.matrixWorld);
      });
      const geometry = mergeGeometries(parts, false);
      parts.forEach((part) => part.dispose());
      if (!geometry) {
        continue;
      }
      geometries.add(geometry);
      const combined = new THREE.Mesh(geometry, objects[0].material);
      combined.castShadow = objects[0].castShadow;
      combined.receiveShadow = objects[0].receiveShadow;
      combined.userData.destination = objects[0].userData.destination;
      objects.forEach((object) => object.removeFromParent());
      world.add(combined);
    }
    // The light and architecture are fixed; tiny curtain motion does not need a
    // full shadow-map rebuild. Camera/light-intensity changes reuse that map.
    curtains.forEach((curtain) =>
      curtain.traverse((object) => {
        object.castShadow = false;
      }),
    );
  }

  const lightingFields = [
    [ambient, "intensity"],
    [ambient, "color"],
    [ambient, "groundColor"],
    [sunlight, "intensity"],
    [sunlight, "color"],
    [fill, "intensity"],
    [fill, "color"],
    [lampLight, "intensity"],
    [screenLight, "intensity"],
    [screenLight, "color"],
    [bulbMaterial, "emissiveIntensity"],
    [renderer, "toneMappingExposure"],
    ...(accentBulbMaterial ? [[accentBulbMaterial, "emissiveIntensity"]] : []),
    ...(accentGlows.length ? [[accentGlows[0].material, "opacity"]] : []),
    ...(nightWindow ? [[nightWindow.material, "opacity"]] : []),
  ];
  function readLighting() {
    return lightingFields.map(([object, key]) =>
      object[key].isColor ? object[key].clone() : object[key],
    );
  }
  function blendLighting(from, to, amount) {
    lightingFields.forEach(([object, key], i) => {
      if (object[key].isColor) {
        object[key].copy(from[i]).lerp(to[i], amount);
      } else {
        object[key] = THREE.MathUtils.lerp(from[i], to[i], amount);
      }
    });
  }
  function transitionLights(to, from = readLighting(), immediate = false) {
    const equal = to.every((value, i) =>
      value.isColor
        ? value.equals(from[i])
        : Math.abs(value - from[i]) < 0.00001,
    );
    if (theme !== "midnight" || immediate || reducedMotion.matches || equal) {
      blendLighting(to, to, 1);
      lightingTween = null;
      host.dataset.lightingTransition = "idle";
    } else {
      lightingTween = { from, to, elapsed: 0 };
      blendLighting(from, from, 1);
      host.dataset.lightingTransition = "playing";
    }
    invalidate();
  }

  // Event-driven rendering, with one optional finite cinematic reveal.
  function positionCamera() {
    camera.position.set(Math.sin(angle) * 12, elevation, Math.cos(angle) * 12);
    camera.lookAt(look);
    camera.zoom = zoom;
    // Composition offsets are normalized screen fractions, independent of zoom.
    // The original room uses zero offsets; the scroll tour frames objects beside text.
    const aspect = width && height ? width / height : 1;
    const frustumHeight = Math.max(8.85, 9.8 / aspect);
    const frustumWidth = frustumHeight * aspect;
    const shiftX = (-viewOffset.x * frustumWidth) / zoom;
    const shiftY = (viewOffset.y * frustumHeight) / zoom;
    camera.left = -frustumWidth / 2 + shiftX;
    camera.right = frustumWidth / 2 + shiftX;
    camera.top = frustumHeight / 2 + shiftY;
    camera.bottom = -frustumHeight / 2 + shiftY;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
  function placeHotspots() {
    for (const { point, element } of hotspots) {
      const p = point.clone().project(camera);
      if (hideOffscreenHotspots) {
        const x = (p.x * 0.5 + 0.5) * width;
        const y = (-0.5 * p.y + 0.5) * height;
        // Labels remain tied to their objects, never clamped into an edge pile.
        element.hidden =
          p.z < -1 ||
          p.z > 1 ||
          x < hotspotPadding ||
          x > width - hotspotPadding ||
          y < Math.min(35, hotspotPadding) ||
          y > height - 55;
        if (adaptiveRender) {
          element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        } else {
          element.style.left = `${x}px`;
          element.style.top = `${y}px`;
        }
        continue;
      }
      element.style.left = `${THREE.MathUtils.clamp((p.x * 0.5 + 0.5) * width, 19, width - 35)}px`;
      element.style.top = `${THREE.MathUtils.clamp((-0.5 * p.y + 0.5) * height, 18, height - 25)}px`;
    }
  }
  function frame(now) {
    frameId = 0;
    if (disposed || !visible || paused || document.hidden) {
      return;
    }
    if (frameBudget && !frameBudget.ready(now)) {
      scheduleFrame();
      return;
    }
    if (!renderRequested) {
      lastFrameTime = 0;
      return;
    }
    renderRequested = false;
    detailRendered = refineWhenIdle && detailRequested;
    detailRequested = false;
    const snap = reducedMotion.matches;
    const dt = lastFrameTime
      ? Math.min(now - lastFrameTime, tourControlled ? 250 : 64)
      : 16.67;
    lastFrameTime = now;
    const damping = snap ? 1 : 1 - Math.exp(-dt / (tourControlled ? 80 : 140));
    if (snap && cinematic) {
      stopReveal();
    }
    if (lightingTween) {
      lightingTween.elapsed += dt;
      const t = snap ? 1 : Math.min(lightingTween.elapsed / 650, 1);
      blendLighting(lightingTween.from, lightingTween.to, t * t * (3 - 2 * t));
      if (t === 1) {
        lightingTween = null;
        host.dataset.lightingTransition = "idle";
      }
    }
    if (cinematic) {
      cinematic.elapsed +=
        cinematic.last === null ? 0 : Math.min(now - cinematic.last, 100);
      cinematic.last = now;
      const t = Math.min(cinematic.elapsed / 3800, 1);
      const outward = t < 0.24;
      const progress = outward ? t / 0.24 : (t - 0.24) / 0.76;
      const ease =
        progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      angle = THREE.MathUtils.lerp(
        outward ? cinematic.angle : 0.43,
        outward ? 0.43 : 0.69,
        ease,
      );
      zoom = THREE.MathUtils.lerp(
        outward ? cinematic.zoom : 0.88,
        outward ? 0.88 : 1,
        ease,
      );
      elevation = THREE.MathUtils.lerp(
        outward ? cinematic.elevation : 10.1,
        outward ? 10.1 : 8.8,
        ease,
      );
      look
        .copy(cinematic.look)
        .lerp(center, THREE.MathUtils.smoothstep(t, 0, 0.24));
      blendLighting(
        cinematic.startLighting,
        cinematic.targetLighting,
        THREE.MathUtils.smoothstep(t, 0, 0.7),
      );
      const warm = 1 - 0.35 * Math.sin(Math.PI * Math.min(t / 0.7, 1));
      lampLight.intensity *= warm;
      if (accentBulbMaterial) {
        accentBulbMaterial.emissiveIntensity *= warm;
      }
      curtains.forEach((curtain, i) => {
        curtain.rotation.z =
          Math.sin(t * 7 + i) * 0.018 * Math.sin(t * Math.PI);
      });
      steam.forEach((puff, i) => {
        puff.visible = true;
        puff.material.opacity =
          0.2 *
          THREE.MathUtils.smoothstep(t, 0, 0.1) *
          (1 - THREE.MathUtils.smoothstep(t, 0.8, 1));
        puff.position.y = 0.15 + ((t * 1.5 + i * 0.22) % 1) * 0.5;
        puff.position.x = Math.sin(t * 9 + i) * 0.027;
      });
      if (t === 1) {
        stopReveal();
      }
    } else {
      angle = THREE.MathUtils.lerp(angle, goalAngle, damping);
      zoom = THREE.MathUtils.lerp(zoom, goalZoom, damping);
      elevation = THREE.MathUtils.lerp(elevation, goalElevation, damping);
      look.lerp(goalLook, damping);
      viewOffset.lerp(goalViewOffset, damping);
      curtains.forEach((curtain) => {
        curtain.rotation.z *= 1 - damping;
      });
      if (steam.length) {
        steam[0].material.opacity *= 1 - damping;
      }
      steam.forEach((puff) => {
        puff.visible = puff.material.opacity > 0.002;
      });
    }
    positionCamera();
    applyRenderResolution(detailRendered);
    const renderStart = performance.now();
    renderer.render(scene, camera);
    frameBudget?.submit(performance.now(), { sample: !detailRendered });
    host.dataset.renderQuality = detailRendered ? "detail" : "motion";
    host.dataset.renderMs = (performance.now() - renderStart).toFixed(1);
    host.dataset.drawCalls = String(renderer.info.render.calls);
    host.dataset.triangles = String(renderer.info.render.triangles);
    placeHotspots();
    host.dataset.renderCount = String(++renderCount);
    host.dataset.width = String(width);
    host.dataset.height = String(height);
    host.dataset.angle = angle.toFixed(3);
    host.dataset.elevation = elevation.toFixed(3);
    host.dataset.zoom = zoom.toFixed(4);
    host.dataset.look = look
      .toArray()
      .map((n) => n.toFixed(3))
      .join(",");
    host.dataset.offset = viewOffset
      .toArray()
      .map((n) => n.toFixed(3))
      .join(",");
    host.dataset.lamp = lampLight.intensity.toFixed(4);
    host.dataset.selection = selected || "overview";
    const moving =
      Math.abs(angle - goalAngle) > 0.0003 ||
      Math.abs(zoom - goalZoom) > 0.0003 ||
      Math.abs(elevation - goalElevation) > 0.001 ||
      viewOffset.distanceTo(goalViewOffset) > 0.0001 ||
      (steam[0]?.material.opacity || 0) > 0.002 ||
      look.distanceTo(goalLook) > 0.001;
    host.dataset.cameraMotion = moving ? "moving" : "idle";
    if (tourControlled) {
      onTourFrame();
    }
    renderRequested = Boolean(moving || cinematic || lightingTween);
    if (refineWhenIdle && !renderRequested && !detailRendered) {
      armDetail();
    }
    if (renderRequested || frameBudget?.pending) {
      scheduleFrame();
    } else {
      lastFrameTime = 0;
    }
  }
  function scheduleFrame() {
    if (!disposed && visible && !paused && !document.hidden && !frameId) {
      frameId = requestAnimationFrame(frame);
    }
  }
  function invalidate() {
    cancelDetail();
    renderRequested = true;
    scheduleFrame();
  }
  function cancelDetail() {
    clearTimeout(detailTimer);
    detailTimer = 0;
    detailRequested = false;
  }
  function armDetail() {
    cancelDetail();
    if (disposed || paused || !visible || document.hidden) {
      return;
    }
    detailTimer = setTimeout(() => {
      detailTimer = 0;
      if (
        disposed ||
        paused ||
        !visible ||
        document.hidden ||
        renderRequested
      ) {
        return;
      }
      detailRequested = true;
      renderRequested = true;
      scheduleFrame();
    }, 240);
  }
  function resize() {
    if (disposed) {
      return;
    }
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (
      !nextWidth ||
      !nextHeight ||
      (width === nextWidth && height === nextHeight)
    ) {
      return;
    }
    width = nextWidth;
    height = nextHeight;
    applyRenderResolution(false);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const frustumHeight = Math.max(8.85, 9.8 / aspect);
    camera.left = (-frustumHeight * aspect) / 2;
    camera.right = (frustumHeight * aspect) / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    invalidate();
  }
  function applyRenderResolution(detail = false) {
    const ratio = detail
      ? settledPixelRatio(width, height, devicePixelRatio, maxDetailPixels)
      : boundedPixelRatio(width, height, requestedPixelRatio, maxRenderPixels);
    if (Math.abs(renderer.getPixelRatio() - ratio) > 0.0001) {
      renderer.setPixelRatio(ratio);
    }
    host.dataset.pixelRatio = ratio.toFixed(2);
    host.dataset.renderPixelBudget = String(
      detail ? maxDetailPixels : maxRenderPixels,
    );
  }
  function focus(id) {
    stopReveal();
    tourControlled = false;
    selected = id;
    goalLook.copy(center);
    goalZoom = 1;
    goalElevation = 8.8;
    goalViewOffset.set(0, 0);
    if (id && anchors[id]) {
      goalLook.lerp(anchors[id], 0.23);
      goalZoom = 1.12;
    }
    invalidate();
  }
  function setTourView(view, immediate = false) {
    if (disposed) {
      return;
    }
    stopReveal();
    tourControlled = true;
    selected = "tour";
    goalAngle = THREE.MathUtils.clamp(view.angle, -0.15, 1.3);
    goalElevation = THREE.MathUtils.clamp(view.elevation, 2.8, 28);
    goalZoom = THREE.MathUtils.clamp(view.zoom, 0.45, 12);
    goalLook.fromArray(view.target);
    goalViewOffset.fromArray(view.offset || [0, 0]);
    if (portfolioDetails && view.atmosphere) {
      const [work, writing] = view.atmosphere;
      // The cues ride the scroll-directed camera path; they create no idle loop
      // or new shadows. Shared room variants never receive this opt-in field.
      monitorSurface.material.color.setScalar(0.84 + work * 0.16);
      screenLight.intensity = 1.8 + work * 1.2;
      lampLight.intensity = 12 + writing * 3;
      host.dataset.atmosphere = view.atmosphere
        .map((n) => n.toFixed(3))
        .join(",");
    }
    if (immediate || reducedMotion.matches) {
      angle = goalAngle;
      elevation = goalElevation;
      zoom = goalZoom;
      look.copy(goalLook);
      viewOffset.copy(goalViewOffset);
    }
    invalidate();
  }
  function setPaused(value) {
    if (paused === value || disposed) {
      return;
    }
    paused = value;
    host.dataset.renderPaused = String(paused);
    host.dataset.cameraMotion = paused ? "paused" : "moving";
    lastFrameTime = 0;
    frameBudget?.reset();
    if (paused) {
      cancelDetail();
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      // A hidden room resumes at the current reading position, not an old pose.
      angle = goalAngle;
      elevation = goalElevation;
      zoom = goalZoom;
      look.copy(goalLook);
      viewOffset.copy(goalViewOffset);
      invalidate();
    }
  }
  function projectPoint(point) {
    if (disposed || !width || !height) {
      return null;
    }
    const p = new THREE.Vector3(...point).project(camera);
    if (Math.abs(p.x) > 1 || Math.abs(p.y) > 1 || Math.abs(p.z) > 1) {
      return null;
    }
    return { x: (p.x * 0.5 + 0.5) * width, y: (-p.y * 0.5 + 0.5) * height };
  }
  function turn(direction) {
    stopReveal();
    goalAngle = THREE.MathUtils.clamp(goalAngle + direction * 0.1, 0.4, 0.99);
    invalidate();
  }
  function reset() {
    goalAngle = 0.69;
    focus(null);
  }
  function setEvening(value) {
    if (disposed) {
      return;
    }
    const from = readLighting();
    stopReveal();
    evening = value;
    host.dataset.light = value ? "evening" : "day";
    ambient.intensity = value ? 1.25 : 3;
    ambient.color.set(value ? 0xb7c9ed : 0xfff5dc);
    sunlight.intensity = value ? 1.0 : 3.8;
    sunlight.color.set(value ? 0xccb0cd : 0xffe4ad);
    fill.intensity = value ? 1.25 : 2;
    fill.color.set(value ? 0xa1b8e4 : 0xe0f0ff);
    lampLight.intensity = value ? 9 : 0;
    screenLight.intensity = value ? 1.4 : 0.35;
    bulbMaterial.emissiveIntensity = value ? 2 : 0.1;
    if (accentBulbMaterial) {
      accentBulbMaterial.emissiveIntensity = value ? 2.8 : 0.15;
    }
    if (accentGlows.length) {
      accentGlows[0].material.opacity = value ? 0.72 : 0;
    }
    if (nightWindow) {
      nightWindow.material.opacity = value ? 1 : 0;
    } else {
      windowView.material.map = value ? nightSky : daySky;
      windowView.material.needsUpdate = true;
    }
    renderer.toneMappingExposure = value ? 1.18 : 1.35;
    if (theme === "midnight" && value) {
      // Moonlit sage walls, warm desk lighting, and the original wood palette.
      ambient.color.set(0xb2c8d4);
      ambient.groundColor.set(0x354439);
      ambient.intensity = 0.95;
      sunlight.color.set(0xc1d0d9);
      sunlight.intensity = 0.7;
      fill.color.set(0x8faebd);
      fill.intensity = 1.15;
      lampLight.intensity = 12;
      screenLight.intensity = 1.8;
      renderer.toneMappingExposure = 1.02;
    } else {
      ambient.groundColor.set(0x687758);
    }
    if (theme === "slate") {
      ambient.color.set(0xbdd3ff);
      ambient.intensity = 2.4;
      sunlight.color.set(0xc5dcff);
      sunlight.intensity = 2.5;
      fill.color.set(0x7caeff);
      fill.intensity = 2.1;
      screenLight.color.set(0x83b5ff);
      screenLight.intensity = 1.8;
      renderer.toneMappingExposure = 1.13;
    }
    transitionLights(readLighting(), from, !lightReady);
    lightReady = true;
  }

  function playReveal() {
    if (disposed || reducedMotion.matches || theme !== "midnight") {
      return false;
    }
    stopReveal();
    tourControlled = false;
    selected = null;
    goalAngle = 0.69;
    goalZoom = 1;
    goalLook.copy(center);
    goalElevation = 8.8;
    goalViewOffset.set(0, 0);
    cinematic = {
      elapsed: 0,
      last: null,
      lamp: lampLight.intensity,
      bulbs: accentBulbMaterial?.emissiveIntensity || 0,
      angle,
      zoom,
      elevation,
      look: look.clone(),
      startLighting: readLighting(),
      targetLighting: lightingTween?.to || readLighting(),
    };
    lightingTween = null;
    host.dataset.cinematic = "playing";
    onCinematicChange(true);
    invalidate();
    return true;
  }
  function stopReveal() {
    if (!cinematic) {
      return;
    }
    const target = cinematic.targetLighting;
    cinematic = null;
    transitionLights(target);
    host.dataset.cinematic = "idle";
    onCinematicChange(false);
    invalidate();
  }

  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function pick(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    // Occlusion-aware: a chair or wall cannot activate something hidden behind it.
    const hit = raycaster.intersectObject(world, true)[0];
    return hit?.object.userData.destination || null;
  }
  let drag = null,
    hovered = null;
  function highlight(id) {
    if (hovered === id) {
      return;
    }
    hovered = id;
    canvas.style.cursor = id ? "pointer" : "grab";
    hotspots.forEach(({ id: target, element }) =>
      element.classList.toggle("corner-highlighted", target === id),
    );
  }
  function pointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    stopReveal();
    drag = {
      x: event.clientX,
      y: event.clientY,
      angle: goalAngle,
      id: event.pointerId,
      active: false,
      moved: false,
    };
  }
  function pointerMove(event) {
    if (drag && event.buttons === 0) {
      pointerCancel();
    }
    if (!drag) {
      if (event.pointerType !== "touch") {
        highlight(pick(event));
      }
      return;
    }
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 7) {
      drag.moved = true;
    }
    if (!drag.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      drag.active = true;
      canvas.setPointerCapture(event.pointerId);
    }
    if (drag.active) {
      goalAngle = THREE.MathUtils.clamp(drag.angle - dx * 0.003, 0.4, 0.99);
      canvas.style.cursor = "grabbing";
      invalidate();
    }
  }
  function pointerUp(event) {
    if (!drag) {
      return;
    }
    const wasClick = !drag.moved;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (wasClick) {
      const id = pick(event);
      if (id) {
        onSelect(id);
      }
    }
    canvas.style.cursor = "grab";
  }
  function pointerCancel() {
    drag = null;
    canvas.style.cursor = "grab";
  }
  function pointerLeave() {
    if (drag && !drag.active) {
      pointerCancel();
    }
    if (!drag) {
      highlight(null);
    }
  }
  function visibilityChange() {
    if (document.hidden) {
      cancelDetail();
      lastFrameTime = 0;
      frameBudget?.reset();
      if (cinematic) {
        cinematic.last = null;
      }
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      invalidate();
    }
  }
  function contextLost(event) {
    event.preventDefault();
    dispose();
    onError();
  }
  const observers = {
    resize: new ResizeObserver(resize),
    intersection: new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        host.dataset.visible = String(visible);
        if (visible) {
          invalidate();
        } else {
          cancelDetail();
          lastFrameTime = 0;
          frameBudget?.reset();
          if (cinematic) {
            cinematic.last = null;
          }
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { threshold: 0.01 },
    ),
  };
  const listeners = [
    ...(enableInteractions
      ? [
          [canvas, "pointerdown", pointerDown],
          [canvas, "pointermove", pointerMove],
          [canvas, "pointerup", pointerUp],
          [canvas, "pointercancel", pointerCancel],
          [canvas, "pointerleave", pointerLeave],
        ]
      : []),
    [canvas, "webglcontextlost", contextLost],
    [document, "visibilitychange", visibilityChange],
    [reducedMotion, "change", invalidate],
  ];
  listeners.forEach(([target, event, handler]) =>
    target.addEventListener(event, handler),
  );
  observers.resize.observe(host);
  observers.intersection.observe(host);
  function dispose() {
    if (disposed) {
      return;
    }
    disposed = true;
    cancelDetail();
    stopReveal();
    cancelAnimationFrame(frameId);
    frameId = 0;
    frameBudget?.reset();
    Object.values(observers).forEach((o) => o.disconnect());
    listeners.forEach(([target, event, handler]) =>
      target.removeEventListener(event, handler),
    );
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    reflectionTarget?.dispose();
    scene.environment = null;
    renderer.dispose();
    canvas.remove();
  }
  resize();
  positionCamera();
  host.dataset.state = "ready";
  host.dataset.visible = "true";
  host.dataset.light = "day";
  host.dataset.cinematic = "idle";
  return {
    focus,
    turn,
    reset,
    setEvening,
    playReveal,
    stopReveal,
    setTourView,
    projectPoint,
    setPaused,
    dispose,
  };
}
