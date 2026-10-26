import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve(import.meta.dirname, "../dist");
for (const route of [
  "terms-of-service",
  "privacy-policy",
  "disclaimer",
  "404",
]) {
  const folder = path.join(dist, route);
  await mkdir(folder, { recursive: true });
  await copyFile(
    path.join(dist, "index.html"),
    path.join(folder, "index.html")
  );
}
await copyFile(path.join(dist, "index.html"), path.join(dist, "404.html"));
console.log("Static policy pages and 404 entry generated in dist/.");
