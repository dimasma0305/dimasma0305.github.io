// Build-time WebP companions retain the originals' exact pixel dimensions.
const roomStill =
  /(assets\/room-stills\/(?:welcome|room|work|writing|about|achievements|skills|experience|services|contact))\.jpg$/;
const roomPhoto = /(assets\/(?:team-(?:bali|china)|portfolio\/photo-\d+))\.jpg$/;

export function optimizedRoomPath(source) {
  return source
    .replace(roomStill, "$1.webp")
    .replace(roomPhoto, "$1.webp")
    .replace(/(assets\/dimas)\.jpg$/, "$1.webp")
    .replace(/(assets\/bali-night-window)\.png$/, "$1.webp");
}

// Narrower companions of the square room stills. The 2048px render stays the
// largest candidate, so a dense or large screen never receives fewer pixels
// than it displays.
export const roomStillWidths = [1024, 1536];
export const roomStillFullWidth = 2048;
export function roomStillVariant(source, width) {
  return source.replace(roomStill, `$1-${width}.webp`);
}
/** `srcset` for a room still; `resolve` maps a source path to its public URL. */
export function roomStillSrcset(source, resolve = (path) => path) {
  if (!roomStill.test(source)) return "";
  return [
    ...roomStillWidths.map(
      (width) => `${resolve(roomStillVariant(source, width))} ${width}w`,
    ),
    `${resolve(optimizedRoomPath(source))} ${roomStillFullWidth}w`,
  ].join(", ");
}

// Album buttons and the 3D contact strip show a photo at well under 320px.
export const roomPhotoThumbWidth = 320;
export function roomPhotoThumb(source) {
  return roomPhoto.test(source)
    ? source.replace(roomPhoto, "$1.thumb.webp")
    : source;
}
// The room's pinned polaroids and 1x screens of the open album figure show a
// photo at well under 800px; denser screens keep the 1200px original.
export const roomPhotoMediumWidth = 800;
export function roomPhotoMedium(source) {
  return roomPhoto.test(source)
    ? source.replace(roomPhoto, `$1-${roomPhotoMediumWidth}.webp`)
    : source;
}
export function roomPhotoSrcset(item) {
  const medium = item.medium || roomPhotoMedium(item.src);
  return medium === item.src
    ? ""
    : `${medium} ${roomPhotoMediumWidth}w, ${item.src} 1200w`;
}

// Project screenshots are PNG sources with lossless WebP companions.
const storyImage = /^((?:\/[^/]+)*\/(?:portfolio|room\/assets\/portfolio)\/[^/?#]+)\.png$/;
export function optimizedStoryImage(source) {
  return source.replace(storyImage, "$1.webp");
}

export function optimizedContentCover(source) {
  // Only known local PNG covers get companions. Remote images and other
  // formats keep their original URLs; no runtime image server is required.
  return /^\/(?:[^/]+\/)*(?:posts|notes)\/[^?#]+\.png$/i.test(source)
    ? `${source}.preview.webp`
    : source;
}
