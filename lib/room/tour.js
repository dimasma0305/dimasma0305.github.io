import { tourContent, escapeHTML } from "./content.js";
import { roomStills } from "./stills.js";
import { roomAsset, roomIcon } from "./assets.js";
import { brandMarkSVG, siteNavigation } from "../site-brand.mjs";

export const tourStops = [
  {
    id: "welcome",
    label: "WELCOME HOME",
    number: "00",
    side: "left",
    view: {
      angle: 0.69,
      elevation: 8.8,
      zoom: 0.67,
      target: [0, 1.98, -0.15],
      offset: [0.24, 0.02],
    },
  },
  {
    id: "room",
    label: "A LITTLE ROOM. A BIGGER WORLD.",
    number: "01",
    side: "center",
    subject: [8.1, 6.4],
    view: {
      angle: 0.55,
      elevation: 9.2,
      zoom: 1.12,
      target: [0, 2.05, -0.15],
      offset: [0, 0],
    },
  },
  {
    id: "work",
    label: "THE WORKBENCH / PROJECT COLLECTION",
    number: "02",
    side: "right",
    view: {
      angle: -0.067,
      elevation: 3.1,
      zoom: 3.9,
      target: [-0.8, 2.495, -1.018],
      offset: [-0.22, 0],
    },
    subject: [1.85, 1.4],
  },
  {
    id: "writing",
    label: "THE NOTEBOOK / LEARNING OUT LOUD",
    number: "03",
    side: "left",
    view: {
      angle: 0.18,
      elevation: 28,
      zoom: 8,
      target: [-1.95, 1.687, -0.21],
      offset: [0.23, 0.04],
    },
    subject: [1.04, 0.86],
  },
  {
    id: "about",
    label: "THE PHOTO WALL / GOOD COMPANY",
    number: "04",
    side: "right",
    view: {
      angle: 0.167,
      elevation: 3.5,
      zoom: 3.8,
      target: [2, 3.04, -2.5],
      offset: [-0.23, 0.01],
    },
    subject: [2.05, 1.94],
  },
  {
    id: "achievements",
    label: "THE TROPHY SHELF / COMPETITION & RESEARCH RESULTS",
    number: "05",
    side: "left",
    view: {
      angle: 0.65,
      elevation: 2.8,
      zoom: 7,
      target: [2.04, 1.02, -2.17],
      offset: [0.2, 0],
    },
    subject: [2.45, 2.08],
  },
  {
    id: "skills",
    label: "THE BOOKSHELF / SKILLS & CERTIFICATIONS",
    number: "06",
    side: "right",
    view: {
      angle: 1.3,
      elevation: 2.8,
      zoom: 4,
      target: [-2.71, 0.77, 1.88],
      offset: [-0.2, 0],
    },
    subject: [1.3, 1.4],
  },
  {
    id: "experience",
    label: "THE STORY WALL / BACKGROUND & EXPERIENCE",
    number: "07",
    side: "left",
    view: {
      angle: 1.3,
      elevation: 3.2,
      zoom: 4,
      target: [-3.1, 2.43, 1.04],
      offset: [0.2, 0],
    },
    subject: [1.68, 1.8],
  },
  {
    id: "services",
    label: "THE REVIEW FOLDER / WORK WITH ME",
    number: "08",
    side: "right",
    view: {
      angle: 0.18,
      elevation: 28,
      zoom: 7,
      target: [0.82, 1.69, -0.28],
      offset: [-0.2, 0],
    },
    subject: [1.02, 0.86],
  },
  {
    id: "contact",
    label: "BACK HOME / KEEP IN TOUCH",
    number: "09",
    side: "right",
    view: {
      angle: 0.73,
      elevation: 8.8,
      zoom: 0.91,
      target: [0, 1.98, -0.15],
      offset: [-0.22, 0.02],
    },
  },
].map((stop) => ({
  ...stop,
  side: "right",
  view: {
    ...stop.view,
    offset: [0, 0],
  },
}));
const stops = tourStops;

