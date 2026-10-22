import { build } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Bundle every runtime dependency locally. The result works by double-clicking
// the HTML file with no server, package installation, CDN, or network access.
const result = await build({
  configFile: false,
  plugins: [react()],
  define: {
    "import.meta.env.VITE_OFFLINE_BUILD": JSON.stringify("true"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    write: false,
    lib: { entry: resolve("src/main.tsx"), name: "PermissionPanic", formats: ["iife"] },
    minify: "esbuild",
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
const javascript = outputs.filter((item) => item.type === "chunk").map((item) => item.code).join("\n");
const css = outputs.filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
  .map((item) => String(item.source)).join("\n");
if (!javascript || !css) throw new Error("Offline build is missing JavaScript or CSS.");
const icon = await readFile("public/favicon.svg", "utf8");
let html = await readFile("index.html", "utf8");
html = html.replace('href="./favicon.svg"', () => `href="data:image/svg+xml,${encodeURIComponent(icon)}"`);
html = html.replace("</head>", () => `<style>${css}</style></head>`);
html = html.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/,
  () => `<script>${javascript.replace(/<\/script/gi, "<\\/script")}</script>`);
if (html.includes('src="/src/main.tsx"')) throw new Error("Offline entry was not inlined.");
await writeFile("dist/Permission-Panic.html", html);
console.log(`Offline game: dist/Permission-Panic.html (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
