// Shared by the React header, room HTML, and generated favicon assets.
// A cut-corner "d" with a terminal prompt: personal workspace + builder identity.
export const siteBrand = {
  name: "dimasc.tf",
  mark: "M9 7H24L39 22V34L24 43H9V7ZM15 13V37H22L33 30.6V24.5L21.5 13H15Z",
  prompt: "M21 21L27 27L21 33",
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

export function brandMarkSVG({ tile = false } = {}) {
  const { ink, accent, background } = siteBrand.colors.dark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true" focusable="false">${tile ? `<rect width="48" height="48" rx="11" fill="${background}"/>` : ""}<path d="${siteBrand.mark}" fill="${ink}" fill-rule="evenodd"/><path d="${siteBrand.prompt}" stroke="${accent}" stroke-width="2.8" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
}
