import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Local inspection of the exact Pages artifact; not a production server.
const root = path.resolve("out");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".md": "text/markdown",
  ".xml": "application/xml",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = path.resolve(root, `.${pathname}`);
      if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
        res.writeHead(403).end();
        return;
      }
      const info = await stat(file);
      const target = info.isDirectory() ? path.join(file, "index.html") : file;
      const body = await readFile(target);
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    }
  })
  .listen(
    Number(process.env.PORT || 4001),
    process.env.PREVIEW_HOST || "127.0.0.1",
    () => {
      console.log(
        `Production export preview on port ${process.env.PORT || 4001}`,
      );
    },
  );
