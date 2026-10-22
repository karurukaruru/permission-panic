// Capture the real production app. No simulated screenshots or synthetic scores.
// npm run build first. Needs Playwright's Chromium (or the executable override).
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const dist = resolve("dist");
const frameDir =
  process.env.PROMO_FRAME_DIR || "/tmp/permission-panic-promo-frames";
await mkdir(frameDir, { recursive: true });
await mkdir("marketing", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1100, height: 1100 },
  deviceScaleFactor: 1,
});
await page.route("http://127.0.0.1:4173/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  const file = resolve(
    dist,
    `.${path.endsWith("/") ? path + "index.html" : path}`,
  );
  if (!file.startsWith(dist + sep)) return route.fulfill({ status: 403 });
  const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
  };
  try {
    await route.fulfill({
      body: await readFile(file),
      contentType: mime[extname(file)] || "application/octet-stream",
    });
  } catch {
    await route.fulfill({ status: 404 });
  }
});
let index = 0;
const segments = [];
async function hold(ms, label) {
  const count = Math.round(ms / 125);
  const start = Date.now();
  segments.push({ frame: index, label });
  for (let i = 0; i < count; i++) {
    await page.screenshot({
      path: `${frameDir}/${String(index++).padStart(4, "0")}.png`,
    });
    await page.waitForTimeout(Math.max(0, start + (i + 1) * 125 - Date.now()));
  }
}
async function next() {
  await page
    .getByRole("button", { name: /Next request|See my results/ })
    .click();
}
await page.goto("http://127.0.0.1:4173/");
await page.getByRole("heading", { name: "Let me take a look." }).waitFor();
await page
  .locator(".permission-card")
  .screenshot({ path: "marketing/request-card.png" });
await hold(2000, "Your agent asks for permission.");
await page.getByRole("button", { name: /^Approve/ }).click();
await hold(1500, "An ordinary file read.");
await next();
await page
  .getByRole("heading", { name: "The tests are green. Probably." })
  .waitFor();
await page
  .locator(".permission-card")
  .screenshot({ path: "marketing/test-request.png" });
await hold(2000, "Then it asks to run npm test.");
await page.getByRole("button", { name: /^Approve/ }).click();
await hold(3500, "Tests passed. Your secrets left the chat.");
await page
  .locator(".permission-card")
  .screenshot({ path: "marketing/incident-card.png" });
await next();
await page.emulateMedia({ reducedMotion: "reduce" });
const rest = [
  ["approve", false],
  ["deny", true],
  ["deny", false],
  ["approve", true],
  ["approve", false],
  ["deny", false],
  ["approve", true],
  ["approve", false],
];
for (const [choice, inspect] of rest) {
  if (inspect) await page.getByRole("button", { name: /^Inspect/ }).click();
  if (inspect && choice === "deny")
    await page
      .locator(".permission-card")
      .screenshot({ path: "marketing/inspect-card.png" });
  await page
    .getByRole("button", { name: new RegExp(`^${choice}`, "i") })
    .click();
  await page
    .getByRole("button", { name: /Next request|See my results/ })
    .waitFor();
  await next();
}
await page.getByRole("region", { name: "Final score card" }).waitFor();
const text = await page
  .getByRole("region", { name: "Final score card" })
  .innerText();
if (!text.includes("800") || !text.includes("90%"))
  throw new Error("Unexpected actual captured score");
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.evaluate(() => window.scrollTo(0, 0));
await page
  .locator(".score-card")
  .screenshot({ path: "marketing/actual-results.png" });
await hold(3000, "Nine correct calls. One expensive approval.");
await writeFile(
  `${frameDir}/capture.json`,
  JSON.stringify(
    { fps: 8, frames: index, seconds: index / 8, segments },
    null,
    2,
  ),
);
console.log(JSON.stringify({ frames: index, seconds: index / 8, frameDir }));
await browser.close();
