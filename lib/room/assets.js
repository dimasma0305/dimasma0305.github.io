import { optimizedRoomPath } from "../optimized-media.mjs";

// Works on the custom domain and on a GitHub Pages subpath. No preview origin.
export function roomAsset(base = "./", path) {
  return `${base.replace(/\/$/, "")}/${optimizedRoomPath(path).replace(/^\.\//, "").replace(/^\//, "")}`;
}

export function roomIcon(name) {
  const path =
    name === "moon"
      ? '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/>'
      : '<path d="m8 5 11 7-11 7V5Z"/>';
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
