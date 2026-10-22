import type { Page } from "@playwright/test";
import { test, expect } from "./fixture";
// Explicit fixtures are intentionally independent of the scenario answer data.
const route = [
  ["approve", false],
  ["deny", true],
  ["approve", false],
  ["deny", true],
  ["deny", false],
  ["approve", true],
  ["approve", false],
  ["deny", false],
  ["approve", true],
  ["approve", false],
] as const;
async function decide(page: Page, choice: string, inspect = false) {
  if (inspect) {
    await page.getByRole("button", { name: /Inspect/ }).click();
    await expect(page.getByLabel("Inspection evidence")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: new RegExp(`^${choice}`, "i") })
    .click();
  await expect(
    page.getByRole("button", { name: /Next request|See my results/ }),
  ).toBeVisible();
}
test("perfect full run, real PNG, sharing and replay", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (
      !new URL(request.url()).hostname.match(
        /^(127\.0\.0\.1|localhost|terminal\.local)$/,
      )
    )
      external.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Let me take a look." }),
  ).toBeVisible();
  await page.screenshot({
    path: `docs/game-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const approveBox = await page
    .getByRole("button", { name: /^Approve/ })
    .boundingBox();
  expect(approveBox).not.toBeNull();
  expect(approveBox!.y + approveBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  for (const [choice, inspect] of route) {
    await decide(page, choice, inspect);
    await page
      .getByRole("button", { name: /Next request|See my results/ })
      .click();
  }
  const score = page.getByRole("region", { name: "Final score card" });
  await expect(score).toContainText("1000");
  await expect(score).toContainText("100%");
  await expect(score).toContainText("Permission Whisperer");
  await page.screenshot({
    path: `docs/results-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download score card/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("permission-panic-score.png");
  await download.saveAs(testInfo.outputPath("score.png"));
  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(testInfo.outputPath("score.png"));
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(720);
  // Save an actual generated score card as documentation.
  if (testInfo.project.name === "desktop")
    await fs.writeFile("docs/score-card.png", bytes);
  // A failed encoder must leave the game usable and show an actionable error.
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(null);
    };
  });
  await page.getByRole("button", { name: /Download score card/ }).click();
  await expect(page.getByRole("status")).toContainText("PNG encoding failed");
  await expect(
    page.getByRole("button", { name: /Download score card/ }),
  ).toBeEnabled();
  // Make clipboard behavior deterministic without granting real clipboard access.
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    }),
  );
  await page.getByRole("button", { name: "X", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("X share text copied");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toContain("1000/1000");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("blocked");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Bilibili", exact: true }).click();
  await expect(page.getByLabel("Share text to copy")).toHaveValue(
    /判断正确率 100%/,
  );
  await page.getByText("Review your decisions", { exact: false }).click();
  await expect(page.locator(".review-list article")).toHaveCount(10);
  await expect(page.locator(".review-list article").last()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Run it back/ }).click();
  await expect(
    page.getByRole("heading", { name: "Let me take a look." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("hidden test hook creates a dramatic simulated breach", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await decide(page, "approve");
  await page.getByRole("button", { name: /Next request/ }).click();
  await decide(page, "approve");
  await expect(
    page.getByRole("heading", {
      name: "Tests passed. Your secrets left the chat.",
    }),
  ).toBeVisible();
  await expect(page.locator(".catastrophe")).toContainText(
    "SIMULATED INCIDENT",
  );
  await expect(page.locator(".catastrophe")).toContainText("-100 pts");
  await page.screenshot({
    path: `docs/incident-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("keyboard, inspect branch and help preserve interaction boundaries", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("a");
  await expect(
    page.getByRole("button", { name: /Next request/ }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "The tests are green. Probably." }),
  ).toBeVisible();
  await page.keyboard.press("i");
  await expect(page.getByLabel("Inspection evidence")).toContainText(
    "posttest",
  );
  await expect(page.getByRole("button", { name: /Inspected/ })).toBeDisabled();
  await expect(page.locator(".inspection-summary")).toContainText(
    "live credentials",
  );
  await expect(page.locator(".technical-evidence")).not.toHaveAttribute("open");
  await page.getByText("View technical evidence", { exact: true }).click();
  await expect(page.locator(".evidence-item pre").first()).toBeVisible();

  await page.getByRole("button", { name: /How to play/ }).click();
  await page.keyboard.press("a");
  await expect(page.getByLabel("Inspection evidence")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("d");
  await expect(
    page.getByRole("heading", {
      name: "Secrets stayed local. Good call.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Next request/ }).click();
  await expect(
    page.getByRole("heading", { name: "A boring install. A good thing." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("all-wrong run still reaches results with a zero score", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const [correct] of route) {
    await decide(page, correct === "approve" ? "deny" : "approve");
    await page
      .getByRole("button", { name: /Next request|See my results/ })
      .click();
  }
  await expect(
    page.getByRole("region", { name: "Final score card" }),
  ).toContainText("000");
  await expect(
    page.getByRole("region", { name: "Final score card" }),
  ).toContainText("0/10 correct");
});

test("compact phones and tablets keep requests and final cards within the viewport", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const [choice, inspect] of route) {
    await decide(page, choice, inspect);
    await page
      .getByRole("button", { name: /Next request|See my results/ })
      .click();
  }
  await expect(
    page.getByRole("region", { name: "Final score card" }),
  ).toContainText("1000");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Run it back/ }).click();
  await expect(
    page.getByRole("heading", { name: "Let me take a look." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Would you allow it?",
  );
  await expect(page.locator(".intro-copy")).toContainText(
    "10 requests from your AI agent.",
  );
  if (testInfo.project.name === "desktop")
    await page.screenshot({ path: "docs/game-tablet.png", fullPage: true });
});
