import { readFileSync } from "node:fs";
import { join } from "node:path";
import { blogEntries } from "./blog-archive";

/** Only small public listing metadata enters the page, never article bodies. */
export function getBlogArchive() {
  try {
    const index = JSON.parse(
      readFileSync(join(process.cwd(), "public/blog-index.json"), "utf8"),
    );
    return blogEntries(index.posts?.all || []);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
