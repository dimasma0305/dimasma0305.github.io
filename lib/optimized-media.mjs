// Build-time WebP companions retain the originals' exact pixel dimensions.
export function optimizedRoomPath(source) {
  return source
    .replace(
      /(assets\/room-stills\/(?:welcome|room|work|writing|about|achievements|skills|experience|services|contact))\.jpg$/,
      "$1.webp",
    )
    .replace(/(assets\/bali-night-window)\.png$/, "$1.webp");
}

export function optimizedContentCover(source) {
  // Only known local PNG covers get companions. Remote images and other
  // formats keep their original URLs; no runtime image server is required.
  return /^\/(?:[^/]+\/)*(?:posts|notes)\/[^?#]+\.png$/i.test(source)
    ? `${source}.preview.webp`
    : source;
}
