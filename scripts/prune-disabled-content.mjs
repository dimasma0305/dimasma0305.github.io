import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const disabledPublicOutputs = [
  "notes",
  "notes.html",
  "notes.txt",
  "notes-index.json",
];

/** Keep temporarily disabled content out of the static Pages artifact even
 * when a developer still has an old generated copy under public/. */
export function pruneDisabledContent(outputDirectory = resolve("out")) {
  for (const relativePath of disabledPublicOutputs) {
    rmSync(resolve(outputDirectory, relativePath), {
      recursive: true,
      force: true,
    });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  pruneDisabledContent();
  console.log("Disabled Notes output removed from the static artifact.");
}
