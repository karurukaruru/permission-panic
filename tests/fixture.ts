import { test as base, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
// Optional in-process static fixture for isolated build environments. No server,
// browser service, or network access is needed; the real built app still runs.
export const test = base.extend({
  page: async ({ page }, use) => {
    if (process.env.PLAYWRIGHT_STATIC_DIR) {
      const root = resolve(process.env.PLAYWRIGHT_STATIC_DIR);
      const types: Record<string, string> = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
      };
      await page.route("http://127.0.0.1:4173/**", async (route) => {
        const path = decodeURIComponent(
          new URL(route.request().url()).pathname,
        );
        const file = resolve(
          root,
          `.${path.endsWith("/") ? `${path}index.html` : path}`,
        );
        if (!file.startsWith(root + sep)) {
          await route.fulfill({ status: 403, body: "Forbidden" });
          return;
        }
        try {
          await route.fulfill({
            status: 200,
            body: await readFile(file),
            contentType: types[extname(file)] || "application/octet-stream",
          });
        } catch {
          await route.fulfill({ status: 404, body: "Not found" });
        }
      });
    }
    await use(page);
  },
});
export { expect };