const mix = (a, b, t) => a + (b - a) * t;
export const tourHotspotAnchors = {
  work: [-0.8, 3.18, -1.018],
  notes: [-1.76, 1.73, -0.67],
  memories: [2, 3.83, -2.49],
  trophy: [2.04, 1.91, -2.03],
  skills: [-2.68, 1.55, 1.88],
  about: [-3.1, 3.2, 1.04],
  services: [0.98, 1.76, -0.67],
};
export function tourViewForSize(
  stop,
  width,
  height,
  { immersive = false } = {},
) {
  const subject = stop.subject || [9.4, 7.2];
  const availableWidth = immersive ? width * 0.56 : width;
  const unit = Math.min(
    Math.max(1, availableWidth - 64) / subject[0],
    Math.max(1, height * 0.72) / subject[1],
  );
  const frustum = Math.max(8.85, 9.8 / (width / height));
  return {
    ...stop.view,
    zoom: Math.min(12, (unit * frustum) / height),
    offset: [immersive ? -0.215 : 0, 0],
    atmosphere: [stop.id === "work" ? 1 : 0, stop.id === "writing" ? 1 : 0],
  };
}
export function tourStillBox(stop, width, height, immersive = false) {
  // Match the projected size of the square source render in the wider scene.
  const view = tourViewForSize(stop, width, height, { immersive });
  const source = tourViewForSize(stop, 1024, 1024);
  const frustum = Math.max(8.85, 9.8 / (width / height));
  const size = (view.zoom * height * 9.8) / (frustum * source.zoom);
  return { size, x: width * (immersive ? 0.285 : 0.5), y: height / 2 };
}
export function mixTourViews(a, b, t) {
  return {
    angle: mix(a.angle, b.angle, t),
    elevation: mix(a.elevation, b.elevation, t),
    zoom: mix(a.zoom, b.zoom, t),
    target: a.target.map((n, i) => mix(n, b.target[i], t)),
    offset: a.offset.map((n, i) => mix(n, b.offset[i], t)),
    ...(a.atmosphere || b.atmosphere
      ? {
          atmosphere: (a.atmosphere || [0, 0]).map((n, i) =>
            mix(n, (b.atmosphere || [0, 0])[i], t),
          ),
        }
      : {}),
  };
}
export function tourTravelMode(a, b) {
  if (a.zoom < 1.5 || b.zoom < 1.5) {
    return "approach";
  }
  return "pan";
}
export function travelTourView(a, b, progress, mode = "pan") {
  let t = Math.max(0, Math.min(1, progress));
  // Only the three establishing shots have an eased arrival. This is a direct
  // scroll mapping, never a second animation chasing the latest scroll position.
  if (mode === "cinematic") {
    t = t * t * (3 - 2 * t);
  }
  return mixTourViews(a, b, t);
}
export function mobileRoomReveal({
  cardTop,
  headerHeight,
  roomHeight,
  overview,
  expanded,
}) {
  if (expanded === true) {
    return 1;
  }
  if (expanded === false || !overview) {
    return 0;
  }
  const range = Math.max(1, roomHeight - 56);
  const arriving = (cardTop - headerHeight - 80) / range;
  return Math.max(0, Math.min(1, arriving));
}
export function buildTourFrames(
  metrics,
  views,
  { headerHeight, viewport, mobile },
) {
  const frames = [{ at: 0, view: views[0] }];
  const arrivals = [0];
  const travel = Math.min(240, Math.max(140, viewport * 0.28));
  for (let i = 1; i < metrics.length; i++) {
    const cinematic =
      !mobile && ["room", "about", "contact"].includes(metrics[i].id);
    const nominalArrival = Math.max(
      frames.at(-1).at + 1,
      metrics[i].cardTop - headerHeight - (mobile ? 110 : viewport * 0.45),
    );
    const span = cinematic
      ? Math.min(620, Math.max(360, viewport * 0.68))
      : travel;
    const previousBottom =
      metrics[i - 1].cardTop + (metrics[i - 1].cardHeight || 0);
    const inset = mobile ? 80 : 32;
    const readingPosition = metrics[i].cardTop - headerHeight - inset;
    const earliest = Math.max(
      frames.at(-1).at,
      previousBottom - headerHeight - viewport * 0.82,
      metrics[i - 1].cardTop -
        headerHeight -
        inset +
        Math.min((metrics[i - 1].cardHeight || 0) * 0.5, viewport * 0.5),
    );
    // Even a short directory gets a real reading hold. Every destination's
    // camera has arrived by the position used by its native navigation link.
    const arrival = Math.max(
      nominalArrival,
      earliest + Math.min(span, Math.max(1, readingPosition - earliest)),
    );
    const start = Math.max(earliest, arrival - span);
    frames.push({ at: start, view: views[i - 1] });
    frames.push({
      at: arrival,
      view: views[i],
      travel: cinematic ? "cinematic" : "pan",
    });
    arrivals.push(arrival);
  }
  return { frames, arrivals };
}
export function sampleTourPath(frames, position) {
  if (position <= frames[0].at) {
    return frames[0].view;
  }
  for (let i = 1; i < frames.length; i++) {
    if (position <= frames[i].at) {
      const previous = frames[i - 1];
      const t =
        (position - previous.at) / Math.max(1, frames[i].at - previous.at);
      return travelTourView(
        previous.view,
        frames[i].view,
        t,
        frames[i].travel || "pan",
      );
    }
  }
  return frames.at(-1).view;
}

export function tourChapterAtPosition(arrivals, position) {
  let active = 0;
  for (let index = 1; index < arrivals.length; index++) {
    // Native scroll positions may round down a fractional CSS-pixel target.
    // Losing focus to the room toggle must not select the previous chapter.
    if (position + 1 >= arrivals[index]) {
      active = index;
    }
  }
  return active;
}

