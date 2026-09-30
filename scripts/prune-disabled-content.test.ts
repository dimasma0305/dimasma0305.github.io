import { expect, test } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  disabledPublicOutputs,
  pruneDisabledContent,
} from "./prune-disabled-content.mjs";

test("disabled Notes content is removed from the deployment artifact", () => {
  const output = mkdtempSync(join(tmpdir(), "dimasc-disabled-content-"));
  try {
    mkdirSync(join(output, "notes", "example"), { recursive: true });
    writeFileSync(join(output, "notes", "index.html"), "notes directory");
    writeFileSync(join(output, "notes", "example", "post.json"), "{}");
    writeFileSync(join(output, "notes.html"), "notes route");
    writeFileSync(join(output, "notes.txt"), "notes route payload");
    writeFileSync(join(output, "notes-index.json"), "{}");
    writeFileSync(join(output, "blog-index.json"), "{}");

    pruneDisabledContent(output);

    for (const relativePath of disabledPublicOutputs) {
      expect(existsSync(join(output, relativePath))).toBe(false);
    }
    expect(existsSync(join(output, "blog-index.json"))).toBe(true);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
