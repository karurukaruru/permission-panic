import { GITHUB_URL } from "./config";
import { summarize, type RoundResult } from "./game";
export type ShareTarget = "X" | "Reddit" | "Bilibili";
export function shareText(
  history: readonly RoundResult[],
  target: ShareTarget,
): string {
  const { score, accuracy, rank } = summarize(history);
  const link = GITHUB_URL ? `\n${GITHUB_URL}` : "";
  if (target === "Bilibili")
    return `我的 AI 编程助手申请了 10 次权限。结果：${score}/1000 分，判断正确率 ${accuracy}%，称号 ${rank}。\nPermission Panic：你敢一直点“允许”吗？纯模拟，无需 API 或登录。${link}`;
  if (target === "Reddit")
    return `I scored ${score}/1000 (${accuracy}% accuracy) in Permission Panic — ${rank}.\nIt's a free, open-source game about 10 AI coding agent permission requests. Even “npm test” can have a plot twist. No API, no login, all simulation. How would you do?${link}`;
  return `My AI agent asked for permission 10 times. I scored ${score}/1000 — ${rank}.\nCan you survive Permission Panic? Your production is (probably) safe.\n#PermissionPanic #OpenSource${link}`;
}
export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText)
    throw new Error("Clipboard unavailable. Select and copy the text below.");
  await navigator.clipboard.writeText(text);
}
export function drawScoreCard(
  history: readonly RoundResult[],
): HTMLCanvasElement {
  const summary = summarize(history);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PNG export is unavailable in this browser.");
  ctx.fillStyle = "#101112";
  ctx.fillRect(0, 0, 1200, 720);
  ctx.fillStyle = "#17191b";
  ctx.fillRect(48, 48, 1104, 624);
  ctx.strokeStyle = "#34383b";
  ctx.strokeRect(48, 48, 1104, 624);
  ctx.fillStyle = "#e8ecdb";
  ctx.fillRect(48, 48, 7, 624);
  ctx.font = "bold 26px monospace";
  ctx.fillText(">_ PERMISSION PANIC", 92, 112);
  ctx.fillStyle = "#a2aaa9";
  ctx.font = "18px monospace";
  ctx.fillText("10 REQUESTS. ONE HUMAN.", 92, 156);
  ctx.fillStyle = "#e8ecdb";
  ctx.font = "bold 142px monospace";
  const scoreText = String(summary.score).padStart(3, "0");
  ctx.fillText(scoreText, 84, 332);
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.fillStyle = "#8c9598";
  ctx.font = "28px monospace";
  ctx.fillText("/ 1000", 105 + scoreWidth, 328);
  ctx.fillStyle = "#f0f1ec";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText(summary.rank, 92, 409);
  ctx.fillStyle = "#a2aaa9";
  ctx.font = "23px sans-serif";
  ctx.fillText(summary.quip, 92, 456);
  ctx.fillStyle = "#79dfba";
  ctx.font = "bold 44px monospace";
  ctx.fillText(`${summary.accuracy}%`, 852, 285);
  ctx.fillStyle = "#a2aaa9";
  ctx.font = "18px monospace";
  ctx.fillText("ACCURACY", 852, 322);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = history[i]?.correct ? "#79dfba" : "#ef767a";
    ctx.fillRect(92 + i * 100, 505, 84, 8);
  }
  ctx.strokeStyle = "#34383b";
  ctx.beginPath();
  ctx.moveTo(92, 556);
  ctx.lineTo(1108, 556);
  ctx.stroke();
  ctx.fillStyle = "#cbd0ce";
  ctx.font = "18px monospace";
  ctx.fillText("10 REQUESTS. WHAT COULD POSSIBLY GO WRONG?", 92, 599);
  ctx.fillStyle = "#a2aaa9";
  ctx.font = "17px monospace";
  ctx.fillText(
    GITHUB_URL || "Open source · MIT · GitHub link pending",
    92,
    635,
  );
  return canvas;
}
export async function downloadScoreCard(
  history: readonly RoundResult[],
): Promise<void> {
  const canvas = drawScoreCard(history);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error("PNG encoding failed. Please try again.")),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "permission-panic-score.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