export function cornerTour({
  icon = roomIcon,
  email,
  site,
  portfolio,
  assetBase = "./",
  production = false,
}) {
  const content = tourContent({ email, site, portfolio, assetBase });
  const aliases = {
    welcome: "home",
    work: "projects",
    writing: "blog",
    about: "moments",
    achievements: "ctf",
  };
  const alias = (id) =>
    production && aliases[id]
      ? `<span class="tour-anchor-alias" id="${aliases[id]}" aria-hidden="true"></span>`
      : "";
  const labels = {
    work: "Projects",
    writing: "Writing",
    about: "Photos",
    achievements: "Results",
    skills: "Skills",
    experience: "Journey",
    services: "Services",
    contact: "Contact",
  };
  const objects = {
    work: ["work", "Workbench"],
    writing: ["notes", "Field notes"],
    about: ["memories", "Photo wall"],
    achievements: ["trophy", "Trophy shelf"],
    skills: ["skills", "Bookshelf"],
    experience: ["about", "My story"],
    services: ["services", "Review folder"],
  };
  const titles = {
    work: "Tools, experiments,<br><em>and shared work.</em>",
    writing: "Leave the<br><em>notebook open.</em>",
    about: "The people<br><em>behind the flags.</em>",
    achievements: "Every award.<br><em>A story behind it.</em>",
    skills: "Always adding<br><em>to the toolkit.</em>",
    experience: "The person<br><em>behind the desk.</em>",
    services: "Source code review.<br><em>Clear, useful fixes.</em>",
    contact: "There’s room for<br><em>one more story.</em>",
  };
  const destinations = stops.filter((stop) => labels[stop.id]);
  return `<div class="tour-page${production ? " tour-still" : ""}" id="top" tabindex="-1"${production ? ' data-production="true"' : ""}>
    <header class="tour-header"><div class="tour-header-inner">
      <a class="tour-brand" href="#welcome" aria-label="dimasc.tf — home">${brandMarkSVG()}<span class="tour-wordmark">dimasc<span>.tf</span></span></a>
      <nav class="tour-site-nav site-primary-nav" aria-label="Main navigation">${siteNavigation.map((item) => `<a href="${escapeHTML(site + item.path)}">${item.name}</a>`).join("")}</nav>
      <div class="tour-header-actions"><a class="tour-search-link" href="${site}/search/" aria-label="Search projects, posts, and notes"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></a><button type="button" class="tour-motion" data-tour-motion aria-pressed="true"${production ? " disabled" : ""}>${icon("play")} <span>3D room</span></button></div>
    </div><div class="tour-section-bar"><span class="tour-section-label" aria-hidden="true">IN THE ROOM</span><nav class="tour-nav" aria-label="Room chapters">${destinations.map((stop) => `<a href="#${stop.id}">${stop.id === "services" ? "Review desk" : labels[stop.id]}</a>`).join("")}</nav></div></header>
    <main id="main-content" tabindex="-1">
      <div class="tour-run">
        <div class="tour-stage">
          <div id="tour-scene" class="tour-scene" data-state="loading"><img class="tour-still-image" src="${escapeHTML(roomAsset(assetBase, "assets/room-stills/welcome.jpg"))}" width="2048" height="2048" fetchpriority="high" alt="" />
            <nav class="tour-hotspots" aria-label="Explore objects in the room">${destinations
              .filter((stop) => objects[stop.id])
              .map(
                (stop) =>
                  `<a href="#${stop.id}" class="tour-hotspot" data-corner-hotspot="${objects[stop.id][0]}" aria-label="${stop.number} · ${objects[stop.id][1]}: ${labels[stop.id]}" hidden><span>${stop.number}</span><span class="tour-hotspot-name">${objects[stop.id][1]} ↗</span></a>`,
              )
              .join("")}</nav>
          </div>
          <div class="tour-atmosphere" aria-hidden="true"></div>
          <div class="tour-vignette" aria-hidden="true"></div>
          <div class="tour-stage-top" aria-hidden="true"><span>ROOM 01 / AFTER HOURS</span><span>DENPASAR, BALI</span></div>
          <div class="tour-hud" aria-hidden="true"><div><span id="tour-stop-number">00</span><span id="tour-stop-label">WELCOME HOME</span></div><span class="tour-scroll-hint">SCROLL OR PICK A ROOM TAG <span>↓</span></span><div class="tour-progress"><span></span></div></div>
          <button class="tour-room-toggle" data-tour-room-toggle aria-expanded="true" aria-controls="tour-scene"><span><span data-room-number>02</span><strong data-room-label>Projects</strong></span><span data-room-action>Hide room ↑</span></button>
          <a class="tour-room-directory-link" href="#room" aria-label="Browse all room chapters">All corners ↑</a>
        </div>
        <div class="tour-chapters">
          <section id="welcome" class="tour-chapter tour-welcome" data-side="right" aria-labelledby="tour-title" tabindex="-1">${alias("welcome")}<div class="tour-copy tour-intro">
            <p class="tour-kicker"><span aria-hidden="true">✳</span> DENPASAR, BALI / AN OPEN DOOR</p>
            <h1 id="tour-title">Dimas<br><em>Maulana.</em></h1>
            <p class="tour-lede">Security researcher. Open-source builder.<br><strong>Founder of TCP1P.</strong></p>
            <div class="tour-intro-actions"><a class="tour-start" href="#room">Come on in <span aria-hidden="true">↓</span></a><a class="tour-link tour-hire-link" href="#services">Work with me ↗</a></div>
            <div class="tour-intro-proof"><a href="${escapeHTML(portfolio.researchEvidence?.profile || "https://patchstack.com/database/")}"><strong>170+</strong><span>research reports · Patchstack ↗</span></a><a href="#work"><strong>Open source</strong><span>made to be shared ↗</span></a></div>
            <div class="tour-signature"><img src="${escapeHTML(roomAsset(assetBase, "assets/dimas.jpg"))}" width="46" height="46" alt="Dimas’ illustrated avatar"/><div><strong>Research. Build. Share.</strong><span>A personal space, from Bali.</span></div></div>
          </div></section>
          <section id="room" class="tour-chapter tour-room-reveal" data-side="right" aria-labelledby="tour-room-title" tabindex="-1"><div class="tour-room-caption"><p class="tour-kicker">PICK A CORNER, OR KEEP SCROLLING</p><h2 id="tour-room-title">A little room.<br><em>A bigger world.</em></h2><nav class="tour-room-index" aria-label="Room directory">${destinations.map((stop) => `<a href="#${stop.id}"><span>${stop.number}</span> ${labels[stop.id]}</a>`).join("")}</nav></div></section>
          ${destinations.map((stop) => `<section id="${stop.id}" class="tour-chapter${stop.id === "contact" ? " tour-contact" : ""}" data-side="${stop.side}" aria-labelledby="tour-${stop.id}-title" tabindex="-1">${alias(stop.id)}<div class="tour-copy tour-card tour-card-${stop.id}"><p class="tour-kicker">${stop.number} / ${escapeHTML(stop.label.split(" / ")[0])}</p><h2 id="tour-${stop.id}-title">${titles[stop.id]}</h2>${content[stop.id]}</div></section>`).join("")}
        </div>
      </div>
    </main>
    <footer class="tour-footer"><span>A little curiosity goes a long way.</span><a href="#welcome">Back to the beginning ↑</a><div>${production ? `<span>DIMAS MAULANA / DENPASAR, BALI</span><a href="${site}/blog/">Blog</a><a href="${site}/notes/">Notes</a><a href="${site}/tools/">Tools</a><a href="${site}/search/">Search</a><a href="${site}/reading-list/">Saved reading</a><a href="${site}/privacy/">Privacy & performance</a><a href="${site}/services/">Services</a><a href="${site}/rss.xml">RSS</a>` : '<span>SCROLL-DIRECTED ROOM TOUR</span><a href="?concept=corner-scroll">Compare scroll-first Corner</a><a href="?concept=corner">Original room</a><a href="?">All concepts</a>'}</div></footer>
    <p id="tour-status" class="sr-only" role="status"></p>
  </div>`;
}

