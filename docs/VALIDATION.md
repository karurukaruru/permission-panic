# Delivery and validation

Validated on **2026-10-22**. This is a working, static MVP, not a concept mockup.

## Delivered

- Ten playable, typed scenarios with task scope, proposed command, inspection
  evidence, contextual final decision, simulation logs and explanations.
- Approve / Inspect / Deny flow; correct, partial-credit and negative outcomes;
  a pure state reducer guards duplicate and out-of-order actions.
- Complete ten-round campaigns, results, titles, accuracy, per-round review and
  replay. Incorrect answers do not terminate the session.
- Native Canvas PNG export (1200 × 720), plus X / Reddit / Bilibili copy. Clipboard
  denial falls back to selectable text; export errors produce a visible message.
- Desktop / tablet / mobile CSS, keyboard operation, focus handling, visible
  simulation labels, terminal and result animations, reduced-motion support.
- English README with genuine screenshots and launch copy; MIT license,
  contribution and security policies; CI and GitHub Pages workflows.
- React and React DOM are the only runtime packages. No AI API, account, backend,
  database, analytics, remote font or scenario-command execution.

## Executed checks

| Check                    | Actual result                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `npm run build`          | Passed: TypeScript check and Vite production build                                                 |
| `npm test`               | 9 tests passed                                                                                     |
| Playwright desktop       | 5 tests passed; main desktop viewport 1440 × 1000                                                  |
| Playwright mobile        | 5 tests passed; main mobile viewport 390 × 664, Chromium iPhone emulation                          |
| Compact / tablet layouts | Additional 320 px and 768 px viewports checked, including a complete compact-screen run            |
| Entire campaign          | Perfect and all-wrong 10-round runs completed on both layouts                                      |
| PNG export               | Download succeeded; PNG signature and 1200 × 720 dimensions checked                                |
| Sharing                  | Copy success and denied-clipboard fallback verified                                                |
| Interactions             | Inspection, keyboard, help, round review and replay verified                                       |
| Layout                   | No horizontal overflow at checked request, evidence and results states                             |
| Network / runtime        | No unexpected external app requests or uncaught page errors in complete successful runs            |
| Manual browser QA        | Real HTTP-served desktop UI, first round, next request and simulated credential incident inspected |
| Visual review            | Genuine desktop, mobile, incident, results and exported-card images reviewed                       |

The final browser command used this environment's temporary Chromium executable
and the optional production-static fixture:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
PLAYWRIGHT_STATIC_DIR=dist npm run test:e2e -- --workers=2
```

The fixture serves the actual `dist/` bytes through Playwright's request routing,
without starting an additional server. This accommodates the managed preview's
separate network environment. It does not mock React, game logic or Canvas.
Normal development and CI use `npm run test:e2e`, which starts Vite automatically.
The temporary browser tooling is not a project or runtime dependency.

## Publication status

- **GitHub repository URL:** not created. The environment has no `gh` executable.
- **Public demo URL:** none; no deployment is claimed.
- A complete local Git repository is included. README contains minimal commands
  to create a new public repository and enable GitHub Actions Pages deployment.
- Pages builds set the real repository URL from `github.repository`. Until then,
  the game never invents an owner or link.
- GitHub-hosted CI and Pages workflows are provided but have not run remotely.

## Known limits

- Browser automation covers Chromium desktop and mobile emulation, not real iOS
  Safari, Firefox, or physical devices. Tablet and compact-phone layouts were
  checked by resizing Chromium, not on physical hardware.
- Current sessions live in memory; reloading starts a new campaign.
- The campaign intentionally has ten fixed requests. Extra scenarios require
  updating score, progress, export layout and test fixtures.
- The game uses simplified, explicitly stated contexts. It is not a universal
  security policy or a guarantee about real agent actions.

## Run

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. For production, run `npm run build` and deploy `dist/`.
