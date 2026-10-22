import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("marketing");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1400, height: 1200 },
  deviceScaleFactor: 1,
});
await page.route("http://127.0.0.1:4173/**", async (route) => {
  const file = resolve(root, `.${new URL(route.request().url()).pathname}`);
  if (!file.startsWith(root + sep)) return route.fulfill({ status: 403 });
  try {
    await route.fulfill({
      body: await readFile(file),
      contentType: extname(file) === ".html" ? "text/html" : "image/png",
    });
  } catch {
    await route.fulfill({ status: 404 });
  }
});
for (const asset of ["launch", "twist", "square"]) {
  await page.goto(`http://127.0.0.1:4173/launch.html?asset=${asset}`);
  await page.locator(`#${asset} img`).evaluate((img) => img.decode());
  await page
    .locator(`#${asset}`)
    .screenshot({ path: `marketing/${asset}.png` });
}
await browser.close();
console.log("Three campaign graphics rendered.");
