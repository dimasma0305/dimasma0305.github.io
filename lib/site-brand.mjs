// Shared by the React header, room HTML, and generated favicon assets.
// Carved DM: Dimas Maulana's M is cut out of a single, rounded D silhouette.
// The display master has softened terminals and a taller, optically centred M.
// Tiny icons retain that silhouette with pixel-aligned stems and open counters.
export const siteBrand = {
  name: "dimasc.tf",
  mark: "M7 5H24C36.8 5 44 12.6 44 24S36.8 43 24 43H7Q4 43 4 40V8Q4 5 7 5ZM11 35V13Q11 12 12 12H15.5L23.25 21.1Q24 22 24.75 21.1L32.5 12H35Q36 12 36 13V35Q36 36 35 36H31.5Q30.5 36 30.5 35V22L24.75 29Q24 30 23.25 29L17.5 22V35Q17.5 36 16.5 36H12Q11 36 11 35Z",
  smallMark:
    "M7 6H24C36.8 6 44 13 44 24S36.8 42 24 42H7Q4 42 4 39V9Q4 6 7 6ZM12 36H18V21L24 30L30 21V36H36V12H30L24 21L18 12H12V36Z",
  colors: {
    dark: { ink: "#eeecdf", accent: "#e4ac83", background: "#111915" },
    light: { ink: "#17231d", accent: "#92562d", background: "#f4f0e5" },
  },
};

export const siteNavigation = [
  { name: "Blog", path: "/blog/" },
  { name: "Notes", path: "/notes/" },
  { name: "Tools", path: "/tools/" },
  { name: "Services", path: "/services/" },
];

export function isSiteSectionActive(pathname, path) {
  const section = path.replace(/\/$/, "");
  return (
    pathname === section ||
    pathname.startsWith(path) ||
    (section === "/blog" && /^\/(posts|categories|tags)(\/|$)/.test(pathname))
  );
}

export function brandMarkSVG({
  tile = false,
  variant = "dark",
  monochrome = false,
  small = false,
} = {}) {
  const { ink, accent, background } = siteBrand.colors[variant];
  const mark = small ? siteBrand.smallMark : siteBrand.mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true" focusable="false">${tile ? `<rect width="48" height="48" rx="11" fill="${background}"/>` : ""}<path d="${mark}" fill="${monochrome ? ink : accent}" fill-rule="evenodd"/></svg>`;
}