export function initCornerTour({
  icon = roomIcon,
  sceneSummary,
  assetBase = "./",
  loadScene,
}) {
  const root = document.documentElement;
  const page = document.querySelector(".tour-page");
  if (!page || page.dataset.enhanced === "true") {
    return () => {};
  }
  page.dataset.enhanced = "true";
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const previousTheme = metaTheme?.getAttribute("content");
  const hadDocumentClass = root.classList.contains("tour-document");
  const previousHeader = root.style.getPropertyValue("--tour-header");
  root.classList.add("tour-document");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", "#111915");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 900px)");
  const events = new AbortController();
  const { signal } = events;
  let initialLanding = 0;
  let landingAllowed = true;
  const cancelLanding = () => {
    landingAllowed = false;
  };
  for (const event of ["pointerdown", "wheel", "keydown", "touchstart"]) {
    addEventListener(event, cancelLanding, { passive: true, signal });
  }
  const host = document.getElementById("tour-scene");
  const stillImage = host.querySelector(".tour-still-image");
  const outgoingImage = stillImage.cloneNode();
  outgoingImage.removeAttribute("fetchpriority");
  outgoingImage.className = "tour-still-outgoing";
  outgoingImage.hidden = true;
  stillImage.after(outgoingImage);
  const stage = document.querySelector(".tour-stage");
  const header = document.querySelector(".tour-header");
  const nav = document.querySelector(".tour-nav");
  const sectionLinks = stops.map((stop) =>
    nav.querySelector(`a[href="#${stop.id}"]`),
  );
  const stopNumber = document.getElementById("tour-stop-number");
  const stopLabel = document.getElementById("tour-stop-label");
  const progressBar = document.querySelector(".tour-progress > span");
  const motionButton = document.querySelector("[data-tour-motion]");
  const roomButton = document.querySelector("[data-tour-room-toggle]");
  const roomNumber = roomButton.querySelector("[data-room-number]");
  const roomLabel = roomButton.querySelector("[data-room-label]");
  const roomAction = roomButton.querySelector("[data-room-action]");
  const chapters = stops.map((stop) => document.getElementById(stop.id));
  const cards = chapters.map((chapter) =>
    chapter.querySelector(".tour-copy, .tour-room-caption"),
  );
  const navLinks = [...document.querySelectorAll(".tour-nav a, .tour-hotspot")];
  const disclosureAnimations = new Map();
  const arrivalAnimations = new Map();
  const pendingArrivals = new Set();
  let arrivalFrame = 0;
  let stillAnimation = null;
  let scene = null,
    disposed = false,
    failed = false;
  let manualStill =
    new URLSearchParams(location.search).get("motion") === "off";
  let forceLive = new URLSearchParams(location.search).get("room") === "3d";
  let performanceStill = false;
  try {
    performanceStill =
      !forceLive &&
      sessionStorage.getItem("corner-tour-lightweight") === "true";
  } catch {}
  let still = media.matches || manualStill || performanceStill;
  let sceneLoading = false;
  let requestedStill = "",
    displayedStill = "";
  const stillCache = new Map();
  let frames = [],
    centers = [],
    metrics = [];
  let frame = 0,
    resizeFrame = 0,
    active = 0,
    headerHeight = 74;
  let sceneWidth = 0,
    sceneHeight = 0,
    cardBounds = [];
  let introBesideRoom = false;
  let lastPose = "",
    firstView = true;
  let manualRoom = null,
    roomReveal = 1,
    previousActive = -1;
  const album = document.querySelector(".tour-album");
  const photos = [...document.querySelectorAll("[data-portfolio-photo]")];
  const photoButtons = [...document.querySelectorAll("[data-tour-photo]")];
  let photoAnimation = null;
  let motionAllowed = !media.matches && !manualStill;
  function setData(element, key, value) {
    if (element.dataset[key] !== value) {
      element.dataset[key] = value;
    }
  }
  function setStyle(element, key, value) {
    if (element.style.getPropertyValue(key) !== value) {
      element.style.setProperty(key, value);
    }
  }

  function responsiveView(stop) {
    return tourViewForSize(stop, sceneWidth, sceneHeight, {
      immersive: !mobile.matches,
    });
  }
  function positionStillImage(image, key) {
    const stop = stops.find((stop) => stop.id === key) || stops[active];
    const box = tourStillBox(stop, sceneWidth, sceneHeight, !mobile.matches);
    setStyle(image, "width", `${box.size}px`);
    setStyle(image, "height", `${box.size}px`);
    setStyle(image, "left", `${box.x}px`);
    setStyle(image, "top", `${box.y}px`);
  }
  function rememberLightweight(value) {
    try {
      if (value) {
        sessionStorage.setItem("corner-tour-lightweight", "true");
      } else {
        sessionStorage.removeItem("corner-tour-lightweight");
      }
    } catch {}
  }
  function preloadStill(index) {
    const item = roomStills[stops[index]?.id];
    if (!item) {
      return Promise.resolve(null);
    }
    if (!stillCache.has(item.src)) {
      const img = new Image();
      img.decoding = "async";
      img.src = roomAsset(assetBase, item.src);
      stillCache.set(
        item.src,
        img
          .decode()
          .then(() => img)
          .catch(() => null),
      );
    }
    return stillCache.get(item.src);
  }
  function positionStillHotspots() {
    const image = roomStills[displayedStill];
    const stop =
      stops.find((stop) => stop.id === displayedStill) || stops[active];
    const { size, x, y } = tourStillBox(
      stop,
      sceneWidth,
      sceneHeight,
      !mobile.matches,
    );
    for (const link of navLinks.filter((link) =>
      link.classList.contains("tour-hotspot"),
    )) {
      const point = image?.anchors[link.dataset.cornerHotspot];
      const hidden =
        displayedStill !== stops[active].id ||
        !point ||
        point.hidden ||
        (active > 1 && link.hash !== `#${stops[active].id}`);
      if (link.hidden !== Boolean(hidden)) {
        link.hidden = Boolean(hidden);
      }
      if (!hidden) {
        setStyle(
          link,
          "transform",
          `translate3d(${x - size / 2 + point.x * size}px, ${y - size / 2 + point.y * size}px, 0) translate(-50%, -50%)`,
        );
      }
    }
  }
  function showStill() {
    const key = stops[active].id;
    positionStillHotspots();
    if (requestedStill === key) {
      return;
    }
    requestedStill = key;
    preloadStill(active).then((img) => {
      if (disposed || !still || requestedStill !== key || !img) {
        return;
      }
      stillAnimation?.cancel();
      const fade =
        motionAllowed &&
        displayedStill &&
        stillImage.src !== img.src &&
        (!mobile.matches || roomReveal > 0.9);
      if (fade) {
        outgoingImage.src = stillImage.src;
        positionStillImage(outgoingImage, displayedStill);
      }
      outgoingImage.hidden = !fade;
      stillImage.src = img.src;
      displayedStill = key;
      positionStillImage(stillImage, key);
      host.dataset.staticView = key;
      positionStillHotspots();
      if (fade) {
        const animation = outgoingImage.animate(
          { opacity: [1, 0] },
          { duration: 360, easing: "ease-out" },
        );
        stillAnimation = animation;
        animation.finished
          .then(() => {
            if (stillAnimation !== animation) {
              return;
            }
            outgoingImage.hidden = true;
            stillAnimation = null;
          })
          .catch(() => {});
      }
    });
    preloadStill(active + 1);
  }
  function measure() {
    resizeFrame = 0;
    if (disposed) {
      return;
    }
    headerHeight = header.getBoundingClientRect().height;
    setStyle(root, "--tour-header", `${headerHeight}px`);
    const viewport = innerHeight - headerHeight;
    const sceneBounds = host.getBoundingClientRect();
    sceneWidth = sceneBounds.width;
    sceneHeight = sceneBounds.height;
    // Landscape phones place the introduction alongside a narrower room pane.
    // Detect that measured layout instead of duplicating its CSS breakpoint.
    introBesideRoom = mobile.matches && sceneWidth < innerWidth * 0.6;
    positionStillImage(stillImage, displayedStill || stops[active].id);
    stillAnimation?.cancel();
    outgoingImage.hidden = true;
    cardBounds = cards.map((card) => card.getBoundingClientRect());
    metrics = chapters.map((chapter, i) => {
      const bounds = chapter.getBoundingClientRect();
      const card = cardBounds[i];
      const cardHeight = card.height;
      return {
        id: stops[i].id,
        top: bounds.top + scrollY,
        height: bounds.height,
        cardTop: card.top + scrollY,
        cardHeight,
        center: card.top + scrollY + cardHeight / 2,
      };
    });
    const path = buildTourFrames(metrics, stops.map(responsiveView), {
      headerHeight,
      viewport,
      mobile: mobile.matches,
    });
    frames = path.frames;
    centers = path.arrivals;
    schedule();
  }
  function scheduleMeasure() {
    if (!resizeFrame) {
      resizeFrame = requestAnimationFrame(measure);
    }
  }
  function update() {
    frame = 0;
    if (disposed || !frames.length) {
      return;
    }
    const position = scrollY;
    let next = tourChapterAtPosition(centers, position);
    const focused = chapters.findIndex((chapter) =>
      chapter.contains(document.activeElement),
    );
    if (focused >= 0 && document.activeElement !== document.body) {
      const top = metrics[focused].cardTop - position;
      if (top >= headerHeight && top < innerHeight) {
        next = focused;
      }
    }
    active = next;
    if (active !== previousActive) {
      manualRoom = null;
      previousActive = active;
      const currentLink = sectionLinks[active];
      if (
        mobile.matches &&
        currentLink &&
        !nav.contains(document.activeElement)
      ) {
        nav.scrollTo({
          left:
            currentLink.offsetLeft -
            nav.offsetLeft -
            (nav.clientWidth - currentLink.offsetWidth) / 2,
          behavior: "instant",
        });
      }
      page.dataset.chapter = stops[active].id;
      document.dispatchEvent(
        new CustomEvent("dimasc:room-chapter", { detail: stops[active].id }),
      );
      stage.dataset.chapter = stops[active].id;
      page.dataset.side = stops[active].side;
      stopNumber.textContent = stops[active].number;
      stopLabel.textContent = stops[active].label;
      roomNumber.textContent = stops[active].number;
      roomLabel.textContent = currentLink?.textContent || "Room";
      for (const link of navLinks) {
        if (link.hash === `#${stops[active].id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      }
      queueArrivals();
    }
    const roomHeight = sceneHeight;
    roomReveal = mobile.matches
      ? mobileRoomReveal({
          cardTop:
            (active === 0 && introBesideRoom
              ? metrics[0].top + roomHeight + 80
              : metrics[active].cardTop) - position,
          cardBottom:
            metrics[active].cardTop + metrics[active].cardHeight - position,
          headerHeight,
          roomHeight,
          overview: active === 0,
          expanded: manualRoom,
        })
      : 1;
    if (host.contains(document.activeElement)) {
      roomReveal = 1;
    }
    // These variables affect only the room overlay, not every portfolio entry.
    setStyle(
      stage,
      "--tour-room-visible",
      `${mix(56, roomHeight, roomReveal)}px`,
    );
    setStyle(stage, "--tour-room-reveal", roomReveal.toFixed(4));
    setData(page, "roomManual", String(manualRoom !== null));
    setData(
      page,
      "roomMode",
      roomReveal < 0.01 ? "reading" : roomReveal > 0.99 ? "open" : "transition",
    );
    const inert = mobile.matches && roomReveal < 0.92;
    if (host.inert !== inert) {
      host.inert = inert;
    }
    const roomHidden = active === 0 || !mobile.matches;
    if (roomButton.hidden !== roomHidden) {
      roomButton.hidden = roomHidden;
    }
    const expanded = String(roomReveal > 0.5);
    if (roomButton.getAttribute("aria-expanded") !== expanded) {
      roomButton.setAttribute("aria-expanded", expanded);
      roomAction.textContent = roomReveal > 0.5 ? "Hide room ↑" : "View room ↓";
    }
    const progress = Math.max(
      0,
      Math.min(1, position / Math.max(1, centers.at(-1))),
    );
    setStyle(progressBar, "transform", `scaleX(${progress.toFixed(4)})`);
    const view = still
      ? responsiveView(stops[active])
      : sampleTourPath(frames, position);
    const pose = JSON.stringify(view);
    setData(host, "closeup", String(view.zoom > 2));
    scene?.setPaused(mobile.matches && roomReveal < 0.01);
    if (scene && (pose !== lastPose || firstView)) {
      scene.setTourView(view, true);
      host.dataset.tourTarget = pose;
      lastPose = pose;
      firstView = false;
    }
    if (still) {
      showStill();
    }
    setData(host, "tourProgress", progress.toFixed(4));
  }
  function schedule() {
    if (!frame && !document.hidden) {
      frame = requestAnimationFrame(update);
    }
  }
  function applyMotion() {
    photoAnimation?.cancel();
    stillAnimation?.cancel();
    outgoingImage.hidden = true;
    for (const animation of arrivalAnimations.values()) {
      animation.cancel();
    }
    arrivalAnimations.clear();
    for (const { animation } of disclosureAnimations.values()) {
      animation.finish();
    }
    still = media.matches || manualStill || performanceStill || failed;
    motionAllowed = !media.matches && !manualStill;
    page.dataset.motion = motionAllowed ? "on" : "off";
    page.classList.toggle("tour-still", still);
    page.dataset.renderMode = still ? "stills" : "live";
    page.dataset.staticReason = media.matches
      ? "reduced-motion"
      : failed
        ? "unavailable"
        : performanceStill
          ? "performance"
          : manualStill
            ? "preference"
            : "";
    motionButton.setAttribute("aria-pressed", String(!still));
    motionButton.disabled = media.matches || failed;
    motionButton.innerHTML = `${icon(still ? "moon" : "play")} <span>${media.matches ? "Reduced motion" : (performanceStill || failed) && !manualStill ? "Lightweight" : still ? "Still room" : "3D room"}</span>`;
    motionButton.title = media.matches
      ? "Camera motion follows your reduced-motion preference."
      : failed
        ? "The room uses lightweight images. All content and navigation are available."
        : performanceStill
          ? "Lightweight room enabled for smoother scrolling. Activate to try 3D again."
          : "Switch between live 3D and still room views without changing the reading layout";
    requestedStill = "";
    firstView = true;
    if (still) {
      scene?.dispose();
      scene = null;
      host.dataset.state = "stills";
      host.dataset.cameraMotion = "idle";
    } else {
      startLiveScene();
    }
    measure();
  }
  // Sticky controls must not scroll the document just to receive pointer focus.
  header.addEventListener(
    "mousedown",
    (event) => {
      const control = event.target.closest("a, button");
      if (event.button === 0 && control) {
        event.preventDefault();
        control.focus({ preventScroll: true });
      }
    },
    { signal },
  );
  motionButton.addEventListener(
    "click",
    () => {
      if (performanceStill) {
        performanceStill = false;
        manualStill = false;
        forceLive = true;
        rememberLightweight(false);
      } else {
        manualStill = !manualStill;
      }
      applyMotion();
      const url = new URL(location.href);
      if (manualStill) {
        url.searchParams.set("motion", "off");
      } else {
        url.searchParams.delete("motion");
      }
      history.replaceState(history.state, "", url);
      document.getElementById("tour-status").textContent = still
        ? "Still room views enabled. Your reading position is unchanged."
        : "Scroll-controlled room tour enabled.";
    },
    { signal },
  );
  roomButton.addEventListener(
    "click",
    () => {
      manualRoom = !(roomReveal > 0.5);
      schedule();
      document.getElementById("tour-status").textContent = manualRoom
        ? "Room expanded. Use Hide room to return to reading."
        : "Room collapsed. More space for reading.";
    },
    { signal },
  );
  media.addEventListener("change", () => applyMotion(), { signal });
  mobile.addEventListener(
    "change",
    () => {
      firstView = true;
      scheduleMeasure();
    },
    { signal },
  );
  addEventListener("scroll", schedule, { passive: true, signal });
  addEventListener("resize", scheduleMeasure, { passive: true, signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        firstView = true;
        schedule();
      }
    },
    { signal },
  );
  document.addEventListener(
    "focusin",
    (event) => {
      // A decorative entrance never gets in the way of using the actual content.
      for (const [element, animation] of arrivalAnimations) {
        if (element.contains(event.target)) {
          animation.cancel();
          arrivalAnimations.delete(element);
        }
      }
      if (event.target.closest(".tour-chapter")) {
        manualRoom = null;
      }
      schedule();
    },
    { signal },
  );
  document.querySelectorAll(".tour-expandable").forEach((details) => {
    const summary = details.querySelector("summary");
    summary.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const previous = disclosureAnimations.get(details);
        const opening = previous ? !previous.opening : !details.open;
        const start = details.getBoundingClientRect().height;
        previous?.animation.cancel();
        if (!motionAllowed) {
          details.open = opening;
          details.style.height = "";
          details.style.overflow = "";
          disclosureAnimations.delete(details);
          measure();
          return;
        }
        details.open = true;
        details.style.height = "auto";
        const end = opening
          ? details.getBoundingClientRect().height
          : summary.getBoundingClientRect().height + 2;
        details.style.height = `${start}px`;
        details.style.overflow = "hidden";
        const animation = details.animate(
          { height: [`${start}px`, `${end}px`] },
          {
            duration: 320,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "forwards",
          },
        );
        disclosureAnimations.set(details, { animation, opening });
        animation.finished
          .then(() => {
            if (disclosureAnimations.get(details)?.animation !== animation) {
              return;
            }
            details.open = opening;
            details.style.height = "";
            details.style.overflow = "";
            animation.cancel();
            disclosureAnimations.delete(details);
            measure();
          })
          .catch(() => {});
      },
      { signal },
    );
  });
  photoButtons.forEach((button, index) => {
    button.addEventListener(
      "click",
      () => {
        if (!photos[index].hidden) {
          return;
        }
        photoAnimation?.cancel();
        photos.forEach((photo, i) => {
          photo.hidden = i !== index;
        });
        photoButtons.forEach((control, i) =>
          control.setAttribute("aria-pressed", String(i === index)),
        );
        const caption = button.textContent.trim();
        document.getElementById("tour-album-status").textContent =
          `${index + 1} / ${photos.length} · ${caption}`;
        if (motionAllowed) {
          photoAnimation = photos[index].animate(
            still
              ? { opacity: [0.65, 1] }
              : {
                  opacity: [0.65, 1],
                  transform: ["translateY(7px) rotate(.6deg)", "none"],
                },
            { duration: 260, easing: "ease-out" },
          );
        }
        scheduleMeasure();
      },
      { signal },
    );
  });
  const search = document.getElementById("tour-library-query");
  if (page.dataset.production === "true") {
    const copy = page.querySelector("[data-copy-email]");
    copy?.addEventListener(
      "click",
      async () => {
        const emailLink = page.querySelector(".tour-email");
        const address = emailLink.getAttribute("href").replace(/^mailto:/, "");
        try {
          await navigator.clipboard.writeText(address);
          if (!disposed) {
            document.getElementById("tour-status").textContent =
              "Email address copied.";
          }
        } catch {
          if (disposed) {
            return;
          }
          const range = document.createRange();
          range.selectNodeContents(emailLink);
          const selection = getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.getElementById("tour-status").textContent =
            "Email selected. Use your device’s Copy command, or activate the email link.";
        }
      },
      { signal },
    );
  }
  const libraryItems = [
    ...document.querySelectorAll(".tour-expansion [data-library-item]"),
  ];
  search.addEventListener(
    "input",
    () => {
      const position = search.getBoundingClientRect().top;
      const terms = search.value
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const library = document.getElementById("tour-library");
      if (terms.length) {
        disclosureAnimations.get(library)?.animation.cancel();
        disclosureAnimations.delete(library);
        library.style.height = "";
        library.style.overflow = "";
        library.open = true;
      }
      let count = 0;
      libraryItems.forEach((item) => {
        item.hidden = !terms.every((term) =>
          item.dataset.search.includes(term),
        );
        if (!item.hidden) {
          count++;
        }
      });
      document.querySelectorAll(".tour-library-group").forEach((group) => {
        group.hidden = !group.querySelector(
          "[data-library-item]:not([hidden])",
        );
      });
      document.getElementById("tour-library-count").textContent = count
        ? `${count} matching ${count === 1 ? "entry" : "entries"}`
        : "No matching entries. Try another title or category.";
      measure();
      scrollTo({
        top: scrollY + search.getBoundingClientRect().top - position,
        behavior: "instant",
      });
    },
    { signal },
  );
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(header);
  observer.observe(album);
  cards.forEach((card) => observer.observe(card));
  document.fonts?.ready.then(() => {
    if (!disposed) {
      scheduleMeasure();
    }
  });
  function queueArrivals() {
    if (!disposed && pendingArrivals.size && !arrivalFrame) {
      arrivalFrame = requestAnimationFrame(playQueuedArrivals);
    }
  }
  function playQueuedArrivals() {
    arrivalFrame = 0;
    if (disposed) {
      return;
    }
    for (const element of pendingArrivals) {
      if (element.closest(".tour-chapter").id !== stops[active].id) {
        continue;
      }
      if (!still && !mobile.matches && motionAllowed) {
        if (!scene || host.dataset.state !== "ready") {
          continue;
        }
        const view = responsiveView(stops[active]);
        if (
          Math.abs(Number(host.dataset.zoom) - view.zoom) > 0.004 ||
          Math.abs(Number(host.dataset.angle) - view.angle) > 0.004
        ) {
          continue;
        }
      }
      pendingArrivals.delete(element);
      arrivalObserver.unobserve(element);
      if (!motionAllowed || element.contains(document.activeElement)) {
        continue;
      }
      const photo = element.classList.contains("tour-album-stage");
      // Animate the paper/print, never its card, section, or document geometry.
      let transform = mobile.matches
        ? "translateY(12px)"
        : photo
          ? "translate(-150px, -32px) scale(.72) rotate(-3deg)"
          : "perspective(1000px) translateX(-42px) rotateY(-14deg)";
      if (
        !still &&
        !mobile.matches &&
        stops[active].id === (photo ? "about" : "writing")
      ) {
        const origin = scene?.projectPoint(
          photo ? [1.63, 3.114, -2.492] : [-1.95, 1.687, -0.21],
        );
        if (origin && origin.x < sceneWidth * 0.6) {
          // One measurement on entry links the HTML print/paper to its actual
          // projected room object. No geometry reads in the scroll loop.
          const bounds = element.getBoundingClientRect();
          const sourceWidth = Math.min(
            sceneWidth * (photo ? 0.18 : 0.3),
            sceneHeight * 0.46,
          );
          const scale = Math.min(
            0.82,
            Math.max(0.3, sourceWidth / bounds.width),
          );
          const dx = origin.x - bounds.left - (bounds.width * scale) / 2;
          const dy =
            headerHeight + origin.y - bounds.top - (bounds.height * scale) / 2;
          transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${photo ? -4 : -7}deg)`;
        }
      }
      element.style.transformOrigin = "left top";
      const animation = element.animate(
        still
          ? { opacity: [0.5, 1] }
          : { opacity: [0.2, 1], transform: [transform, "none"] },
        {
          duration: still ? 300 : photo ? 620 : 540,
          easing: "cubic-bezier(.22,1,.36,1)",
        },
      );
      arrivalAnimations.set(element, animation);
      animation.finished
        .then(() => {
          if (arrivalAnimations.get(element) === animation) {
            arrivalAnimations.delete(element);
          }
        })
        .catch(() => {});
    }
  }
  const arrivalObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.16) {
          pendingArrivals.add(entry.target);
        } else {
          pendingArrivals.delete(entry.target);
        }
      }
      queueArrivals();
    },
    { threshold: 0.16, rootMargin: "-140px 0px -4% 0px" },
  );
  document
    .querySelectorAll(".tour-notebook-index, .tour-album-stage")
    .forEach((element) => arrivalObserver.observe(element));

  function focusFragment() {
    if (landOnProject()) {
      return;
    }
    const target = fragmentChapter();
    target?.focus({ preventScroll: true });
    schedule();
  }
  // Search can link directly to a project. Reveal it once, without changing
  // native scrolling or adding a correction loop while the reader moves.
  function landOnProject() {
    if (!/^#project-\d+$/.test(location.hash)) {
      return false;
    }
    const project = document.getElementById(location.hash.slice(1));
    if (
      !(project instanceof HTMLDetailsElement) ||
      !project.hasAttribute("data-portfolio-project")
    ) {
      return false;
    }
    project.open = true;
    let ancestor = project.parentElement;
    while (ancestor) {
      if (ancestor instanceof HTMLDetailsElement) {
        ancestor.open = true;
      }
      ancestor = ancestor.parentElement;
    }
    manualRoom = null;
    measure();
    project.querySelector("summary")?.focus({ preventScroll: true });
    scrollTo({
      top: Math.max(
        0,
        project.getBoundingClientRect().top +
          scrollY -
          headerHeight -
          (mobile.matches ? 80 : 32),
      ),
      behavior: "instant",
    });
    schedule();
    return true;
  }
  function fragmentChapter() {
    try {
      return document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.closest(".tour-chapter");
    } catch {
      // A malformed external fragment should never interrupt room navigation.
      return null;
    }
  }
  function destinationPosition(index) {
    if (index === 0) {
      return 0;
    }
    if (mobile.matches) {
      return metrics[index].cardTop - headerHeight - 80;
    }
    return metrics[index].cardTop - headerHeight - 32;
  }
  document.querySelectorAll('.tour-page a[href^="#"]').forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        const index = stops.findIndex((stop) => `#${stop.id}` === link.hash);
        if (index < 0) {
          return;
        }
        event.preventDefault();
        manualRoom = null;
        measure();
        if (location.hash !== link.hash) {
          history.pushState(history.state, "", link.hash);
        }
        chapters[index].focus({ preventScroll: true });
        scrollTo({
          top: Math.max(0, destinationPosition(index)),
          behavior: still ? "instant" : "smooth",
        });
        schedule();
      },
      { signal },
    );
  });
  addEventListener("hashchange", focusFragment, { signal });
  applyMotion();
  // One initial landing after fonts settle. User input cancels it; this is not
  // a scroll correction loop and never drags a reader back to an old anchor.
  if (location.hash) {
    Promise.resolve(document.fonts?.ready).then(() => {
      if (disposed || !landingAllowed) {
        return;
      }
      initialLanding = requestAnimationFrame(() => {
        if (disposed || !landingAllowed) {
          return;
        }
        if (landOnProject()) {
          return;
        }
        const target = fragmentChapter();
        const index = chapters.indexOf(target);
        if (index < 0) {
          return;
        }
        measure();
        target.focus({ preventScroll: true });
        scrollTo({
          top: Math.max(0, destinationPosition(index)),
          behavior: "instant",
        });
        schedule();
      });
    });
  }

  function fallback() {
    if (disposed) {
      return;
    }
    failed = true;
    applyMotion();
    document.getElementById("tour-status").textContent =
      "The room is in still view. All projects, writing, and contact information are available below.";
  }
  function performanceFallback() {
    if (disposed || still || forceLive) {
      return;
    }
    performanceStill = true;
    rememberLightweight(true);
    applyMotion();
    document.getElementById("tour-status").textContent =
      "Switched to lightweight room views for smoother scrolling. Your reading position and all navigation are unchanged.";
  }
  function startLiveScene() {
    if (disposed || still || scene || sceneLoading) {
      return;
    }
    sceneLoading = true;
    host.dataset.state = "loading";
    loadScene()
      .then(({ createCornerScene }) => {
        if (disposed || still) {
          return;
        }
        scene = createCornerScene({
          host,
          reducedMotion: media,
          theme: "midnight",
          enableInteractions: false,
          pixelRatioCap: 1.3,
          maxRenderPixels: 1600000,
          minimumPixelRatio: 1,
          refineWhenIdle: true,
          maxDetailPixels: 4000000,
          adaptiveRender: true,
          hideOffscreenHotspots: true,
          hotspotPadding: 26,
          readableSurfaces: true,
          hotspotAnchors: tourHotspotAnchors,
          portfolioDetails: true,
          portfolioSummary: sceneSummary,
          assetBase: new URL(assetBase, location.href).href,
          onSelect: () => {},
          onTourFrame: queueArrivals,
          onError: fallback,
          onPerformanceFallback: forceLive
            ? undefined
            : () => queueMicrotask(performanceFallback),
        });
        if (!scene) {
          return;
        }
        scene.setEvening(true);
        firstView = true;
        update();
      })
      .catch(fallback)
      .finally(() => {
        sceneLoading = false;
      });
  }
  function dispose() {
    if (disposed) {
      return;
    }
    disposed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(arrivalFrame);
    cancelAnimationFrame(initialLanding);
    observer.disconnect();
    arrivalObserver.disconnect();
    photoAnimation?.cancel();
    stillAnimation?.cancel();
    for (const animation of arrivalAnimations.values()) {
      animation.cancel();
    }
    for (const { animation } of disclosureAnimations.values()) {
      animation.cancel();
    }
    events.abort();
    scene?.dispose();
    outgoingImage.remove();
    if (!hadDocumentClass) {
      root.classList.remove("tour-document");
    }
    if (previousHeader) {
      root.style.setProperty("--tour-header", previousHeader);
    } else {
      root.style.removeProperty("--tour-header");
    }
    if (previousTheme !== null && previousTheme !== undefined) {
      metaTheme?.setAttribute("content", previousTheme);
    }
    delete page.dataset.enhanced;
  }
  addEventListener(
    "pagehide",
    (event) => {
      if (!event.persisted) {
        dispose();
      }
    },
    { signal },
  );
  return dispose;
}
