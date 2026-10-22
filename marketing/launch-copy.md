# Launch copy

Repository: https://github.com/karurukaruru/permission-panic

Play: https://karurukaruru.github.io/permission-panic/

Verified on 2026-10-22: public HTTP, desktop/mobile browser journeys, and PNG download.

## X — primary post

I let my AI agent run npm test.
The tests passed. My secrets left the chat.

In Permission Panic, that disaster is simulated.
10 requests. Approve, Inspect, or Deny.
Can you get 1000/1000?

https://karurukaruru.github.io/permission-panic/

## X — short video post

It was just npm test.

The tests passed. My secrets left the chat.

A simulated bad decision in Permission Panic — 10 AI-agent permission requests. How many would you get right?

https://karurukaruru.github.io/permission-panic/

## Reddit

Title: I built a tiny open-source game about AI coding agent permission prompts

Permission Panic puts you on the other side of the “Allow?” button. There are 10
requests: read a file, run tests, install dependencies, delete a directory, push
a commit… Approve, inspect the evidence, or deny.

The point is context, not memorizing a blacklist. A file read can be appropriate;
a test command can hide a credential-upload hook. Inspect now explains the
consequence in plain language, with the technical evidence available underneath.

It's a static React + TypeScript app: no AI API, account, backend or analytics.
Nothing in the game actually executes. You get a PNG score card at the end.
The scenarios are in a typed data file if you want to improve a question or fork it.

I'd especially like feedback on which requests feel realistic and which decisions
are ambiguous. A correct call should be explainable, not a trick based on missing
information.

Play: https://karurukaruru.github.io/permission-panic/
Source: https://github.com/karurukaruru/permission-panic

## Threads / 脆 — 繁體中文

AI 問：「可以跑一下 npm test 嗎？」
我按了允許。測試過了，密鑰也跟著走了。

還好，這次只是我做的小遊戲 Permission Panic。
10 次 AI 權限請求，選允許、檢查或拒絕。
免費、開源、不用登入，所有事故都是模擬。

你能拿幾分？玩完貼成績卡，我想看看大家栽在哪一關。

https://karurukaruru.github.io/permission-panic/

附件：gameplay.mp4。這是實際操作剪輯，並非連續通關錄影。

## X — 中文備用稿

AI 申请跑一下 npm test，我点了允许。
测试过了，密钥也走了。

我把这种瞬间做成了 Permission Panic：10 次权限请求，允许 / 检查 / 拒绝。
免费开源，无需登录，事故全是模拟。

你能拿多少分？

https://karurukaruru.github.io/permission-panic/

## Bilibili

标题：我让 AI 跑了个测试，结果密钥先走了【权限判断小游戏 / 全程模拟】

简介：Permission Panic，一个关于 AI 编程助手权限弹窗的开源小游戏。
十次请求，三个按钮：允许、检查、拒绝。

读文件、装依赖、跑测试、删目录……看起来正常的请求，完整上下文可能完全不同。
“检查”会先用人话告诉你发生了什么，再提供具体证据。
最后会给你分数、正确率、称号，还能下载成绩卡。

不需要 API、不需要登录，所有危险行为都只是模拟。
视频是实际游戏画面的剪辑，最后 800 分、90% 正确率也是这次操作的真实结算。

试玩：https://karurukaruru.github.io/permission-panic/
源码：https://github.com/karurukaruru/permission-panic

## 12-second clip caption plan

- 0–2s: The agent asks to read a component.
- 2–3.5s: Approve. An ordinary, proportionate operation.
- 3.5–5.5s: Next request: npm test.
- 5.5–9s: Approve. Hidden post-test hook causes a simulated credential incident.
- 9–12s: Cut past the remaining correctly answered rounds to the actual 800-point result.

## Release description

Permission Panic is a small game about a very familiar button: Allow.

- 10 contextual AI-agent permission requests.
- Approve, inspect evidence, or deny.
- Plain-language inspection summaries and expandable technical details.
- Simulated execution, incidents and short explanations.
- PNG score cards, share text and full decision review.
- Mobile layout, keyboard controls and reduced-motion support.
- No API, login, backend or real command execution.

MIT licensed. Fork it, question the answers, improve the scenarios.
