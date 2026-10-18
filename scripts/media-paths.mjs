import { fileURLToPath } from "node:url";

/** Sharp expects a filesystem path, not a file URL's URL-encoded pathname. */
export function mediaFilePath(url) {
  return fileURLToPath(url);
}
