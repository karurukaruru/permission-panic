import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { test, expect } from "./fixture";

const answers = ["approve", "deny", "approve", "deny", "deny", "approve", "approve", "deny", "approve", "approve"] as const;
const copies = [
  { locale: "en", browser: "en-US", title: "Let me take a look.", inspect: "Inspect", approve: "Approve", deny: "Deny", next: "Next request", results: "See my results", rank: "Permission Whisperer", download: "Download score card" },
  { locale: "zh-Hans", browser: "zh-CN", title: "让我先看一眼。", inspect: "检查", approve: "允许", deny: "拒绝", next: "下一次请求", results: "查看成绩", rank: "权限判断大师", download: "下载成绩卡" },
  { locale: "zh-Hant", browser: "zh-TW", title: "讓我先看一眼。", inspect: "檢查", approve: "允許", deny: "拒絕", next: "下一次請求", results: "查看成績", rank: "權限判斷大師", download: "下載成績卡" },
  { locale: "ko", browser: "ko-KR", title: "잠깐 살펴볼게요.", inspect: "검토", approve: "허용", deny: "거부", next: "다음 요청", results: "결과 보기", rank: "권한 판단의 달인", download: "점수 카드 다운로드" },
  { locale: "ja", browser: "ja-JP", title: "まずは見てみます。", inspect: "確認", approve: "許可", deny: "拒否", next: "次のリクエスト", results: "結果を見る", rank: "権限判断の達人", download: "スコアカードを保存" },
];

for (const copy of copies) {
  test.describe(copy.locale, () => {
    test.use({ locale: copy.browser });
    test("auto-detects language, completes all ten requests, exports and remembers selection", async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("./");
      const select = page.getByRole("combobox");
      await expect(select).toHaveValue(copy.locale);
      await expect(page.locator("html")).toHaveAttribute("lang", copy.locale);
      await expect(page.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
      const approve = await page.getByRole("button", { name: copy.approve, exact: false }).boundingBox();
      expect(approve!.y + approve!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      for (let i = 0; i < answers.length; i++) {
        await page.getByRole("button", { name: copy.inspect, exact: false }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (i === 1) await page.screenshot({ path: testInfo.outputPath(`${copy.locale}-evidence.png`), fullPage: true });
        await page.getByRole("button", { name: answers[i] === "approve" ? copy.approve : copy.deny, exact: false }).click();
        await page.getByRole("button", { name: i === 9 ? copy.results : copy.next, exact: true }).click();
      }
      await expect(page.getByRole("heading", { name: copy.rank, exact: true })).toBeVisible();
      await expect(page.locator(".score-number")).toContainText("1000");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: copy.download, exact: false }).click(),
      ]);
      const png = testInfo.outputPath(`${copy.locale}-score.png`);
      await download.saveAs(png);
      const bytes = await readFile(png);
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(bytes.readUInt32BE(16)).toBe(1200);
      expect(bytes.readUInt32BE(20)).toBe(720);
      await select.selectOption(copy.locale === "en" ? "ja" : "en");
      // Language changes preserve the completed campaign.
      await expect(page.locator(".score-number")).toContainText("1000");
      await page.reload();
      await expect(select).toHaveValue(copy.locale === "en" ? "ja" : "en");
    });
  });
}

test("changing language during inspection preserves the request and evidence", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("a");
  await page.getByRole("button", { name: "Next request", exact: true }).click();
  await page.keyboard.press("i");
  await page.getByRole("combobox").selectOption("ja");
  await expect(page.locator(".progress-labels")).toContainText("02");
  await expect(page.getByRole("button", { name: "確認済み", exact: false })).toBeDisabled();
  await expect(page.locator(".inspection-summary")).toContainText("認証情報");
  // Keyboard shortcuts must not make decisions while a language select has focus.
  await page.getByRole("combobox").focus();
  await page.keyboard.press("a");
  await expect(page.getByRole("button", { name: "拒否", exact: false })).toBeVisible();
  await page.getByRole("button", { name: "拒否", exact: false }).click();
  await expect(page.locator(".outcome")).toContainText("秘密はローカルに残りました");
});

test("downloaded HTML runs a whole campaign without a server or network", async ({ page }, testInfo) => {
  await page.goto("./");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download offline", exact: true }).click(),
  ]);
  const file = testInfo.outputPath("Permission-Panic.html");
  await download.saveAs(file);
  const html = await readFile(file, "utf8");
  expect(html).not.toMatch(/<script[^>]+src=/);
  expect(html).not.toMatch(/<link[^>]+stylesheet/);
  const requests: string[] = [];
  page.on("request", (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.context().setOffline(true);
  await page.goto(pathToFileURL(file).href);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("combobox").selectOption("en");
  await page.getByRole("heading", { name: "Let me take a look.", exact: true }).click();
  for (const answer of answers) {
    await page.keyboard.press("i");
    await page.keyboard.press(answer === "approve" ? "a" : "d");
    await page.getByRole("button", { name: /Next request|See my results/ }).click();
  }
  await expect(page.locator(".score-number")).toContainText("1000");
  await expect(page.getByRole("link", { name: "Download offline", exact: true })).toHaveCount(0);
  const [score] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download score card/ }).click(),
  ]);
  expect(score.suggestedFilename()).toBe("permission-panic-score.png");
  expect(requests).toEqual([]);
});
