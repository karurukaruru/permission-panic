# Permission Panic

**Your AI agent wants permission. Would you allow it?**

### [▶ Play now — no installation](https://karurukaruru.github.io/permission-panic/)

Open the link and play. No login, API key, terminal, or setup.

**Offline:** on the game page, click **Download offline**, then double-click
`Permission-Panic.html`. It includes everything and works without internet or a server.
You can also get the file from [Releases](https://github.com/karurukaruru/permission-panic/releases/latest).

**Languages:** English · 简体中文 · 繁體中文 · 한국어 · 日本語.
Your browser language is detected automatically; change it using the top-right menu.
All 10 scenarios, inspection summaries, explanations, results and challenge text are localized.
Commands, raw technical evidence and simulated logs keep their original form.

[中文说明](README.zh-CN.md)

![Actual Permission Panic gameplay](docs/game-desktop.png)

## Make the call

Your AI coding agent wants to read a file, run tests, delete a directory or push
a commit. There are **10 requests** and three choices: **Approve**, **Inspect**, **Deny**.
Inspect reveals the context before you decide. There is no timer.

Every campaign reaches a result. Download your score card or copy a challenge
with the playable link. Can you get **1000/1000**?

- Correct: +100; correct without required review: +60.
- Incorrect: −50; an incorrect high-risk approval: −100.
- Inspection never costs points. The final score cannot go below zero.
- Keyboard: **A** approve · **I** inspect · **D** deny · **Enter** next.
- No commands run. All incidents are simulated. No tracking or backend.
- Reloading starts a new campaign; your language choice is remembered when storage is available.

## Develop or contribute

Playing does **not** require Node.js. To edit the source, use Node.js 22.12+:

```sh
npm ci
npm run dev
```

[Development and deployment](docs/DEVELOPMENT.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

[![Build and test](https://github.com/karurukaruru/permission-panic/actions/workflows/ci.yml/badge.svg)](https://github.com/karurukaruru/permission-panic/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/karurukaruru/permission-panic/actions/workflows/pages.yml/badge.svg)](https://github.com/karurukaruru/permission-panic/actions/workflows/pages.yml)

## Credits

Created and maintained by [karurukaruru](https://github.com/karurukaruru), with AI assistance from OpenAI Codex.
Inspired by AI coding agent permission prompts. Independent project; no affiliation or endorsement implied.
[MIT licensed](LICENSE).
